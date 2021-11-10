set -e
docker-compose up -d db
./reset-schema.sh