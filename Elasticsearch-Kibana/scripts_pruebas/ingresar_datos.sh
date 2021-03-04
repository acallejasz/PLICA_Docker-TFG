#! /bin/bash

# Check if elastic is running properly

echo "Comprobamos que elasticsearch está funcionando"

curl -u elastic:xxxx -X GET http://localhost:9200/

# Create a new index with some JSON

echo "Creamos un nuevo índice, sin replicar, ya que estamos utilizando un solo nodo en nuestro cluster de Elasticsearch"
echo

curl -u elastic:xxxx -X PUT "localhost:9200/my-index?pretty" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "index": {
      "number_of_replicas": 0
    }
  }
}
'

echo
echo "Añadimos un JSON con obras de Shakespeare al índice anterior"
echo

curl -u elastic:xxxx -H 'Content-Type: application/x-ndjson' -XPOST 'localhost:9200/my-index/doc/_bulk?pretty' --data-binary @shakespeare_6.0.json

echo
echo "Comprobamos que nuestro índice esta listado en la lista de índices"
echo

curl -u elastic:xxxx -X GET "localhost:9200/_cat/indices?v&pretty"

echo
echo "Creamos un index index-pattern en Kibana para poder visualizar los datos del índice creado en Elasticsearch"
echo

curl -u elastic:xxxx -X POST localhost:5601/api/saved_objects/index-pattern/my-index  -H 'kbn-xsrf: true' -H 'Content-Type: application/json' -d '
{
  "attributes": {
    "title": "my-index"
  }
}'
