#Dockerfile for Zookeeper

FROM openjdk:8u212-jre-alpine

ARG zookeeper_version=3.5.9

LABEL org.label-schema.name="zookeeper" \
      org.label-schema.description="Apache ZooKeeper" \
      org.label-schema.version="${zookeeper_version}" \
      org.label-schema.schema-version="1.0" \
      maintainer="acallejasz"

ENV ZOOKEEPER_VERSION=$zookeeper_version \
	ZK_HOME=/opt/zookeeper 

COPY zookeeper_jaas.conf zookeeper_certs.sh zkEnv.sh zoo.cfg /tmp/

#Install and config 

RUN apk add --no-cache wget openssl bash \
 && mkdir -p ${ZK_HOME} \
 && chmod a+x /tmp/*.sh \
 && mv /tmp/zookeeper_certs.sh /tmp/zookeeper_jaas.conf /tmp/zkEnv.sh /tmp/zoo.cfg ${ZK_HOME} \
 && wget -q -O - http://apache.mirrors.pair.com/zookeeper/zookeeper-${ZOOKEEPER_VERSION}/apache-zookeeper-${ZOOKEEPER_VERSION}-bin.tar.gz \
    | tar -xzC ${ZK_HOME} --strip-components=1 \
 && mv ${ZK_HOME}/zoo.cfg ${ZK_HOME}/conf/zoo.cfg \
 && rm -f ${ZK_HOME}/bin/zkEnv.sh \
 && mv ${ZK_HOME}/zkEnv.sh ${ZK_HOME}/bin/zkEnv.sh \
 && mkdir -p /tmp/zookeeper \
 &&	mkdir ${ZK_HOME}/data \
 && mkdir -p /var/ssl \
 && ${ZK_HOME}/zookeeper_certs.sh

EXPOSE 2181 2281 2888 3888

WORKDIR ${ZK_HOME}

ENTRYPOINT ["/opt/zookeeper/bin/zkServer.sh"]

CMD ["start-foreground"]
