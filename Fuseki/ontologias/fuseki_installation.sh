#!/bin/bash

# Instalar servidor

cd ontologias
wget https://archive.apache.org/dist/jena/binaries//apache-jena-fuseki-${FUSEKI_VERSION}.tar.gz
tar -xzvf apache-jena-fuseki-${FUSEKI_VERSION}.tar.gz

echo ""
echo "- - - - - - - - - - - - - - - - - - - - - - - - "
echo "Servidor Fuseki Instalado."
echo "- - - - - - - - - - - - - - - - - - - - - - - - "
echo ""

# Configurar servidor

cd apache-jena-fuseki-${FUSEKI_VERSION}
bash ./fuseki-server &
echo  "Configurando Fuseki ..."
sleep 10
ps aux | grep -i fuseki-server | awk {'print $1'} | head -2 | xargs kill
cd ..
cp shiro.ini ./apache-jena-fuseki-${FUSEKI_VERSION}/run/shiro.ini
cp fuseki-config.ttl ./apache-jena-fuseki-${FUSEKI_VERSION}/run/configuration/fuseki-config.ttl

echo ""
echo "- - - - - - - - - - - - - - - - - - - - - - - - "
echo "Servidor Fuseki configurado correctamente."
echo "- - - - - - - - - - - - - - - - - - - - - - - - "
echo ""

