#!/bin/sh

# Start ssh server and pandoraFMS agent

/usr/sbin/sshd

service pandora_agent_daemon start

# Set required variables at /configFiles

sed -i '17c\es_host: '"${ELASTICSEARCH_IP}" /opt/config/config_correlacion_conjunta.yaml
sed -i '20c\es_port: '"${ELASTICSEARCH_PORT}" /opt/config/config_correlacion_conjunta.yaml
sed -i '46c\es_username: '"${ELASTIC_USERNAME}" /opt/config/config_correlacion_conjunta.yaml
sed -i '47c\es_password: '"${ELASTIC_PASSWORD}" /opt/config/config_correlacion_conjunta.yaml

sed -i '17c\es_host: '"${ELASTICSEARCH_IP}" /opt/config/config_correlacion_individual.yaml
sed -i '20c\es_port: '"${ELASTICSEARCH_PORT}" /opt/config/config_correlacion_individual.yaml
sed -i '46c\es_username: '"${ELASTIC_USERNAME}" /opt/config/config_correlacion_individual.yaml
sed -i '47c\es_password: '"${ELASTIC_PASSWORD}" /opt/config/config_correlacion_individual.yaml

sleep 1m

elastalert-create-index --config /opt/config/config_correlacion_conjunta.yaml
elastalert-create-index --config /opt/config/config_correlacion_individual.yaml
elastalert --config /opt/config/config_correlacion_conjunta.yaml &
elastalert --config /opt/config/config_correlacion_individual.yaml 