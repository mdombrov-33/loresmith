import json
from unittest.mock import AsyncMock, patch

import pytest

from chains.multi_variant import generate_multiple_relics
from constants.themes import Theme
from models.lore_piece import LorePiece

# Enable usage of 'await' in test functions
pytestmark = pytest.mark.asyncio


@patch("chains.multi_variant.redis_get_with_retries", new_callable=AsyncMock)
@patch("chains.multi_variant.redis_set_with_retries", new_callable=AsyncMock)
@patch("chains.multi_variant.generate_relic", new_callable=AsyncMock)
async def test_generate_multiple_relics_fresh(
    mock_generate_relic, mock_redis_set, mock_redis_get
):
    """
    Test fresh relic generation when no cached relics exist.

    - Simulates cache miss by returning None on Redis get.
    - The relic generator function is called to create new relic(s).
    - Generated relics are cached via Redis set.
    - Verifies returned relics match the expected mock data.
    """
    mock_redis_get.return_value = None

    mock_generate_relic.return_value = LorePiece(
        type="relic",
        details={"relic": "value"},
        name="Test Relic",
        description="Lorem Ipsum",
    )

    relics = await generate_multiple_relics(count=2, theme=Theme.post_apocalyptic)

    assert isinstance(relics, list)
    assert len(relics) == 2
    for relic in relics:
        assert isinstance(relic, LorePiece)
        assert relic.name == "Test Relic"

    mock_generate_relic.assert_called()
    mock_redis_get.assert_called_once()
    mock_redis_set.assert_called_once()


@patch("chains.multi_variant.redis_get_with_retries", new_callable=AsyncMock)
@patch("chains.multi_variant.redis_set_with_retries", new_callable=AsyncMock)
async def test_generate_multiple_relics_cached(mock_redis_set, mock_redis_get):
    """
    Test relic retrieval from Redis cache when cached data is present.

    - Redis get returns a JSON string representing cached relics.
    - The relic generator function is NOT called.
    - Redis set is NOT called since no new data generation happens.
    - Returned relics are correctly deserialized and validated.
    """
    cached_data = [
        {
            "type": "relic",
            "details": {"relic": "cached"},
            "name": "Cached Relic",
            "description": "Cached description",
        }
    ]
    mock_redis_get.return_value = json.dumps(cached_data)

    relics = await generate_multiple_relics(count=1, theme=Theme.post_apocalyptic)

    assert isinstance(relics, list)
    assert len(relics) == 1
    relic = relics[0]
    assert isinstance(relic, LorePiece)
    assert relic.name == "Cached Relic"

    mock_redis_get.assert_called_once()
    mock_redis_set.assert_not_called()


@patch("chains.multi_variant.redis_get_with_retries", new_callable=AsyncMock)
@patch("chains.multi_variant.redis_set_with_retries", new_callable=AsyncMock)
@patch("chains.multi_variant.generate_relic", new_callable=AsyncMock)
async def test_generate_multiple_relics_regenerate(
    mock_generate_relic, mock_redis_set, mock_redis_get
):
    """
    Test forced regeneration of relics ignoring cached data.

    - Redis get returns None, simulating cache miss or bypass.
    - The relic generator function is called to create fresh relic(s).
    - Newly generated relics are cached with Redis set.
    - Validates returned relics match the regenerated mock data.
    """
    mock_redis_get.return_value = None

    mock_generate_relic.return_value = LorePiece(
        type="relic",
        details={"relic": "regenerated"},
        name="Regenerated Relic",
        description="Lorem Ipsum Regenerated",
    )

    relics = await generate_multiple_relics(
        count=1, theme=Theme.post_apocalyptic, regenerate=True
    )

    assert isinstance(relics, list)
    assert len(relics) == 1
    relic = relics[0]
    assert isinstance(relic, LorePiece)
    assert relic.name == "Regenerated Relic"

    mock_generate_relic.assert_called()
    mock_redis_get.assert_not_called()
    mock_redis_set.assert_called_once()
