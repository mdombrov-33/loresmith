from dataclasses import dataclass
from models.faction import Faction
from models.npc import NPC


@dataclass
class FactionAndNPC:
    faction: Faction
    npc: NPC
