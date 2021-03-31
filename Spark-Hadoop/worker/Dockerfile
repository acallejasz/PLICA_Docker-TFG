FROM acallejasz/spark_base

ARG spark_version=2.4.4
ARG hadoop_version=2.7

LABEL org.label-schema.name="spark_worker" \
      org.label-schema.description="Apache spark" \
      org.label-schema.version="${spark_version}_${hadoop_version}" \
      org.label-schema.schema-version="1.0" \
      maintainer="acallejasz"

COPY worker.sh /

EXPOSE 8081

CMD ["/bin/bash", "/worker.sh"]
