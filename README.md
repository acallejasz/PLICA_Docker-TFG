<img  align="left" width="150" style="float: left;" src="https://www.upm.es/sfs/Rectorado/Gabinete%20del%20Rector/Logos/UPM/CEI/LOGOTIPO%20leyenda%20color%20JPG%20p.png">

<br/><br/><br/>

# Repositorio para los archivos de mi TFG

Versión: 22 de Abril de 2021

## Título

MIGRACIÓN DE PLATAFORMA DE CONCIENCIA CIBERSITUACIONAL A ENTORNO DOCKER SECURIZADO

## Descripción y objetivo del TFG

Desarrollo de imágenes Docker de cada uno de los subsistemas PLICA, proyecto de la Universidad Politécnica de Madrid, con orquestación del despliegue con Docker-Compose, identificación de dependencias entre contenedores y securización de comunicación entre estos.

## Partes del proyecto

  - Directorio Kafka-ZooKeeper, que contiene el dockerfile y dockercompose para levantar Apache Kafka y Zookeper con SSL y bastionado
  - Directorio Spark-Hadoop, que contiene el dockerfile y dockercompose para levantar Apache Spark y Hadoop con bastionado
  - Directorio Elasticsearch-Kibana, que contiene el dockercompose para levantar Elasticsearch y la interfaz visual de Kibana

## Kafka + Zookeper

Para este módulo hay que utilizar el docker-compose.yml para crear el contenedor de ZooKeeper, el primero de nuestros brokers, sobre el que se hará la conexión SSL de los clientes, los volumenes donde se encuentran los diversos certificados y ficheros de configuración y la network PLICA, en la que la ip del gateway debe coincidir con el ADVERTISED_HOST_NAME. 

Tras esto pueden usar los scripts de la carpeta scripts_pruebas para crear topics, brokers, productores o consumidores. El de los brokers necesita de dos parámetros, donde el pirmero de ellos se corresponde con el puerto que utiizará ese broker y que debe ser distinto a los de cualquier otro y siempre +3 con respecto al último y el segundo parámetro que será el id del broker, y que no puede coincidir con el de ningún otro. Por su parte los dos últimos requieren de un parámetro, que se corresponde con el nombre del topic al que queremos conectarnos.

 
## Elasticsearch + Kibana

Para este módulo simplemente se utilizan las imagenes oficiales proporcionadas por la compañía que se encuentran disponibles en DockerHub. Cuentan con una mínima configuración, permitiendo ver la interfaz visual de Kibana en localhost:5601, con usuario elastic y contraseña xxxx. Utiliza la versión básica (No de pago ni el free trial).

## Spark-Hadoop

Usar el docker-compose.yml con --scale spark-base=0 (Se necesita contruir la imagen pero no hay que levantarla). TRas esto utilizar el script con ./startPy.sh $1, donde se añada el tipo de aplicación que se quiere desplegar en spark (wifi,bluetooth,etc). Se cuenta con un docker-compose adicional con el que se pueden escalar nuevos workers dentro de la carpeta /Spark-Hadoop/worker.

## Elastalert

Basta con arrancar el compose global. Si se quiere probar individualmente con su compose recordar eliminar el sleep y tener siempre levantado el contenedor de elasticsearch.

## Otras caracteristicas

Se encuentra habilitado el acceso por ssh a todos los contenedores (Elasticsearch y kibana pendientes)
