from dataclasses import dataclass


@dataclass
class Setting:
    name: str
    landscape: str
    dangers: str
    summary: str
