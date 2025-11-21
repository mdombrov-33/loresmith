from enum import Enum


class PersonalityTrait(str, Enum):
    """Standardized personality traits for characters.

    Each trait includes:
    - Name: The trait identifier (used in code)
    - Display: How it appears to users
    - Icon: Suggested icon identifier for frontend
    - Description: Brief explanation for context
    - Mechanical_Use: How it might affect gameplay
    """

    # EMOTIONAL TRAITS
    MELANCHOLIC = "Melancholic"
    OPTIMISTIC = "Optimistic"
    STOIC = "Stoic"
    PASSIONATE = "Passionate"
    CYNICAL = "Cynical"
    EMPATHETIC = "Empathetic"
    VOLATILE = "Volatile"
    SERENE = "Serene"

    # SOCIAL TRAITS
    CHARISMATIC = "Charismatic"
    INTIMIDATING = "Intimidating"
    SHY = "Shy"
    DIPLOMATIC = "Diplomatic"
    ABRASIVE = "Abrasive"
    LOYAL = "Loyal"
    MANIPULATIVE = "Manipulative"
    HONEST = "Honest"

    # BEHAVIORAL TRAITS
    RECKLESS = "Reckless"
    CAUTIOUS = "Cautious"
    METHODICAL = "Methodical"
    SPONTANEOUS = "Spontaneous"
    STUBBORN = "Stubborn"
    ADAPTABLE = "Adaptable"
    DISCIPLINED = "Disciplined"
    IMPULSIVE = "Impulsive"

    # COGNITIVE TRAITS
    ANALYTICAL = "Analytical"
    INTUITIVE = "Intuitive"
    CREATIVE = "Creative"
    PRAGMATIC = "Pragmatic"
    CURIOUS = "Curious"
    PARANOID = "Paranoid"
    PERCEPTIVE = "Perceptive"
    OBLIVIOUS = "Oblivious"

    # MORAL TRAITS
    HONORABLE = "Honorable"
    RUTHLESS = "Ruthless"
    COMPASSIONATE = "Compassionate"
    SELFISH = "Selfish"
    JUST = "Just"
    VENGEFUL = "Vengeful"
    MERCIFUL = "Merciful"
    CRUEL = "Cruel"

    # AMBITION TRAITS
    AMBITIOUS = "Ambitious"
    CONTENT = "Content"
    GREEDY = "Greedy"
    HUMBLE = "Humble"
    COMPETITIVE = "Competitive"
    COOPERATIVE = "Cooperative"

    # COURAGE TRAITS
    BRAVE = "Brave"
    COWARDLY = "Cowardly"
    FEARLESS = "Fearless"
    ANXIOUS = "Anxious"

    # LEADERSHIP TRAITS
    AUTHORITATIVE = "Authoritative"
    FOLLOWER = "Follower"
    REBELLIOUS = "Rebellious"
    OBEDIENT = "Obedient"
    INDEPENDENT = "Independent"
    TEAM_PLAYER = "Team-Player"


# Trait metadata for rich descriptions and mechanical effects
TRAIT_METADATA = {
    # EMOTIONAL TRAITS
    PersonalityTrait.MELANCHOLIC: {
        "icon": "cloud-rain",
        "description": "Introspective and prone to sadness, sees the weight of the world",
        "mechanics": "Gains +5 stress from failures but -2 DC on Perception checks to notice details",
    },
    PersonalityTrait.OPTIMISTIC: {
        "icon": "sun",
        "description": "Sees the bright side, maintains hope in darkness",
        "mechanics": "Reduces stress gained by 5 from most sources, but -2 DC penalty when detecting danger",
    },
    PersonalityTrait.STOIC: {
        "icon": "shield",
        "description": "Emotionally controlled and resilient under pressure",
        "mechanics": "Stress threshold raised to 60 before 'Tense', reduces stress gain by 3",
    },
    PersonalityTrait.PASSIONATE: {
        "icon": "flame",
        "description": "Driven by strong emotions and convictions",
        "mechanics": "+2 bonus to Influence checks when motivated by beliefs, -2 penalty when emotionally manipulated",
    },
    PersonalityTrait.CYNICAL: {
        "icon": "eye-slash",
        "description": "Distrustful and expects the worst from people",
        "mechanics": "+2 bonus to Empathy checks to detect deception, -2 penalty on Influence to build trust",
    },
    PersonalityTrait.EMPATHETIC: {
        "icon": "heart",
        "description": "Deeply attuned to others' emotions and suffering",
        "mechanics": "+2 bonus to Empathy checks, gains +5 stress when companions are wounded",
    },
    PersonalityTrait.VOLATILE: {
        "icon": "lightning-bolt",
        "description": "Unpredictable mood swings and emotional outbursts",
        "mechanics": "Random ±2 modifier to Influence checks, may trigger relationship changes with companions",
    },
    PersonalityTrait.SERENE: {
        "icon": "lotus",
        "description": "Calm and peaceful, rarely disturbed",
        "mechanics": "-10 stress from camp rest, but +1 DC penalty on rushed decision checks",
    },
    # SOCIAL TRAITS
    PersonalityTrait.CHARISMATIC: {
        "icon": "star",
        "description": "Naturally magnetic and influential personality",
        "mechanics": "+2 bonus to Influence checks, gains companion relationship faster (+15 instead of +10)",
    },
    PersonalityTrait.INTIMIDATING: {
        "icon": "skull",
        "description": "Commands respect through fear and presence",
        "mechanics": "+2 bonus to Influence checks involving threats, -5 to companion relationship gains",
    },
    PersonalityTrait.SHY: {
        "icon": "mask",
        "description": "Reserved and uncomfortable in social situations",
        "mechanics": "-2 penalty to Influence checks with strangers, gains +5 stress in social confrontations",
    },
    PersonalityTrait.DIPLOMATIC: {
        "icon": "handshake",
        "description": "Skilled at negotiation and finding common ground",
        "mechanics": "+2 bonus to Empathy checks when mediating, reduces conflict-based stress by 5",
    },
    PersonalityTrait.ABRASIVE: {
        "icon": "thorns",
        "description": "Harsh and difficult to get along with",
        "mechanics": "-2 penalty to Empathy checks, -10 to companion relationship when disagreeing",
    },
    PersonalityTrait.LOYAL: {
        "icon": "anchor",
        "description": "Steadfast and faithful to allies and causes",
        "mechanics": "+2 bonus to all checks when protecting companions, +20 stress if companion dies",
    },
    PersonalityTrait.MANIPULATIVE: {
        "icon": "puppet",
        "description": "Skilled at using others for personal gain",
        "mechanics": "+2 bonus to Influence when deceiving, -10 to companion relationship if deception revealed",
    },
    PersonalityTrait.HONEST: {
        "icon": "scales",
        "description": "Values truth above convenience",
        "mechanics": "-2 penalty to Influence when lying required, +15 to companion relationship when honest",
    },
    # BEHAVIORAL TRAITS
    PersonalityTrait.RECKLESS: {
        "icon": "dice",
        "description": "Takes dangerous risks without considering consequences",
        "mechanics": "Reroll failed checks once per scene, but critical failures deal double HP damage",
    },
    PersonalityTrait.CAUTIOUS: {
        "icon": "warning",
        "description": "Carefully weighs risks before acting",
        "mechanics": "+2 bonus to Perception checks for traps/danger, gains +3 stress when forced to rush",
    },
    PersonalityTrait.METHODICAL: {
        "icon": "gear",
        "description": "Systematic and organized approach to problems",
        "mechanics": "+2 bonus to Creativity checks when planning, -2 penalty when improvising quickly",
    },
    PersonalityTrait.SPONTANEOUS: {
        "icon": "sparkles",
        "description": "Acts on instinct and impulse",
        "mechanics": "+2 bonus on first action in new scenes, -2 penalty on careful investigation",
    },
    PersonalityTrait.STUBBORN: {
        "icon": "rock",
        "description": "Refuses to change course or admit mistakes",
        "mechanics": "+2 bonus to Resilience checks against persuasion, -10 relationship when companions suggest retreat",
    },
    PersonalityTrait.ADAPTABLE: {
        "icon": "chameleon",
        "description": "Flexible and adjusts easily to new situations",
        "mechanics": "-5 stress when plans fail, but -2 penalty to Influence when standing firm on principles",
    },
    PersonalityTrait.DISCIPLINED: {
        "icon": "medal",
        "description": "Follows rules and maintains strict self-control",
        "mechanics": "Flaw trigger threshold raised (less likely to trigger), gains +5 stress when breaking rules",
    },
    PersonalityTrait.IMPULSIVE: {
        "icon": "arrow",
        "description": "Acts without thinking through consequences",
        "mechanics": "-1 DC on immediate reaction checks, but +10 stress when impulsive choice backfires",
    },
    # COGNITIVE TRAITS
    PersonalityTrait.ANALYTICAL: {
        "icon": "magnifying-glass",
        "description": "Logical and data-driven thinker",
        "mechanics": "+2 bonus to Lore Mastery checks when analyzing, gains +3 stress from chaotic situations",
    },
    PersonalityTrait.INTUITIVE: {
        "icon": "crystal-ball",
        "description": "Relies on gut feelings and instinct",
        "mechanics": "+2 bonus to Empathy checks reading people, -2 penalty to Lore Mastery for factual recall",
    },
    PersonalityTrait.CREATIVE: {
        "icon": "palette",
        "description": "Imaginative and thinks outside the box",
        "mechanics": "+2 bonus to Creativity checks for unconventional solutions, -1 DC on puzzle beats",
    },
    PersonalityTrait.PRAGMATIC: {
        "icon": "toolbox",
        "description": "Practical and results-focused",
        "mechanics": "+2 bonus to Resilience checks when enduring hardship, -2 penalty to Creativity when innovation needed",
    },
    PersonalityTrait.CURIOUS: {
        "icon": "book-open",
        "description": "Driven to learn and explore",
        "mechanics": "+2 bonus to Lore Mastery checks, gains +5 stress when denied information or mysteries",
    },
    PersonalityTrait.PARANOID: {
        "icon": "eye",
        "description": "Constantly suspects threats and conspiracies",
        "mechanics": "+2 bonus to Perception checks for ambushes, starts encounters with +10 stress",
    },
    PersonalityTrait.PERCEPTIVE: {
        "icon": "glasses",
        "description": "Notices details others miss",
        "mechanics": "+2 bonus to Perception checks for details, may discover hidden story flags",
    },
    PersonalityTrait.OBLIVIOUS: {
        "icon": "fog",
        "description": "Misses obvious signs and social cues",
        "mechanics": "-2 penalty to Perception and Empathy checks, but -5 stress from disturbing revelations",
    },
    # MORAL TRAITS
    PersonalityTrait.HONORABLE: {
        "icon": "sword",
        "description": "Lives by a strict code of ethics",
        "mechanics": "+15 to companion relationships when acting honorably, gains +10 stress when forced to break code",
    },
    PersonalityTrait.RUTHLESS: {
        "icon": "dagger",
        "description": "Achieves goals without moral restraint",
        "mechanics": "-10 stress from morally questionable choices, -20 to companion relationships when cruel",
    },
    PersonalityTrait.COMPASSIONATE: {
        "icon": "helping-hand",
        "description": "Driven to help those in need",
        "mechanics": "+2 bonus to Empathy when helping, gains +10 stress from ignoring suffering",
    },
    PersonalityTrait.SELFISH: {
        "icon": "coin",
        "description": "Prioritizes personal gain above others",
        "mechanics": "-5 stress when prioritizing self-preservation, -15 to companion relationships when abandoning others",
    },
    PersonalityTrait.JUST: {
        "icon": "gavel",
        "description": "Seeks fairness and proper punishment for wrongs",
        "mechanics": "+2 bonus to Influence when enforcing justice, gains +8 stress when injustice unpunished",
    },
    PersonalityTrait.VENGEFUL: {
        "icon": "fire",
        "description": "Never forgets a slight, seeks retribution",
        "mechanics": "+3 bonus to all checks against those who wronged you, gains +5 stress per scene until revenge achieved",
    },
    PersonalityTrait.MERCIFUL: {
        "icon": "dove",
        "description": "Believes in second chances and redemption",
        "mechanics": "+2 bonus to Empathy when showing mercy, -10 stress when sparing enemies",
    },
    PersonalityTrait.CRUEL: {
        "icon": "chains",
        "description": "Takes pleasure in others' suffering",
        "mechanics": "+2 bonus to Influence when threatening, -25 to all companion relationships",
    },
    # AMBITION TRAITS
    PersonalityTrait.AMBITIOUS: {
        "icon": "mountain",
        "description": "Driven to achieve greatness and power",
        "mechanics": "+2 bonus to Influence when seeking advancement, gains +8 stress when opportunities denied",
    },
    PersonalityTrait.CONTENT: {
        "icon": "hammock",
        "description": "Satisfied with simple life, lacks drive",
        "mechanics": "-15 stress from camp rest, but -2 penalty to Influence when asserting authority",
    },
    PersonalityTrait.GREEDY: {
        "icon": "treasure",
        "description": "Obsessed with wealth and possessions",
        "mechanics": "+2 bonus to Perception when searching for valuables, gains +10 stress when sharing loot",
    },
    PersonalityTrait.HUMBLE: {
        "icon": "feather",
        "description": "Modest and downplays achievements",
        "mechanics": "+10 to companion relationships with common folk, -2 penalty to Influence when commanding",
    },
    PersonalityTrait.COMPETITIVE: {
        "icon": "trophy",
        "description": "Driven to win and be the best",
        "mechanics": "+2 bonus to checks when directly challenged, -10 relationship when companions outperform",
    },
    PersonalityTrait.COOPERATIVE: {
        "icon": "puzzle-piece",
        "description": "Values teamwork and collaboration",
        "mechanics": "+2 bonus to all checks when working with companions, +10 stress when alone",
    },
    # COURAGE TRAITS
    PersonalityTrait.BRAVE: {
        "icon": "lion",
        "description": "Faces danger without hesitation",
        "mechanics": "-10 stress from dangerous situations, +2 bonus to Resilience checks in combat",
    },
    PersonalityTrait.COWARDLY: {
        "icon": "rabbit",
        "description": "Avoids danger and conflict when possible",
        "mechanics": "+15 stress from combat encounters, +2 bonus to checks when fleeing/avoiding",
    },
    PersonalityTrait.FEARLESS: {
        "icon": "bull",
        "description": "Completely unafraid, sometimes dangerously so",
        "mechanics": "Immune to stress from dangerous situations, but may miss warnings (disadvantage on some Perception)",
    },
    PersonalityTrait.ANXIOUS: {
        "icon": "heartbeat",
        "description": "Constantly worried about potential dangers",
        "mechanics": "+10 starting stress each scene, +2 bonus to Perception for detecting threats",
    },
    # LEADERSHIP TRAITS
    PersonalityTrait.AUTHORITATIVE: {
        "icon": "crown",
        "description": "Natural leader who commands respect",
        "mechanics": "+2 bonus to Influence when giving orders, +10 to companion relationships when decisive",
    },
    PersonalityTrait.FOLLOWER: {
        "icon": "footprints",
        "description": "Prefers to take direction from others",
        "mechanics": "-2 penalty to Influence when taking charge, -5 stress when following companion suggestions",
    },
    PersonalityTrait.REBELLIOUS: {
        "icon": "fist",
        "description": "Challenges authority and established order",
        "mechanics": "+2 bonus to checks against authority figures, gains +8 stress when forced to obey",
    },
    PersonalityTrait.OBEDIENT: {
        "icon": "scroll",
        "description": "Follows rules and respects hierarchy",
        "mechanics": "-5 stress when following established rules, gains +10 stress when breaking authority",
    },
    PersonalityTrait.INDEPENDENT: {
        "icon": "lone-wolf",
        "description": "Self-reliant and prefers working alone",
        "mechanics": "+2 bonus to checks when solo, -10 relationship when companions interfere with plans",
    },
    PersonalityTrait.TEAM_PLAYER: {
        "icon": "people",
        "description": "Thrives in group settings and collaboration",
        "mechanics": "+15 to all companion relationships, +2 bonus when coordinating with party",
    },
}


# Trait compatibility rules (traits that work well together)
COMPATIBLE_TRAIT_GROUPS = [
    # Strategic combinations
    {
        PersonalityTrait.METHODICAL,
        PersonalityTrait.CAUTIOUS,
        PersonalityTrait.ANALYTICAL,
    },
    {PersonalityTrait.RECKLESS, PersonalityTrait.SPONTANEOUS, PersonalityTrait.BRAVE},
    {
        PersonalityTrait.EMPATHETIC,
        PersonalityTrait.COMPASSIONATE,
        PersonalityTrait.MERCIFUL,
    },
    {PersonalityTrait.RUTHLESS, PersonalityTrait.AMBITIOUS, PersonalityTrait.SELFISH},
    {
        PersonalityTrait.CHARISMATIC,
        PersonalityTrait.MANIPULATIVE,
        PersonalityTrait.AMBITIOUS,
    },
    {PersonalityTrait.LOYAL, PersonalityTrait.HONORABLE, PersonalityTrait.HONEST},
    {PersonalityTrait.CREATIVE, PersonalityTrait.CURIOUS, PersonalityTrait.INTUITIVE},
    {PersonalityTrait.STOIC, PersonalityTrait.DISCIPLINED, PersonalityTrait.METHODICAL},
]

# Trait opposition rules (traits that contradict each other)
OPPOSING_TRAITS = [
    (PersonalityTrait.BRAVE, PersonalityTrait.COWARDLY),
    (PersonalityTrait.HONEST, PersonalityTrait.MANIPULATIVE),
    (PersonalityTrait.COMPASSIONATE, PersonalityTrait.CRUEL),
    (PersonalityTrait.METHODICAL, PersonalityTrait.SPONTANEOUS),
    (PersonalityTrait.OPTIMISTIC, PersonalityTrait.CYNICAL),
    (PersonalityTrait.HUMBLE, PersonalityTrait.AMBITIOUS),
    (PersonalityTrait.INDEPENDENT, PersonalityTrait.TEAM_PLAYER),
    (PersonalityTrait.DISCIPLINED, PersonalityTrait.IMPULSIVE),
    (PersonalityTrait.CAUTIOUS, PersonalityTrait.RECKLESS),
    (PersonalityTrait.OBEDIENT, PersonalityTrait.REBELLIOUS),
    (PersonalityTrait.ADAPTABLE, PersonalityTrait.STUBBORN),
    (PersonalityTrait.PERCEPTIVE, PersonalityTrait.OBLIVIOUS),
    (PersonalityTrait.CONTENT, PersonalityTrait.GREEDY),
    (PersonalityTrait.SERENE, PersonalityTrait.VOLATILE),
    (PersonalityTrait.FEARLESS, PersonalityTrait.ANXIOUS),
]


def are_traits_compatible(trait1: PersonalityTrait, trait2: PersonalityTrait) -> bool:
    """Check if two traits are compatible (not opposing)."""
    return (trait1, trait2) not in OPPOSING_TRAITS and (
        trait2,
        trait1,
    ) not in OPPOSING_TRAITS


def validate_trait_selection(traits: list[PersonalityTrait]) -> bool:
    """
    Validate that a selection of 3 traits is compatible.
    Returns True if all traits are compatible with each other.
    """
    if len(traits) != 3:
        return False

    # Check all pairs for opposition
    for i in range(len(traits)):
        for j in range(i + 1, len(traits)):
            if not are_traits_compatible(traits[i], traits[j]):
                return False

    return True


def get_trait_list_for_prompt() -> str:
    """
    Generate a formatted string of all traits for use in LLM prompts.
    Returns trait names with descriptions for context.
    """
    trait_lines = []

    # Group traits by category for better organization
    categories = {
        "EMOTIONAL": [
            PersonalityTrait.MELANCHOLIC,
            PersonalityTrait.OPTIMISTIC,
            PersonalityTrait.STOIC,
            PersonalityTrait.PASSIONATE,
            PersonalityTrait.CYNICAL,
            PersonalityTrait.EMPATHETIC,
            PersonalityTrait.VOLATILE,
            PersonalityTrait.SERENE,
        ],
        "SOCIAL": [
            PersonalityTrait.CHARISMATIC,
            PersonalityTrait.INTIMIDATING,
            PersonalityTrait.SHY,
            PersonalityTrait.DIPLOMATIC,
            PersonalityTrait.ABRASIVE,
            PersonalityTrait.LOYAL,
            PersonalityTrait.MANIPULATIVE,
            PersonalityTrait.HONEST,
        ],
        "BEHAVIORAL": [
            PersonalityTrait.RECKLESS,
            PersonalityTrait.CAUTIOUS,
            PersonalityTrait.METHODICAL,
            PersonalityTrait.SPONTANEOUS,
            PersonalityTrait.STUBBORN,
            PersonalityTrait.ADAPTABLE,
            PersonalityTrait.DISCIPLINED,
            PersonalityTrait.IMPULSIVE,
        ],
        "COGNITIVE": [
            PersonalityTrait.ANALYTICAL,
            PersonalityTrait.INTUITIVE,
            PersonalityTrait.CREATIVE,
            PersonalityTrait.PRAGMATIC,
            PersonalityTrait.CURIOUS,
            PersonalityTrait.PARANOID,
            PersonalityTrait.PERCEPTIVE,
            PersonalityTrait.OBLIVIOUS,
        ],
        "MORAL": [
            PersonalityTrait.HONORABLE,
            PersonalityTrait.RUTHLESS,
            PersonalityTrait.COMPASSIONATE,
            PersonalityTrait.SELFISH,
            PersonalityTrait.JUST,
            PersonalityTrait.VENGEFUL,
            PersonalityTrait.MERCIFUL,
            PersonalityTrait.CRUEL,
        ],
        "AMBITION": [
            PersonalityTrait.AMBITIOUS,
            PersonalityTrait.CONTENT,
            PersonalityTrait.GREEDY,
            PersonalityTrait.HUMBLE,
            PersonalityTrait.COMPETITIVE,
            PersonalityTrait.COOPERATIVE,
        ],
        "COURAGE": [
            PersonalityTrait.BRAVE,
            PersonalityTrait.COWARDLY,
            PersonalityTrait.FEARLESS,
            PersonalityTrait.ANXIOUS,
        ],
        "LEADERSHIP": [
            PersonalityTrait.AUTHORITATIVE,
            PersonalityTrait.FOLLOWER,
            PersonalityTrait.REBELLIOUS,
            PersonalityTrait.OBEDIENT,
            PersonalityTrait.INDEPENDENT,
            PersonalityTrait.TEAM_PLAYER,
        ],
    }

    for category, traits in categories.items():
        trait_lines.append(f"\n{category} TRAITS:")
        for trait in traits:
            metadata = TRAIT_METADATA[trait]
            trait_lines.append(f"  - {trait.value}: {metadata['description']}")

    return "\n".join(trait_lines)


def get_all_trait_names() -> list[str]:
    """Get a simple list of all trait names (for LLM output parsing)."""
    return [trait.value for trait in PersonalityTrait]
