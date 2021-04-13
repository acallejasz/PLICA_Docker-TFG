#!/usr/bin/env python
# bin/elasticsearch --elastic
#
# Run with: spark-submit --packages org.apache.spark:spark-sql-kafka-0-10_2.11:2.4.4 structuredRmW2V.py
# 

# Librerias

import findspark
findspark.init()

    # Procesamiento de datos

import math
import random 
import numpy as np
from datetime import datetime

import pyspark.sql.functions as F
from pyspark import SparkConf, SparkContext
from pyspark.sql.session import SparkSession
from pyspark.sql.types import *
from pyspark.ml import PipelineModel
from pyspark.ml.feature import StringIndexer, VectorAssembler, VectorSizeHint, Word2VecModel, MinMaxScalerModel
from pyspark.ml.linalg import Vectors

    # Modelos de clustering 

from pyspark.ml.clustering import KMeansModel

# Variables

APP_NAME = "RM-SparkStreaming.py"
PREDICTION_TOPIC = sys.argv[2]
PERIOD = 10
BROKERS = sys.argv[1]
base_path = '/app/rm/StructuredStreaming/DistanceKmeans'
threshold = np.load(f'{base_path}/data/thresholdWord2Vec.npy',allow_pickle=True)
limit = 0

conf = SparkConf().setAppName(f"{APP_NAME}")
sc = SparkContext(conf=conf)
spark = SparkSession(sc)
lines = spark.readStream.format("kafka").option("kafka.bootstrap.servers", BROKERS).option("subscribe", PREDICTION_TOPIC).load()

# Funciones 

    # Función cast string a timestamp

def timeFormat(time_string):
    datetime_string = datetime.utcfromtimestamp(int(time_string)).strftime('%Y-%m-%d %H:%M:%S')
    return datetime_string

    # Función de calculo del vector del centroid más cercano

def centroid (k,centers):
    return centers[k].tolist()

    # Función de calculo de distancia euclidea al centroid

def distToCentroid(datapt, centroid):
    return math.sqrt(Vectors.squared_distance(datapt, centroid))

    # Función para determinar anomalia

def anomalia (prediction, distance, threshold,limit):
    if(distance >= threshold[prediction][limit]):
        return True
    return False

# Esquema

schema = StructType().add('version', StringType()).add('time', StringType()).add('id', StringType()).add('type', StringType()).add('event', StringType()).add('data',ArrayType(StructType() \
	.add('time', StringType()) \
	.add('imei', StringType()) \
	.add('imsi', StringType()) \
	.add('rat', StringType())))

dataset =  lines.select(F.from_json(F.col("value").cast("string"),schema).alias("dataset")).select("dataset.*")

# Preprocesamiento

dataset = dataset.drop("event","id","type","version","time")
dataset = dataset.withColumn("data", F.explode("data")) \
    .select( "*", F.col("data")["imei"].alias("imei"), F.col("data")["imsi"].alias("imsi"), F.col("data")["rat"].alias("rat"), F.col("data")["time"].alias("time"))

dataset = dataset.drop("data")

    # Cast string a timestamp col time

timeFormatUDF = F.udf(lambda ts: timeFormat(ts)) 

dataset = dataset.withColumn("time", timeFormatUDF(F.col("time")).cast(TimestampType()))

    # Separamos col time

dataset = dataset.withColumn("year", F.year(F.col("time")))
dataset = dataset.withColumn("month", F.month(F.col("time")))
dataset = dataset.withColumn("day", F.dayofmonth(F.col("time")))
dataset = dataset.withColumn("hour", F.hour(F.col("time")))
dataset = dataset.withColumn("minute", F.minute(F.col("time")))
dataset = dataset.withColumn("second", F.second(F.col("time")))

    # Separamos MCC, MNC y MSIN de la columna IMSI

dataset = dataset.withColumn('mcc', dataset.imsi.substr(1,3))
dataset = dataset.withColumn('mnc', dataset.imsi.substr(4,2))
dataset = dataset.withColumn('msin', dataset.imsi.substr(6,10))

    # Separamos TAC, SNR y CD de la columna IMEI
    # Formato de los IMEI: TAC -- Serial_Number (14 digitos)

dataset = dataset.withColumn('tac', dataset.imei.substr(1,8))
dataset = dataset.withColumn('snr', dataset.imei.substr(9,6))

    # Escalamos la columna year con MinMaxScaler en el rango [0,1]

dataset = dataset.withColumn("year", dataset["year"].cast(FloatType()))
max_year = 3000
min_year = 0
dataset = dataset.withColumn("year", (F.col("year") - min_year) / (max_year - min_year))

    # Normalizamos columnas mes, día, hora, minuto y segundo

dataset = dataset.withColumn("month", (F.col("month") - 1) / (12 - 1))
dataset = dataset.withColumn("day", (F.col("day") - 1) / (31 - 1))
dataset = dataset.withColumn("hour", (F.col("hour") - 0) / (23 - 0))
dataset = dataset.withColumn("minute", (F.col("minute") - 0) / (59 - 0))
dataset = dataset.withColumn("second", (F.col("second") - 0) / (59 - 0))

    
    # Word2Vec

dataset = dataset.withColumn('categorical', F.concat(F.array('rat'),F.array('mcc'),F.array('mnc'),F.array('msin'),F.array('tac'),F.array('snr')))

word2Vec_output_path = "{}/data/word2VecModel.bin".format(base_path)
word2Vec = Word2VecModel.load(word2Vec_output_path)
dataset = word2Vec.transform(dataset)

    # VectorAssembler

sizeHint = VectorSizeHint(inputCol="vcategorical", handleInvalid="skip", size=50)
dataset = sizeHint.transform(dataset)

vector_assembler_output_path = "{}/data/vectorAssemblerW2VModel.bin".format(base_path)
vector_assembler = VectorAssembler.load(vector_assembler_output_path)
dataset = vector_assembler.transform(dataset)

# Clasificación

model_path = "{}/data/distanceKmeansRmW2VModel.bin".format(base_path)
model = KMeansModel.load(model_path)
predictions = model.transform(dataset)

centers = model.clusterCenters()

vectorCent = F.udf(lambda k: centroid(k,centers), ArrayType(DoubleType()))
euclDistance = F.udf(lambda data,centroid: distToCentroid(data,centroid),FloatType())
detectAnom = F.udf(lambda prediction, distance: anomalia(prediction, distance, threshold, limit), BooleanType())

predictions  = predictions.withColumn('centroid', vectorCent(F.col('prediction')))
predictions = predictions.withColumn('distance', euclDistance(F.col('features'),F.col('centroid')))
predictions = predictions.withColumn('anomalia', detectAnom(F.col('prediction'),F.col('distance')))

only_predictions = predictions.select('rat','imei','imsi','time','prediction','distance','anomalia')

# Comienzo

print('Threshold por cada k:\n')
for index,t in enumerate(threshold):
    print(f'> k: {index} | threshold: {t[limit]}')

only_predictions.writeStream.outputMode("append").format("console").start().awaitTermination()
