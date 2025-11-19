import json
import asyncio
from utils.logger import logger
from services.rabbitmq import get_rabbitmq_connection
from services.portraits.operations import store_portrait
from services.image_gen.generator import generate_character_images


def process_portrait_job(ch, method, properties, body):
    """Process a single portrait generation job."""
    try:
        job_data = json.loads(body)
        uuid = job_data['uuid']
        name = job_data['name']
        appearance = job_data['appearance']
        theme = job_data['theme']
        traits = job_data['traits']

        logger.info(f"Processing portrait job for {name} (UUID: {uuid})")

        async def generate():
            return await generate_character_images(
                name=name,
                appearance=appearance,
                theme=theme,
                world_id=0,
                character_id=uuid,
                traits=traits,
                skills=[]
            )

        portrait_data = asyncio.run(generate())

        if portrait_data.get('image_portrait_base64'):
            store_portrait(uuid, portrait_data['image_portrait_base64'])
            logger.info(f"✓ Portrait for {name} stored in Redis")
        else:
            logger.warning(f"No portrait generated for {name}")

        ch.basic_ack(delivery_tag=method.delivery_tag)

    except Exception as e:
        logger.error(f"Error processing portrait job: {e}", exc_info=True)
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)


def start_worker():
    """Start the portrait generation worker."""
    logger.info("Starting portrait generation worker...")

    connection = get_rabbitmq_connection()
    channel = connection.channel()

    channel.queue_declare(queue='portrait_generation', durable=True)
    channel.basic_qos(prefetch_count=1)

    channel.basic_consume(
        queue='portrait_generation',
        on_message_callback=process_portrait_job
    )

    logger.info("✓ Worker ready. Waiting for portrait jobs...")

    try:
        channel.start_consuming()
    except KeyboardInterrupt:
        logger.info("Worker interrupted")
        channel.stop_consuming()
    finally:
        connection.close()
        logger.info("Worker shutdown complete")


if __name__ == '__main__':
    start_worker()
