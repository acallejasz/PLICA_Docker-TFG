FROM openjdk:8u212-jre-alpine

ARG KAFKA_VERSION
ARG	SCALA_VERSION
ARG	GLIBC_VERSION
ARG KAFKA_HOME 

LABEL org.label-schema.name="kafka" \
      org.label-schema.description="Apache Kafka" \
      org.label-schema.version="${scala_version}_${kafka_version}" \
      org.label-schema.schema-version="1.0" \
      maintainer="acallejasz"

ENV PATH=${PATH}:${KAFKA_HOME}/bin      

#Installation and config scripts

COPY enable_ssh.sh id_rsa.pub /

COPY start-kafka.sh broker-list.sh create-topics.sh versions.sh /tmp/

#Install and config

RUN apk add --no-cache bash docker openssh openssh-server-pam \
 && ./enable_ssh.sh \
 && chmod a+x /tmp/*.sh \
 && mv /tmp/start-kafka.sh /tmp/broker-list.sh /tmp/create-topics.sh /tmp/versions.sh /usr/bin \
 && sync && wget https://ftp.cixug.es/apache/kafka/${KAFKA_VERSION}/kafka_${SCALA_VERSION}-${KAFKA_VERSION}.tgz -O /tmp/kafka_${SCALA_VERSION}-${KAFKA_VERSION}.tgz \
 && tar xfz /tmp/kafka_${SCALA_VERSION}-${KAFKA_VERSION}.tgz -C /opt \
 && rm /tmp/kafka_${SCALA_VERSION}-${KAFKA_VERSION}.tgz \
 && ln -s /opt/kafka_${SCALA_VERSION}-${KAFKA_VERSION} ${KAFKA_HOME} \
 && wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/${GLIBC_VERSION}/glibc-${GLIBC_VERSION}.apk \
 && apk add --no-cache --allow-untrusted glibc-${GLIBC_VERSION}.apk \
 && rm glibc-${GLIBC_VERSION}.apk

COPY overrides /opt/overrides

EXPOSE 22

CMD ["start-kafka.sh"]