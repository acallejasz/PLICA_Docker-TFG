FROM ubuntu-pandora:base

ARG SPARK_VERSION
ARG HADOOP_VERSION

LABEL org.label-schema.name="spark" \
      org.label-schema.description="Apache spark" \
      org.label-schema.version="${SPARK_VERSION}_${HADOOP_VERSION}" \
      org.label-schema.schema-version="1.0" \
      maintainer="acallejasz"

COPY requirements.txt /app/

RUN apt-get update \
  && apt-get install -y bash openjdk-8-jdk python3 python3-pip libcurl3-nss libc6 make gcc g++ python3-dev libssl-dev \
  && ln -s /lib64/ld-linux-x86-64.so.2 /lib/ld-linux-x86-64.so.2 \
  && wget https://archive.apache.org/dist/spark/spark-${SPARK_VERSION}/spark-${SPARK_VERSION}-bin-hadoop${HADOOP_VERSION}.tgz \
  && tar -xvzf spark-${SPARK_VERSION}-bin-hadoop${HADOOP_VERSION}.tgz \
  && mv spark-${SPARK_VERSION}-bin-hadoop${HADOOP_VERSION} spark \
  && rm spark-${SPARK_VERSION}-bin-hadoop${HADOOP_VERSION}.tgz \
  && pip3 install -r /app/requirements.txt 

EXPOSE 22  

#COPY PLICA_V6 /app