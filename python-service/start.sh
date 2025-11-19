#!/bin/bash
set -e

echo "Starting RabbitMQ worker in background..."
python -m services.image_gen.portraits.worker &
WORKER_PID=$!

echo "Starting gRPC server..."
python lore_servicer.py &
SERVER_PID=$!

wait $WORKER_PID $SERVER_PID
