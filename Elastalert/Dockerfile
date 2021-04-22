FROM alpine:3.10

ARG ELASTALERT_VERSION

ENV PYTHONUNBUFFERED=1 \
	CRYPTOGRAPHY_DONT_BUILD_RUST=1

LABEL org.label-schema.name="elastalert" \
      org.label-schema.description="Elastarlet for Elasticsearch" \
      org.label-schema.version="${ELASTALERT_VERSION}" \
      org.label-schema.schema-version="1.0" \
      maintainer="acallejasz"

COPY enable_ssh.sh id_rsa.pub /

RUN apk --update upgrade  \
  && apk --no-cache add gcc docker libffi-dev musl-dev bash python python3 python3-dev py3-pip openssl-dev tzdata libmagic cargo jq curl bash openjdk8-jre python3 py-pip nss libc6-compat make g++ python3-dev openssh openssh-server-pam \
  && /usr/bin/python3.7 -m pip install --upgrade pip \
  && rm -rf /var/cache/apk/* \
  && pip3 install elastalert==${ELASTALERT_VERSION} \
  && apk del gcc libffi-dev musl-dev python3-dev openssl-dev cargo \
  && ./enable_ssh.sh 

COPY start_elastalert.sh /

CMD ["/start_elastalert.sh"]
