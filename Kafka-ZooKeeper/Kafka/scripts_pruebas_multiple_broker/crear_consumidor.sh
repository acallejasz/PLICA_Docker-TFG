# Gestor de Flujos v.0 PLICA
# Maintainer: Universidad Politecnica de Madrid
# Contact: a.callejasz@upm.es


#!/bin/bash

# Creación de contenedor kafka para hacer de consumidorr
# Se introduce manualmente el topic al que se quiere conectar
# Cuando se ejecute el script indicar como primer parámetro el HOST_ADVERTISED_NAME (Que debe ser al gateway de la network definida en el compose) y como segundo el topic a usar de los creados

broker_ip=$(docker network inspect -f '{{range .IPAM.Config}}{{.Gateway}}{{end}}' kafka_PLICA)
port=$(docker inspect kafka1 | grep HostPort | sort | uniq | grep -o [0-9]*)

docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -e HOST_IP=$1 --name consumer -i -t acallejasz/kafka /opt/kafka/bin/kafka-console-consumer.sh --topic=$2 --from-beginning --bootstrap-server=$broker_ip:$port --consumer.config /opt/kafka/config/consumer_ssl.properties