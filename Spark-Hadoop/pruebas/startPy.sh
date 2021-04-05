# ML Spark v.0 PLICA
# Maintainer: Universidad Politecnica de Madrid
# Contact: a.callejasz@upm.es


#!/bin/bash

# Fichero que permite ejecutar en nuestro spark-master la rutina que se desee
# El parametro introducido indica sobre que se quiere iniciar la rutina e. WiFi=1

# Comprobacion de que Kafka esta levantado

kafka_id=$(docker ps -q --filter "name=kafka")
spark_master=$(docker ps -q --filter "name=spark-master")

if [ -z "${kafka_id}" ]; then
	echo
    echo "Tienes que levantar primero el  contenedor de Kafka"
    echo
    exit 0
fi

export SPARK_MASTER_URL=spark://${SPARK_MASTER_NAME}:${SPARK_MASTER_PORT}
export SPARK_HOME=/spark

sudo docker exec -it ${spark_master} /bin/sh /template.sh $1

