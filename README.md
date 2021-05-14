<img  align="left" width="150" style="float: left;" src="https://www.upm.es/sfs/Rectorado/Gabinete%20del%20Rector/Logos/UPM/CEI/LOGOTIPO%20leyenda%20color%20JPG%20p.png">

<br/><br/><br/>

# Repositorio para la dockerización y migración de PLICA

Versión: 14 de Mayo de 2021

## Título

DISEÑO Y DESARROLLO DE UN ENTORNO BASADO EN MICROSERVICIOS SECURIZADOS DOCKER PARA LA MIGRACIÓN DE UNA PLATAFORMA DE CONCIENCIA CIBERSITUACIONAL

## Descripción y objetivo del TFG

Desarrollo de imágenes Docker de cada uno de los subsistemas PLICA, proyecto de la Universidad Politécnica de Madrid, con orquestación del despliegue con Docker-Compose, identificación de dependencias entre contenedores y securización de comunicación entre estos.

## Partes del proyecto
  
  - Directorio Elastalert, que contiene el dockerfile y docker-compose para levantar Elastalert, así como otros archivos necesarios para adicionarlos como volumen.
  - Directorio Elasticsearch-Kibana, que contiene el docker-compose para levantar Elasticsearch y la interfaz visual de Kibana.
  - Directorio Kafka-ZooKeeper y Kafka-ZooKeeperSSL, que contienen los dockerfile y docker-compose necesarios para levantar Apache Kafka y Zookeper sin/con SSL.
  - Directorio Spark-Hadoop, que contiene los dockerfile y docker-compose para levantar Apache Spark, permitiendo su clusterización y despliegue escalable de workers.
  - Directorio Fuseki, que contiene el dockerfile y docker-compose para levantar Fuseki, así como otros archivos necesarios para su funcionamiento.
  - Directorio PLICA-Ubuntu_based_PandoraFMS, con todo el proyecto pero basado en Ubuntu y con PandoraFMS corriendo en los contenedores.
  - Directorio scripts_pruebas, que contiene todos los archivos necesarios para crear topics, productores, las tramas a enviar, ejecutar servicio en Spark y olvidar EDCAS.
  
## Arranque del servicio global

Sobre el directorio descargado realizar: docker-compose up --scale spark-base=0. Recordar que habría que meter en la carpeta PLICAv6, que esta en la ruta /TFG/Spark-Hadoop/base/, todos los archivos que faltan. Utilizar la carpeta normal del proyecto PLICA para Spark y meterla en dicha ruta y sustituir lo archivos /PLICAv6/XXXX/StructuredStreaming/DistanceKMeans/structuredXX.py por los del repositorio. Además, es necesario añadir en la parte de ontologías de Fuseki el .jar de PLICA, ya que no se incluye en este repositorio.

## Kafka + Zookeper (SSL)

Para este módulo hay que utilizar el docker-compose.yml para crear el contenedor de ZooKeeper, el primero de nuestros brokers, sobre el que se hará la conexión SSL de los clientes, los volumenes donde se encuentran los diversos certificados y ficheros de configuración y la network PLICA, en la que la ip del gateway debe coincidir con el ADVERTISED_HOST_NAME. 

Tras esto pueden usar los scripts de la carpeta scripts_pruebas para crear topics, brokers, productores o consumidores. El de los brokers necesita de dos parámetros, donde el pirmero de ellos se corresponde con el puerto que utiizará ese broker y que debe ser distinto a los de cualquier otro y siempre +3 con respecto al último y el segundo parámetro que será el id del broker, y que no puede coincidir con el de ningún otro. Por su parte los dos últimos requieren de un parámetro, que se corresponde con el nombre del topic al que queremos conectarnos.

## Elasticsearch + Kibana

Para este módulo simplemente se utilizan las imagenes oficiales proporcionadas por la compañía que se encuentran disponibles en DockerHub. Cuentan con una mínima configuración, permitiendo ver la interfaz visual de Kibana en localhost:5601, con usuario elastic y contraseña xxxx. Utiliza la versión básica (No de pago ni el free trial).

## Spark-Hadoop

Usar el docker-compose.yml con --scale spark-base=0 (Se necesita construir la imagen pero no hay que levantarla). Tras esto, utilizar el script con ./startPy.sh $1, donde se añada el tipo de aplicación que se quiere desplegar en spark (wifi,bluetooth,etc). Se cuenta con un docker-compose adicional con el que se pueden escalar nuevos workers dentro de la carpeta /Spark-Hadoop/worker.

## Elastalert

Basta con arrancar el docker-compose global. Si se quiere probar individualmente con su docker-compose recordar eliminar el sleep y tener siempre levantado el contenedor de Elasticsearch.

## Fuseki

Basta con arrancar el docker-compose global. Si se quiere probar individualmente con su docker-compose recordar eliminar el sleep y tener siempre levantado el contenedor de Elasticsearch. Apunte importante: El servicio del .jar (que no el incio del servidor) estará en un bucle while infinito hasta que todos los indices que esten indicados en el .env en EASTICSEARCH_INDEX sean creados en Elasticsearch, para evitar así errores al intentar buscar o trabajar sobre estos.

## Otras caracteristicas

  - Se encuentra habilitado el acceso por ssh a todos los contenedores, excepto a los de Elasticsearch y Kibana.
  - Se dispone de PandoraFMS en las imagenes basadas en Ubuntu, excepto en las de Elasticsearch y Kibana.
