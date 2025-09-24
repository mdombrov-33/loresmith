from exceptions.base import OpenRouterException


class OpenRouterRequestError(OpenRouterException):
    """Network or request-related error during OpenRouter call."""

    pass


class OpenRouterHTTPError(OpenRouterException):
    """HTTP status error during OpenRouter call."""

    pass
