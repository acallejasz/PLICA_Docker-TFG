FROM openjdk:8u212-jre-alpine

ARG FUSEKI_VERSION

LABEL org.label-schema.name="fuseki" \
      org.label-schema.description="Fuseki server for Ontology" \
      org.label-schema.version="${FUSEKI_VERSION}" \
      org.label-schema.schema-version="1.0" \
      maintainer="acallejasz"

COPY . /

RUN apk --update upgrade \
  && apk add --no-cache wget bash curl openssh openssh-server-pam \
  && ./enable_ssh.sh \
  && ./ontologias/fuseki_installation.sh \
  && ./ontologias/configuration.sh 

EXPOSE 3030

CMD ["/start_fuseki.sh"]
