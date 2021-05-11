# Gestor de Flujos v.0 PLICA
# Maintainer: Universidad Politecnica de Madrid
# Contact: a.callejasz@upm.es


#!/bin/bash

# Creación de contenedor kafka para hacer de productor
# Se introduce manualmente el topic al que se quiere conectar como primer y único parámetro
# Cambiar si cambia la versión de Kafka

broker_ip=$(docker network inspect -f '{{range .IPAM.Config}}{{.Gateway}}{{end}}' kafkassl_PLICA)
port=$(docker inspect kafkaSSL | grep HostPort | sort | uniq | grep -o [0-9]*)

docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -e HOST_IP=$broker_ip --name producer$2 -i -t kafka_ssl:2.7.0 \
/opt/kafka/bin/kafka-console-producer.sh --topic=$1 --bootstrap-server=$broker_ip:$port --producer.config /opt/kafka/config/producer_ssl.properties
