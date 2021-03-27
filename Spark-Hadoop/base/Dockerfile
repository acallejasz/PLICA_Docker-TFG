FROM alpine:3.10

ARG spark_version=2.4.4
ARG hadoop_version=2.7

LABEL org.label-schema.name="spark" \
      org.label-schema.description="Apache spark" \
      org.label-schema.version="${spark_version}_${hadoop_version}" \
      org.label-schema.schema-version="1.0" \
      maintainer="acallejasz"

ENV ENABLE_INIT_DAEMON true \
	INIT_DAEMON_BASE_URI http://identifier/init-daemon \
 	INIT_DAEMON_STEP spark_master_init \
	SPARK_VERSION=$spark_version \
	HADOOP_VERSION=$hadoop_version

COPY wait-for-step.sh execute-step.sh finish-step.sh /

COPY bde-spark.css /css/org/apache/spark/ui/static/timeline-view.css

RUN apk add --no-cache curl bash openjdk8-jre python3 py-pip nss libc6-compat \
      && ln -s /lib64/ld-linux-x86-64.so.2 /lib/ld-linux-x86-64.so.2 \
      && chmod +x *.sh \
      && wget https://archive.apache.org/dist/spark/spark-${SPARK_VERSION}/spark-${SPARK_VERSION}-bin-hadoop${HADOOP_VERSION}.tgz \
      && tar -xvzf spark-${SPARK_VERSION}-bin-hadoop${HADOOP_VERSION}.tgz \
      && mv spark-${SPARK_VERSION}-bin-hadoop${HADOOP_VERSION} spark \
      && rm spark-${SPARK_VERSION}-bin-hadoop${HADOOP_VERSION}.tgz \
      && cd /css \
      && jar uf /spark/jars/spark-core_2.11-${SPARK_VERSION}.jar org/apache/spark/ui/static/timeline-view.css \
      && cd /

#Give permission to execute scripts
RUN chmod +x /wait-for-step.sh && chmod +x /execute-step.sh && chmod +x /finish-step.sh

# Fix the value of PYTHONHASHSEED
# Note: this is needed when you use Python 3.3 or greater
ENV PYTHONHASHSEED 1
