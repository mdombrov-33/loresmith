import json
from unittest.mock import AsyncMock, patch

import pytest

from chains.multi_variant import generate_multiple_characters
from constants.themes import Theme
from models.lore_piece import LorePiece

# Needed so we can await inside test
pytestmark = pytest.mark.asyncio


@patch("chains.multi_variant.redis_get_with_retries", new_callable=AsyncMock)
@patch("chains.multi_variant.redis_set_with_retries", new_callable=AsyncMock)
@patch("chains.multi_variant.generate_character", new_callable=AsyncMock)
async def test_generate_multiple_characters_fresh(
    mock_generate_character, mock_redis_set, mock_redis_get
):
    """
    Test fresh character generation when no cached data is found in Redis.

    - Redis `get` returns None to simulate cache miss.
    - Character generator is called to create fresh characters.
    - Redis `set` is called to cache the newly generated characters.
    - Asserts the result contains the expected number of characters with correct attributes.
    """

    # Simulate no cache found
    mock_redis_get.return_value = None

    # Fake character returned by generator
    mock_generate_character.return_value = LorePiece(
        type="character",
        details={"name": "value"},
        name="Test Guy",
        description="Lorem Ipsum",
    )

    characters = await generate_multiple_characters(
        count=2, theme=Theme.post_apocalyptic
    )

    assert isinstance(characters, list)
    assert len(characters) == 2
    for char in characters:
        assert isinstance(char, LorePiece)
        assert char.name == "Test Guy"

    mock_generate_character.assert_called()
    mock_redis_get.assert_called_once()
    mock_redis_set.assert_called_once()


@patch("chains.multi_variant.redis_get_with_retries", new_callable=AsyncMock)
@patch("chains.multi_variant.redis_set_with_retries", new_callable=AsyncMock)
@patch("chains.multi_variant.generate_character", new_callable=AsyncMock)
async def test_generate_multiple_characters_cached(
    mock_generate_character, mock_redis_set, mock_redis_get
):
    """
    Test retrieval of characters from Redis cache when cached data is present.

    - Redis `get` returns a JSON string representing cached characters.
    - Character generator is NOT called, since data comes from cache.
    - Redis `set` is NOT called, no new cache write occurs.
    - Asserts returned characters match cached data correctly.
    """
    # Simulate Redis returning cached data
    fake_cache = json.dumps(
        [
            {
                "type": "character",
                "name": "Cached Character",
                "description": "From Redis",
                "details": {"role": "cached test"},
            },
            {
                "type": "character",
                "name": "Cached Character 2",
                "description": "Also from Redis",
                "details": {"role": "cached test 2"},
            },
        ]
    )
    mock_redis_get.return_value = fake_cache

    characters = await generate_multiple_characters(
        count=2, theme=Theme.post_apocalyptic
    )

    assert isinstance(characters, list)
    assert len(characters) == 2
    assert characters[0].name == "Cached Character"
    assert characters[1].name == "Cached Character 2"

    mock_generate_character.assert_not_called()
    mock_redis_set.assert_not_called()


@patch("chains.multi_variant.redis_get_with_retries", new_callable=AsyncMock)
@patch("chains.multi_variant.redis_set_with_retries", new_callable=AsyncMock)
@patch("chains.multi_variant.generate_character", new_callable=AsyncMock)
async def test_generate_multiple_characters_regenerate_true(
    mock_generate_character, mock_redis_set, mock_redis_get
):
    """
    Test forced regeneration of characters ignoring cache.

    - `regenerate=True` causes bypass of Redis `get`.
    - Character generator is called fresh for each character.
    - Redis `set` is called once to cache newly generated characters.
    - Asserts correct number of generated characters with expected attributes.
    """
    # Prepare fake characters
    mock_generate_character.return_value = LorePiece(
        type="character",
        name="Regenerated Character",
        description="Generated fresh",
        details={"role": "regenerated"},
    )

    characters = await generate_multiple_characters(
        count=2, theme=Theme.post_apocalyptic, regenerate=True
    )

    assert isinstance(characters, list)
    assert len(characters) == 2
    assert all(c.name == "Regenerated Character" for c in characters)

    mock_redis_get.assert_not_called()
    assert mock_generate_character.call_count == 2
    mock_redis_set.assert_called_once()
