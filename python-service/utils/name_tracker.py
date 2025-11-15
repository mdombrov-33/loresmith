"""
Name tracker to prevent repetitive character name generation.

Keeps track of recently generated names to ensure variety.
Names can be reused after 100 different names have been generated.
"""

from collections import deque
from typing import Set


class NameTracker:
    """Tracks recently generated character names to ensure variety."""

    def __init__(self, max_recent: int = 100):
        """
        Initialize name tracker.

        Args:
            max_recent: Maximum number of recent names to track (default 100)
        """
        self._recent_names: deque[str] = deque(maxlen=max_recent)
        self._name_set: Set[str] = set()

    def add_name(self, name: str) -> None:
        """
        Add a newly generated name to the tracker.

        Args:
            name: Character name to track
        """
        name_lower = name.lower().strip()
        if name_lower:
            # If deque is full, remove oldest from set
            if len(self._recent_names) == self._recent_names.maxlen and self._recent_names:
                oldest = self._recent_names[0]
                self._name_set.discard(oldest)

            # Add new name
            self._recent_names.append(name_lower)
            self._name_set.add(name_lower)

    def get_recent_names(self, limit: int = 50) -> list[str]:
        """
        Get list of recently used names for prompt exclusion.

        Args:
            limit: Maximum number of recent names to return

        Returns:
            List of recent name strings (most recent first)
        """
        # Return up to `limit` most recent names, in reverse order (newest first)
        recent = list(self._recent_names)[-limit:]
        return list(reversed(recent))

    def is_recent(self, name: str) -> bool:
        """
        Check if a name was recently used.

        Args:
            name: Name to check

        Returns:
            True if name is in recent tracker, False otherwise
        """
        return name.lower().strip() in self._name_set

    def clear(self) -> None:
        """Clear all tracked names."""
        self._recent_names.clear()
        self._name_set.clear()


# Global name tracker instance
_name_tracker = NameTracker(max_recent=100)


def add_generated_name(name: str) -> None:
    """
    Add a generated name to the global tracker.

    Args:
        name: Character name that was just generated
    """
    _name_tracker.add_name(name)


def get_excluded_names(limit: int = 50) -> list[str]:
    """
    Get list of recently used names to exclude from generation.

    Args:
        limit: Maximum number of names to exclude

    Returns:
        List of recent names that should not be reused
    """
    return _name_tracker.get_recent_names(limit)


def is_name_recent(name: str) -> bool:
    """
    Check if a name was recently generated.

    Args:
        name: Name to check

    Returns:
        True if recently used, False otherwise
    """
    return _name_tracker.is_recent(name)
