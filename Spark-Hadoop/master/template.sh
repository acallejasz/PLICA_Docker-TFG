# ML Spark v.0 PLICA
# Maintainer: Universidad Politecnica de Madrid
# Contact: a.callejasz@upm.es


#!/bin/bash

# Fichero que permite ejecutar en nuestro spark-master la rutina que se desee
# El parametro introducido indica sobre que se quiere iniciar la rutina e. WiFi=1

export SPARK_MASTER_URL=spark://${SPARK_MASTER_NAME}:${SPARK_MASTER_PORT}
export SPARK_HOME=/spark


case $1 in

  wifi)
	if [ -f "${SPARK_APPLICATION_PYTHON_LOCATION_WF}" ]; then
	    echo "Submit application ${SPARK_APPLICATION_PYTHON_LOCATION_WF} to Spark master ${SPARK_MASTER_URL}"
	    echo "Logs available at ${SPARK_APPLICATION_LOG_WF}"
	 	PYSPARK_PYTHON=python3 /spark/bin/spark-submit \
	        --master ${SPARK_MASTER_URL} \
	        ${SPARK_SUBMIT_ARGS} \
	        ${SPARK_APPLICATION_PYTHON_LOCATION_WF} ${KAFKA_BROKER} ${WF_TOPIC} ${ELASTICSEARCH_IP} ${ELASTICSEARCH_PORT} ${ELASTIC_USERNAME} ${ELASTIC_PASSWORD} &> ${SPARK_APPLICATION_LOG_WF}
	else
	    echo "Not recognized application."
	fi
	;;

  bluetooth)
    if [ -f "${SPARK_APPLICATION_PYTHON_LOCATION_BT}" ]; then
	    echo "Submit application ${SPARK_APPLICATION_PYTHON_LOCATION_BT} to Spark master ${SPARK_MASTER_URL}"
	    echo "Passing arguments ${SPARK_APPLICATION_LOG_BT}"
	 	PYSPARK_PYTHON=python3 /spark/bin/spark-submit \
	        --master ${SPARK_MASTER_URL} \
	        ${SPARK_SUBMIT_ARGS} \
	        ${SPARK_APPLICATION_PYTHON_LOCATION_BT} ${KAFKA_BROKER} ${BT_TOPIC} ${ELASTICSEARCH_IP} ${ELASTICSEARCH_PORT} ${ELASTIC_USERNAME} ${ELASTIC_PASSWORD} &> ${SPARK_APPLICATION_LOG_BT}
	else
	    echo "Not recognized application."
	fi
    ;;

  fw)
    if [ -f "${SPARK_APPLICATION_PYTHON_LOCATION_FW}" ]; then
	    echo "Submit application ${SPARK_APPLICATION_PYTHON_LOCATION_FW} to Spark master ${SPARK_MASTER_URL}"
	    echo "Passing arguments ${SPARK_APPLICATION_LOG_FW}"
	 	PYSPARK_PYTHON=python3 /spark/bin/spark-submit \
	        --master ${SPARK_MASTER_URL} \
	        ${SPARK_SUBMIT_ARGS} \
	        ${SPARK_APPLICATION_PYTHON_LOCATION_FW} ${KAFKA_BROKER} ${FW_TOPIC} ${ELASTICSEARCH_IP} ${ELASTICSEARCH_PORT} ${ELASTIC_USERNAME} ${ELASTIC_PASSWORD} &> ${SPARK_APPLICATION_LOG_FW}
	else
	    echo "Not recognized application."
	fi
    ;;

  rf)
    if [ -f "${SPARK_APPLICATION_PYTHON_LOCATION_RF}" ]; then
	    echo "Submit application ${SPARK_APPLICATION_PYTHON_LOCATION_RF} to Spark master ${SPARK_MASTER_URL}"
	    echo "Passing arguments ${SPARK_APPLICATION_LOG_RF}"
	 	PYSPARK_PYTHON=python3 /spark/bin/spark-submit \
	        --master ${SPARK_MASTER_URL} \
	        ${SPARK_SUBMIT_ARGS} \
	        ${SPARK_APPLICATION_PYTHON_LOCATION_RF} ${KAFKA_BROKER} ${RF_TOPIC} ${ELASTICSEARCH_IP} ${ELASTICSEARCH_PORT} ${ELASTIC_USERNAME} ${ELASTIC_PASSWORD} &> ${SPARK_APPLICATION_LOG_RF}
	else
	    echo "Not recognized application."
	fi
    ;;

  rm)
    if [ -f "${SPARK_APPLICATION_PYTHON_LOCATION_RM}" ]; then
	    echo "Submit application ${SPARK_APPLICATION_PYTHON_LOCATION_RM} to Spark master ${SPARK_MASTER_URL}"
	    echo "Passing arguments ${SPARK_APPLICATION_LOG_RM}"
	 	PYSPARK_PYTHON=python3 /spark/bin/spark-submit \
	        --master ${SPARK_MASTER_URL} \
	        ${SPARK_SUBMIT_ARGS} \
	        ${SPARK_APPLICATION_PYTHON_LOCATION_RM}  ${KAFKA_BROKER} ${RM_TOPIC} ${ELASTICSEARCH_IP} ${ELASTICSEARCH_PORT} ${ELASTIC_USERNAME} ${ELASTIC_PASSWORD} &> ${SPARK_APPLICATION_LOG_RM}
	else
	    echo "Not recognized application."
	fi
    ;;          

  siem)
    if [ -f "${SPARK_APPLICATION_PYTHON_LOCATION_SM}" ]; then
	    echo "Submit application ${SPARK_APPLICATION_PYTHON_LOCATION_SM} to Spark master ${SPARK_MASTER_URL}"
	    echo "Passing arguments ${SPARK_APPLICATION_LOG_SM}"
	 	PYSPARK_PYTHON=python3 /spark/bin/spark-submit \
	        --master ${SPARK_MASTER_URL} \
	        ${SPARK_SUBMIT_ARGS} \
	        ${SPARK_APPLICATION_PYTHON_LOCATION_SM} ${KAFKA_BROKER} ${SM_TOPIC} ${ELASTICSEARCH_IP} ${ELASTICSEARCH_PORT} ${ELASTIC_USERNAME} ${ELASTIC_PASSWORD} &> ${SPARK_APPLICATION_LOG_SM}
	else
	    echo "Not recognized application."
	fi
    ;;

  *)
    echo -n "Unknown task - Try one: wifi-bluetooth-fw-rf-rm-siem"
    echo
    ;;
esac


