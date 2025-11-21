from pathlib import Path
from typing import Optional
from utils.logger import logger

NAMES_DIR = Path("generate/chains/character/data/names")

THEME_NAMES_MAPPING = {
    "post-apocalyptic": {
        "first": "post_apoc_first_names.txt",
        "last": "post_apoc_last_names.txt",
    },
    "cyberpunk": {
        "first": "cyberpunk_first_names.txt",
        "last": "cyberpunk_last_names.txt",
    },
    "steampunk": {
        "first": "steampunk_first_names.txt",
        "last": "steampunk_last_names.txt",
    },
    "fantasy": {
        "first": "fantasy_first_names.txt",
        "last": "fantasy_last_names.txt",
    },
    "norse": {
        "first": "norse_first_names.txt",
        "last": "norse_last_names.txt",
    },
}


def load_names_for_theme(theme: str) -> Optional[dict[str, str]]:
    """
    Load first and last names for a given theme.

    Args:
        theme: The theme (e.g., 'cyberpunk', 'steampunk', 'post-apocalyptic')

    Returns:
        Dictionary with 'first_names' and 'last_names' keys containing formatted strings,
        or None if theme not found.
    """
    files = THEME_NAMES_MAPPING.get(theme)
    if not files:
        return None

    try:
        first_path = NAMES_DIR / files["first"]
        last_path = NAMES_DIR / files["last"]

        with open(first_path, "r") as f:
            first_names = f.read().strip().split("\n")

        with open(last_path, "r") as f:
            last_names = f.read().strip().split("\n")

        # Filter out empty strings
        first_names = [name.strip() for name in first_names if name.strip()]
        last_names = [name.strip() for name in last_names if name.strip()]

        return {
            "first_names": ", ".join(first_names),
            "last_names": ", ".join(last_names),
        }
    except FileNotFoundError as e:
        logger.error(f"Error loading names for theme '{theme}': {e}")
        return None
