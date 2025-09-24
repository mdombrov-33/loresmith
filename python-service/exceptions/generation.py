from exceptions.base import LoreSmithException


class GenerationError(LoreSmithException):
    """Base class for all generation-related errors."""

    pass


class CharacterGenerationError(GenerationError):
    """Exception raised during character generation."""

    pass


class EventGenerationError(GenerationError):
    """Exception raised during event generation."""

    pass


class RelicGenerationError(GenerationError):
    """Exception raised during relic generation."""

    pass


class SettingGenerationError(GenerationError):
    """Exception raised during setting generation."""

    pass


class FactionGenerationError(GenerationError):
    """Exception raised during faction generation."""

    pass


class FullStoryGenerationError(GenerationError):
    """Exception raised during full story generation."""

    pass


class LoreVariantsGenerationError(GenerationError):
    """Exception raised during lore variants generation."""

    pass
