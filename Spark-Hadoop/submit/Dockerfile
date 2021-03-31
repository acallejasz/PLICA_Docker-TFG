FROM acallejasz/spark

ARG spark_version=2.4.4
ARG hadoop_version=2.7

LABEL org.label-schema.name="spark_submit" \
      org.label-schema.description="Apache spark" \
      org.label-schema.version="${spark_version}_${hadoop_version}" \
      org.label-schema.schema-version="1.0" \
      maintainer="acallejasz"

ENV SPARK_MASTER_NAME=spark-master \
	SPARK_MASTER_PORT=7077 \
	SPARK_APPLICATION_JAR_LOCATION=/app/application.jar \
	SPARK_APPLICATION_PYTHON_LOCATION=/app/app.py \
	SPARK_APPLICATION_MAIN_CLASS=my.main.Application \
	SPARK_APPLICATION_ARGS=""

COPY submit.sh /

CMD ["/bin/bash", "/submit.sh"]
