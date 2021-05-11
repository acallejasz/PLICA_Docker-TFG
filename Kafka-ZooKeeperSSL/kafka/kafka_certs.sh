#!/usr/bin/env bash

set -eu

KEYSTORE_FILENAME="${KAFKA_KEYSTORE_FILENAME}"
KEYSTORE_CLIENT_FILENAME="${KAFKA_KEYSTORE_CLIENT_FILENAME}"
VALIDITY_IN_DAYS=3650
DEFAULT_TRUSTSTORE_FILENAME="${KAFKA_TRUSTSTORE_FILENAME}"
DEFAULT_CLIENT_TRUSTSTORE_FILENAME="${KAFKA_CLIENT_TRUSTSTORE_FILENAME}"
TRUSTSTORE_WORKING_DIRECTORY="${KAFKA_STORE_WORKING_DIRECTORY}"
KEYSTORE_WORKING_DIRECTORY="${KAFKA_STORE_WORKING_DIRECTORY}"
CA_CERT_FILE="ca-cert-kafka"
KEYSTORE_SIGN_REQUEST="cert-file-kafka"
KEYSTORE_SIGN_REQUEST_SRL="ca-cert-kafka.srl"
KEYSTORE_SIGNED_CERT="cert-signed-kafka"
KAFKA_ADVERTISED_HOST_NAME=${KAFKA_ADVERTISED_HOST_NAME}
KAFKA_BROKERS_NUMBER=${BROKERS_NUMBER}

COUNTRY=es
STATE=Madrid
OU=UPM
CN=${KAFKA_ADVERTISED_HOST_NAME}
LOCATION=Madrid
PASS=${KAFKA_TRUSTSTORE_PASSWORD}


function file_exists_and_exit() {
  echo "'$1' cannot exist. Move or delete it before"
  echo "re-running this script."
  exit 1
}

if [ -e "$KEYSTORE_WORKING_DIRECTORY" ]; then
  file_exists_and_exit $KEYSTORE_WORKING_DIRECTORY
fi

if [ -e "$CA_CERT_FILE" ]; then
  file_exists_and_exit $CA_CERT_FILE
fi

if [ -e "$KEYSTORE_SIGN_REQUEST" ]; then
  file_exists_and_exit $KEYSTORE_SIGN_REQUEST
fi

if [ -e "$KEYSTORE_SIGN_REQUEST_SRL" ]; then
  file_exists_and_exit $KEYSTORE_SIGN_REQUEST_SRL
fi

if [ -e "$KEYSTORE_SIGNED_CERT" ]; then
  file_exists_and_exit $KEYSTORE_SIGNED_CERT
fi

echo "Welcome to the Kafka SSL keystore and trust store generator script."

trust_store_file=""
trust_store_private_key_file=""

  if [ -e "$TRUSTSTORE_WORKING_DIRECTORY" ]; then
    file_exists_and_exit $TRUSTSTORE_WORKING_DIRECTORY
  fi

  mkdir $TRUSTSTORE_WORKING_DIRECTORY
  echo
  echo "OK, we'll generate a trust store and associated private key."
  echo
  echo "First, the private key."
  echo


  openssl req -new -x509 -keyout $TRUSTSTORE_WORKING_DIRECTORY/ca-key-kafka \
    -out $TRUSTSTORE_WORKING_DIRECTORY/ca-cert-kafka -days $VALIDITY_IN_DAYS -nodes \
    -subj "/C=$COUNTRY/ST=$STATE/L=$LOCATION/O=$OU/CN=$CN"


  trust_store_private_key_file="$TRUSTSTORE_WORKING_DIRECTORY/ca-key-kafka"

  echo
  echo "Two files were created:"
  echo " - $TRUSTSTORE_WORKING_DIRECTORY/ca-key -- the private key used later to"
  echo "   sign certificates"
  echo " - $TRUSTSTORE_WORKING_DIRECTORY/ca-cert -- the certificate that will be"
  echo "   stored in the trust store in a moment and serve as the certificate"
  echo "   authority (CA). Once this certificate has been stored in the trust"
  echo "   store, it will be deleted. It can be retrieved from the trust store via:"
  echo "   $ keytool -keystore <trust-store-file> -export -alias CARoot -rfc"

  echo
  echo "Now the trust store will be generated from the certificate."
  echo

  # Kafka server 

  keytool -keystore $TRUSTSTORE_WORKING_DIRECTORY/$DEFAULT_TRUSTSTORE_FILENAME \
    -alias CARoot -import -file $TRUSTSTORE_WORKING_DIRECTORY/ca-cert-kafka \
    -noprompt -dname "C=$COUNTRY, ST=$STATE, L=$LOCATION, O=$OU, CN=$CN" -keypass $PASS -storepass $PASS

  # Kafka client 

  keytool -keystore $TRUSTSTORE_WORKING_DIRECTORY/$DEFAULT_CLIENT_TRUSTSTORE_FILENAME \
    -alias CARoot -import -file $TRUSTSTORE_WORKING_DIRECTORY/ca-cert-kafka \
    -noprompt -dname "C=$COUNTRY, ST=$STATE, L=$LOCATION, O=$OU, CN=$CN" -keypass $PASS -storepass $PASS

  # Kafka broker

  for (( i=1; i<=$KAFKA_BROKERS_NUMBER; i++ ))
  do

    keytool -keystore $TRUSTSTORE_WORKING_DIRECTORY/kafka.broker$i.truststore.jks \
      -alias CARoot -import -file $TRUSTSTORE_WORKING_DIRECTORY/ca-cert-kafka \
      -noprompt -dname "C=$COUNTRY, ST=$STATE, L=$LOCATION, O=$OU, CN=$CN" -keypass $PASS -storepass $PASS
  done

  

  trust_store_file="$TRUSTSTORE_WORKING_DIRECTORY/$DEFAULT_TRUSTSTORE_FILENAME"

  echo
  echo "$TRUSTSTORE_WORKING_DIRECTORY/$DEFAULT_TRUSTSTORE_FILENAME was created."

  # don't need the cert because it's in the trust store.
  #rm $TRUSTSTORE_WORKING_DIRECTORY/$CA_CERT_FILE

echo
echo "Continuing with:"
echo " - trust store file:        $trust_store_file"
echo " - trust store private key: $trust_store_private_key_file"

echo
echo "Now, a keystore will be generated. Each broker and logical client needs its own"
echo "keystore. This script will create only one keystore. Run this script multiple"
echo "times for multiple keystores."
echo
echo "     NOTE: currently in Kafka, the Common Name (CN) does not need to be the FQDN of"
echo "           this host. However, at some point, this may change. As such, make the CN"
echo "           the FQDN. Some operating systems call the CN prompt 'first / last name'"

# To learn more about CNs and FQDNs, read:
# https://docs.oracle.com/javase/7/docs/api/javax/net/ssl/X509ExtendedTrustManager.html

keytool -keystore $KEYSTORE_WORKING_DIRECTORY/$KEYSTORE_FILENAME \
  -alias $KAFKA_ADVERTISED_HOST_NAME -validity $VALIDITY_IN_DAYS -genkey -keyalg RSA \
   -noprompt -dname "C=$COUNTRY, ST=$STATE, L=$LOCATION, O=$OU, CN=$CN" -keypass $PASS -storepass $PASS

echo
echo "'$KEYSTORE_WORKING_DIRECTORY/$KEYSTORE_FILENAME' now contains a key pair and a"
echo "self-signed certificate. Again, this keystore can only be used for one broker or"
echo "one logical client. Other brokers or clients need to generate their own keystores."

echo
echo "Fetching the certificate from the trust store and storing in $CA_CERT_FILE."
echo

keytool -keystore $trust_store_file -export -alias CARoot -rfc -file $CA_CERT_FILE -keypass $PASS -storepass $PASS

echo
echo "Now a certificate signing request will be made to the keystore."
echo

# Kafka server

keytool -keystore $KEYSTORE_WORKING_DIRECTORY/$KEYSTORE_FILENAME -alias $KAFKA_ADVERTISED_HOST_NAME \
  -certreq -file $KEYSTORE_SIGN_REQUEST -keypass $PASS -storepass $PASS

echo
echo "Now the trust store's private key (CA) will sign the keystore's certificate."
echo
openssl x509 -req -CA $CA_CERT_FILE -CAkey $trust_store_private_key_file \
  -in $KEYSTORE_SIGN_REQUEST -out $KEYSTORE_SIGNED_CERT \
  -days $VALIDITY_IN_DAYS -CAcreateserial
# creates $KEYSTORE_SIGN_REQUEST_SRL which is never used or needed.

echo
echo "Now the CA will be imported into the server keystore."
echo
keytool -keystore $KEYSTORE_WORKING_DIRECTORY/$KEYSTORE_FILENAME -alias CARoot \
  -import -file $CA_CERT_FILE -keypass $PASS -storepass $PASS -noprompt
#rm $CA_CERT_FILE # delete the trust store cert because it's stored in the trust store.

echo
echo "Now the keystore's signed certificate will be imported back into the server keystore."
echo
keytool -keystore $KEYSTORE_WORKING_DIRECTORY/$KEYSTORE_FILENAME -alias $KAFKA_ADVERTISED_HOST_NAME -import \
  -file $KEYSTORE_SIGNED_CERT -keypass $PASS -storepass $PASS


# Kafka client


keytool -keystore $KEYSTORE_WORKING_DIRECTORY/$KEYSTORE_CLIENT_FILENAME \
  -alias $KAFKA_ADVERTISED_HOST_NAME -validity $VALIDITY_IN_DAYS -genkey -keyalg RSA \
   -noprompt -dname "C=$COUNTRY, ST=$STATE, L=$LOCATION, O=$OU, CN=$CN" -keypass $PASS -storepass $PASS

keytool -keystore $KEYSTORE_WORKING_DIRECTORY/$KEYSTORE_CLIENT_FILENAME -alias $KAFKA_ADVERTISED_HOST_NAME \
  -certreq -file $KEYSTORE_SIGN_REQUEST -keypass $PASS -storepass $PASS

openssl x509 -req -CA $CA_CERT_FILE -CAkey $trust_store_private_key_file \
  -in $KEYSTORE_SIGN_REQUEST -out $KEYSTORE_SIGNED_CERT \
  -days $VALIDITY_IN_DAYS -CAcreateserial

echo
echo "Now the CA will be imported into the client keystore."
echo
keytool -keystore $KEYSTORE_WORKING_DIRECTORY/$KEYSTORE_CLIENT_FILENAME -alias CARoot \
  -import -file $CA_CERT_FILE -keypass $PASS -storepass $PASS -noprompt

echo
echo "Now the keystore's signed certificate will be imported back into the client keystore."
echo
keytool -keystore $KEYSTORE_WORKING_DIRECTORY/$KEYSTORE_CLIENT_FILENAME -alias $KAFKA_ADVERTISED_HOST_NAME -import \
  -file $KEYSTORE_SIGNED_CERT -keypass $PASS -storepass $PASS

# Kafka broker


for (( i=1; i<=$KAFKA_BROKERS_NUMBER; i++ ))
do

  keytool -keystore $KEYSTORE_WORKING_DIRECTORY/kafka.broker$i.keystore.jks \
  -alias $KAFKA_ADVERTISED_HOST_NAME -validity $VALIDITY_IN_DAYS -genkey -keyalg RSA \
   -noprompt -dname "C=$COUNTRY, ST=$STATE, L=$LOCATION, O=$OU, CN=$CN" -keypass $PASS -storepass $PASS

  keytool -keystore $KEYSTORE_WORKING_DIRECTORY/kafka.broker$i.keystore.jks -alias $KAFKA_ADVERTISED_HOST_NAME \
    -certreq -file $KEYSTORE_SIGN_REQUEST -keypass $PASS -storepass $PASS

  openssl x509 -req -CA $CA_CERT_FILE -CAkey $trust_store_private_key_file \
    -in $KEYSTORE_SIGN_REQUEST -out $KEYSTORE_SIGNED_CERT \
    -days $VALIDITY_IN_DAYS -CAcreateserial

  echo
  echo "Now the CA will be imported into the broker keystore."
  echo
  keytool -keystore $KEYSTORE_WORKING_DIRECTORY/kafka.broker$i.keystore.jks -alias CARoot \
    -import -file $CA_CERT_FILE -keypass $PASS -storepass $PASS -noprompt

  echo
  echo "Now the keystore's signed certificate will be imported back into the broker keystore."
  echo
  keytool -keystore $KEYSTORE_WORKING_DIRECTORY/kafka.broker$i.keystore.jks -alias $KAFKA_ADVERTISED_HOST_NAME -import \
    -file $KEYSTORE_SIGNED_CERT -keypass $PASS -storepass $PASS

done





echo
echo "All done!"
echo
echo "Deleting intermediate files. They are:"
echo " - '$KEYSTORE_SIGN_REQUEST_SRL': CA serial number"
echo " - '$KEYSTORE_SIGN_REQUEST': the keystore's certificate signing request"
echo "   (that was fulfilled)"
echo " - '$KEYSTORE_SIGNED_CERT': the keystore's certificate, signed by the CA, and stored back"
echo "    into the keystore"

  rm $CA_CERT_FILE # delete the trust store cert because it's stored in the trust store.
  rm $KEYSTORE_SIGN_REQUEST_SRL
  rm $KEYSTORE_SIGN_REQUEST
  rm $KEYSTORE_SIGNED_CERT
