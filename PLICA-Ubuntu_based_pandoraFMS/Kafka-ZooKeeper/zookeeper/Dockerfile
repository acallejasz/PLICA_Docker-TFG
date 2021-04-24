FROM ubuntu-pandora:base

ARG ZOOKEEPER_VERSION
ARG ZK_HOME

LABEL org.label-schema.name="zookeeper" \
      org.label-schema.description="Apache ZooKeeper" \
      org.label-schema.version="${ZOOKEEPER_VERSION}" \
      org.label-schema.schema-version="1.0" \
      maintainer="acallejasz"

COPY zoo.cfg zkServer.sh /tmp/

#Install and config 

RUN apt-get update \
 && apt-get install -y openjdk-11-jre-headless bash docker \
 && chmod a+x /tmp/*.sh \
 && mkdir -p ${ZK_HOME} \
 && mv /tmp/zoo.cfg ${ZK_HOME} \
 && mv /tmp/zkServer.sh ${ZK_HOME} \
 && wget -q -O - http://apache.mirrors.pair.com/zookeeper/zookeeper-${ZOOKEEPER_VERSION}/apache-zookeeper-${ZOOKEEPER_VERSION}-bin.tar.gz \
    | tar -xzC ${ZK_HOME} --strip-components=1 \
 && mv ${ZK_HOME}/zoo.cfg ${ZK_HOME}/conf/zoo.cfg \
 && mv ${ZK_HOME}/zkServer.sh ${ZK_HOME}/bin/zkServer.sh \
 && mkdir -p /tmp/zookeeper \
 &&	mkdir ${ZK_HOME}/data

EXPOSE 22 2181 2281 2888 3888

WORKDIR ${ZK_HOME}

ENTRYPOINT ["/opt/zookeeper/bin/zkServer.sh"]

CMD ["start-foreground"]
