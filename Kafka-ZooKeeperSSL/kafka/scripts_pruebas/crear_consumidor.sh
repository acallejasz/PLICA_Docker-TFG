# Gestor de Flujos v.0 PLICA
# Maintainer: Universidad Politecnica de Madrid
# Contact: a.callejasz@upm.es


#!/bin/bash

# Creación de contenedor kafka para hacer de consumidor
# Se introduce manualmente el topic al que se quiere conectar como primer y único parámetro

broker_ip=$(docker network inspect -f '{{range .IPAM.Config}}{{.Gateway}}{{end}}' kafka_PLICA)
port=$(docker inspect kafka | grep HostPort | sort | uniq | grep -o [0-9]*)

docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -e HOST_IP=$broker_ip --name consumer -i -t acallejasz/kafka \
/opt/kafka/bin/kafka-console-consumer.sh --topic=$1 --from-beginning --bootstrap-server=$broker_ip:$port --consumer.config /opt/kafka/config/consumer_ssl.properties