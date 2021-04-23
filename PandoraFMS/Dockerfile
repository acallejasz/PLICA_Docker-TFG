FROM ubuntu

LABEL org.label-schema.name="pandasfms" \
      org.label-schema.description="PandasFMS" \
      org.label-schema.version="${SPARK_VERSION}_${HADOOP_VERSION}" \
      org.label-schema.schema-version="1.0" \
      maintainer="acallejasz"

RUN apt-get update \
  && apt-get install -y wget dpkg perl unzip \
  && wget https://sourceforge.net/projects/pandora/files/Pandora%20FMS%207.0NG/753/Debian_Ubuntu/pandorafms.agent_unix_7.0NG.753.deb/download \
  && dpkg -i download \
  && rm -rf download 


# service pandora_agent_daemon start