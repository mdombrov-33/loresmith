import json
from unittest.mock import AsyncMock, patch

import pytest

from chains.multi_variant import generate_multiple_settings
from constants.themes import Theme
from models.lore_piece import LorePiece

# Allows async test functions using pytest-asyncio
pytestmark = pytest.mark.asyncio


@patch("chains.multi_variant.redis_get_with_retries", new_callable=AsyncMock)
@patch("chains.multi_variant.redis_set_with_retries", new_callable=AsyncMock)
@patch("chains.multi_variant.generate_setting", new_callable=AsyncMock)
async def test_generate_multiple_settings_fresh(
    mock_generate_setting, mock_redis_set, mock_redis_get
):
    """
    Test generating fresh settings when cache is empty.

    - Simulates Redis cache miss by returning None.
    - The real generate_setting function is replaced with a mock returning a fixed LorePiece.
    - Verifies that new settings are generated and cached.
    - Checks the returned list contains correct mocked settings.
    """
    mock_redis_get.return_value = None

    mock_generate_setting.return_value = LorePiece(
        type="setting",
        details={"location": "value"},
        name="Test Setting",
        description="Lorem Ipsum",
    )

    settings = await generate_multiple_settings(count=2, theme=Theme.post_apocalyptic)

    assert isinstance(settings, list)
    assert len(settings) == 2
    for setting in settings:
        assert isinstance(setting, LorePiece)
        assert setting.name == "Test Setting"

    mock_generate_setting.assert_called()
    mock_redis_get.assert_called_once()
    mock_redis_set.assert_called_once()


@patch("chains.multi_variant.redis_get_with_retries", new_callable=AsyncMock)
@patch("chains.multi_variant.redis_set_with_retries", new_callable=AsyncMock)
async def test_generate_multiple_settings_cached(mock_redis_set, mock_redis_get):
    """
    Test retrieving settings from Redis cache.

    - Returns a JSON-encoded list of cached settings from Redis get.
    - The generate_setting function is NOT called (no regeneration).
    - Verifies cached settings are deserialized properly and returned.
    """
    cached_data = [
        {
            "type": "setting",
            "details": {"location": "cached"},
            "name": "Cached Setting",
            "description": "Cached description",
        }
    ]
    mock_redis_get.return_value = json.dumps(cached_data)

    settings = await generate_multiple_settings(count=1, theme=Theme.post_apocalyptic)

    assert isinstance(settings, list)
    assert len(settings) == 1
    setting = settings[0]
    assert isinstance(setting, LorePiece)
    assert setting.name == "Cached Setting"

    mock_redis_get.assert_called_once()
    mock_redis_set.assert_not_called()


@patch("chains.multi_variant.redis_get_with_retries", new_callable=AsyncMock)
@patch("chains.multi_variant.redis_set_with_retries", new_callable=AsyncMock)
@patch("chains.multi_variant.generate_setting", new_callable=AsyncMock)
async def test_generate_multiple_settings_regenerate(
    mock_generate_setting, mock_redis_set, mock_redis_get
):
    """
    Test forced regeneration ignoring Redis cache.

    - Redis get returns None to simulate cache miss or forced regeneration.
    - generate_setting is called to produce fresh settings.
    - Redis set caches the newly generated settings.
    - Verifies the returned settings match the regenerated mock.
    """
    mock_redis_get.return_value = None

    mock_generate_setting.return_value = LorePiece(
        type="setting",
        details={"location": "regenerated"},
        name="Regenerated Setting",
        description="Lorem Ipsum Regenerated",
    )

    settings = await generate_multiple_settings(
        count=1, theme=Theme.post_apocalyptic, regenerate=True
    )

    assert isinstance(settings, list)
    assert len(settings) == 1
    setting = settings[0]
    assert isinstance(setting, LorePiece)
    assert setting.name == "Regenerated Setting"

    mock_generate_setting.assert_called()
    mock_redis_get.assert_not_called()
    mock_redis_set.assert_called_once()
