FROM openjdk:8-jre-alpine

ARG zookeeper_version=3.5.9

LABEL org.label-schema.name="zookeeper" \
      org.label-schema.description="Apache ZooKeeper" \
      org.label-schema.version="${zookeeper_version}" \
      org.label-schema.schema-version="1.0" \
      maintainer="acallejasz"

ENV ZOOKEEPER_VERSION=$zookeeper_version
ENV ZK_HOME /opt/zookeeper

RUN apk add --no-cache wget bash \
 && mkdir -p $ZK_HOME \
 && wget -q -O - http://apache.mirrors.pair.com/zookeeper/zookeeper-${ZOOKEEPER_VERSION}/apache-zookeeper-${ZOOKEEPER_VERSION}-bin.tar.gz \
    | tar -xzC $ZK_HOME --strip-components=1 \
 && mv $ZK_HOME/conf/zoo_sample.cfg $ZK_HOME/conf/zoo.cfg \
 && mkdir -p /tmp/zookeeper

# Enable other options
RUN sed -i "s|/tmp/zookeeper|$ZK_HOME/data|g" $ZK_HOME/conf/zoo.cfg; mkdir $ZK_HOME/data \
 &&	sed -i -r 's|#(log4j.appender.ROLLINGFILE.MaxBackupIndex.*)|\1|g' $ZK_HOME/conf/log4j.properties \
 &&	sed -i -r 's|#autopurge|autopurge|g' $ZK_HOME/conf/zoo.cfg

EXPOSE 2181 2888 3888

WORKDIR /opt/zookeeper

VOLUME ["/opt/zookeeper/conf", "/opt/zookeeper/data"]

ENTRYPOINT ["/opt/zookeeper/bin/zkServer.sh"]

CMD ["start-foreground"]
