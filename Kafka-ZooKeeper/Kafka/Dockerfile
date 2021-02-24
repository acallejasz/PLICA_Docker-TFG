#Dockerfile for Kafka

FROM openjdk:8u212-jre-alpine

ARG kafka_version=2.7.0
ARG scala_version=2.13
ARG glibc_version=2.31-r0

LABEL org.label-schema.name="kafka" \
      org.label-schema.description="Apache Kafka" \
      org.label-schema.version="${scala_version}_${kafka_version}" \
      org.label-schema.schema-version="1.0" \
      maintainer="acallejasz"

ENV KAFKA_VERSION=$kafka_version \
    SCALA_VERSION=$scala_version \
    KAFKA_HOME=/opt/kafka \
    GLIBC_VERSION=$glibc_version \
    PATH=${PATH}:${KAFKA_HOME}/bin

#Installation and config scripts

COPY start-kafka.sh start-broker.sh broker-list.sh create-topics.sh versions.sh kafka-ssl.sh kafka_server_jaas.conf consumer_ssl.properties producer_ssl.properties /tmp/

#Install and config

RUN apk add --no-cache bash openssl docker \
 && chmod a+x /tmp/*.sh \
 && mv /tmp/start-kafka.sh /tmp/start-broker.sh /tmp/broker-list.sh /tmp/create-topics.sh /tmp/versions.sh /tmp/kafka-ssl.sh /tmp/kafka_server_jaas.conf /usr/bin \
 && sync && wget https://ftp.cixug.es/apache/kafka/${KAFKA_VERSION}/kafka_${SCALA_VERSION}-${KAFKA_VERSION}.tgz -O /tmp/kafka_${SCALA_VERSION}-${KAFKA_VERSION}.tgz \
 && tar xfz /tmp/kafka_${SCALA_VERSION}-${KAFKA_VERSION}.tgz -C /opt \
 && rm /tmp/kafka_${SCALA_VERSION}-${KAFKA_VERSION}.tgz \
 && ln -s /opt/kafka_${SCALA_VERSION}-${KAFKA_VERSION} ${KAFKA_HOME} \
 && mv /tmp/consumer_ssl.properties /tmp/producer_ssl.properties ${KAFKA_HOME}/config \
 && mkdir -p /var/ssl/private \
 && /usr/bin/kafka-ssl.sh \
 && wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/${GLIBC_VERSION}/glibc-${GLIBC_VERSION}.apk \
 && apk add --no-cache --allow-untrusted glibc-${GLIBC_VERSION}.apk \
 && rm glibc-${GLIBC_VERSION}.apk

COPY overrides /opt/overrides

# Use "exec" form so that it runs as PID 1 (useful for graceful shutdown)
CMD ["start-kafka.sh"]
