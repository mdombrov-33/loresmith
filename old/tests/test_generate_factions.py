import json
from unittest.mock import AsyncMock, patch

import pytest

from chains.multi_variant import generate_multiple_factions
from constants.themes import Theme
from models.lore_piece import LorePiece

# Allows usage of 'await' syntax in test functions
pytestmark = pytest.mark.asyncio


@patch("chains.multi_variant.redis_get_with_retries", new_callable=AsyncMock)
@patch("chains.multi_variant.redis_set_with_retries", new_callable=AsyncMock)
@patch("chains.multi_variant.generate_faction", new_callable=AsyncMock)
async def test_generate_multiple_factions_fresh(
    mock_generate_faction, mock_redis_set, mock_redis_get
):
    """
    Test fresh faction generation when no cached factions exist.

    - Simulates cache miss by returning None on Redis get.
    - The faction generator function is called to create new faction(s).
    - Generated factions are cached via Redis set.
    - Verifies returned factions match the expected mock data.
    """
    mock_redis_get.return_value = None

    mock_generate_faction.return_value = LorePiece(
        type="faction",
        details={"symbol": "🛡"},
        name="Iron Brotherhood",
        description="An ancient order guarding technology.",
    )

    factions = await generate_multiple_factions(count=2, theme=Theme.post_apocalyptic)

    assert isinstance(factions, list)
    assert len(factions) == 2
    for f in factions:
        assert isinstance(f, LorePiece)
        assert f.name == "Iron Brotherhood"

    mock_generate_faction.assert_called()
    mock_redis_get.assert_called_once()
    mock_redis_set.assert_called_once()


@patch("chains.multi_variant.redis_get_with_retries", new_callable=AsyncMock)
@patch("chains.multi_variant.redis_set_with_retries", new_callable=AsyncMock)
@patch("chains.multi_variant.generate_faction", new_callable=AsyncMock)
async def test_generate_multiple_factions_cached(
    mock_generate_faction, mock_redis_set, mock_redis_get
):
    """
    Test faction retrieval from Redis cache when cached data is present.

    - Redis get returns a JSON string representing cached factions.
    - The faction generator function is NOT called.
    - Redis set is NOT called since no new data generation happens.
    - Returned factions are correctly deserialized and validated.
    """
    cached_data = [
        {
            "type": "faction",
            "details": {"symbol": "⛩"},
            "name": "Sun Clan",
            "description": "Worshippers of ancient solar tech.",
        },
        {
            "type": "faction",
            "details": {"symbol": "🦂"},
            "name": "Scorpion Syndicate",
            "description": "Traders and smugglers of the wastes.",
        },
    ]

    mock_redis_get.return_value = json.dumps(cached_data)

    factions = await generate_multiple_factions(count=2, theme=Theme.post_apocalyptic)

    assert len(factions) == 2
    assert factions[0].name == "Sun Clan"
    assert factions[1].name == "Scorpion Syndicate"

    mock_generate_faction.assert_not_called()
    mock_redis_get.assert_called_once()
    mock_redis_set.assert_not_called()


@patch("chains.multi_variant.redis_get_with_retries", new_callable=AsyncMock)
@patch("chains.multi_variant.redis_set_with_retries", new_callable=AsyncMock)
@patch("chains.multi_variant.generate_faction", new_callable=AsyncMock)
async def test_generate_multiple_factions_with_regenerate(
    mock_generate_faction, mock_redis_set, mock_redis_get
):
    """
    Test forced regeneration of factions ignoring cached data.

    - Redis get returns cached data but is bypassed due to regenerate=True.
    - Faction generator function is called to create fresh faction(s).
    - Newly generated factions are cached with Redis set.
    - Validates returned factions match the regenerated mock data.
    """
    mock_redis_get.return_value = json.dumps(
        [
            {
                "type": "faction",
                "details": {"symbol": "🪖"},
                "name": "Old Guard",
                "description": "Remnants of pre-apocalypse military.",
            }
        ]
    )

    mock_generate_faction.return_value = LorePiece(
        type="faction",
        details={"symbol": "⚔️"},
        name="New Dawn",
        description="A rising utopian militant society.",
    )

    factions = await generate_multiple_factions(
        count=1, theme=Theme.post_apocalyptic, regenerate=True
    )

    assert len(factions) == 1
    assert factions[0].name == "New Dawn"

    mock_generate_faction.assert_called_once()
    mock_redis_get.assert_not_called()  # Should skip cache due to regeneration
    mock_redis_set.assert_called_once()
