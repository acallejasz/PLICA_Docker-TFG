# Gestor de Flujos v.0 PLICA
# Maintainer: Universidad Politecnica de Madrid
# Contact: a.callejasz@upm.es


#!/bin/bash

# Creación de contenedor kafka pra hacer de productor
# Se opta por el filtrado referenciado al nombre del contenedor
# Se introduce manualmente el topic al que se quiere conectar

docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -e HOST_IP=$1 --name consumer -i -t wurstmeister/kafka

kafka_id=$(docker ps -q --filter "name=consumer")

sudo docker exec -it $kafka_id /opt/kafka/bin/kafka-console-consumer.sh --topic=$2 --from-beginning --bootstrap-server=`broker-list.sh`