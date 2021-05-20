FROM ubuntu:18.04

LABEL org.label-schema.name="pandorafms" \
      org.label-schema.description="PandoraFMS" \
      org.label-schema.version="0.24" \
      org.label-schema.schema-version="1.0" \
      maintainer="acallejasz"

COPY enable_ssh.sh id_rsa.pub /
COPY /pandoraAgents /pandoraAgents

RUN apt-get update \
  && ln -fs /usr/share/zoneinfo/Europe/Madrid /etc/localtime \
  && apt-get install -y tzdata \
  && apt-get install -y wget dpkg perl unzip net-tools openssh-server \
  && wget https://sourceforge.net/projects/pandora/files/Pandora%20FMS%207.0NG/753/Debian_Ubuntu/pandorafms.agent_unix_7.0NG.753.deb/download \
  && dpkg -i download \
  && rm -rf download \
  && ./enable_ssh.sh \
  && rm -rf enable_ssh

EXPOSE 22
