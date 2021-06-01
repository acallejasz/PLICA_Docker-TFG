<img  align="left" width="150" style="float: left;" src="https://www.upm.es/sfs/Rectorado/Gabinete%20del%20Rector/Logos/UPM/CEI/LOGOTIPO%20leyenda%20color%20JPG%20p.png">

<br/><br/><br/>

# Repositorio del proyecto PLICA para la dockerización y migración del entorno monolítico empleado

Versión: 31 de Mayo de 2021

## Título del TFG

DISEÑO Y DESARROLLO DE UN ENTORNO BASADO EN MICROSERVICIOS SECURIZADOS DOCKER PARA LA MIGRACIÓN DE UNA PLATAFORMA DE CONCIENCIA CIBERSITUACIONAL

## Descripción y objetivo del TFG

Desarrollo de imágenes Docker de cada uno de los subsistemas PLICA, proyecto de la Universidad Politécnica de Madrid, con orquestación del despliegue con Docker-Compose, identificación de dependencias entre contenedores, securización de comunicación entre estos con SSL/TLS, mejora del escalado, la portabilidad y la resiliencia. De este modo, se permite su despliegue en entornos distribuidos en microservicios securizados.

## Partes del proyecto
  
  - Directorio **Elastalert**: 
    Contiene el dockerfile, docker-compose y el .env para compilar y desplegar Elastalert, así como otros archivos de configuración necesarios para adicionarlos como volumen.
    
  - Directorio **Elasticsearch-Kibana**:
     Contiene el dockerfile, docker-compose y el .env para compilar y desplegar Elasticsearch y la interfaz visual de Kibana. 
    
  - Directorio **Kafka-ZooKeeper y Kafka-ZooKeeperSSL**:
     Contiene el dockerfile, docker-compose y el .env para compilar y desplegar Apache Kafka y Zookeper sin/con SSL. Adicionalmente, cuenta con los ficheros de configuración          necesarios y un script para generar certificados.
    
  - Directorio **Spark-Hadoop**:
    Contiene el dockerfile, docker-compose y el .env para compilar y desplegar Apache Spark, permitiendo su clusterización y el despliegue escalable de workers, cifrando también     las comunicaciones con Kafka.
  
  - Directorio **Fuseki**:
    Contiene el dockerfile, docker-compose y el .env para compilar y desplegar Fuseki, así como otros archivos necesarios para su funcionamiento.

  - Directorio **PLICA-Ubuntu_based_PandoraFMS**:
    Contiene todo el proyecto PLICA pero basado en la imagen base de Ubuntu y con un agente de Pandora FMS corriendo en los contenedores para la monitorización.

  - Directorio **scripts_pruebas**:
    Contiene todos los archivos necesarios para crear topics, productores, consumidores, las tramas a enviar, ejecutar servicios en Spark y olvidar EDCA de los contenedores en       el host local.

## Compilación y despliegue del entorno 🚀

### Pre-requesitos 📋

1. Clonar el repositorio en el directorio de trabajo con el siguiente comando: 
`git clone https://github.com/acallejasz/TFG.git`.
2. Instalar la herramienta Docker y Docker-Compose.
3. Para el servicio de Spark, incluir los binarios y ficheros necesarios en el directorio PLICAv6, que esta en la ruta _/TFG/PLICA-Ubuntu_based_PandoraFMS/Spark-Hadoop/base/_ o usar la carpeta del proyecto y sustituir lo archivos /PLICAv6/XXXX/StructuredStreaming/DistanceKMeans/structuredXX.py por los del repositorio. 
4. Añadir en el susbsitema de ontologías de Fuseki, en la ruta _/TFG/PLICA-Ubuntu_based_PandoraFMS/Fuseki_ el .jar de PLICA, ya que no se incluye en este repositorio.

### Compilación de imagenes de los microservicios 🔧

Sobre el directorio **PLICA-Ubuntu_based_PandoraFMS** realizar: 

```
docker-compose build
```

### Despliegue completo basado en Ubuntu con Pandora FMS 🔧

Sobre el directorio **PLICA-Ubuntu_based_PandoraFMS**, realizar: 

```
docker-compose up --scale base=0 --scale spark-base=0
```

Todas las versiones de las aplicaciones, direcciones de red, puertos, usuarios, credenciales y otras variables pueden ser modificadas en el fichero **.env** que se encuentra en la misma ruta indicada anteriormente.

### Aranque de los subsistemas individualmente 🔧

Sobre el directorio del subsistema que se desee desplegar, incluido en el directorio **PLICA-Ubuntu_based_PandoraFMS**, realizar: 

```
docker-compose up
```
* Para el caso de Spark añadir, a continuación: `--scale spark-base=0`

Todas las versiones de las aplicaciones, direcciones de red, puertos, usuarios, credenciales y otras variables pueden ser modificadas en el fichero **.env** que se encuentra en el propio directorio del subsistema.

### Finalizar/reiniciar los subsistemas 🔧

Sobre el directorio del subsistema, incluido en **PLICA-Ubuntu_based_PandoraFMS**, realizar: 

Finalizar:
```
docker-compose stop
```

Reiniciar:
```
docker-compose start
```

## Descripción y uso de los subsistemas ⚙️

### Kafka + Zookeper (SSL)

Para este módulo hay que utilizar el docker-compose.yml para crear el contenedor de ZooKeeper, el primero de nuestros brokers, sobre el que se hará la conexión SSL de los clientes, los volumenes donde se encuentran los diversos certificados y ficheros de configuración y la network PLICA, en la que la ip del gateway debe coincidir con el ADVERTISED_HOST_NAME. 

Tras esto pueden usar los scripts de la carpeta scripts_pruebas para crear topics, brokers, productores o consumidores. El de los brokers necesita de dos parámetros, donde el pirmero de ellos se corresponde con el puerto que utiizará ese broker y que debe ser distinto a los de cualquier otro y siempre +3 con respecto al último y el segundo parámetro que será el id del broker, y que no puede coincidir con el de ningún otro. Por su parte los dos últimos requieren de un parámetro, que se corresponde con el nombre del topic al que queremos conectarnos.

### Elasticsearch + Kibana

Para este módulo simplemente se utilizan las imagenes oficiales proporcionadas por la compañía que se encuentran disponibles en DockerHub. Cuentan con una mínima configuración, permitiendo ver la interfaz visual de Kibana en localhost:5601, con usuario elastic y contraseña xxxx. Utiliza la versión básica (No de pago ni el free trial).

### Spark-Hadoop

Usar el docker-compose.yml con --scale spark-base=0 (Se necesita construir la imagen pero no hay que levantarla). Tras esto, utilizar el script con ./startPy.sh $1, donde se añada el tipo de aplicación que se quiere desplegar en spark (wifi,bluetooth,etc). Se cuenta con un docker-compose adicional con el que se pueden escalar nuevos workers dentro de la carpeta /Spark-Hadoop/worker.

### Elastalert

Basta con arrancar el docker-compose global. Si se quiere probar individualmente con su docker-compose recordar eliminar el sleep y tener siempre levantado el contenedor de Elasticsearch.

### Fuseki

Basta con arrancar el docker-compose global. Si se quiere probar individualmente con su docker-compose recordar eliminar el sleep y tener siempre levantado el contenedor de Elasticsearch. Apunte importante: El servicio del .jar (que no el incio del servidor) estará en un bucle while infinito hasta que todos los indices que esten indicados en el .env en ELASTICSEARCH_INDEX sean creados en Elasticsearch, para evitar así errores al intentar buscar o trabajar sobre estos.

## Otras caracteristicas

  - Se encuentra habilitado el acceso por ssh a todos los contenedores, excepto a los de Elasticsearch y Kibana.
  - Se dispone un agente configurado de Pandora FMS en las imagenes basadas en Ubuntu, excepto en las de Elasticsearch y Kibana.

## Autor ✒️

* **Adrián Callejas Zurita** - [acallejasz](https://github.com/acallejasz)
