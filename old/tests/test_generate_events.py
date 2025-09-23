import json
from unittest.mock import AsyncMock, patch

import pytest

from chains.multi_variant import generate_multiple_events
from constants.themes import Theme
from models.lore_piece import LorePiece

# Needed so tests can use 'await' syntax properly
pytestmark = pytest.mark.asyncio


@patch("chains.multi_variant.redis_get_with_retries", new_callable=AsyncMock)
@patch("chains.multi_variant.redis_set_with_retries", new_callable=AsyncMock)
@patch("chains.multi_variant.generate_event", new_callable=AsyncMock)
async def test_generate_multiple_events_fresh(
    mock_generate_event, mock_redis_set, mock_redis_get
):
    """
    Test fresh event generation when no cached data is found in Redis.

    - Redis `get` returns None simulating cache miss.
    - The event generator is called to create fresh events.
    - Redis `set` is called to cache the newly generated events.
    - Asserts the returned list contains the expected number of events with correct attributes.
    """
    mock_redis_get.return_value = None

    mock_generate_event.return_value = LorePiece(
        type="event",
        details={"event": "value"},
        name="Test Event",
        description="Lorem Ipsum",
    )

    events = await generate_multiple_events(count=2, theme=Theme.post_apocalyptic)

    assert isinstance(events, list)
    assert len(events) == 2
    for event in events:
        assert isinstance(event, LorePiece)
        assert event.name == "Test Event"

    mock_generate_event.assert_called()
    mock_redis_get.assert_called_once()
    mock_redis_set.assert_called_once()


@patch("chains.multi_variant.redis_get_with_retries", new_callable=AsyncMock)
@patch("chains.multi_variant.redis_set_with_retries", new_callable=AsyncMock)
async def test_generate_multiple_events_cached(mock_redis_set, mock_redis_get):
    """
    Test retrieval of events from Redis cache when cached data exists.

    - Redis `get` returns JSON string representing cached events.
    - Event generator is NOT called because data is served from cache.
    - Redis `set` is NOT called (no cache write needed).
    - Asserts returned events correctly deserialize and match cached data.
    """
    cached_data = [
        {
            "type": "event",
            "details": {"event": "cached"},
            "name": "Cached Event",
            "description": "Cached description",
        }
    ]
    mock_redis_get.return_value = json.dumps(cached_data)

    events = await generate_multiple_events(count=1, theme=Theme.post_apocalyptic)

    assert isinstance(events, list)
    assert len(events) == 1
    event = events[0]
    assert isinstance(event, LorePiece)
    assert event.name == "Cached Event"

    mock_redis_get.assert_called_once()
    mock_redis_set.assert_not_called()


@patch("chains.multi_variant.redis_get_with_retries", new_callable=AsyncMock)
@patch("chains.multi_variant.redis_set_with_retries", new_callable=AsyncMock)
@patch("chains.multi_variant.generate_event", new_callable=AsyncMock)
async def test_generate_multiple_events_regenerate(
    mock_generate_event, mock_redis_set, mock_redis_get
):
    """
    Test forced regeneration of events ignoring any cache.

    - Redis `get` is bypassed when `regenerate=True`.
    - Event generator is called fresh for each requested event.
    - Redis `set` caches the newly generated events.
    - Asserts the generated events match expected values.
    """
    mock_redis_get.return_value = None

    mock_generate_event.return_value = LorePiece(
        type="event",
        details={"event": "regenerated"},
        name="Regenerated Event",
        description="Lorem Ipsum Regenerated",
    )

    events = await generate_multiple_events(
        count=1, theme=Theme.post_apocalyptic, regenerate=True
    )

    assert isinstance(events, list)
    assert len(events) == 1
    event = events[0]
    assert isinstance(event, LorePiece)
    assert event.name == "Regenerated Event"

    mock_generate_event.assert_called()
    mock_redis_get.assert_not_called()
    mock_redis_set.assert_called_once()
