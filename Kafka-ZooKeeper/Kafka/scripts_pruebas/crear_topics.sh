# Gestor de Flujos v.0 PLICA
# Maintainer: Universidad Politecnica de Madrid
# Contact: a.callejasz@upm.es


#!/bin/bash

# Filtrado por puertos expuestos, kafka comparte puerto con el conector de elastic
# Se opta por el filtrado referenciado al contenedor que se levanta
# Se debe introducir como primer parámetro el número de réplicas y como segundo el número de particiones

kafka_id=$(docker ps -q --filter "name=kafka")
zookeeper_id=$(docker ps -q --filter "expose=2181")
zookeeper_ip=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $zookeeper_id)
broker_ip=$(docker network inspect -f '{{range .IPAM.Config}}{{.Gateway}}{{end}}' kafka_PLICA)
port=$(docker inspect kafka | grep HostPort | sort | uniq | grep -o [0-9]*)


declare -a topics=("WF-DATA" "BT-DATA" "CS-DATA" "RF-DATA" "RM-DATA" "TI-DATA" "PF-DATA" "UBA-DATA")

## now loop through the above array
for i in "${topics[@]}"
do
	# Creacion de topics desde Kafka instalado en docker
	sudo docker exec -it $kafka_id /opt/kafka/bin/kafka-topics.sh --create --bootstrap-server=$broker_ip:$port \
	--command-config=/opt/kafka/config/producer_ssl.properties --replication-factor $1 --partitions $2 --topic "$i"  --config retention.ms=5000

done

echo Topics creados