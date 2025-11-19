#!/bin/bash
set -e

echo "Starting RabbitMQ worker in background..."
python -m services.portraits.worker &
WORKER_PID=$!

echo "Starting gRPC server..."
python lore_servicer.py &
SERVER_PID=$!

wait $WORKER_PID $SERVER_PID
