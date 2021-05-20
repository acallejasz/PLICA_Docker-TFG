FROM spark_base

ARG SPARK_VERSION
ARG HADOOP_VERSION

LABEL org.label-schema.name="spark_worker" \
      org.label-schema.description="Apache spark" \
      org.label-schema.version="${SPARK_VERSION}_${HADOOP_VERSION}" \
      org.label-schema.schema-version="1.0" \
      maintainer="acallejasz"

COPY worker.sh /

RUN  dpkg -i /pandoraAgents/pandorafms.agent_unix_spark_worker.deb

EXPOSE 8081

CMD ["/bin/bash", "/worker.sh"]
