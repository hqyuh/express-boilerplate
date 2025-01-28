#!/bin/sh
# Config path
BASE_PATH=$PWD/../../server

cd $BASE_PATH
source .env
if [ -n "${DB_USERNAME:-}" ] && [ -n "${DB_PASSWORD}" ]; then
     echo "Start generator 🚀🚀🚀"
	npx typeorm-model-generator -h ${DB_HOST} -d ${DB_DATABASE} -u ${DB_USERNAME} -x ${DB_PASSWORD} -e ${DB_TYPE} -p ${DB_PORT} -o ./src/databases -s dev
   rm ./src/databases/ormconfig.json
   rm ./src/databases/tsconfig.json
else
	echo "SETUP INFO: No Environment variables given!"
fi