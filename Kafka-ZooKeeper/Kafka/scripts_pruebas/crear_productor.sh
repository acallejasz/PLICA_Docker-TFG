# Gestor de Flujos v.0 PLICA
# Maintainer: Universidad Politecnica de Madrid
# Contact: a.callejasz@upm.es


#!/bin/bash

# Creación de contenedor kafka pra hacer de productor
# Se opta por el filtrado referenciado al nombre del contenedor
# Se introduce manualmente el topic al que se quiere conectar

docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -e HOST_IP=$1 --name producer -i -t wurstmeister/kafka

kafka_id=$(docker ps -q --filter "name=producer")

sudo docker exec -it $kafka_id /opt/kafka/bin/kafka-console-producer.sh --topic=$2 --bootstrap-server=`broker-list.sh`
