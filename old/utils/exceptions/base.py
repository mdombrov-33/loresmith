class LoreSmithException(Exception):
    """Base class for all exceptions raised by the LoreSmith application."""

    pass


class OpenRouterException(LoreSmithException):
    """Base class for OpenRouter API related errors."""

    pass
