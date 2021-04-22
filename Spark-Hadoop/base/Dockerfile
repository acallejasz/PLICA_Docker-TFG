FROM alpine:3.10

ARG SPARK_VERSION
ARG HADOOP_VERSION

LABEL org.label-schema.name="spark" \
      org.label-schema.description="Apache spark" \
      org.label-schema.version="${SPARK_VERSION}_${HADOOP_VERSION}" \
      org.label-schema.schema-version="1.0" \
      maintainer="acallejasz"

COPY requirements.txt /app/

COPY enable_ssh.sh id_rsa.pub /

RUN apk update \
  && apk add --no-cache curl bash openjdk8-jre python3 py-pip nss libc6-compat make gcc g++ python3-dev openssh openssh-server-pam \
  && ./enable_ssh.sh \
  && ln -s /lib64/ld-linux-x86-64.so.2 /lib/ld-linux-x86-64.so.2 \
  && wget https://archive.apache.org/dist/spark/spark-${SPARK_VERSION}/spark-${SPARK_VERSION}-bin-hadoop${HADOOP_VERSION}.tgz \
  && tar -xvzf spark-${SPARK_VERSION}-bin-hadoop${HADOOP_VERSION}.tgz \
  && mv spark-${SPARK_VERSION}-bin-hadoop${HADOOP_VERSION} spark \
  && rm spark-${SPARK_VERSION}-bin-hadoop${HADOOP_VERSION}.tgz \
  && /usr/bin/python3.7 -m pip install --upgrade pip \
  && pip3 install -r /app/requirements.txt 

EXPOSE 22  

#COPY PLICA_V6 /app