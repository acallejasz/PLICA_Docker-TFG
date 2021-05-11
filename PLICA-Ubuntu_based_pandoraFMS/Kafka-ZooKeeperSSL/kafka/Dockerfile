FROM ubuntu-pandora:base

ARG KAFKA_VERSION
ARG	SCALA_VERSION
ARG	GLIBC_VERSION
ARG KAFKA_HOME
ARG KAFKA_ADVERTISED_HOST_NAME
ARG BROKERS_NUMBER
ARG KAFKA_KEYSTORE_FILENAME
ARG KAFKA_KEYSTORE_CLIENT_FILENAME
ARG KAFKA_TRUSTSTORE_FILENAME
ARG KAFKA_CLIENT_TRUSTSTORE_FILENAME
ARG KAFKA_STORE_WORKING_DIRECTORY
ARG KAFKA_TRUSTSTORE_PASSWORD


LABEL org.label-schema.name="kafka" \
      org.label-schema.description="Apache Kafka" \
      org.label-schema.version="${SCALA_VERSION}_${KAFKA_VERSION}" \
      org.label-schema.schema-version="1.0" \
      maintainer="acallejasz"

ENV PATH=${PATH}:${KAFKA_HOME}/bin

#Installation and config scripts

COPY start-kafka.sh start-broker.sh broker-list.sh create-topics.sh versions.sh kafka_certs.sh kafka_server_jaas.conf consumer_ssl.properties producer_ssl.properties /tmp/

#Install and config

RUN apt-get update \
 && apt-get install -y openjdk-11-jre-headless bash docker glibc-doc libssl-dev \
 && chmod a+x /tmp/*.sh \
 && mv /tmp/start-kafka.sh /tmp/start-broker.sh /tmp/broker-list.sh /tmp/create-topics.sh /tmp/versions.sh /tmp/kafka_certs.sh /tmp/kafka_server_jaas.conf /usr/bin \
 && sync && wget https://ftp.cixug.es/apache/kafka/${KAFKA_VERSION}/kafka_${SCALA_VERSION}-${KAFKA_VERSION}.tgz -O /tmp/kafka_${SCALA_VERSION}-${KAFKA_VERSION}.tgz \
 && tar xfz /tmp/kafka_${SCALA_VERSION}-${KAFKA_VERSION}.tgz -C /opt \
 && rm /tmp/kafka_${SCALA_VERSION}-${KAFKA_VERSION}.tgz \
 && ln -s /opt/kafka_${SCALA_VERSION}-${KAFKA_VERSION} ${KAFKA_HOME} \
 && mv /tmp/consumer_ssl.properties /tmp/producer_ssl.properties ${KAFKA_HOME}/config \
 && mkdir -p /var/ssl/private \
 && /usr/bin/kafka_certs.sh 

COPY overrides /opt/overrides

EXPOSE 22

CMD ["start-kafka.sh"]
