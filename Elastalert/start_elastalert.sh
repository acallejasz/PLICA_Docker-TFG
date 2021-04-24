#!/bin/sh

# Start ssh server 

/usr/sbin/sshd

sleep 3m

elastic_id=$(docker ps -q --filter "name=elasticsearch")

if [ -z "${elastic_id}" ]; then
	echo
    echo "Error: Tienes que levantar primero el contenedor de Elasticsearch"
    echo
    exit 0
fi

elastalert-create-index --config /opt/config/config_correlacion_conjunta.yaml
elastalert-create-index --config /opt/config/config_correlacion_individual.yaml
elastalert --config /opt/config/config_correlacion_conjunta.yaml &
elastalert --config /opt/config/config_correlacion_individual.yaml 