FROM ubuntu-pandora:base

ARG ELASTALERT_VERSION

ENV PYTHONUNBUFFERED=1 \
	CRYPTOGRAPHY_DONT_BUILD_RUST=1

LABEL org.label-schema.name="elastalert" \
      org.label-schema.description="Elastarlet for Elasticsearch" \
      org.label-schema.version="${ELASTALERT_VERSION}" \
      org.label-schema.schema-version="1.0" \
      maintainer="acallejasz"

RUN apt-get update \
  && apt-get install -y bash docker openjdk-11-jre-headless python python3 python3-dev  python3-pip libcurl3-nss libc6 make gcc g++ python3-dev libssl-dev libmagic-dev cargo jq \
  && rm -rf /var/cache/apk/* \
  && pip3 install elastalert==${ELASTALERT_VERSION} 

COPY start_elastalert.sh /

CMD ["/start_elastalert.sh"]
