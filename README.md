<img  align="left" width="150" style="float: left;" src="https://www.upm.es/sfs/Rectorado/Gabinete%20del%20Rector/Logos/UPM/CEI/LOGOTIPO%20leyenda%20color%20JPG%20p.png">

<br/><br/><br/>

# Repositorio para los archivos de mi TFG

Versión: 16 de Febrero de 2021

## Título

MIGRACIÓN DE PLATAFORMA DE CONCIENCIA CIBERSITUACIONAL A ENTORNO DOCKER SECURIZADO

## Descripción y objetivo del TFG

Desarrollo de imágenes Docker de cada uno de los subsistemas PLICA, proyecto de la Universidad Politécnica de Madrid, con orquestación del despliegue con Docker-Compose, identificación de dependencias entre contenedores y securización de comunicación entre estos.

## Partes del proyecto

  - Directorio Kafka-ZooKeeper, que contiene el dockerfile y dockercompose para levantar apache Kafka y Zookeper con SSL y bastionado
  - Directorio Spark-Hadoop, que contiene el dockerfile y dockercompose para levantar apache Spark y Hadoop con bastionado

## Kafka + Zookeper

Para este módulo hay que utilizar el docker-compose.yml para crear el contenedor de ZooKeeper, el primero de nuestros brokers, sobre el que se hará la conexión SSL de los clientes, los volumenes donde se encuentran los diversos certificados y ficheros de configuración y la network PLICA, en la que la ip del gateway debe coincidir con el ADVERTISED_HOST_NAME. 

Tras esto pueden usar los scripts de la carpeta scripts_pruebas para crear topics, brokers, productores o consumidores. El de los brokers necesita de dos parámetros, donde el pirmero de ellos se corresponde con el puerto que utiizará ese broker y que debe ser distinto a los de cualquier otro y siempre +3 con respecto al último y el segundo parámetro que será el id del broker, y que no puede coincidir con el de ningún otro. Por su parte los dos últimos requieren de un parámetro, que se corresponde con el nombre del topic al que queremos conectarnos.

 
