#!/bin/sh

# Start ssh server 

/usr/sbin/sshd

# Set required Elasticsearch variables at /ontologias/config-files/esConfig.txt

sed -i '1c\ELASTIC.SEARCH.IP = '"${ELASTICSEARCH_IP}" /ontologias/config-files/esConfig.txt
sed -i '2c\ELASTIC.SEARCH.INDEX = '"${ELASTICSEARCH_INDEX}" /ontologias/config-files/esConfig.txt
sed -i '3c\ELASTIC.SEARCH.USER = '"${ELASTIC_USERNAME}" /ontologias/config-files/esConfig.txt
sed -i '4c\ELASTIC.SEARCH.PWD = '"${ELASTIC_PASSWORD}" /ontologias/config-files/esConfig.txt

# Start Fuseki server

sleep 2m

cd ontologias/apache-jena-fuseki-${FUSEKI_VERSION}

./fuseki-server --update &

# Check if index are created

cd ..
cd ..
./indexCheck.sh

# Start jar

cd ontologias
java -jar /ontologias/PLICAOntologiasV3.0.jar