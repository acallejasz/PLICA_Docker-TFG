#!/bin/sh

# Start ssh server 

/usr/sbin/sshd

# Set required Elasticsearch variables at /ontologias/config-files/esConfig.txt

sed -i '1c\ELASTIC.SEARCH.IP = '"${ELASTICSEARCH_IP}" /ontologias/config-files/esConfig.txt
sed -i '2c\ELASTIC.SEARCH.PORT = '"${ELASTICSEARCH_PORT}" /ontologias/config-files/esConfig.txt
sed -i '3c\ELASTIC.SEARCH.USERNAME = '"${ELASTIC_USERNAME}" /ontologias/config-files/esConfig.txt
sed -i '4c\ELASTIC.SEARCH.PASSWORD = '"${ELASTIC_PASSWORD}" /ontologias/config-files/esConfig.txt
sed -i '5c\ELASTIC.SEARCH.INDEX = '"${ELASTICSEARCH_INDEX}" /ontologias/config-files/esConfig.txt

# Set required Fuseki ip at /ontologias/scripts/app.js (It may change if you change the netwotk)

sed -i '111c\var queryUrl = "http://'"${FUSEKI_IP}"':3030/PLICA/sparql" + "?query=" + encodeURIComponent(query) + "&format=json";' /ontologias/scripts/app.js 

# Start Fuseki server

sleep 30s

cd ontologias/apache-jena-fuseki-${FUSEKI_VERSION}

./fuseki-server --update &

# Start jar

cd ..
java -jar /ontologias/PLICAOntologiasV3.0.jar