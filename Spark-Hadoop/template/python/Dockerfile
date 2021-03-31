FROM acallejasz/spark_base

ARG spark_version=2.4.4
ARG hadoop_version=2.7

LABEL org.label-schema.name="spark_python" \
      org.label-schema.description="Apache spark" \
      org.label-schema.version="${spark_version}_${hadoop_version}" \
      org.label-schema.schema-version="1.0" \
      maintainer="acallejasz"

COPY template.sh /

# Copy the requirements.txt first, for separate dependency resolving and downloading
ONBUILD COPY requirements.txt /app/
ONBUILD RUN cd /app \
      && pip3 install -r requirements.txt

# Copy the source code
ONBUILD COPY . /app

CMD ["/bin/bash", "/template.sh"]
