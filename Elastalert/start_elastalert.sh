#!/bin/sh

# Start ssh server 

/usr/sbin/sshd

elastic_id=$(docker ps -q --filter "name=elasticsearch")

if [ -z "${elastic_id}" ]; then
	echo
    echo "Error: Tienes que levantar primero el contenedor de Elasticsearch"
    echo
    exit 0
fi

# Set required variables at /configFiles

sed -i '17c\es_host: '"${ELASTICSEARCH_IP}" /opt/config/config_correlacion_conjunta.yaml
sed -i '20c\es_port: '"${ELASTICSEARCH_PORT}" /opt/config/config_correlacion_conjunta.yaml
sed -i '46c\es_username: '"${ELASTIC_USERNAME}" /opt/config/config_correlacion_conjunta.yaml
sed -i '47c\es_password: '"${ELASTIC_PASSWORD}" /opt/config/config_correlacion_conjunta.yaml

sed -i '17c\es_host: '"${ELASTICSEARCH_IP}" /opt/config/config_correlacion_individual.yaml
sed -i '20c\es_port: '"${ELASTICSEARCH_PORT}" /opt/config/config_correlacion_individual.yaml
sed -i '46c\es_username: '"${ELASTIC_USERNAME}" /opt/config/config_correlacion_individual.yaml
sed -i '47c\es_password: '"${ELASTIC_PASSWORD}" /opt/config/config_correlacion_individual.yaml

sleep 2m

elastalert-create-index --config /opt/config/config_correlacion_conjunta.yaml
elastalert-create-index --config /opt/config/config_correlacion_individual.yaml
elastalert --config /opt/config/config_correlacion_conjunta.yaml &
elastalert --config /opt/config/config_correlacion_individual.yaml 