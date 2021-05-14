#!/bin/bash

# Cogemos de la variable de entorno el indice y creamos una variable para saber si esta listo

index=${ELASTICSEARCH_INDEX}
ready=1

# Comprobamos para todos los indices esperados si están creados y guardamos el resultado en un array

IFS=',' read -ra ADDR <<< "${index}"
for i in "${ADDR[@]}"; do
  arr+=($(curl -s -o /dev/null -w "%{http_code}" http://172.21.0.1:9200/${i}?pretty))
done

# Se guarda el ready el número de peticiones que han dado error 404

ready=$(echo ${arr[@]} | grep -o "404" | wc -w)


while [ ${ready} != 0 ]
do
	echo El número de indices que faltan por crear es: ${ready}
	echo Debes crear todos los indices en elastic para su correcto funcionamiento

	sleep 20s 
	unset arr

	for i in "${ADDR[@]}"; do
  		arr+=($(curl -s -o /dev/null -w "%{http_code}" http://172.21.0.1:9200/${i}?pretty))
	done

	ready=$(echo ${arr[@]} | grep -o "404" | wc -w)

done

echo
echo Todo listo, comienzan a crearse las ontologías
echo