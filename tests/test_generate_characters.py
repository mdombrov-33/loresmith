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
