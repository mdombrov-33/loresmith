from typing import Literal, Union
from pydantic import BaseModel


class LorePiece(BaseModel):
    name: str
    description: str
    details: dict[str, Union[str, str]]
    type: Literal["character", "faction", "setting", "relic", "event"]
