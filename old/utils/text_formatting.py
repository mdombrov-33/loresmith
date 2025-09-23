import re


def clean_ai_text(text: str) -> str:
    """
    Basic cleaning to remove unwanted markdown and newlines from AI output.
    """
    # Remove common markdown bold/italic
    text = re.sub(r"(\*\*|__)(.*?)\1", r"\2", text)
    text = re.sub(r"(\*|_)(.*?)\1", r"\2", text)
    # Replace newlines with space
    text = re.sub(r"\s*\n\s*", " ", text)
    # Collapse multiple spaces
    text = re.sub(r"\s{2,}", " ", text)
    return text.strip()


def format_details(details):
    """
    Format details from lore pieces into a readable string.
    Handles both lists and dictionaries, returning a comma-separated string.
    """
    if isinstance(details, list):
        return ", ".join(details)
    elif isinstance(details, dict):
        return ", ".join(f"{k}: {v}" for k, v in details.items())
    return str(details)
