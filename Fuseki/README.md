# Ontologías

El sistema de ontologías trata de desarrollar un entorno para la
gestión, la integración de información y el cálculo dinámico del riesgo.

Este sistema esta diseñado para integrar información sobre anomalías, activos desde la
herramienta PILAR e información de STIX.

El sistema procesa y razona la información, genera nuevas amenazas y actualiza los
riesgos. Por otro lado, evalúa estos riesgos y actualiza los riesgos potenciales y
residuales de la organización.

Por último, el sistema cuenta con una interfaz de visualización para mostrar
gráficamente los resultados obtenidos del cálculo del riesgo (Servidor Fuseki).

Para su desarrollo y pruebas se han utilizado los siguientes recursos, aunque pueden utilizarse otros recursos de sistema operativo:

  - Eclipse
  - Java 8
  - [Protégé](https://protege.stanford.edu/) - Protégé 5.5.0
  - Sistema Operativo Mac OS Catalina versión 10.15.5 y 10.15.6


## Objetivos

  - Importar información de anomalías
  - Importar información de activos
  - Importar información de Threat Intelligence
  - Calcular el Riesgo

## Instalación del ENTORNO DEL SISTEMA DE ONTOLOGÍAS:

### 1.	Descomprimir PLICA_Ontologia.tgz

Ejecutar en una ventana de terminal: ```tar -xzvf PLICA_Ontologia.tgz```

En el directorio que se crea aparecerán los siguientes archivos:  

-	fuseki-config.ttl  
-	shiro.ini  
-	fuseki_installation.sh
-	config.txt
-	Sub-directorio config-files
-	PLICAOntologiasv1.13.jar
-	README.md 

### 2. Instalar Servidor Fuseki mediante el script “fuseki_installation.sh”:
Para instalar y conigurar el servidor Fuseki, ejecutar el comando de terminal:  

    cd PLICA_Ontologia  
    bash ./fuseki_installation.sh


## Ejecución del ENTORNO DEL SISTEMA DE ONTOLOGÍAS:

### 1.	Configurar los parámetros en los archivos del subdirectorio config-files:


- **AnomaliesConfigSV.txt:** *UMBRAL* (valor mínimo a partir del cual una anomalía es susceptible de generar amenazas) e *INTERVALO* (valor con el que aumenta el valor del parámetro SUSPICIOUS VALUE).

- **riskConfig.txt:** *RISK.PENALIZATION.VALUE* (define en minutos la antigüedad máxima de las mediciones para tener en cuenta para realizar el cálculo del riesgo). 

### 2. Configurar ficheros provisionales para el correcto funcionamiento del sistema.

Ejecutar en una ventana de terminal:  
    
    cd PLICA_Ontologia 
    bash ./PLICA_Ontologia/configuration.sh

### 3.	Lanzar servidor Fuseki: 

Para iniciar el servidor se deben ejecutar los siguientes comandos:

    cd PLICA_Ontologia/apache-jena-fuseki-3.16.0  
    bash ./fuseki-server --update  

El servidor ya está disponible en [http://localhost:3030.](http://localhost:3030)

### 4.	Ejecutar jar: java -jar PLICAOntologiasv1.13.jar

Para ello, como último paso, se ejecuta en otra ventana de terminal situada en el directorio **PLICA_Ontologia** el comando:  

    cd PLICA_Ontologia 
    java -jar PLICAOntologiasV1.13.jar




