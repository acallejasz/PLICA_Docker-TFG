# Gestor de Flujos v.0 PLICA
# Maintainer: Universidad Politecnica de Madrid
# Contact: mario.sanz@upm.es


#!/bin/bash


# Solo es necesario si se ejecuta kafka en local no en docker
#BIN_PATH="/home/kafka/kafka/bin"
#cd $BIN_PATH

# Filtrado por puertos expuestos, kafka comparte puerto con el conector de elastic
# Se opta por el filtrado referenciado a su imagen base

#kafka_id=$(docker ps -q --filter "expose=9092")
kafka_id=$(docker ps -q --filter "name=kafka_kafka_1")
zookeeper_id=$(docker ps -q --filter "expose=2181")
zookeeper_ip=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $zookeeper_id)

declare -a topics=("WF-DATA" "BT-DATA" "CS-DATA" "RF-DATA" "RM-DATA" "TI-DATA" "PF-DATA" "UBA-DATA")

sudo docker exec -it $kafka_id /opt/kafka/bin/kafka-console-producer.sh --topic "WF-DATA" --bootstrap-server 192.168.99.100:9092