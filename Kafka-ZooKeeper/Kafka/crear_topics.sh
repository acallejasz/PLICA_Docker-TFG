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
kafka_id=$(docker ps -q --filter "ancestor=wurstmeister/kafka:0.11.0.1")
zookeeper_id=$(docker ps -q --filter "expose=2181")
zookeeper_ip=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $zookeeper_id)

declare -a topics=("WF-DATA" "BT-DATA" "CS-DATA" "RF-DATA" "RM-DATA" "TI-DATA" "PF-DATA" "UBA-DATA")

## now loop through the above array
for i in "${topics[@]}"
do
	# Creacion de topics desde Kafka instalado en local
	#sudo ./kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic "$i"
	# Creacion de topics desde Kafka instlado en docker (modificar el nombre del contenedor y la IP de zookeeper correspondiente)
	sudo docker exec -it $kafka_id kafka-topics.sh --create --zookeeper $zookeeper_ip:2181 --replication-factor 1 --partitions 1 --topic "$i"  --config retention.ms=5000

done

