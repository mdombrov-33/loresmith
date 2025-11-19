import os
import pika


def get_rabbitmq_connection():
    """Create RabbitMQ connection."""
    credentials = pika.PlainCredentials(
        os.getenv('RABBITMQ_USER', 'loresmith'),
        os.getenv('RABBITMQ_PASS', 'loresmith')
    )
    parameters = pika.ConnectionParameters(
        host=os.getenv('RABBITMQ_HOST', 'rabbitmq'),
        port=int(os.getenv('RABBITMQ_PORT', '5672')),
        credentials=credentials,
        heartbeat=600,
        blocked_connection_timeout=300,
    )
    return pika.BlockingConnection(parameters)
