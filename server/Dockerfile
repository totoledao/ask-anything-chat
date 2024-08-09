FROM golang:1.22.5

WORKDIR /server

COPY  go.mod go.sum ./

RUN go mod download && go mod verify

COPY . .

RUN go install github.com/jackc/tern/v2@latest

RUN go build -o server/bin/server .

EXPOSE ${APP_PORT}
ENTRYPOINT [ "server/bin/server" ]