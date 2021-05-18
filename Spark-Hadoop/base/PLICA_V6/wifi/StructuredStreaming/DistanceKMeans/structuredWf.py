#!/usr/bin/env python
# bin/elasticsearch --elastic
#
# Run with: spark-submit --packages org.apache.spark:spark-sql-kafka-0-10_2.11:2.4.4 structuredWf.py
# 

# Librerias

import findspark
findspark.init()

    # Procesamiento de datos

import sys
import math
import random 
import numpy as np
from datetime import datetime

import pyspark.sql.functions as F
from pyspark import SparkConf, SparkContext
from pyspark.sql.session import SparkSession
from pyspark.sql.types import *
from pyspark.ml import PipelineModel
from pyspark.ml.feature import StringIndexer, VectorAssembler, MinMaxScalerModel
from pyspark.ml.linalg import Vectors

    # Modelos de clustering 

from pyspark.ml.clustering import KMeansModel

# Variables

APP_NAME = "WF-SparkStreaming.py"
PREDICTION_TOPIC = sys.argv[2]
PERIOD = 10
BROKERS = sys.argv[1]
KEYSTORE = sys.argv[7]
TRUSTSTORE = sys.argv[8]
KEY = sys.argv[9]
PASSWORD = sys.argv[10]
base_path = '/app/wifi/StructuredStreaming/DistanceKMeans'
threshold = np.load(f'{base_path}/data/thresholdWifi.npy',allow_pickle=True)
limit = 0

conf = SparkConf().setAppName(f"{APP_NAME}")
sc = SparkContext(conf=conf)
spark = SparkSession(sc)
spark.conf.set("spark.sql.session.timeZone", "Europe/Madrid")

# KAFKA-SPARK Without SSL config

#lines = spark.readStream.format("kafka").option("kafka.bootstrap.servers", BROKERS).option("subscribe", PREDICTION_TOPIC).option("failOnDataLoss", "false").load()

# KAFKA-SPARK With SSL config

lines = spark.readStream.format("kafka") \
        .option("kafka.bootstrap.servers", BROKERS) \
        .option("subscribe", PREDICTION_TOPIC) \
        .option("failOnDataLoss", "false") \
        .option("kafka.security.protocol", "SSL") \
        .option("kafka.ssl.truststore.location", TRUSTSTORE) \
        .option("kafka.ssl.truststore.password", PASSWORD) \
        .option("kafka.ssl.keystore.location", KEYSTORE) \
        .option("kafka.ssl.keystore.password", PASSWORD) \
        .option("kafka.ssl.key.location", KEY) \
        .option("kafka.ssl.endpoint.identification.algorithm", "") \
        .option("kafka.ssl.key.password", PASSWORD).load()

# Funciones 

    # Función de calculo del vector del centroid más cercano

def centroid (k,centers):
    return centers[k].tolist()

    # Función de calculo de distancia euclidea al centroid

def distToCentroid(datapt, centroid):
    return math.sqrt(Vectors.squared_distance(datapt, centroid))

    # Función para determinar anomalia

def anomalia (prediction, distance, threshold,limit):
    limit = min(limit,len(threshold[prediction]) - 1)
    if(round(distance,6) > round(threshold[prediction][limit],6)):
        return True
    return False

print('> Cargando estructura')

# Esquema

schema = StructType() \
    .add("version", StringType()) \
    .add("time", StringType()) \
    .add("id", StringType()) \
    .add("type", StringType()) \
    .add("event", StringType()) \
    .add("data",StructType() \
        .add('userid', StringType()) \
        .add('minact', IntegerType()) \
        .add('tseen', IntegerType()) \
        .add('tacum', IntegerType()) \
        .add('visits', IntegerType()) \
        .add('act24h', IntegerType()) \
        .add('pwr', IntegerType()) \
        .add('footprint', StringType()) \
        .add('oui', StringType()) \
        .add('type', StringType()) \
        .add('tx_packets', IntegerType()) \
        .add('tx_bytes', IntegerType()) \
        .add('rx_packets', IntegerType()) \
        .add('rx_bytes', IntegerType()) \
        .add('ap', StringType()) \
        .add('essid', StringType()) \
        .add('apwr', IntegerType()) \
        .add('timestamp', StringType())) 

dataset =  lines.select(F.from_json(F.col("value").cast("string"),schema).alias("dataset")).select("dataset.*")

print('# Estructura cargada')
print('> Cargando modelos de preprocesamiento')

# Preprocesamiento

dataset = dataset.select("version",F.col("time").alias('timestamp'),"id","type","event" \
        ,"data.userid","data.minact","data.tseen","data.tacum","data.visits","data.act24h","data.pwr","data.footprint","data.oui" \
        ,F.col("data.type").alias('type_mac'), "data.tx_packets", "data.tx_bytes", "data.rx_packets", "data.rx_bytes", "data.ap", "data.essid", "data.apwr",F.col("data.timestamp").alias('time'))

    # Cast string a tipos adecuados

dataset = dataset.withColumn("timestamp", F.from_unixtime(F.col("timestamp"), "yyyy-MM-dd'T'HH:mm:ssXXX"))
dataset = dataset.withColumn("time", F.from_unixtime(F.col("time"), "yyyy-MM-dd'T'HH:mm:ssXXX"))

    # Creamos col hora

dataset = dataset.withColumn("hour", F.hour(F.col("time")))

    # Normalizamos columna hora

dataset = dataset.withColumn("hour", (F.col("hour") - 0) / (23 - 0)*12)

    # Separamos oui, nic de userid (direccion MAC)

dataset = dataset.withColumn('oui_userid', dataset.userid.substr(1,8))
dataset = dataset.withColumn('nic_userid', dataset.userid.substr(10,9))

    # Separamos oui, nic de footprint (direccion MAC)

dataset = dataset.withColumn('oui_footprint', dataset.footprint.substr(1,8))
dataset = dataset.withColumn('nic_footprint', dataset.footprint.substr(10,9))

    # StringIndexer

string_indexer_model_path = "{}/data/stringIndexerModel.bin".format(base_path)
string_indexer = PipelineModel.load(string_indexer_model_path)
dataset = string_indexer.transform(dataset)

    # MinMaxScaler

minMaxScaler_model_path = "{}/data/minMaxScalerModel.bin".format(base_path)
minMaxScaler = PipelineModel.load(minMaxScaler_model_path)
dataset = minMaxScaler.transform(dataset)

    # OneHotEncoding

ohe_model_path = "{}/data/oheModel.bin".format(base_path)
ohe = PipelineModel.load(ohe_model_path)
dataset = ohe.transform(dataset)

    # VectorAssembler

vector_assembler_output_path = "{}/data/vectorAssemblerModel.bin".format(base_path)
vector_assembler = VectorAssembler.load(vector_assembler_output_path)
dataset = vector_assembler.transform(dataset)

print('# Modelos de preprocesamiento cargados')
print('> Cargando KMeans')

# Clasificación

model_path = "{}/data/distanceKmeansWifiModel.bin".format(base_path)
model = KMeansModel.load(model_path)
predictions = model.transform(dataset)

centers = model.clusterCenters()

vectorCent = F.udf(lambda k: centroid(k,centers), ArrayType(DoubleType()))
euclDistance = F.udf(lambda data,centroid: distToCentroid(data,centroid),FloatType())
detectAnom = F.udf(lambda prediction, distance: anomalia(prediction, distance, threshold, limit), BooleanType())

predictions  = predictions.withColumn('centroid', vectorCent(F.col('prediction')))
predictions = predictions.withColumn('distance', euclDistance(F.col('features'),F.col('centroid')))
predictions = predictions.withColumn('anomalia', detectAnom(F.col('prediction'),F.col('distance')))

print('# KMeans cargado ')

only_predictions = predictions.select('version','timestamp','id','type','event' \
    ,'userid','minact','tseen','tacum','visits','act24h','pwr','footprint','oui','type_mac','tx_packets','tx_bytes','rx_packets','rx_bytes','ap','essid','apwr','time','anomalia')

# Comienzo
print('# Comienzo ')

#only_predictions.writeStream.outputMode("append").format("console").start().awaitTermination()
only_predictions.writeStream.outputMode("append").format("org.elasticsearch.spark.sql").option("checkpointLocation",'/tmp/checkpoint400').option("es.nodes",sys.argv[3]).option("es.port",sys.argv[4]).option("es.nodes.wan.only","true").option("es.net.http.auth.user",sys.argv[5]).option("es.net.http.auth.pass",sys.argv[6]).option("es.resource","wifi/doc-type").start("wifi/doc-type").awaitTermination()