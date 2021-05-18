#!/usr/bin/env python
# bin/elasticsearch --elastic
#
# Run with: spark-submit --packages org.apache.spark:spark-sql-kafka-0-10_2.11:2.4.4 structuredRm.py
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

APP_NAME = "RM-SparkStreaming.py"
PREDICTION_TOPIC = sys.argv[2]
PERIOD = 10
BROKERS = sys.argv[1]
KEYSTORE = sys.argv[7]
TRUSTSTORE = sys.argv[8]
KEY = sys.argv[9]
PASSWORD = sys.argv[10]
base_path = '/app/rm/StructuredStreaming/DistanceKmeans'
threshold = np.load(f'{base_path}/data/thresholdRm.npy',allow_pickle=True)
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
    if(distance > threshold[prediction][limit]):
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
        .add('time', StringType()) \
        .add('imei', StringType()) \
        .add('imsi', StringType()) \
        .add('rat', StringType()))

dataset =  lines.select(F.from_json(F.col("value").cast("string"),schema).alias("dataset")).select("dataset.*")

print('# Estructura cargada')
print('> Cargando modelos de preprocesamiento')

# Preprocesamiento

dataset = dataset.select("version",F.col("time").alias('timestamp'),"id","type","event","data.time","data.imei","data.imsi","data.rat")

    # Cast string a timestamp col time

dataset = dataset.withColumn("time", F.from_unixtime(F.col("time"), "yyyy-MM-dd'T'HH:mm:ssXXX"))
dataset = dataset.withColumn("timestamp", F.from_unixtime(F.col("timestamp"), "yyyy-MM-dd'T'HH:mm:ssXXX"))

    # Cambiar los valores NA IMEI a IMSI si los hay

dataset = dataset.withColumn('imei', F.when(dataset.imei == 'NA', dataset.imsi).otherwise(dataset.imei))

    # Creamos col hora

dataset = dataset.withColumn("hour", F.hour(F.col("time")))

    # Separamos MCC, MNC y MSIN de la columna IMSI

dataset = dataset.withColumn('mcc', dataset.imsi.substr(1,3))
dataset = dataset.withColumn('mnc', dataset.imsi.substr(4,2))
dataset = dataset.withColumn('msin', dataset.imsi.substr(6,10))

    # Separamos TAC, SNR y CD de la columna IMEI
    # Formato de los IMEI: TAC -- Serial_Number (14 digitos)

dataset = dataset.withColumn('tac_a', dataset.imei.substr(1,2))
dataset = dataset.withColumn('tac_b', dataset.imei.substr(3,6))
dataset = dataset.withColumn('snr', dataset.imei.substr(9,6))

    # Normalizamos columna hora

dataset = dataset.withColumn("hour", (F.col("hour") - 0) / (23 - 0)*6)

    # StringIndexer

string_indexer_model_path = "{}/data/stringIndexerModel.bin".format(base_path)
string_indexer = PipelineModel.load(string_indexer_model_path)
dataset = string_indexer.transform(dataset)

    # MinMaxScaler

minMaxScaler_output_path = "{}/data/minMaxScalerModel.bin".format(base_path)
minMaxScaler = PipelineModel.load(minMaxScaler_output_path)
dataset = minMaxScaler.transform(dataset)
    
    # VectorAssembler

vector_assembler_output_path = "{}/data/vectorAssemblerModel.bin".format(base_path)
vector_assembler = VectorAssembler.load(vector_assembler_output_path)
dataset = vector_assembler.transform(dataset)

print('# Modelos de preprocesamiento cargados')
print('> Cargando KMeans')

# Clasificación

model_path = "{}/data/distanceKmeansRmModel.bin".format(base_path)
model = KMeansModel.load(model_path)
predictions = model.transform(dataset)

centers = model.clusterCenters()

vectorCent = F.udf(lambda k: centroid(k,centers), ArrayType(DoubleType()))
euclDistance = F.udf(lambda data,centroid: distToCentroid(data,centroid),FloatType())
detectAnom = F.udf(lambda prediction, distance: anomalia(prediction, distance, threshold, limit), BooleanType())

predictions  = predictions.withColumn('centroid', vectorCent(F.col('prediction')))
predictions = predictions.withColumn('distance', euclDistance(F.col('features'),F.col('centroid')))
predictions = predictions.withColumn('anomalia', detectAnom(F.col('prediction'),F.col('distance')))

predictions = predictions.withColumn('imei', F.when((dataset.rat == '4G') | (dataset.rat == '3G'), 'NA').otherwise(dataset.imei))

print('# KMeans cargado ')

only_predictions = predictions.select('version','timestamp','id','type','event','rat','imei','imsi','time','anomalia')

# Comienzo
print('# Comienzo ')

#only_predictions.writeStream.outputMode("append").format("console").start().awaitTermination()
only_predictions.writeStream.outputMode("append").format("org.elasticsearch.spark.sql").option("checkpointLocation",'/tmp/checkpoint789').option("es.nodes",sys.argv[3]).option("es.port",sys.argv[4]).option("es.nodes.wan.only","true").option("es.net.http.auth.user",sys.argv[5]).option("es.net.http.auth.pass",sys.argv[6]).option("es.resource","redes_moviles/doc-type").start("redes_moviles/doc-type").awaitTermination()

