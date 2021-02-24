# Gestor de Flujos v.0 PLICA
# Maintainer: Universidad Politecnica de Madrid
# Contact: mario.sanz@upm.es


#!/bin/bash


# NOTA: En docker (contenedor kafka) es necesario habilitar "delete.topics.enable=true" en el fichero
# "server.properties" en el path del contenedor "/opt/kafka_2.12-0.11.0.1/config".

# Para acceder al contenedor "docker exec -it nombre_del_container /bin/bash", nano no esta instalado
# se puede instalar con "apk add nano".

# Solo es necesario si se ejecuta kafka en local no en docker
#BIN_PATH="/home/kafka/kafka/bin"
#cd $BIN_PATH

# Filtrado por puertos expuestos, kafka comparte puerto con el conector de elastic
# Se opta por el filtrado referenciado a su imagen base

#kafka_id=$(docker ps -q --filter "expose=9092")
kafka_id=$(docker ps -q --filter "name=kafka")
zookeeper_id=$(docker ps -q --filter "expose=2181")
zookeeper_ip=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $zookeeper_id)

declare -a topics=("WF-DATA" "BT-DATA" "CS-DATA" "RF-DATA" "RM-DATA" "TI-DATA" "PF-DATA" "UBA-DATA")

## now loop through the above array
for i in "${topics[@]}"
do
	# Eliminacion de topics desde Kafka instalado en local
	#udo ./kafka-topics.sh --delete --zookeeper localhost:2181 --topic "$i"
	# Eliminacion de topics desde Kafka instlado en docker (modificar el nombre del contenedor y la IP de zookeeper correspondiente)
	sudo docker exec -itd $kafka_id kafka-topics.sh --delete --zookeeper $zookeeper_ip:2181 --topic "$i"

done

echo Topics eliminados