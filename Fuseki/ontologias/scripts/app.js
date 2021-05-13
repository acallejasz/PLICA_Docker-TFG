var anomalias = "config-files/register.json";
var datos = "config-files/datos.json";
var stype = 'WF';
var type;
var n_amenazas;
var originalContent;
var type_icon = new Map([["ClassifiedData",'<i data-eva="file-outline"></i> '], ["Users",'<i data-eva="person-outline"></i> '],
 ["Hardware", '<i data-eva="printer-outline"></i> '], ["Networks", '<i data-eva="globe-outline"></i> '], ["Software", '<i data-eva="at-outline"></i> ']]);

 $(document).ready(function(){
    originalContent = document.getElementById("accordion").innerHTML;
    // Posición Global por defecto
    document.querySelector('#container-amenazas').classList.remove('show');
    type = "Global";
    $("select.types").change(function(){
        type = $(this).children("option:selected").val();
    });
    loadData(anomalias, function(text){
        if(text.length>0){
	getAnomalies(JSON.parse(text), type);
	}
    });
    loadData(datos, function(text){
        getDatos(JSON.parse(text), type);
    });
    var query = "PREFIX owl: <http://www.w3.org/2002/07/owl#>\n" +
    "PREFIX cyberthreat_DRM: <http://www.semanticweb.org/upm/ontologies/2019/11/cyberthreat_DRM#>\n" + 
    "PREFIX cyberthreat_STIX: <http://www.semanticweb.org/upm/ontologies/2019/11/cyberthreat_STIX#>\n " + 
    "PREFIX cyberthreat_ONA: <http://www.semanticweb.org/paulagarcia/ontologies/2020/2/cyberthreat_ONA#>\n" + 
    "PREFIX cibersituational-ontology: <http://www.semanticweb.org/paulagarcia/ontologies/2020/2/cibersituational-ontology#>\n" + 
    "SELECT ?individuo ?type ?type ?i ?p\n" + 
    "Where{\n" + 
        "?individuo a cyberthreat_DRM:Threat.\n" +
        "?individuo cibersituational-ontology:type ?type.\n"+
        "?individuo cibersituational-ontology:impact ?i.\n"+
        "?individuo cibersituational-ontology:total_prob ?p.\n"+
    "}";
    fusekiConn(query, general);
});

function loadData(path, done){
    var f = new XMLHttpRequest();
    f.onload = function () {
        return done(this.responseText)
    }
    f.open("GET", path, true);
    f.send();
}

function general(text){
    text = JSON.parse(text);
    n_amenazas = text.results.bindings.length;
    document.getElementById("extra").innerHTML = '<div class="anomalias-cases card mt-3">' +
                            '<div class="card-header anomalias-view" role="tab" id="headingTwo">' +
                            '<h5 class="mb-0">'+
                            '<a id="anomalias-card" class="collapsed card-title color-white" data-toggle="collapse" href="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">'+
                            'Nº de Amenazas'+
                            '</a>'+
                            '<span id="anomalias-count" class="case-count float-right">'+
                            n_amenazas +
                            '</span>' +
                            '</h5>' +
                            '</div>' +
                            '<div id="max_sv"></div>' +
                            '</div>';
}
var colors = {
    blue: "#2a6dc0",
    orange: "#ea2857",
    green: "#1cc1bc",
    gray: "#5b5b5b",
    white: "#F5F5F5"
  }

function geoFunc(geoname) {
    var geo = icons[geoname];
    if (typeof geo === "string") {
      geo = icons[geoname] = go.Geometry.parse(geo, true);  // fill each geometry
    }
    return geo;
}

function listAssets(text){
    text = JSON.parse(text);
    assets_types = new Map();
    for (i of text.results.bindings){
        if(assets_types.get(i.t.value) != undefined) {
            var aux = Array.from(assets_types.get(i.t.value));
            aux.push(i.individuo.value.split("#")[1].slice(1,))
            assets_types.set(i.t.value, aux);
        } else {
            var arr = new Array();
            arr.push(i.individuo.value.split("#")[1].slice(1,))
            assets_types.set(i.t.value,arr);
        }
    }
    
    var text = ""
    for (i of assets_types.keys()){
        text += '<dt>' + type_icon.get(i) + i + "</dt>";
        for (x = 0; x< assets_types.get(i).length; x ++){
            text += '<dd> - ' + assets_types.get(i)[x] + "</dd>";
        } 
    }
    document.getElementById("container-amenazas").innerHTML = '<div id = "list"><dl>' + text + 
    '</dl></div>';
    eva.replace();
}

function fusekiConn(query, func){
    var queryUrl = "http://138.4.7.158:3030/PLICA/sparql" + "?query=" + encodeURIComponent(query) + "&format=json";

    var http = new XMLHttpRequest();
    http.open("POST", queryUrl, true);
    http.onreadystatechange = function(){
    if(http.readyState == 4 && http.status == 200) {
        func(http.responseText);
    }
}
http.send();
}

function fillAssets(text){
    var asset_icons = new Map([["ClassifiedData","file"], ["Software1", "windows8"] , ["Hardware1", "cogs"], ["Router", "cogs"],  ["LAN", "connection"], ["Employee", "user"]]);
    var tipos  = ["CD", "SW", "HW", "N", "U"];
    document.getElementById("potencial-card").innerHTML = "Relación entre activos";
    document.getElementById("potencial-count").innerHTML = "";
    document.getElementById("container-potencial").innerHTML = '<div id="map_container"><div id ="map"> </div></div>';
    document.getElementById("anomalias-count").innerHTML = tipos.length;
    document.getElementById("amenazas-card").innerHTML = "Clasificación de Activos"
    
    text = JSON.parse(text);
    var assets_rel = new Array();
    var nodes = new Array();
    for (i of text.results.bindings){
        assets_rel.push([i.individuo.value.split("#")[1].slice(1,), i.i.value.split("#")[1].slice(1,)]);
        nodes.push(i.individuo.value.split("#")[1].slice(1,));
        nodes.push(i.i.value.split("#")[1].slice(1,))
    }

    var $ = go.GraphObject.make;
    var myDiagram = $(go.Diagram, "map");

    myDiagram.nodeTemplate = $(go.Node, "Auto",
        {click: function(e, node) {
            var diagram = node.diagram;
            diagram.startTransaction("highlight");
            diagram.clearHighlighteds();
            node.findLinksOutOf().each(function(l) { l.isHighlighted = true; });
            diagram.commitTransaction("highlight");
        }
        },
        $(go.Shape, "RoundedRectangle",
            { fill: colors["blue"], strokeWidth: 0, width: 95, height: 95 },
            new go.Binding("fill", "color")),
        $(go.Shape,
            { margin: 3, fill: colors["white"], strokeWidth: 0 },
            new go.Binding("geometry", "geo", geoFunc)),
        $(go.TextBlock,  // the text label
            { margin: 3, stroke: "white", width: 95, height: 90, verticalAlignment: go.Spot.Bottom, textAlign: "center"},
                new go.Binding("text", "key")),
          // Each node has a tooltip that reveals the name
        {toolTip:
            $("ToolTip",
              { "Border.stroke": colors["gray"], "Border.strokeWidth": 2 },
              $(go.TextBlock, { margin: 8, stroke: colors["gray"], font: "bold 12px sans-serif" },
                new go.Binding("text", "name")))
        }
    );
    myDiagram.linkTemplate = $(go.Link, { toShortLength: 4 },
        $(go.Shape,
            // the Shape.stroke color depends on whether Link.isHighlighted is true
            new go.Binding("stroke", "isHighlighted", function(h) { return h ? "black" : "#7B7B88"; })
                .ofObject(),
            // the Shape.strokeWidth depends on whether Link.isHighlighted is true
            new go.Binding("strokeWidth", "isHighlighted", function(h) { return h ? 3 : 1; })
                .ofObject()),
        $(go.Shape,
            { toArrow: "Standard", strokeWidth: 0 },
            // the Shape.fill color depends on whether Link.isHighlighted is true
            new go.Binding("fill", "isHighlighted", function(h) { return h ? "black" : "#7B7B88"; })
                .ofObject())
    );
    nodes = [...new Set(nodes)];
    var nodes_data = [];

    for (n = 0; n<nodes.length; n++){
        var inf = nodes[n]
        nodes_data.push({key:inf, geo: asset_icons.get(inf), name:inf});
    }


    var rel = [];

    for(k = 0; k<assets_rel.length; k++){
        var data = assets_rel[k]
        var son = data[0]
        var parent = data[1];
        rel.push({from:son, to: parent})
    }

    myDiagram.model = new go.GraphLinksModel(nodes_data, rel);
    myDiagram.contentAlignment = go.Spot.Center;       

}

function fillThreats(text){
    document.getElementById("subtype").innerHTML = "";
    threat_i = new Map();
    threat_p = new Map();
    text = JSON.parse(text);
    document.getElementById("anomalias-count").innerHTML = text.results.bindings.length;
    document.getElementById("amenazas-card").innerHTML = "Impacto";
    document.getElementById("potencial-card").innerHTML = "Probabilidad";
    for (i of text.results.bindings){
        if(threat_p.get(i.type.value) != undefined) {
            var aux = Array.from(threat_p.get(i.type.value));
            aux.push(parseFloat(i.p.value))
            threat_p.set(i.type.value, aux);
        } else {
            var arr = new Array();
            arr.push(parseFloat(i.p.value))
            threat_p.set(i.type.value,arr);
        }
        if(threat_i.get(i.type.value) != undefined) {
            var aux = Array.from(threat_i.get(i.type.value));
            aux.push(parseFloat(i.i.value))
            threat_i.set(i.type.value, aux);
        } else {
            var arr = new Array();
            arr.push(parseFloat(i.i.value))
            threat_i.set(i.type.value,arr);
        }
    }

    for (k of threat_p){
        threat_p.set(k[0], k[1].reduce((a, b) => (parseFloat(a) + parseFloat(b)))/Array.from(k[1].values()).length);
    }

    for (k of threat_i){
        threat_i.set(k[0], k[1].reduce((a, b) => (parseFloat(a) + parseFloat(b)))/Array.from(k[1].values()).length);
    }

    
    var query = "PREFIX owl: <http://www.w3.org/2002/07/owl#>\n" +
                    "PREFIX cyberthreat_DRM: <http://www.semanticweb.org/upm/ontologies/2019/11/cyberthreat_DRM#>\n" + 
                    "PREFIX cyberthreat_STIX: <http://www.semanticweb.org/upm/ontologies/2019/11/cyberthreat_STIX#>\n " + 
                    "PREFIX cyberthreat_ONA: <http://www.semanticweb.org/paulagarcia/ontologies/2020/2/cyberthreat_ONA#>\n" + 
                    "PREFIX cibersituational-ontology: <http://www.semanticweb.org/paulagarcia/ontologies/2020/2/cibersituational-ontology#>\n" + 
                    "SELECT (AVG(?i) AS ?avgi) (AVG(?p) AS ?avgp)\n" + 
                    "Where{\n" + 
                        "?individuo a cyberthreat_DRM:Threat.\n" +
                        "?individuo cibersituational-ontology:impact ?i.\n" +
                        "?individuo cibersituational-ontology:total_prob ?p.\n" +
                    "}";
   fusekiConn(query, avgThreat);
 }
function avgThreat(text) {
    var level_i = "";
    var level_p = "";
    text = JSON.parse(text);
    var i_avg = text.results.bindings[0].avgi.value;
    var p_avg = text.results.bindings[0].avgp.value;
    document.getElementById("potencial-count").innerHTML = "";
    document.getElementById("range-amenazas-count").innerHTML = Math.round(i_avg*100)/100 + "/10";
    document.getElementById("range-potencial-count").innerHTML = Math.round(p_avg*100)/100 + "/10";
    
    if (i_avg < 6) {
        level_i = "Low";
        document.getElementById("range-amenazas-count").style.color="#5BB834";
        document.getElementById("headingOne").style.background="#5BB834";
    } else if (6<= i_avg &&  i_avg< 8) {
        level_i = "Medium";
        document.getElementById("range-amenazas-count").style.color="#FBC33B";
        document.getElementById("headingOne").style.background="#FBC33B";
    } else {
        level_i = "High";
        document.getElementById("range-amenazas-count").style.color="#C1385B";
        document.getElementById("headingOne").style.background="#C1385B";
    }

    if(p_avg < 6 ) {
        level_p = "Low";
        document.getElementById("range-potencial-count").style.color="#5BB834";
        document.getElementById("headingThree").style.background="#5BB834";
    } else if (6<= p_avg && p_avg< 8) {
        level_p = "Medium";
        document.getElementById("range-potencial-count").style.color="#FBC33B";
        document.getElementById("headingThree").style.background="#FBC33B";
    } else {
        level_p = "High";
        document.getElementById("range-potencial-count").style.color="#C1385B";
        document.getElementById("headingThree").style.background="#C1385B";
    }

    graph(threat_i, "Impacto", "Amenazas", level_i);
    graph(threat_p, "Probabilidad", "Potencial", level_p);
}

function getsafeguards(text){
	text = JSON.parse(text);
	inner_text = "";
	arr = text.results.bindings;
	for ( i = 0; i<arr.length; i++){
		inner_text += "<br><b> Salvaguarda: " + arr[i].safeguard.value.split("#")[1] + "</b><br>"
		 + "Valor asociado: " + arr[i].value.value + "<br>" + 
		"Riesgo afectado: " + arr[i].risk.value.split("#")[1].split("_")[0] + "<br>" 
	} 
	document.getElementById("salvaguardas").innerHTML = inner_text;
	document.getElementById("salvaguardas").style.fontSize = "small";
}

function fillRisks(text){
    risk_i = new Map();
    risk_p = new Map();
    risk_r = new Map();
    text = JSON.parse(text);
    document.getElementById("subtype").innerHTML = "";
    document.getElementById("anomalias-count").innerHTML = text.results.bindings.length;
    document.getElementById("amenazas-card").innerHTML = "Riesgo";
    document.getElementById("potencial-card").innerHTML = "Probabilidad";
    document.getElementById("residual-card").innerHTML = "Impacto";
    document.getElementById("max_sv").innerHTML = '<b>Salvaguardas</b> <br> <div id ="salvaguardas"><div>'; 
    document.getElementById("max_sv").onclick=function(){
	var query = "PREFIX owl: <http://www.w3.org/2002/07/owl#>\n" +
                "PREFIX cyberthreat_DRM: <http://www.semanticweb.org/upm/ontologies/2019/11/cyberthreat_DRM#>\n" + 
                "PREFIX cyberthreat_STIX: <http://www.semanticweb.org/upm/ontologies/2019/11/cyberthreat_STIX#>\n " + 
                "PREFIX cyberthreat_ONA: <http://www.semanticweb.org/paulagarcia/ontologies/2020/2/cyberthreat_ONA#>\n" + 
                "PREFIX cibersituational-ontology: <http://www.semanticweb.org/paulagarcia/ontologies/2020/2/cibersituational-ontology#>\n" + 
                "SELECT ?safeguard ?value ?risk \n" + 
                "Where{\n" + 
                    "?safeguard a cyberthreat_DRM:Safeguards.\n" +
                    "?safeguard cibersituational-ontology:drm_value ?value.\n" +
                    "?risk a cyberthreat_DRM:ResidualRisk.\n" +
                    "?risk cibersituational-ontology:isMitigatedBy ?safeguard." +
                "}";
    	fusekiConn(query, getsafeguards);
    }
	for (i of text.results.bindings){
        if(risk_p.get(i.type.value) != undefined) {
            var aux = Array.from(risk_p.get(i.type.value));
            aux.push(parseFloat(i.p.value))
            risk_p.set(i.type.value, aux);
        } else {
            var arr = new Array();
            arr.push(parseFloat(i.p.value))
            risk_p.set(i.type.value,arr);
        }
        if(risk_i.get(i.type.value) != undefined) {
            var aux = Array.from(risk_i.get(i.type.value));
            aux.push(parseFloat(i.i.value))
            risk_i.set(i.type.value, aux);
        } else {
            var arr = new Array();
            arr.push(parseFloat(i.i.value))
            risk_i.set(i.type.value,arr);
        }
        if(risk_r.get(i.type.value) != undefined) {
            var aux = Array.from(risk_r.get(i.type.value));
            aux.push(parseFloat(i.r.value))
            risk_r.set(i.type.value, aux);
        } else {
            var arr = new Array();
            arr.push(parseFloat(i.r.value))
            risk_r.set(i.type.value,arr);
        }
    }

    for (k of risk_p){
        risk_p.set(k[0], k[1].reduce((a, b) => (parseFloat(a) + parseFloat(b)))/Array.from(k[1].values()).length);
    }

    for (k of risk_i){
        risk_i.set(k[0], k[1].reduce((a, b) => (parseFloat(a) + parseFloat(b)))/Array.from(k[1].values()).length);
    }

    for (k of risk_r){
        risk_r.set(k[0], k[1].reduce((a, b) => (parseFloat(a) + parseFloat(b)))/Array.from(k[1].values()).length);
    }

    document.getElementById("potencial-count").innerHTML = "";
    document.getElementById("residual-count").innerHTML = "";
    
    var level_r = "";
    var level_p = "";
    var level_i = "";

    r_avg = (Array.from(risk_r.values())).reduce((a, b) => (parseFloat(a) + parseFloat(b)))/Array.from(risk_r.values()).length;
    i_avg = (Array.from(risk_i.values())).reduce((a, b) => (parseFloat(a) + parseFloat(b)))/Array.from(risk_i.values()).length;
    p_avg = (Array.from(risk_p.values())).reduce((a, b) => (parseFloat(a) + parseFloat(b)))/Array.from(risk_p.values()).length;
    
    document.getElementById("range-amenazas-count").innerHTML = Math.round(r_avg*1000)/1000 + "%";
    document.getElementById("range-potencial-count").innerHTML = Math.round(p_avg*100)/100 + "/10";
    document.getElementById("range-residual-count").innerHTML = Math.round(i_avg*100)/100 + "/10";

    if (r_avg < 20) {
        level_r = "Low";
        document.getElementById("range-amenazas-count").style.color="#5BB834";
        document.getElementById("headingOne").style.background="#5BB834";
    } else if (20 <= r_avg &&  r_avg< 50) {
        level_r = "Medium";
        document.getElementById("range-amenazas-count").style.color="#FBC33B";
        document.getElementById("headingOne").style.background="#FBC33B";
    } else {
        level_r = "High";
        document.getElementById("range-amenazas-count").style.color="#C1385B";
        document.getElementById("headingOne").style.background="#C1385B";
    }

    if(p_avg < 6 ) {
        level_p = "Low";
        document.getElementById("range-potencial-count").style.color="#5BB834";
        document.getElementById("headingThree").style.background="#5BB834";
    } else if (6<= p_avg && p_avg< 8) {
        level_p = "Medium";
        document.getElementById("range-potencial-count").style.color="#FBC33B";
        document.getElementById("headingThree").style.background="#FBC33B";
    } else {
        level_p = "High";
        document.getElementById("range-potencial-count").style.color="#C1385B";
        document.getElementById("headingThree").style.background="#C1385B";
    }

    if(i_avg < 6 ) {
        level_i = "Low";
        document.getElementById("range-residual-count").style.color="#5BB834";
        document.getElementById("headingFour").style.background="#5BB834";
    } else if (6<= i_avg && i_avg< 8) {
        level_i = "Medium";
        document.getElementById("range-residual-count").style.color="#FBC33B";
        document.getElementById("headingFour").style.background="#FBC33B";
    } else {
        level_i = "High";
        document.getElementById("range-residual-count").style.color="#C1385B";
        document.getElementById("headingFour").style.background="#C1385B";
    }

    graph(risk_r, "Riesgo", "Amenazas", level_r);
    graph(risk_p, "Probabilidad", "Potencial", level_p);
    graph(risk_i, "Impacto", "Residual", level_i);
}

function getAnomalies(arr, type){
    var anomaly_type = ["WF", "RF", "RM", "IDS", "CS", "Connection", "SM", "BT"];

    // Case Global, ver el numero total de anomalias
    if(type === "Global"){
        var size = 0;
        for (var t in anomaly_type){
            var x = anomaly_type[t];
            $.each(arr["Anomalies Register"][x],function(k,v){
                size += v.suspicious_value;
            });
        }
        document.getElementById("anomalias-count").innerHTML = size;  

    } 
    
    // Case Anomalias
    if(type === "Anomalias"){
        document.getElementById("WF").onclick = function() {setSType("#WF")};
        document.getElementById("RF").onclick = function() {setSType("#RF")};
        document.getElementById("RM").onclick = function() {setSType("#RM")};
        document.getElementById("BT").onclick = function() {setSType("#BT")};
        document.getElementById("SM").onclick = function() {setSType("#SM")};
        document.getElementById("IDS").onclick = function() {setSType("#IDS")};
        document.getElementById("CS").onclick = function() {setSType("#CS")};
        document.getElementById("Connection").onclick = function() {setSType("#Connection")};
        function setSType(st) {
            var size = 0;
            var styp = ["#WF", "#RF", "#RM", "#IDS", "#CS", "#Connection", "#BT", "#SM"];
            styp.forEach(element => {
                if(element === st){
                    $(element).css('color', '#0F81C2');
                } else  $(element).css('color', 'black');
            });
            stype = st.replace("#", "");
            $.each(arr["Anomalies Register"][stype], function(k,v){
                size += v.suspicious_value
            });
            document.getElementById("anomalias-count").innerHTML = size;
            charts_anomalies(arr["Anomalies Register"][stype], stype)
        }
    }
}

function nCorr(text){
    text = JSON.parse(text);
    document.getElementById("anomalias-count").innerHTML = text.results.bindings.length;
}

function getCorr(text){

    text = JSON.parse(text); 
    document.getElementById("potencial-count").innerHTML = "";
    document.getElementById("residual-count").innerHTML = "";
    
    document.getElementById("amenazas-card").innerHTML = "Analisis de la Correlación";
    document.getElementById("potencial-card").innerHTML = "Análisis Temporal";
    document.getElementById("residual-card").innerHTML = "Análisis de las reglas";
    
    var arr = text.results.bindings
    // Rellenar Medidas
    var correladas = [];
    var reglas = new Map();
    var fechas = new Map();
    var caused = new Map();
    $.each(arr, function(_,v){
        correladas.push(v['individuo'].value.split("#")[1]);
        if (reglas.get(v['individuo'].value.split("#")[1])!= undefined){
            var aux = [... new Set(reglas.get(v['individuo'].value.split("#")[1]))];
	    aux.push(v["r"].value);
	    aux = [... new Set(aux)];
            reglas.set(v['individuo'].value.split("#")[1], aux);
        } else {reglas.set(v['individuo'].value.split("#")[1], new Array(v["r"].value));}

        if (fechas.get(v['individuo'].value.split("#")[1])!= undefined){
            var aux = [... new Set(fechas.get(v['individuo'].value.split("#")[1]))];
	    aux.push(v["t"].value.replace("T", " ").split(".")[0]);
            aux = [... new Set(aux)];
	    fechas.set(v['individuo'].value.split("#")[1], aux);
        } else {fechas.set(v['individuo'].value.split("#")[1], new Array(v["t"].value.replace("T", " ").split(".")[0]));}
        
        if (caused.get(v['individuo'].value.split("#")[1])!= undefined){
            var aux = caused.get(v['individuo'].value.split("#")[1]);
	aux.push(v["a"].value.split("#")[1]);
	caused.set(v['individuo'].value.split("#")[1], aux);
        } else {caused.set(v['individuo'].value.split("#")[1], new Array(v["a"].value.split("#")[1]));}
    });
    var text_der = "<dl>";
    var text_izq = "<dl>";

    correladas = [...new Set(correladas)];
    for (i = 0; i< correladas.length;){
        
        text_izq += '<dt> <u>' + correladas[i] + "</u> <dt/>"
        + '<ul>'
        + '<li> <b>Regla:</b> ' + reglas.get(correladas[i]) + "</li>"
        + '<li> <b>Fecha de Alarma:</b>  ' + fechas.get(correladas[i]) + "</li>"
        + '<li> <b>Causado por: </b> <ul>';

        for (j of caused.get(correladas[i])){

            text_izq += '<li>' + j + "</li>";
        }
        text_izq += "</ul></li></ul></dl>";
	i++;
	if(i+1 < correladas.length){
        	text_der += '<dt> <u>' + correladas[i] + "</u> <dt/>"
        	+ '<ul>'
        	+ '<li> <b>Regla:</b> ' + reglas.get(correladas[i]) + "</li>"
        	+ '<li> <b>Fecha de Alarma:</b>  ' + fechas.get(correladas[i]) + "</li>"
        	+ '<li> <b>Causado por: </b> <ul>';

        	for (j of caused.get(correladas[i])){
            		text_der += '<li>' + j + "</li>";
        	}
        	text_der += "</ul></li></ul></dl>";
        	i++;
	}
    }
    document.getElementById("container-amenazas").innerHTML = '<div style="padding: 10px; float: left; width: 45%; text-align: justify;">' + 
    text_izq + '</div>'+ '<div style="padding: 10px; float: right; width: 45%; text-align: justify;">' + text_der + '</div>';

    time = [];
    fechas.forEach(x => time.push(x[0]));
    
    var time_map = new Map ();
    time.forEach(x => {
        if(!time_map.has(x)){ time_map.set(x, 1)}
        else { var l = time_map.get(x);
            time_map.set(x, l + 1);}
    });

    rules = [];
    reglas.forEach(x => rules.push(x[0]));
    
    var rules_map = new Map ();
    rules.forEach(x => {
        if(!rules_map.has(x)){ rules_map.set(x, 1)}
        else { var l = rules_map.get(x);
            rules_map.set(x, l + 1);}
    });

    document.getElementById("range-potencial-count").innerHTML = "";
    document.getElementById("range-residual-count").innerHTML = "";

    graph(time_map, "Numero de amenazas", "Potencial", "Other");
    graph(rules_map, "Numero de amenazas", "Residual", "Other");
}

function getLastData(text){
    text = JSON.parse(text); 
    document.getElementById("potencial-count").innerHTML = "";
    document.getElementById("residual-count").innerHTML = "";
    
    document.getElementById("potencial-card").innerHTML = "Análisis Temporal";
    document.getElementById("residual-card").innerHTML = "Análisis de las reglas";
    
    var arr = text.results.bindings
    if(arr.length>0){
        var last_anomaly = arr[0];
        var last_name = last_anomaly.individuo.value.split("#")[1];
        var last_time = last_anomaly.t.value.replace("T", " ").split(".")[0];
        var last_sv = last_anomaly.sv.value;
        document.getElementById("chart1").innerHTML = "<b>" + last_name + ": </b>";
        document.getElementById("chart1").innerHTML += last_time + "<br>";
        document.getElementById("chart1").innerHTML += "Suspicious Value = " + last_sv;
        document.getElementById("total_cases").innerHTML = "";
        document.getElementById("range-amenazas-count").innerHTML = "";
}
    document.getElementById("potencial-card").innerHTML = "Amenazas Asociadas";
    var query = "PREFIX owl: <http://www.w3.org/2002/07/owl#>\n" +
                "PREFIX cyberthreat_DRM: <http://www.semanticweb.org/upm/ontologies/2019/11/cyberthreat_DRM#>\n" + 
                "PREFIX cyberthreat_STIX: <http://www.semanticweb.org/upm/ontologies/2019/11/cyberthreat_STIX#>\n " + 
                "PREFIX cyberthreat_ONA: <http://www.semanticweb.org/paulagarcia/ontologies/2020/2/cyberthreat_ONA#>\n" + 
                "PREFIX cibersituational-ontology: <http://www.semanticweb.org/paulagarcia/ontologies/2020/2/cibersituational-ontology#>\n" + 
                "SELECT ?individuo ?a ?p ?i \n" + 
                "Where{\n" + 
                    "?individuo a cyberthreat_ONA:Detected_Anomaly.\n" +
                    "?individuo cibersituational-ontology:generates ?a.\n" +
                    "?a cibersituational-ontology:total_prob ?p.\n" +
                    "?a cibersituational-ontology:impact ?i.\n" +
                    "FILTER(?individuo = cyberthreat_ONA:" + last_name + ")" +
                "}";
    fusekiConn(query, getrelThreat);

}

function getrelThreat(text){
    text = JSON.parse(text); 
    var arr = text.results.bindings;
    var innerText = "";
    var list_threats = [];
    for (i = 0; i< arr.length; i ++){
        var indiv = arr[i];
        list_threats.push("<" + indiv.a.value + ">");
        innerText += "<b>" + indiv.a.value.split("#")[1]+ ": </b><br>";
        innerText += "Probabilidad: " + Math.round(indiv.p.value*100)/100 + "<br>";
        innerText += "Impacto: " + Math.round(indiv.i.value*100)/100 + "<br>";
    }
    document.getElementById("chart2").innerHTML = innerText;
    document.getElementById("potencial_lab").innerHTML = "";
    document.getElementById("range-potencial-count").innerHTML = "";
    document.getElementById("residual-card").innerHTML = "Riesgos Asociados";
    var query = "PREFIX owl: <http://www.w3.org/2002/07/owl#>\n" +
                "PREFIX cyberthreat_DRM: <http://www.semanticweb.org/upm/ontologies/2019/11/cyberthreat_DRM#>\n" + 
                "PREFIX cyberthreat_STIX: <http://www.semanticweb.org/upm/ontologies/2019/11/cyberthreat_STIX#>\n " + 
                "PREFIX cyberthreat_ONA: <http://www.semanticweb.org/paulagarcia/ontologies/2020/2/cyberthreat_ONA#>\n" + 
                "PREFIX cibersituational-ontology: <http://www.semanticweb.org/paulagarcia/ontologies/2020/2/cibersituational-ontology#>\n" + 
                "SELECT ?a ?r ?rr ?pr ?ar \n" + 
                "Where{\n" + 
                    "?a a cyberthreat_DRM:Threat.\n" +
                    "?a cibersituational-ontology:generates ?r.\n" +
                    "?r cyberthreat_DRM:hasAssessmentOf ?rr.\n" +
                    "{?rr cibersituational-ontology:potentialRisk ?pr.}\n" + 
                    "UNION \n" + 
                    "{?rr cibersituational-ontology:actualRisk ?ar.}\n" + 
                    "FILTER(?a IN ("  + list_threats + "))" +
                "}";
    fusekiConn(query, getrelRisks);
}

function getrelRisks(text){
    text = JSON.parse(text); 
    var arr = text.results.bindings;
    var map_risks = new Map();
    for (i = 0; i< arr.length; i ++){
        var ind = arr[i];
        var risk = ind.r.value.split("#")[1];
        if (map_risks.has(risk)){
            var actual = map_risks.get(risk);
            if(actual.has("PR")){ 
                if(!actual.has("AR")){ actual.set("AR", ind.ar.value);}
            }
           else{ actual.set("PR", ind.pr.value);}
        } else {
            var aux = new Map();
            if (ind.pr != undefined){map_risks.set(risk, aux.set("PR", ind.pr.value));}
            else {map_risks.set(risk, aux.set("AR", ind.ar.value));}
        }
    }
    var innerText = "";
    for (x of map_risks){
        var r = x[0];
        var r_values = x[1]
        innerText += "<b>" + r.split("_")[0]+ ": </b><br>";
        innerText += "Riesgo Potencial: " + Math.round(r_values.get("PR")*1000)/1000 + " % <br>";
        innerText += "Riesgo Residual: " + Math.round(r_values.get("AR")*1000)/1000 + " % <br><br>";

    }

     document.getElementById("chart3").innerHTML = innerText;
     document.getElementById("residual-lab").innerHTML = "";
     document.getElementById("range-residual-count").innerHTML = ""; 
}

function charts_anomalies(data, st){
    var id_set = new Map();
    var field_map = new Map();
    $.each(data, function(k,v){
        var id_tot = (JSON.stringify(k).split('(')[1].replace("\"", "")).split("_");
        if(id_tot.length > 1){
            var id = id_tot[0];
            var field = id_tot[1].replace(")", "");

            if (id_set.has(id)){
                id_set.set(id, id_set.get(id)+v.suspicious_value);
            } else {
                id_set.set(id, v.suspicious_value);
            }
            if (field_map.has(field)){
                field_map.set(field, field_map.get(field)+v.suspicious_value);
            } else {
                field_map.set(field, v.suspicious_value);
            }
        }

    });
    document.getElementById("range-amenazas-count").innerHTML = id_set.size;
    document.getElementById("range-potencial-count").innerHTML = field_map.size;
    graph(id_set, "Identificadores", "Amenazas", "Other");
    var pot_card;
    var pot_lab;
    switch(st){
        case "RF": pot_card = "Frecuencias"; pot_lab = "Frecuencias detectadas"; break;
        case "RM": pot_card = "IMSIs"; pot_lab = "IMSIs detectados"; break;
        case "BT": pot_card = "UUIDs"; pot_lab = "UUIDs detectados"; break;
        default: pot_card = "Direcciones"; pot_lab = "Direcciones detectadas"; break;
    }

    document.getElementById('amenazas-card').innerHTML = "Identificadores";
    document.getElementById("total_cases").innerHTML = "Identificadores detectados";
    document.getElementById('potencial-card').innerHTML = pot_card;
    document.getElementById("potencial-count").innerHTML = "";
    document.getElementById("potencial_lab").innerHTML = pot_lab;
    graph(field_map, pot_card, "Potencial", "Other");
}

function graph(data, id, status, level){
    var labels = [];
    var chartData = [];
    for (k of data.keys()){
        labels.push(k);
        chartData.push(data.get(k));
    }
    var ctx;
    switch(status){
        case "Amenazas": 
            $('amenazas-case-chart').remove();
            document.getElementById("chart1").innerHTML = '<canvas class="line-chart" id="amenazas-case-chart" width="400" height="400"></canvas>'
            ctx = document.getElementById("amenazas-case-chart").getContext('2d');
            break;
        case "Potencial":
            $('potencial-case-chart').remove();
            document.getElementById("chart2").innerHTML = '<canvas class="line-chart" id="potencial-case-chart" width="400" height="400"></canvas>'
            ctx = document.getElementById("potencial-case-chart").getContext('2d');
            break;
        case "Residual":
            $('residual-case-chart').remove();
            document.getElementById("chart3").innerHTML = '<canvas class="line-chart" id="residual-case-chart" width="400" height="400"></canvas>'
            ctx = document.getElementById("residual-case-chart").getContext('2d');
            break;
    }
    
    var statusChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: id,
                data: chartData,
                backgroundColor: getChartColors(level, 'background')[0],
                borderColor: getChartColors(level, 'border')[0],
                borderWidth: 4
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        stepSize: 5,
                    }
                }]
            }
        }
    });
}

function getDatos(arr){
    var last = Object.keys(arr).length;
    // Rellenar Medidas
    var riesgos = [];
    var valores = [];
    var medidas = [];
    var resalto = [];
    $.each(arr[last-1]["Strategies"], function(k,v){
        riesgos.push(v['Risk'].split(" ")[0]);
        valores.push(Math.round(v['Risk Value']*1000)/1000);
        medidas.push(v["Recommendation Strategy"]);
        if(Math.round(v['Risk Value']*1000)/1000 > 50){
            resalto.push(["<b>","</b>"]);
        } else{resalto.push(["",""]);}
    });
    var text_der = "";
    var text_izq = "";
    for (i = 0; i < riesgos.length;){
        text_izq += '<dt> <u>' + riesgos[i] + "</u></dt>"
        + '<dd> - Nivel de riesgo: ' + resalto[i][0] + valores[i] + resalto[i][1] + " % </dd>"
        + '<dd> - Medida: ' + medidas[i] + "</dd>";
        i++;
	if(i< riesgos.length){
        	text_der += '<dt> <u>' + riesgos[i] + "</u></dt>"
        	+ '<dd> - Nivel de riesgo: ' + resalto[i][0] + valores[i] + resalto[i][1] + " % </dd>"
        	+ '<dd> - Medida: ' + medidas[i] + "</dd>";
        	i++;
	}
    }
    document.getElementById("container-amenazas").innerHTML = '<div style="padding: 10px; float: left; width: 45%; text-align: justify;">' + 
    text_izq + '</div>'+ '<div style="padding: 10px; float: right; width: 45%; text-align: justify;">' + text_der + '</div>';

    //Total riesgos potenciales
    document.getElementById("range-potencial-count").innerHTML = Math.round(arr[last-1]["Potential Total Risk"]*1000)/1000 + " %";
    document.getElementById("potencial-count").innerHTML = Math.round(arr[last-1]["Potential Total Risk"]*1000)/1000 + " %";

    pot_avg = Math.round(arr[last-1]["Potential Total Risk"]*1000)/1000;
    level_pot= "";
    if (pot_avg < 20){
        level_pot = "Low";
        document.getElementById("range-potencial-count").style.color="#5BB834";
        document.getElementById("headingThree").style.background="#5BB834";
    } else if (20 <= pot_avg && pot_avg < 50){
        level_pot = "Medium";
        document.getElementById("range-potencial-count").style.color="#FBC33B";
        document.getElementById("headingThree").style.background="#FBC33B";
    } else {
        level_pot = "High";
        document.getElementById("range-potencial-count").style.color="#C1385B";
        document.getElementById("headingThree").style.background="#C1385B";
    }
    
    //Grafico riesgos potenciales
    var potenciales = {}
    $.each(arr, function(k,v){
        var time = v["Time"].split("T")[0];
        var number = v["Potential Total Risk"];
        potenciales[time] = number;
    });
    setChartForStatus(potenciales, "Potencial", level_pot)

    //Total riesgos residuales
    document.getElementById("range-residual-count").innerHTML = Math.round(arr[last-1]["Residual Total Risk"]*1000)/1000 + " %";
    document.getElementById("residual-count").innerHTML = Math.round(arr[last-1]["Residual Total Risk"]*1000)/1000 + " %";
    
    //Grafico riesgos residuales
    var residuales = {}
    $.each(arr, function(k,v){
        var time = v["Time"].split("T")[0];
        var number = v["Residual Total Risk"];
        residuales[time] = number;
    });

    res_avg = Math.round(arr[last-1]["Residual Total Risk"]*1000)/1000;
    level_res= "";
    if (res_avg < 20){
        level_res = "Low";
        document.getElementById("range-residual-count").style.color="#5BB834";
        document.getElementById("headingFour").style.background="#5BB834";
    } else if (20 <= res_avg && res_avg < 50){
        level_res = "Medium";
        document.getElementById("range-residual-count").style.color="#FBC33B";
        document.getElementById("headingFour").style.background="#FBC33B";
    } else {
        level_res = "High";
        document.getElementById("range-residual-count").style.color="#C1385B";
        document.getElementById("headingFour").style.background="#C1385B";
    }

    setChartForStatus(residuales, "Residual", level_res);

}

function getChartColors(status, type) {
    if (type === 'background') {
        if (status === 'Low') {
            return ['rgba(91, 184, 52, 0.2)'] 
        }
        if (status === 'Medium') {
            return ['rgba(252, 179, 59, 0.2)']
        }
        if (status === 'High') {
            return ['rgba(255, 99, 132, 0.2)']
            
        }
        if (status === "Other"){
            return ['rgba(118, 128, 144, 0.2)']
        }
    }
    if (type === 'border') {
        if (status === 'Low') {
            return ['rgba(91, 184, 52, 1)']
        }
        if (status === 'Medium') {
            return ['rgba(252, 179, 59, 1)']
        }
        if (status === 'High') {
            return ['rgba(255, 99, 132, 1)']
        }
        if (status === "Other"){
            return ['rgba(118, 128, 144, 1)']
        }
    }
}

function setChartForStatus (data, status, level) {
    var labels = Object.keys(data);
    var chartData = [];
    $.each(data, function(k,v){
        chartData.push(data[k])
    });
    var ctx;
    switch(status){
        case 'Amenazas': ctx = document.getElementById("amenazas-case-chart").getContext('2d'); break;
        case 'Potencial': ctx = document.getElementById("potencial-case-chart").getContext('2d'); break;
        case 'Residual': ctx = document.getElementById("residual-case-chart").getContext('2d'); break;
    }
    var statusChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: status,
                data: chartData,
                backgroundColor: getChartColors(level, 'background'),
                borderColor: getChartColors(level, 'border'),
                borderWidth: 6
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: false,
                        stepSize: 5,
                    }
                }]
            }
        }
    });
}

document.getElementById("amenazas-card").addEventListener('click', () => {
    document.querySelector('#container-potencial').classList.remove('show');
    document.querySelector('#container-residual').classList.remove('show');
});

document.getElementById("residual-card").addEventListener('click', () => {
    document.querySelector('#container-potencial').classList.remove('show');
    document.querySelector('#container-amenazas').classList.remove('show');
});

document.getElementById("potencial-card").addEventListener('click', () => {
    document.querySelector('#container-amenazas').classList.remove('show');
    document.querySelector('#container-residual').classList.remove('show');
});

document.querySelector('#types').addEventListener('change', (event) => {
    document.getElementById("accordion").innerHTML = originalContent;
    document.getElementById("extra").innerHTML = "";
    document.getElementById("max_sv").innerHTML = "";
    document.getElementById("shortdiv").style.display = "block";
    document.getElementById("type-name").innerHTML = event.target.value;
    loadData(anomalias, function(text){if(text.length>0){getAnomalies(JSON.parse(text), event.target.value);}});
   if(event.target.value === "Global"){
        location.reload();
    }

    if (event.target.value === "Ultimos Datos"){
        document.getElementById("subtype").innerHTML = "";
        document.getElementById("shortdiv").style.display = "none";
        document.getElementById("amenazas-card").innerHTML = "Última Anomalía Detectada";
        query = "PREFIX owl: <http://www.w3.org/2002/07/owl#>\n" +
                    "PREFIX cyberthreat_DRM: <http://www.semanticweb.org/upm/ontologies/2019/11/cyberthreat_DRM#>\n" + 
                    "PREFIX cyberthreat_STIX: <http://www.semanticweb.org/upm/ontologies/2019/11/cyberthreat_STIX#>\n " + 
                    "PREFIX cyberthreat_ONA: <http://www.semanticweb.org/paulagarcia/ontologies/2020/2/cyberthreat_ONA#>\n" + 
                    "PREFIX cibersituational-ontology: <http://www.semanticweb.org/paulagarcia/ontologies/2020/2/cibersituational-ontology#>\n" + 
                    "SELECT ?individuo ?t ?sv\n" + 
                    "Where{\n" + 
                        "{?individuo a cyberthreat_ONA:Detected_Anomaly.} UNION {?subject a cyberthreat_ONA:Detected_Anomaly.}\n" +
                        "?individuo cibersituational-ontology:start_time ?t.\n" +
                        "?individuo cibersituational-ontology:related_sv ?sv.\n" +
                    "} order by desc (?t)";
         fusekiConn(query, getLastData);
    }

   if(event.target.value === "Anomalias"){
        document.getElementById("mt-3").style.display = "none";
        document.getElementById("anomalias-card").innerHTML = "Nº Anomalías";
        document.getElementById('amenazas-card').innerHTML = "Identificadores";
        document.getElementById("total_cases").innerHTML = "Identificadores detectados";
        document.getElementById('potencial-card').innerHTML = "Campo Principal";
        document.getElementById("potencial-count").innerHTML = "";
        document.getElementById("potencial_lab").innerHTML = "-";
        document.querySelector('#container-potencial').classList.remove('show');
        document.querySelector('#container-amenazas').classList.remove('show');
        document.querySelector('#container-residual').classList.remove('show');
        document.getElementById("subtype").innerHTML = '&nbsp<div id="stypes"><div id="WF">Wi-Fi</div>' + 
            '<div id="RF">Radio Frecuencia</div>' + 
            '<div id="RM">Redes Moviles</div>' + 
            '<div id="IDS">IDS</div>' +
            '<div id="CS">Ciberseguridad</div>' + 
            '<div id="BT">Bluetooth</div>' + 
            '<div id="SM">SIEM</div>' + 
            '<div id="Connection">Firewall</div></div>';
   }

   if(event.target.value === "Activos"){
        document.getElementById("mt-3").style.display = "none";
        document.getElementById("anomalias-card").innerHTML = "Tipos de Activos";
        document.getElementById("subtype").innerHTML = "";
        var query = "PREFIX owl: <http://www.w3.org/2002/07/owl#>\n" +
            "PREFIX cyberthreat_DRM: <http://www.semanticweb.org/upm/ontologies/2019/11/cyberthreat_DRM#>\n" + 
            "PREFIX cyberthreat_STIX: <http://www.semanticweb.org/upm/ontologies/2019/11/cyberthreat_STIX#>\n " + 
            "PREFIX cyberthreat_ONA: <http://www.semanticweb.org/paulagarcia/ontologies/2020/2/cyberthreat_ONA#>\n" + 
            "PREFIX cibersituational-ontology: <http://www.semanticweb.org/paulagarcia/ontologies/2020/2/cibersituational-ontology#>\n" + 
            "SELECT ?individuo ?t\n" + 
            "Where{\n" + 
                "?individuo a cyberthreat_DRM:Asset.\n" +
                "?individuo cibersituational-ontology:type ?t.\n"+
            "}";
        fusekiConn(query, listAssets);

        var query = "PREFIX owl: <http://www.w3.org/2002/07/owl#>\n" +
                    "PREFIX cyberthreat_DRM: <http://www.semanticweb.org/upm/ontologies/2019/11/cyberthreat_DRM#>\n" + 
                    "PREFIX cyberthreat_STIX: <http://www.semanticweb.org/upm/ontologies/2019/11/cyberthreat_STIX#>\n " + 
                    "PREFIX cyberthreat_ONA: <http://www.semanticweb.org/paulagarcia/ontologies/2020/2/cyberthreat_ONA#>\n" + 
                    "PREFIX cibersituational-ontology: <http://www.semanticweb.org/paulagarcia/ontologies/2020/2/cibersituational-ontology#>\n" + 
                    "SELECT ?individuo ?i\n" + 
                    "Where{\n" + 
                        "?individuo a cyberthreat_DRM:Asset.\n" +
                        "?individuo cyberthreat_DRM:dependsOn ?i.\n"+
                    "}";
        fusekiConn(query, fillAssets);
    }

    if(event.target.value === "Amenazas"){
        document.getElementById("mt-3").style.display = "none";
        var query = "PREFIX owl: <http://www.w3.org/2002/07/owl#>\n" +
                    "PREFIX cyberthreat_DRM: <http://www.semanticweb.org/upm/ontologies/2019/11/cyberthreat_DRM#>\n" + 
                    "PREFIX cyberthreat_STIX: <http://www.semanticweb.org/upm/ontologies/2019/11/cyberthreat_STIX#>\n " + 
                    "PREFIX cyberthreat_ONA: <http://www.semanticweb.org/paulagarcia/ontologies/2020/2/cyberthreat_ONA#>\n" + 
                    "PREFIX cibersituational-ontology: <http://www.semanticweb.org/paulagarcia/ontologies/2020/2/cibersituational-ontology#>\n" + 
                    "SELECT ?individuo ?type ?i ?p\n" + 
                    "Where{\n" + 
                        "?individuo a cyberthreat_DRM:Threat.\n" +
                        "?individuo cibersituational-ontology:type ?type.\n"+
                        "?individuo cibersituational-ontology:impact ?i.\n"+
                        "?individuo cibersituational-ontology:total_prob ?p.\n"+
                    "}";
    fusekiConn(query, fillThreats);
    document.getElementById("total_cases").innerHTML = "Impacto medio";
    document.getElementById("potencial_lab").innerHTML = "Probabilidad media";
    document.getElementById("anomalias-card").innerHTML = "Numero de Amenazas";
    document.getElementById("subtype").innerHTML = "";
    }

    if(event.target.value === "Riesgos"){
        document.getElementById("mt-3").style.display = "inline";
        var query = "PREFIX owl: <http://www.w3.org/2002/07/owl#>\n" +
                    "PREFIX cyberthreat_DRM: <http://www.semanticweb.org/upm/ontologies/2019/11/cyberthreat_DRM#>\n" + 
                    "PREFIX cyberthreat_STIX: <http://www.semanticweb.org/upm/ontologies/2019/11/cyberthreat_STIX#>\n " + 
                    "PREFIX cyberthreat_ONA: <http://www.semanticweb.org/paulagarcia/ontologies/2020/2/cyberthreat_ONA#>\n" + 
                    "PREFIX cibersituational-ontology: <http://www.semanticweb.org/paulagarcia/ontologies/2020/2/cibersituational-ontology#>\n" + 
                    "SELECT ?individuo ?type ?p ?i ?r\n" + 
                    "Where{\n" + 
                        "?individuo a cyberthreat_DRM:Risk.\n" +
                        "?pr a cyberthreat_DRM:PotentialRisk.\n" +
                        "?individuo cibersituational-ontology:type ?type.\n"+
                        "?individuo cyberthreat_DRM:hasAssessmentOf ?pr.\n"+
                        "?pr cibersituational-ontology:probability ?p.\n"+
                        "?pr cibersituational-ontology:impact ?i.\n"+
                        "?pr cibersituational-ontology:potentialRisk ?r.\n"+
                    "}";
        fusekiConn(query, fillRisks);
        document.getElementById("total_cases").innerHTML = "Riesgo medio";
        document.getElementById("potencial_lab").innerHTML = "Probabilidad media";
        document.getElementById("residual-lab").innerHTML = "Impacto media"
        document.getElementById("anomalias-card").innerHTML = "Numero de Riesgos";
        document.getElementById("subtype").innerHTML = "";
    }
    if(event.target.value === "Anomalias Correladas"){
        
        var query = "PREFIX owl: <http://www.w3.org/2002/07/owl#>\n" +
                    "PREFIX cyberthreat_DRM: <http://www.semanticweb.org/upm/ontologies/2019/11/cyberthreat_DRM#>\n" + 
                    "PREFIX cyberthreat_STIX: <http://www.semanticweb.org/upm/ontologies/2019/11/cyberthreat_STIX#>\n " + 
                    "PREFIX cyberthreat_ONA: <http://www.semanticweb.org/paulagarcia/ontologies/2020/2/cyberthreat_ONA#>\n" + 
                    "PREFIX cibersituational-ontology: <http://www.semanticweb.org/paulagarcia/ontologies/2020/2/cibersituational-ontology#>\n" + 
                    "SELECT ?individuo \n" + 
                    "Where {?individuo a cyberthreat_ONA:Correlated_Anomaly.}";
        fusekiConn(query, nCorr);

        query = "PREFIX owl: <http://www.w3.org/2002/07/owl#>\n" +
                    "PREFIX cyberthreat_DRM: <http://www.semanticweb.org/upm/ontologies/2019/11/cyberthreat_DRM#>\n" + 
                    "PREFIX cyberthreat_STIX: <http://www.semanticweb.org/upm/ontologies/2019/11/cyberthreat_STIX#>\n " + 
                    "PREFIX cyberthreat_ONA: <http://www.semanticweb.org/paulagarcia/ontologies/2020/2/cyberthreat_ONA#>\n" + 
                    "PREFIX cibersituational-ontology: <http://www.semanticweb.org/paulagarcia/ontologies/2020/2/cibersituational-ontology#>\n" + 
                    "SELECT ?individuo ?t ?r ?a\n" + 
                    "Where{\n" + 
                        "?individuo a cyberthreat_ONA:Correlated_Anomaly.\n" +
                        "?individuo cibersituational-ontology:start_time ?t.\n" +
                        "?individuo cibersituational-ontology:rule ?r.\n"+
                        "?individuo cibersituational-ontology:caused_by ?a.\n" +
                    "}";
        fusekiConn(query, getCorr);
        document.getElementById("potencial_lab").innerHTML = "";
        document.getElementById("residual-lab").innerHTML = "";
        document.getElementById("anomalias-card").innerHTML = "Nº Anomalías Correladas";
        document.getElementById("subtype").innerHTML = "";
    }
});
