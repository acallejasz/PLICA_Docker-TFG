#!/bin/bash

# Recuperar archivos temporales después de cada ejecución
cd ontologias/config-files
cp asset_valuation-copiaseguridad.xml ./asset_valuation.xml
cp assets_ejemplo-copiaseguridad.csv ./assets_ejemplo.csv
cp ficheroJSONSTIX-copiaseguridad.json ./ficheroJSONSTIX.json

echo ""
echo "- - - - - - - - - - - - - - - - - - - - - - - - "
echo "Preparado para ejecución."
echo "- - - - - - - - - - - - - - - - - - - - - - - - "
echo ""
