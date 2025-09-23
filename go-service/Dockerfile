FROM golang:1.25.1-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o loresmith-go-service ./main.go

FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/loresmith-go-service .

EXPOSE 8080

CMD ["./loresmith-go-service"]