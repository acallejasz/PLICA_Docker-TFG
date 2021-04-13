#!/usr/bin/env python
# bin/elasticsearch --elastic
#
# Run with: spark-submit --packages org.apache.spark:spark-sql-kafka-0-10_2.11:2.4.4 structuredSm.py
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

APP_NAME = "SM-SparkStreaming.py"
PREDICTION_TOPIC = sys.argv[2]
PERIOD = 10
BROKERS = sys.argv[1]
base_path = '/app/siem/StructuredStreaming/DistanceKmeans'
threshold = np.load(f'{base_path}/data/thresholdSm.npy',allow_pickle=True)
limit = 0

conf = SparkConf().setAppName(f"{APP_NAME}")
sc = SparkContext(conf=conf)
spark = SparkSession(sc)
spark.conf.set("spark.sql.session.timeZone", "Europe/Madrid")
lines = spark.readStream.format("kafka").option("kafka.bootstrap.servers", BROKERS).option("subscribe", PREDICTION_TOPIC).option("failOnDataLoss", "false").load()

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
        .add('Signature', StringType()) \
        .add('Date', StringType()) \
        .add('Sensor', StringType()) \
        .add('Source', StringType()) \
        .add('Destination', StringType()) \
        .add('Risk', IntegerType()))

dataset =  lines.select(F.from_json(F.col("value").cast("string"),schema).alias("dataset")).select("dataset.*")

print('# Estructura cargada')
print('> Cargando modelos de preprocesamiento')

# Preprocesamiento

dataset = dataset.select("version",F.col("time").alias('timestamp'),"id","type","event", \
"data.Signature","data.Date","data.Sensor","data.Source","data.Destination","data.Risk")

    # Cast string a tipos adecuados

dataset = dataset.withColumn("Date", F.to_timestamp(F.col("Date"),'dd/MM/yyyy HH:mm'))
dataset = dataset.withColumn("Date", F.date_format(F.col("Date"), "yyyy-MM-dd'T'HH:mm:ssXXX"))
dataset = dataset.withColumn("timestamp", F.from_unixtime(F.col("timestamp"), "yyyy-MM-dd'T'HH:mm:ssXXX"))

    # Separamos año, mes, dia, hora, minuto de Date

dataset = dataset.withColumn("year", F.year(F.col("Date")))
dataset = dataset.withColumn("month", F.month(F.col("Date")))
dataset = dataset.withColumn("day", F.dayofmonth(F.col("Date")))
dataset = dataset.withColumn("hour", F.hour(F.col("Date")))
dataset = dataset.withColumn("minute", F.minute(F.col("Date")))
dataset = dataset.withColumn("second", F.second(F.col("Date")))

    # Normalizamos columna hora

dataset = dataset.withColumn("hour", (F.col("hour") - 0) / (23 - 0)*4)

    # Escalamos la columna RISK (rango 0-5)

max_risk = 5
min_risk = 0
dataset = dataset.withColumn("Risk_scaled", (F.col("Risk") - min_risk) / (max_risk - min_risk))

    # TF-IDF | Signature

tfIdf_model_path = "{}/data/tfIdfSignatureModel.bin".format(base_path)
tfIdf = PipelineModel.load(tfIdf_model_path)
dataset = tfIdf.transform(dataset)

    # TF-IDF | Source

tfIdf_model_path = "{}/data/tfIdfSourceModel.bin".format(base_path)
tfIdf = PipelineModel.load(tfIdf_model_path)
dataset = tfIdf.transform(dataset)

    # TF-IDF | Destination

tfIdf_model_path = "{}/data/tfIdfDestinationModel.bin".format(base_path)
tfIdf = PipelineModel.load(tfIdf_model_path)
dataset = tfIdf.transform(dataset)
    
    # VectorAssembler

vector_assembler_output_path = "{}/data/vectorAssemblerModel.bin".format(base_path)
vector_assembler = VectorAssembler.load(vector_assembler_output_path)
dataset = vector_assembler.transform(dataset)

print('# Modelos de preprocesamiento cargados')
print('> Cargando KMeans')

# Clasificación

model_path = "{}/data/distanceKmeansSmModel.bin".format(base_path)
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

only_predictions = predictions.select('version','timestamp','id','type','event','Signature','Date','Sensor','Source','Destination','Risk','anomalia','prediction','distance')

# Comienzo
print('# Comienzo ')

#only_predictions.writeStream.outputMode("append").format("console").start().awaitTermination()
only_predictions.writeStream.outputMode("append").format("org.elasticsearch.spark.sql").option("checkpointLocation",'/tmp/checkpoint5').option("es.nodes",sys.argv[3]).option("es.port",sys.argv[4]).option("es.nodes.wan.only","true").option("es.net.http.auth.user",sys.argv[5]).option("es.net.http.auth.pass",sys.argv[6]).option("es.resource","sm/doc-type").start("sm/doc-type").awaitTermination()

