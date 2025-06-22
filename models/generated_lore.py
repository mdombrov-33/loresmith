from dataclasses import dataclass
from models.faction import Faction
from models.npc import NPC
from models.setting import Setting


@dataclass
class GeneratedLore:
    faction: Faction
    npc: NPC
    setting: Setting
