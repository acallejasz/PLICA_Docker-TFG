# Gestor de Flujos v.0 PLICA
# Maintainer: Universidad Politecnica de Madrid
# Contact: a.callejasz@upm.es


#!/bin/bash

# Creación de contenedor kafka para hacer de broker
# Se introducen manualmente los listener y puertos a utilizar, que nunca deben coincidir con el broker principal o con ningún otro broker
# Por teclado se introduce: 
#	- Primero el numero de puerto, que debe ser ser +3 el del último broker utilizado 
#	- El segundo parámetro a introducir deber ser el id del broker, que no debe coincidir con ningún otro

broker_ip=$(docker network inspect -f '{{range .IPAM.Config}}{{.Gateway}}{{end}}' kafka_PLICA)
port1=$(($1-1))
port2=$(($1+1))

docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v kafka_certs-zookeeper:/var/ssl/private/zookeeper -v kafka_certs-kafka:/var/ssl/private/kafka \
-v kafka_broker_config:/opt/kafka/config -e  KAFKA_ADVERTISED_HOST_NAME=$broker_ip -e KAFKA_ZOOKEEPER_CONNECT=zookeeper:2281 -e KAFKA_PORT=$1 -e KAFKA_ADVERTISED_PORT=$1 \
-e KAFKA_LISTENERS=PLAINTEXT://:$port1,SSL://:$1,SASL_SSL://:$port2 -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://$broker_ip:$port1,SSL://$broker_ip:$1,SASL_SSL://$broker_ip:$port2 \
-e  KAFKA_BROKER_ID=$2 --name broker$2 --network kafka_PLICA -p $1:$1 -i -t acallejasz/kafka /usr/bin/start-broker.sh
