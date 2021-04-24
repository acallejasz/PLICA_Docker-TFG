# ML Spark v.0 PLICA
# Maintainer: Universidad Politecnica de Madrid
# Contact: a.callejasz@upm.es


#!/bin/bash

# Fichero que permite ejecutar en nuestro spark-master la rutina que se desee
# El parametro introducido indica sobre que se quiere iniciar la rutina e. WiFi=1

# Comprobacion de que Kafka esta levantado

kafka_id=$(docker ps -q --filter "name=kafka")
elastic_id=$(docker ps -q --filter "name=elasticsearch")
spark_master=$(docker ps -q --filter "name=spark-master")

if [ -z "${kafka_id}" ]; then
	echo
    echo "Error: Tienes que levantar primero el contenedor de Kafka"
    echo
    exit 0
fi

# Comprobacion de que Elastic esta levantado

if [ -z "${elastic_id}" ]; then
	echo
    echo "Error: Tienes que levantar primero el contenedor de Kafka"
    echo
    exit 0
fi


if [ "$1" == "wifi" ] || [ "$1" == "bluetooth" ] || [ "$1" == "fw" ] || [ "$1" == "rf" ] || [ "$1" == "rm" ] || [ "$1" == "siem" ]; then
	docker exec -itd ${spark_master} /bin/sh /template.sh $1
else
	echo
	echo -n "Unknown task - Try one: wifi-bluetooth-fw-rf-rm-siem"
	echo
	echo
fi

