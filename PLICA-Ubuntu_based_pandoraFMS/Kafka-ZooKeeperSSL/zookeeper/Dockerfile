FROM ubuntu-pandora:base

ARG ZOOKEEPER_VERSION
ARG ZK_HOME
ARG ZOOKEEPER_IP
ARG ZOOKEEPER_KEYSTORE_FILENAME
ARG ZOOKEEPER_TRUSTSTORE_FILENAME
ARG ZOOKEEPER_STORE_WORKING_DIRECTORY
ARG ZOOKEEPER_TRUSTSTORE_PASSWORD

LABEL org.label-schema.name="zookeeper" \
      org.label-schema.description="Apache ZooKeeper" \
      org.label-schema.version="${ZOOKEEPER_VERSION}" \
      org.label-schema.schema-version="1.0" \
      maintainer="acallejasz"

ENV	ZK_HOME=/opt/zookeeper 

COPY zookeeper_jaas.conf zookeeper_certs.sh zkEnv.sh zkServer.sh zoo.cfg /tmp/

#Install and config 

RUN apt-get update \
 && apt-get install -y openjdk-11-jre-headless bash docker libssl-dev \
 && mkdir -p ${ZK_HOME} \
 && chmod a+x /tmp/*.sh \
 && mv /tmp/zookeeper_certs.sh /tmp/zookeeper_jaas.conf /tmp/zkEnv.sh /tmp/zoo.cfg /tmp/zkServer.sh ${ZK_HOME} \
 && wget -q -O - http://apache.mirrors.pair.com/zookeeper/zookeeper-${ZOOKEEPER_VERSION}/apache-zookeeper-${ZOOKEEPER_VERSION}-bin.tar.gz \
    | tar -xzC ${ZK_HOME} --strip-components=1 \
 && mv ${ZK_HOME}/zoo.cfg ${ZK_HOME}/conf/zoo.cfg \
 && rm -f ${ZK_HOME}/bin/zkEnv.sh \
 && mv ${ZK_HOME}/zkEnv.sh ${ZK_HOME}/bin/zkEnv.sh \
 && mv ${ZK_HOME}/zkServer.sh ${ZK_HOME}/bin/zkServer.sh \
 && mkdir -p /tmp/zookeeper \
 &&	mkdir ${ZK_HOME}/data \
 && mkdir -p /var/ssl/private \
 && ${ZK_HOME}/zookeeper_certs.sh \
 && dpkg -i /pandoraAgents/pandorafms.agent_unix_zookeeper.deb

EXPOSE 22 2181 2281 2888 3888

WORKDIR ${ZK_HOME}

ENTRYPOINT ["/opt/zookeeper/bin/zkServer.sh"]

CMD ["start-foreground"]
