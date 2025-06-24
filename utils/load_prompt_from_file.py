def load_prompt(filename: str, **kwargs) -> str:
    with open(f"prompts/{filename}", "r") as f:
        template = f.read()
    return template.format(**kwargs)
