FROM spark_base

ARG SPARK_VERSION
ARG HADOOP_VERSION

LABEL org.label-schema.name="spark_python" \
      org.label-schema.description="Apache spark" \
      org.label-schema.version="${SPARK_VERSION}_${HADOOP_VERSION}" \
      org.label-schema.schema-version="1.0" \
      maintainer="acallejasz"

COPY template.sh /
COPY requirements.txt /app/
RUN cd /app \
	&& apk update \
	&& apk add make gcc g++ python3-dev \
	&& /usr/bin/python3.7 -m pip install --upgrade pip \
    && pip3 install -r requirements.txt 

COPY PLICA_V4.2 /app

CMD ["/bin/bash", "/template.sh"]
