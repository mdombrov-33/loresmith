class LoreSmithException(Exception):
    """Base class for all exceptions raised by the LoreSmith application."""

    pass


class RedisGetError(LoreSmithException):
    """Exception raised when a Redis GET operation fails after retries."""

    def __init__(
        self, key: str, message: str = "Failed to get value from Redis after retries."
    ):
        self.key = key
        self.message = message
        super().__init__(self.message)

    def __str__(self):
        return f"RedisGetError for key '{self.key}': {self.message}"


class RedisSetError(LoreSmithException):
    """Exception raised when a Redis SET operation fails after retries."""

    def __init__(
        self, key: str, message: str = "Failed to set value in Redis after retries."
    ):
        self.key = key
        self.message = message
        super().__init__(self.message)

    def __str__(self):
        return f"RedisSetError for key '{self.key}': {self.message}"
