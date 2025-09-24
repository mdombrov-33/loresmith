def load_prompt(filename: str, **kwargs) -> str:
    """Load a prompt template from a file and format it with given keyword arguments."""

    with open(f"prompts/{filename}", "r") as f:
        template = f.read()
    return template.format(**kwargs)
