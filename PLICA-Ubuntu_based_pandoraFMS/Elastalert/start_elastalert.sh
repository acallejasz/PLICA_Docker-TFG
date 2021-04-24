#!/bin/sh

# Start ssh server and pandoraFMS agent

/usr/sbin/sshd

service pandora_agent_daemon start

sleep 2m

elastalert-create-index --config /opt/config/config_correlacion_conjunta.yaml
elastalert-create-index --config /opt/config/config_correlacion_individual.yaml
elastalert --config /opt/config/config_correlacion_conjunta.yaml &
elastalert --config /opt/config/config_correlacion_individual.yaml 