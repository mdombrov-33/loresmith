from unittest.mock import AsyncMock, patch

import pytest
from fastapi import HTTPException

from constants.themes import Theme
from models.full_story import FullStory
from models.lore_piece import LorePiece
from models.selected_lore_pieces import SelectedLorePieces
from orchestrators.orchestrator_full_story import generate_full_story_orchestrator

pytestmark = pytest.mark.asyncio


async def test_generate_full_story_orchestrator_success():
    """
    Test that generate_full_story_orchestrator returns a FullStory
    instance correctly when generate_full_story succeeds.
    """
    selected = SelectedLorePieces(
        character=LorePiece(
            name="Char", description="Desc", details={"key": "val"}, type="character"
        ),
        faction=LorePiece(
            name="Fact", description="Desc", details={"key": "val"}, type="faction"
        ),
        setting=LorePiece(
            name="Set", description="Desc", details={"key": "val"}, type="setting"
        ),
        event=LorePiece(
            name="Ev", description="Desc", details={"key": "val"}, type="event"
        ),
        relic=LorePiece(
            name="Rel", description="Desc", details={"key": "val"}, type="relic"
        ),
    )
    theme = Theme.post_apocalyptic

    fake_story = FullStory(
        title="Test Story",
        content="This is a generated story.",
        theme=theme,
        pieces=selected,
    )

    with patch(
        "orchestrators.orchestrator_full_story.generate_full_story",
        new_callable=AsyncMock,
    ) as mock_generate:
        mock_generate.return_value = fake_story

        result = await generate_full_story_orchestrator(selected, theme)

        mock_generate.assert_awaited_once_with(selected, theme)
        assert isinstance(result, FullStory)
        assert result.title == "Test Story"
        assert result.content == "This is a generated story."
        assert result.theme == theme
        assert result.pieces == selected


async def test_generate_full_story_orchestrator_failure(caplog):
    """
    Test that generate_full_story_orchestrator raises HTTPException with status 500
    and logs the error when generate_full_story raises an Exception.
    """
    selected = SelectedLorePieces(
        character=None,
        faction=None,
        setting=None,
        event=None,
        relic=None,
    )
    theme = Theme.post_apocalyptic

    with patch(
        "orchestrators.orchestrator_full_story.generate_full_story",
        new_callable=AsyncMock,
    ) as mock_generate:
        mock_generate.side_effect = Exception("AI service down")

        with pytest.raises(HTTPException) as exc_info:
            await generate_full_story_orchestrator(selected, theme)

        assert exc_info.value.status_code == 500
        assert "Full story generation failed" in exc_info.value.detail

        # Check error was logged
        assert any("AI service down" in record.message for record in caplog.records)
