<img  align="left" width="150" style="float: left;" src="https://www.upm.es/sfs/Rectorado/Gabinete%20del%20Rector/Logos/UPM/CEI/LOGOTIPO%20leyenda%20color%20JPG%20p.png">

<br/><br/><br/>

# Repositorio para los archivos y pruebas Docker de mi TFG

Versión: 16 de Febrero de 2021

## Título

MIGRACIÓN DE PLATAFORMA DE CONCIENCIA CIBERSITUACIONAL A ENTORNO DOCKER SECURIZADO

## Descripción y objetivo del TFG

Desarrollo de imágenes Docker de cada uno de los subsistemas PLICA, proyecto de la Universidad Politécnica de Madrid, con orquestación del despliegue con Docker-Compose, identificación de dependencias entre contenedores y securización de comunicación entre estos.

## Partes del proyecto

  - Directorio Kafka-ZooKeeper, que contiene el dockerfile y dockercompose para levantar apache Kafka y Zookeper con SSL y bastionado
  - Directorio Spark-Hadoop, que contiene el dockerfile y dockercompose para levantar apache Spark y Hadoop con bastionado

## Kafka + Zookeper

<p style="text-align: justify;">

Para este módulo hay que configurar el docker-compose_single_broker.yml para crear la network PLICA en la que la ip del gateway debe coincidir con el ADVERTISED_HOST_NAME de modo que se levantan estos dos contenedores y se pueden usar los scripts de la carpeta scripts_single_broker para crear topics, productores o consumidores. Estos dos últimos requieren de dos parámetros: El primero de ellos la ip del host, que es la del gateway de la network, y el segundo el nombre del topic al que queremos conectarnos.

Si se quieren utilizar múltiples brokers se debe usar el docker-compose.yml  y desplegar el contenedor como docker--compose up --scale kafka=numero_brokers -d, y usar los scripts de la carpeta scripts_multiple_broker si se desea usar dos de los brokers, uno como consumidor y otro como productor. Si se quieren usar como brokers y levantar los otros dos contenedores como consumidor y productor para poder hacer replicación en los topics usar los scripts de la carpeta scripts_single_broker y sustituir como bootstrap-server=`broker-list.sh`

</p> 
