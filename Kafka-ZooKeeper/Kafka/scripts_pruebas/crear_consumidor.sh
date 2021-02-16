# Gestor de Flujos v.0 PLICA
# Maintainer: Universidad Politecnica de Madrid
# Contact: a.callejasz@upm.es


#!/bin/bash

# Creación de contenedor kafka para hacer de consumidorr
# Se introduce manualmente el topic al que se quiere conectar

broker_ip=$(docker network inspect -f '{{range .IPAM.Config}}{{.Gateway}}{{end}}' bridge)
port=$(docker inspect kafka-docker_kafka_1 | grep HostPort | sort | uniq | grep -o [0-9]*)

docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -e HOST_IP=$1 --name consumer -i -t wurstmeister/kafka /opt/kafka/bin/kafka-console-consumer.sh --topic=$2 --from-beginning --bootstrap-server=$broker_ip:$port