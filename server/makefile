include .env
migrations := ./internal/store/pgstore/migrations
sqlc := ./internal/store/pgstore/sqlc.yaml

run:
		tern migrate --migrations ${migrations} --host ${DATABASE_HOST} --port ${DATABASE_PORT} --database ${DATABASE_NAME} --user ${DATABASE_USER} --password ${DATABASE_PASSWORD} && sqlc generate -f ${sqlc}