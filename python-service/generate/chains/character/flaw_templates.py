from typing import TypedDict


class FlawTemplate(TypedDict):
    id: str
    name: str
    description: str  # What the flaw represents
    trigger: str  # When it activates (keywords for adventure mode)
    penalty: str  # What penalty it causes (parseable format)
    duration: str  # How long it lasts
    category: str  # For variety/filtering


FLAW_TEMPLATES: list[FlawTemplate] = [
    # PHYSICAL INJURIES & DISABILITIES (15)
    {
        "id": "missing_eye",
        "name": "Missing Eye",
        "description": "Lost an eye in combat or accident",
        "trigger": "perception_check,ranged_combat,distant_objects",
        "penalty": "perception-3",
        "duration": "permanent",
        "category": "physical_injury",
    },
    {
        "id": "bad_leg",
        "name": "Injured Leg",
        "description": "Old leg injury that never healed properly",
        "trigger": "running,climbing,chasing,escaping",
        "penalty": "resilience-2,stress+3",
        "duration": "permanent",
        "category": "physical_injury",
    },
    {
        "id": "shoulder_injury",
        "name": "Shoulder Injury",
        "description": "Chronic shoulder pain from old wound",
        "trigger": "strength_check,heavy_lifting,melee_combat",
        "penalty": "resilience-3",
        "duration": "permanent",
        "category": "physical_injury",
    },
    {
        "id": "hand_tremor",
        "name": "Hand Tremor",
        "description": "Uncontrollable shaking in hands",
        "trigger": "precision_task,lockpicking,surgery,aiming",
        "penalty": "perception-2,auto_fail_precision",
        "duration": "permanent",
        "category": "physical_injury",
    },
    {
        "id": "chronic_pain",
        "name": "Chronic Pain",
        "description": "Constant physical pain from old injuries",
        "trigger": "stress_above_20,long_travel,combat",
        "penalty": "all_checks-1,stress+2_per_scene",
        "duration": "permanent",
        "category": "physical_injury",
    },
    {
        "id": "hearing_loss",
        "name": "Partial Deafness",
        "description": "Hearing damage from explosion or loud noise",
        "trigger": "listening,detect_ambush,stealth_enemy",
        "penalty": "perception-4_audio",
        "duration": "permanent",
        "category": "physical_injury",
    },
    {
        "id": "weak_lungs",
        "name": "Damaged Lungs",
        "description": "Lung damage from smoke, gas, or disease",
        "trigger": "running,climbing,combat_extended,toxic_air",
        "penalty": "resilience-2,stress+5",
        "duration": "permanent",
        "category": "physical_injury",
    },
    {
        "id": "scarred_face",
        "name": "Disfiguring Scars",
        "description": "Severe facial scars that unnerve others",
        "trigger": "first_meeting,persuasion,calm_npc",
        "penalty": "influence-3,empathy-2",
        "duration": "permanent",
        "category": "physical_injury",
    },
    {
        "id": "missing_fingers",
        "name": "Missing Fingers",
        "description": "Lost fingers on dominant hand",
        "trigger": "climbing,weapon_handling,crafting",
        "penalty": "resilience-2,perception-2_manual",
        "duration": "permanent",
        "category": "physical_injury",
    },
    {
        "id": "broken_ribs_healed_wrong",
        "name": "Malformed Ribs",
        "description": "Ribs healed incorrectly after breaking",
        "trigger": "melee_combat,taking_damage,heavy_breathing",
        "penalty": "resilience-2,stress+3_when_hit",
        "duration": "permanent",
        "category": "physical_injury",
    },
    {
        "id": "nerve_damage",
        "name": "Nerve Damage",
        "description": "Numbness and weakness from nerve injury",
        "trigger": "fine_motor,feel_objects,combat",
        "penalty": "perception-2,resilience-1",
        "duration": "permanent",
        "category": "physical_injury",
    },
    {
        "id": "vision_problems",
        "name": "Blurred Vision",
        "description": "Deteriorating eyesight, struggles to see clearly",
        "trigger": "reading,distant_objects,spotting_details",
        "penalty": "perception-2,knowledge-1",
        "duration": "permanent",
        "category": "physical_injury",
    },
    {
        "id": "old_burn_scars",
        "name": "Severe Burn Scars",
        "description": "Body covered in painful burn tissue",
        "trigger": "fire,heat,smoke,showing_skin",
        "penalty": "stress+5_near_fire,influence-2",
        "duration": "permanent",
        "category": "physical_injury",
    },
    {
        "id": "back_injury",
        "name": "Chronic Back Pain",
        "description": "Severe back injury that flares up unpredictably",
        "trigger": "heavy_lifting,long_travel,sleeping_rough",
        "penalty": "resilience-3,stress+3",
        "duration": "permanent",
        "category": "physical_injury",
    },
    {
        "id": "malnourished",
        "name": "Malnourished",
        "description": "Years of starvation have weakened the body",
        "trigger": "physical_exertion,combat,illness",
        "penalty": "resilience-2,all_checks-1",
        "duration": "permanent",
        "category": "physical_injury",
    },
    # ADDICTIONS & DEPENDENCIES (8)
    {
        "id": "stim_addiction",
        "name": "Stim Addiction",
        "description": "Addicted to combat stims, needs regular doses",
        "trigger": "no_stims_12_hours",
        "penalty": "stress+10,all_checks-2,shaking",
        "duration": "until_stim_used",
        "category": "addiction",
    },
    {
        "id": "alcohol_dependence",
        "name": "Alcohol Dependence",
        "description": "Relies on alcohol to function normally",
        "trigger": "no_alcohol_24_hours",
        "penalty": "stress+8,resilience-2,empathy-2",
        "duration": "until_drink",
        "category": "addiction",
    },
    {
        "id": "painkiller_addiction",
        "name": "Painkiller Addiction",
        "description": "Hooked on painkillers, suffers withdrawal",
        "trigger": "no_painkillers_8_hours",
        "penalty": "stress+10,all_checks-3",
        "duration": "until_pills",
        "category": "addiction",
    },
    {
        "id": "tech_implant_dependency",
        "name": "Implant Dependency",
        "description": "Cybernetic implants require regular maintenance",
        "trigger": "no_maintenance_48_hours",
        "penalty": "stress+5,perception-2,glitching",
        "duration": "until_repair",
        "category": "addiction",
    },
    {
        "id": "gambling_compulsion",
        "name": "Compulsive Gambler",
        "description": "Cannot resist gambling opportunities",
        "trigger": "gambling_opportunity,money_available",
        "penalty": "must_pass_resilience_15_or_gamble,stress+5_if_resist",
        "duration": "per_encounter",
        "category": "addiction",
    },
    {
        "id": "combat_junkie",
        "name": "Combat Junkie",
        "description": "Addicted to adrenaline rush of violence",
        "trigger": "peaceful_resolution_offered,diplomacy",
        "penalty": "must_pass_resilience_13_or_attack,stress+3_if_peaceful",
        "duration": "per_encounter",
        "category": "addiction",
    },
    {
        "id": "hoarding_compulsion",
        "name": "Compulsive Hoarder",
        "description": "Cannot leave loot behind, even when dangerous",
        "trigger": "valuable_loot,corpse_to_loot",
        "penalty": "must_pass_resilience_12_or_loot,stress+5_if_caught",
        "duration": "per_encounter",
        "category": "addiction",
    },
    {
        "id": "sleep_deprivation",
        "name": "Chronic Insomnia",
        "description": "Cannot sleep properly, always exhausted",
        "trigger": "after_rest,every_morning",
        "penalty": "perception-2,resilience-1,stress+3",
        "duration": "permanent",
        "category": "addiction",
    },
    # PHOBIAS & FEARS (12)
    {
        "id": "claustrophobia",
        "name": "Claustrophobia",
        "description": "Terrified of enclosed or tight spaces",
        "trigger": "underground,tunnel,small_room,trapped",
        "penalty": "stress+8_per_scene,empathy-3,panic_checks",
        "duration": "while_enclosed",
        "category": "phobia",
    },
    {
        "id": "fear_of_heights",
        "name": "Acrophobia",
        "description": "Paralyzing fear of heights",
        "trigger": "tall_building,cliff,bridge,climbing",
        "penalty": "stress+6,resilience-3,frozen_on_fail",
        "duration": "while_elevated",
        "category": "phobia",
    },
    {
        "id": "fear_of_water",
        "name": "Aquaphobia",
        "description": "Terror of deep water or drowning",
        "trigger": "swimming,boat,rain_heavy,flood",
        "penalty": "stress+7,auto_fail_swimming",
        "duration": "near_water",
        "category": "phobia",
    },
    {
        "id": "fear_of_fire",
        "name": "Pyrophobia",
        "description": "Traumatized by fire, cannot be near flames",
        "trigger": "fire,burning_building,explosions",
        "penalty": "stress+10,flee_or_freeze,all_checks-3",
        "duration": "near_fire",
        "category": "phobia",
    },
    {
        "id": "fear_of_dark",
        "name": "Nyctophobia",
        "description": "Cannot function in darkness without light",
        "trigger": "darkness,night,no_light_source",
        "penalty": "stress+5,perception-4,empathy-2",
        "duration": "while_dark",
        "category": "phobia",
    },
    {
        "id": "fear_of_crowds",
        "name": "Agoraphobia",
        "description": "Panic attacks in crowds or open spaces",
        "trigger": "crowd,market,public_gathering",
        "penalty": "stress+6,influence-4,must_escape",
        "duration": "in_crowd",
        "category": "phobia",
    },
    {
        "id": "fear_of_blood",
        "name": "Hemophobia",
        "description": "Faints or panics at sight of blood",
        "trigger": "injury,surgery,combat_gore",
        "penalty": "stress+8,empathy-3,pass_resilience_12_or_faint",
        "duration": "seeing_blood",
        "category": "phobia",
    },
    {
        "id": "fear_of_authority",
        "name": "Fear of Authority",
        "description": "Traumatized by past abuse from authority figures",
        "trigger": "guard,official,military,police",
        "penalty": "stress+5,influence-4_with_authority",
        "duration": "near_authority",
        "category": "phobia",
    },
    {
        "id": "fear_of_technology",
        "name": "Technophobia",
        "description": "Believes technology is cursed or evil",
        "trigger": "high_tech,ai,robots,computers",
        "penalty": "cannot_use_tech,stress+4_near_tech",
        "duration": "permanent",
        "category": "phobia",
    },
    {
        "id": "fear_of_death",
        "name": "Thanatophobia",
        "description": "Obsessive fear of dying",
        "trigger": "danger,combat,low_hp,death_mentioned",
        "penalty": "stress+7,flee_priority,influence-2",
        "duration": "in_danger",
        "category": "phobia",
    },
    {
        "id": "fear_of_abandonment",
        "name": "Abandonment Issues",
        "description": "Terror of being left alone",
        "trigger": "party_split,alone,companion_leaves",
        "penalty": "stress+10,empathy-4,desperate_actions",
        "duration": "when_alone",
        "category": "phobia",
    },
    {
        "id": "fear_of_children",
        "name": "Pediophobia",
        "description": "Disturbed by children after traumatic event",
        "trigger": "child_npc,child_crying,orphan",
        "penalty": "stress+6,empathy-3,must_avoid",
        "duration": "near_children",
        "category": "phobia",
    },
    # SOCIAL DYSFUNCTION (10)
    {
        "id": "distrust_everyone",
        "name": "Paranoid Distrust",
        "description": "Cannot trust anyone, expects betrayal",
        "trigger": "new_npc_offers_help,alliance_proposed",
        "penalty": "must_pass_empathy_15_or_refuse,influence-3",
        "duration": "permanent",
        "category": "social",
    },
    {
        "id": "authority_defiance",
        "name": "Authority Defiance",
        "description": "Compulsively lies to or defies authority",
        "trigger": "guard,official,law_enforcement,boss",
        "penalty": "auto_fail_influence_with_authority,stress+4",
        "duration": "permanent",
        "category": "social",
    },
    {
        "id": "violent_temper",
        "name": "Hair-Trigger Temper",
        "description": "Explodes into violence when insulted",
        "trigger": "insult,disrespect,mockery,challenge",
        "penalty": "must_pass_resilience_14_or_attack,stress+5",
        "duration": "per_encounter",
        "category": "social",
    },
    {
        "id": "pathological_liar",
        "name": "Pathological Liar",
        "description": "Lies reflexively, even when truth is better",
        "trigger": "questioned,interrogation,explanation_needed",
        "penalty": "auto_lie,influence-2,trust_lost_if_caught",
        "duration": "permanent",
        "category": "social",
    },
    {
        "id": "social_anxiety",
        "name": "Severe Social Anxiety",
        "description": "Cannot speak or act confidently in social situations",
        "trigger": "public_speaking,persuasion,first_meeting",
        "penalty": "influence-4,empathy-2,stress+5",
        "duration": "permanent",
        "category": "social",
    },
    {
        "id": "overprotective",
        "name": "Overprotective",
        "description": "Cannot let companions take risks",
        "trigger": "companion_in_danger,risky_plan",
        "penalty": "must_intervene,stress+6_if_companion_hurt",
        "duration": "permanent",
        "category": "social",
    },
    {
        "id": "martyr_complex",
        "name": "Martyr Complex",
        "description": "Believes they must sacrifice themselves",
        "trigger": "dangerous_task,someone_must_die",
        "penalty": "must_volunteer,stress+8_if_others_sacrifice",
        "duration": "permanent",
        "category": "social",
    },
    {
        "id": "distrusts_specific_group",
        "name": "Racist/Prejudiced",
        "description": "Hatred or distrust of specific group",
        "trigger": "specific_faction,specific_race,outsiders",
        "penalty": "auto_fail_empathy_with_group,influence-5",
        "duration": "permanent",
        "category": "social",
    },
    {
        "id": "extreme_greed",
        "name": "Overwhelming Greed",
        "description": "Will betray for money or treasure",
        "trigger": "large_reward,treasure,bribe_offered",
        "penalty": "must_pass_resilience_16_or_betray,stress+7_if_resist",
        "duration": "per_encounter",
        "category": "social",
    },
    {
        "id": "coward",
        "name": "Cowardice",
        "description": "Flees at first sign of real danger",
        "trigger": "combat_starts,outnumbered,low_hp",
        "penalty": "must_pass_resilience_13_or_flee,influence-3",
        "duration": "permanent",
        "category": "social",
    },
    # COMBAT TRAUMA & PTSD (7)
    {
        "id": "combat_ptsd",
        "name": "Combat PTSD",
        "description": "Flashbacks and panic during combat",
        "trigger": "combat_starts,explosions,gunfire",
        "penalty": "stress+8,pass_resilience_14_or_freeze_1_turn",
        "duration": "in_combat",
        "category": "trauma",
    },
    {
        "id": "survivors_guilt",
        "name": "Survivor's Guilt",
        "description": "Haunted by deaths of fallen comrades",
        "trigger": "companion_hurt,someone_dies,memorial",
        "penalty": "stress+10,empathy-3,self_destructive",
        "duration": "permanent",
        "category": "trauma",
    },
    {
        "id": "freezes_under_pressure",
        "name": "Freezes Under Pressure",
        "description": "Cannot act when children are in danger",
        "trigger": "child_crying,child_in_danger",
        "penalty": "lose_1_turn,frozen,stress+6",
        "duration": "until_child_safe",
        "category": "trauma",
    },
    {
        "id": "torture_scars",
        "name": "Torture Survivor",
        "description": "Traumatized by past torture",
        "trigger": "interrogation,restraints,pain_threatened",
        "penalty": "stress+12,auto_confess_or_break",
        "duration": "while_threatened",
        "category": "trauma",
    },
    {
        "id": "betrayal_trauma",
        "name": "Betrayal Trauma",
        "description": "Was betrayed by trusted ally in the past",
        "trigger": "ally_suspicious,secret_kept,trust_test",
        "penalty": "stress+7,empathy-4,preemptive_hostility",
        "duration": "permanent",
        "category": "trauma",
    },
    {
        "id": "cannot_kill",
        "name": "Cannot Take Life",
        "description": "Traumatized, refuses to kill anyone",
        "trigger": "lethal_option,enemy_helpless,execute",
        "penalty": "cannot_kill,stress+10_if_forced",
        "duration": "permanent",
        "category": "trauma",
    },
    {
        "id": "nightmares",
        "name": "Violent Nightmares",
        "description": "Cannot rest properly due to nightmares",
        "trigger": "resting,sleeping,camping",
        "penalty": "rest_recovery_halved,stress+4_after_rest",
        "duration": "permanent",
        "category": "trauma",
    },
]


def get_flaw_by_id(flaw_id: str) -> FlawTemplate | None:
    """Get a specific flaw template by ID."""
    for flaw in FLAW_TEMPLATES:
        if flaw["id"] == flaw_id:
            return flaw
    return None


def get_flaws_by_category(category: str) -> list[FlawTemplate]:
    """Get all flaws in a specific category."""
    return [f for f in FLAW_TEMPLATES if f["category"] == category]


def get_random_flaw_ids(count: int = 10) -> list[str]:
    """Get random flaw IDs for prompt variety."""
    import random

    return [f["id"] for f in random.sample(FLAW_TEMPLATES, min(count, len(FLAW_TEMPLATES)))]


def format_flaw_for_storage(template: FlawTemplate) -> str:
    """
    Format flaw template for database storage.

    Format: name | trigger | penalty | duration

    Example: "Missing Eye | perception_check,ranged_combat | perception-3 | permanent"
    """
    return f"{template['name']} | {template['trigger']} | {template['penalty']} | {template['duration']}"
