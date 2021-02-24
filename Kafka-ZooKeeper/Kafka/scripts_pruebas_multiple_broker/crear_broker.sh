# Gestor de Flujos v.0 PLICA
# Maintainer: Universidad Politecnica de Madrid
# Contact: a.callejasz@upm.es


#!/bin/bash

# Creación de contenedor kafka para hacer de consumidorr
# Se introduce manualmente el topic al que se quiere conectar
# Cuando se ejecute el script indicar como primer parámetro el HOST_ADVERTISED_NAME (Que debe ser al gateway de la network definida en el compose) y como segundo el topic a usar de los creados

broker_ip=$(docker network inspect -f '{{range .IPAM.Config}}{{.Gateway}}{{end}}' kafka_PLICA)

docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v kafka_certs-zookeeper:/var/ssl/private/zookeeper -v kafka_certs-kafka:/var/ssl/private/kafka \
-v kafka_broker_kafka_config:/opt/kafka/config -e  KAFKA_ADVERTISED_HOST_NAME=$broker_ip -e KAFKA_ZOOKEEPER_CONNECT=zookeeper:2281 -e KAFKA_PORT=9096 -e KAFKA_ADVERTISED_PORT=9096 \
-e KAFKA_LISTENERS=PLAINTEXT://:9095,SSL://:9096,SASL_SSL://:9097 -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://172.20.0.1:9095,SSL://172.20.0.1:9096,SASL_SSL://172.20.0.1:9097 \
-e  KAFKA_BROKER_ID=20 --name broker2 --network kafka_PLICA -p 9096:9096 -i -t acallejasz/kafka /usr/bin/start-broker.sh
