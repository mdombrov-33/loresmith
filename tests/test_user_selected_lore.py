import pytest
from fastapi import FastAPI

from routes.user_selected_lore import router

app = FastAPI()
app.include_router(router)


@pytest.mark.asyncio
async def test_user_selected_lore_flow():
    """Test that the user-selected-lore flow is properly structured"""

    # Test that routes are defined
    routes = [route.path for route in app.routes]

    assert "/user-selected-lore" in routes
    assert "/user-selected-lore/{user_id}" in routes

    # Test that the schema includes lore_piece data
    from db.lore_piece.schemas import UserSelectedLoreRead

    # Check if the schema has the expected fields
    schema_fields = UserSelectedLoreRead.__fields__.keys()
    expected_fields = {"id", "user_id", "lore_piece_id", "selected_at", "lore_piece"}

    assert expected_fields.issubset(schema_fields), (
        f"Missing fields: {expected_fields - schema_fields}"
    )


@pytest.mark.asyncio
async def test_lore_conversion():
    """Test converting generated lore to database format"""
    from models.lore_piece import LorePiece
    from utils.lore_conversion import convert_generated_lore_to_db
    from constants.themes import Theme

    # Create a sample generated lore piece
    generated_lore = LorePiece(
        name="Test Character",
        description="A test character",
        details={"appearance": "tall", "personality": "brave"},
        type="character",
    )

    # Convert to database format
    db_lore = convert_generated_lore_to_db(generated_lore, Theme.post_apocalyptic)

    assert db_lore.name == "Test Character"
    assert db_lore.description == "A test character"
    assert db_lore.type == "character"
    assert db_lore.theme == Theme.post_apocalyptic
    assert db_lore.details == {"appearance": "tall", "personality": "brave"}


if __name__ == "__main__":
    pytest.main([__file__])
