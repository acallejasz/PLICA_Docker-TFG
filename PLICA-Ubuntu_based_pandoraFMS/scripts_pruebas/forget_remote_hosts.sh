#!/bin/bash

kafka_id=$(docker ps -q --filter "name=kafka")
zookeeper_id=$(docker ps -q --filter "name=zookeeper")
elasticsearch_id=$(docker ps -q --filter "name=elasticsearch")
kibana_id=$(docker ps -q --filter "name=kibana")
spark_master_id=$(docker ps -q --filter "name=spark-master")
spark_worker_id=$(docker ps -q --filter "name=plica_worker_1")
elastalert_id=$(docker ps -q --filter "name=elastalert")

kafka_ip=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $kafka_id)
zookeeper_ip=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $zookeeper_id)
elasticsearch_ip=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $elasticsearch_id)
kibana_ip=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $kibana_id)
spark_master_ip=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $spark_master_id)
spark_worker_ip=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $spark_worker_id)
elastalert_ip=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $elastalert_id)

declare -a ips=($kafka_ip $zookeeper_ip $elasticsearch_ip $kibana_ip $spark_master_ip $spark_worker_ip $elastalert_ip)

for i in "${ips[@]}"
do
	# Borrado de los host conocidos
	echo
	echo "Se procede a eliminar el host: " $i
	echo
	ssh-keygen -f "/home/acallejasz/.ssh/known_hosts" -R "$i"

done

