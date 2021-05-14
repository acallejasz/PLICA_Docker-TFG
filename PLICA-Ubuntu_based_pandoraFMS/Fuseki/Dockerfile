FROM ubuntu-pandora:base

ARG FUSEKI_VERSION

LABEL org.label-schema.name="fuseki" \
      org.label-schema.description="Fuseki server for Ontology" \
      org.label-schema.version="${FUSEKI_VERSION}" \
      org.label-schema.schema-version="1.0" \
      maintainer="acallejasz"

COPY . /

RUN apt-get update \
  && apt-get install -y openjdk-11-jre-headless curl \
  && ./enable_ssh.sh \
  && ./ontologias/fuseki_installation.sh \
  && ./ontologias/configuration.sh 

EXPOSE 3030

CMD ["/start_fuseki.sh"]
