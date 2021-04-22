#!/bin/sh

AUTHORIZED_KEYS="$(cat id_rsa.pub)" 

if [ -z "${AUTHORIZED_KEYS}" ]; then
  echo "Need your ssh public key as AUTHORIZED_KEYS env variable. Abnormal exit ..."
  exit 1
fi

mkdir /root/.ssh 
chmod 0700 /root/.ssh 
ssh-keygen -A 
sed -i s/^#PasswordAuthentication\ yes/PasswordAuthentication\ no/ /etc/ssh/sshd_config 
sed -i s/^#UsePAM\ no/UsePAM\ yes/ /etc/ssh/sshd_config
echo "${AUTHORIZED_KEYS}" > /root/.ssh/authorized_keys
