from exceptions.base import LoreSmithException


class AdventureGenerationError(LoreSmithException):
    """Base class for all adventure-related AI generation errors."""

    pass


class SceneBatchGenerationError(AdventureGenerationError):
    """Exception raised during scene batch generation (3 scenes per act)."""

    pass


class SceneBeatsGenerationError(AdventureGenerationError):
    """Exception raised during scene beat expansion (skeleton -> narrative)."""

    pass


class ConsequenceGenerationError(AdventureGenerationError):
    """Exception raised during consequence generation (choice outcomes)."""

    pass


class CompanionGenerationError(AdventureGenerationError):
    """Exception raised during companion character generation."""

    pass
