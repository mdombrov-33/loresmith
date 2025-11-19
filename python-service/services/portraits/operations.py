import json
from utils.logger import logger
from services.redis import get_redis_client
from services.rabbitmq import get_rabbitmq_connection
import pika


def store_portrait(uuid: str, base64_data: str, ttl_seconds: int = 3600):
    """Store portrait base64 in Redis with TTL."""
    try:
        client = get_redis_client()
        key = f"portrait:{uuid}"
        client.setex(key, ttl_seconds, base64_data)
        logger.info(f"Stored portrait {uuid} in Redis (TTL: {ttl_seconds}s)")
    except Exception as e:
        logger.error(f"Failed to store portrait in Redis: {e}")
        raise


def get_portrait(uuid: str) -> str | None:
    """Retrieve portrait base64 from Redis."""
    try:
        client = get_redis_client()
        key = f"portrait:{uuid}"
        data = client.get(key)
        if data:
            return data.decode('utf-8') if isinstance(data, bytes) else data
        return None
    except Exception as e:
        logger.error(f"Failed to get portrait from Redis: {e}")
        return None


def publish_portrait_job(uuid: str, name: str, appearance: str, theme: str, traits: list):
    """Publish a portrait generation job to RabbitMQ."""
    try:
        connection = get_rabbitmq_connection()
        channel = connection.channel()
        channel.queue_declare(queue='portrait_generation', durable=True)

        job_data = {
            "uuid": uuid,
            "name": name,
            "appearance": appearance,
            "theme": theme,
            "traits": traits
        }

        channel.basic_publish(
            exchange='',
            routing_key='portrait_generation',
            body=json.dumps(job_data),
            properties=pika.BasicProperties(
                delivery_mode=2,
                content_type='application/json'
            )
        )

        logger.info(f"Published portrait job for {name} (UUID: {uuid})")
        connection.close()
    except Exception as e:
        logger.error(f"Failed to publish portrait job: {e}", exc_info=True)
        raise
