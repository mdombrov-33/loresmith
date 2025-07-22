from utils.exceptions.base import OpenRouterException


class OpenRouterRequestError(OpenRouterException):
    """Network or request-related error during OpenRouter call."""

    def __init__(self, message="Request error during OpenRouter API call."):
        self.message = message
        super().__init__(self.message)

    def __str__(self):
        return f"OpenRouterRequestError: {self.message}"


class OpenRouterHTTPError(OpenRouterException):
    """HTTP status error during OpenRouter call."""

    def __init__(
        self, status_code=None, message="HTTP error during OpenRouter API call."
    ):
        self.status_code = status_code
        self.message = message
        super().__init__(self.message)

    def __str__(self):
        return f"OpenRouterHTTPError (status {self.status_code}): {self.message}"
