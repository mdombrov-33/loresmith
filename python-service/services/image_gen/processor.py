import base64
from pathlib import Path
import aiohttp
from PIL import Image
import boto3
from botocore.exceptions import ClientError
import io

from utils.logger import logger
from config.settings import get_settings

settings = get_settings()

# Initialize R2 client (S3-compatible)
s3_client = None
if settings.AWS_ACCESS_KEY_ID and settings.AWS_ENDPOINT_URL:
    s3_client = boto3.client(
        's3',
        endpoint_url=settings.AWS_ENDPOINT_URL,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name='auto'  # R2 uses 'auto' as region
    )


async def save_base64_image(
    base64_data: str, world_id: int, character_id: str, image_type: str
) -> str:
    """
    Upload base64-encoded image from Automatic1111 to R2.

    Args:
        base64_data: Base64 encoded image data
        world_id: World ID for organizing files
        character_id: Character ID for file naming
        image_type: "card" or "portrait"

    Returns:
        R2 object key (path in bucket)
    """
    if not s3_client:
        raise Exception("R2 client not initialized. Check AWS credentials in .env")

    # Decode image
    image_data = base64.b64decode(base64_data)

    # Object key: portraits/{world_id}/{character_id}_portrait.png
    key = f"portraits/{world_id}/{character_id}_{image_type}.png"

    try:
        # Upload to R2
        s3_client.put_object(
            Bucket=settings.R2_BUCKET_NAME,
            Key=key,
            Body=image_data,
            ContentType='image/png'
        )
        logger.info(f"Uploaded image to R2: {key}")
        return key

    except ClientError as e:
        logger.error(f"Failed to upload to R2: {e}")
        raise Exception(f"R2 upload failed: {e}")


async def download_and_save_image(
    url: str, world_id: int, character_id: str, image_type: str
) -> str:
    """
    Download image from URL (Replicate) and upload to R2.

    Args:
        url: Image URL from Replicate
        world_id: World ID for organizing files
        character_id: Character ID for file naming
        image_type: "card" or "portrait"

    Returns:
        R2 object key (path in bucket)
    """
    if not s3_client:
        raise Exception("R2 client not initialized. Check AWS credentials in .env")

    # Download image
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status != 200:
                raise Exception(f"Failed to download image: HTTP {response.status}")

            image_data = await response.read()

    # Object key: portraits/{world_id}/{character_id}_portrait.png
    key = f"portraits/{world_id}/{character_id}_{image_type}.png"

    try:
        # Upload to R2
        s3_client.put_object(
            Bucket=settings.R2_BUCKET_NAME,
            Key=key,
            Body=image_data,
            ContentType='image/png'
        )
        logger.info(f"Uploaded image to R2: {key}")
        return key

    except ClientError as e:
        logger.error(f"Failed to upload to R2: {e}")
        raise Exception(f"R2 upload failed: {e}")


async def upload_image_to_r2(
    image_data: bytes, world_id: int, character_id: str, image_type: str
) -> str:
    """
    Upload image bytes directly to R2.

    Used when uploading images AFTER world creation (with real world_id).

    Args:
        image_data: Raw image bytes
        world_id: Real world ID from database
        character_id: Character UUID
        image_type: "portrait" or "card"

    Returns:
        Full R2 public URL
    """
    if not s3_client:
        raise Exception("R2 client not initialized. Check AWS credentials in .env")

    # Object key: portraits/{world_id}/{character_id}_portrait.png
    key = f"portraits/{world_id}/{character_id}_{image_type}.png"

    try:
        # Upload to R2
        s3_client.put_object(
            Bucket=settings.R2_BUCKET_NAME,
            Key=key,
            Body=image_data,
            ContentType='image/png'
        )
        logger.info(f"Uploaded image to R2: {key}")

        # Return full public URL
        return f"{settings.R2_PUBLIC_URL}/{key}"

    except ClientError as e:
        logger.error(f"Failed to upload to R2: {e}")
        raise Exception(f"R2 upload failed: {e}")


def build_image_urls(world_id: int, character_id: str) -> dict[str, str | None]:
    """
    Build public R2 URL for generated portrait image.

    NOTE: This is called AFTER uploading to R2 with the real world_id.
    """
    # Use R2 public URL + object key
    key = f"portraits/{world_id}/{character_id}_portrait.png"
    return {
        "image_portrait": f"{settings.R2_PUBLIC_URL}/{key}",
    }
