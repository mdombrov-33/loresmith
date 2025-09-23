from utils.exceptions.base import LoreSmithException


class GenerationError(LoreSmithException):
    """Base class for all generation-related errors."""

    pass


class CharacterGenerationError(GenerationError):
    """Exception raised during character generation."""

    def __init__(self, message: str = "Error occurred during character generation."):
        self.message = message
        super().__init__(self.message)

    def __str__(self):
        return f"CharacterGenerationError: {self.message}"


class EventGenerationError(GenerationError):
    """Exception raised during event generation."""

    def __init__(self, message: str = "Error occurred during event generation."):
        self.message = message
        super().__init__(self.message)

    def __str__(self):
        return f"EventGenerationError: {self.message}"


class RelicGenerationError(GenerationError):
    """Exception raised during relic generation."""

    def __init__(self, message: str = "Error occurred during relic generation."):
        self.message = message
        super().__init__(self.message)

    def __str__(self):
        return f"RelicGenerationError: {self.message}"


class SettingGenerationError(GenerationError):
    """Exception raised during setting generation."""

    def __init__(self, message: str = "Error occurred during setting generation."):
        self.message = message
        super().__init__(self.message)

    def __str__(self):
        return f"SettingGenerationError: {self.message}"


class FactionGenerationError(GenerationError):
    """Exception raised during faction generation."""

    def __init__(self, message: str = "Error occurred during faction generation."):
        self.message = message
        super().__init__(self.message)

    def __str__(self):
        return f"FactionGenerationError: {self.message}"


class FullStoryGenerationError(GenerationError):
    """Exception raised during full story generation."""

    def __init__(self, message: str = "Error occurred during full story generation."):
        self.message = message
        super().__init__(self.message)

    def __str__(self):
        return f"FullStoryGenerationError: {self.message}"
