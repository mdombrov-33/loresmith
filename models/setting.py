from dataclasses import dataclass


@dataclass
class Setting:
    name: str
    landscape: str
    factions_presence: str
    dangers: str
    summary: str
