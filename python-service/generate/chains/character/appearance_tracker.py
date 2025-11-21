"""
Track recently used appearance features to prevent repetitive character generation.

Similar to name tracking, this prevents the LLM from generating 5 steampunk
characters in a row all wearing goggles.
"""

from collections import deque
from typing import Set
import random


class AppearanceTracker:
    """Tracks recently used appearance features to ensure variety."""

    def __init__(self, max_recent: int = 100):
        self._recent_features: deque[str] = deque(maxlen=max_recent)
        self._feature_set: Set[str] = set()

    def add_features(self, features: list[str]):
        """Add appearance features from a generated character."""
        for feature in features:
            feature_lower = feature.lower().strip()
            if feature_lower:
                self._recent_features.append(feature_lower)
                self._feature_set.add(feature_lower)

                # Clean up feature set if deque removed old items
                if len(self._feature_set) > len(self._recent_features):
                    self._feature_set = set(self._recent_features)

    def get_excluded_features(self, limit: int = 15) -> list[str]:
        """Get most recently used features to exclude from next generation."""
        # Return the most recent features (to avoid immediate reuse)
        return list(self._recent_features)[-limit:] if self._recent_features else []

    def extract_features_from_text(self, appearance_text: str) -> list[str]:
        """
        Extract key appearance features from generated text.

        Looks for common feature keywords in the appearance description.
        """
        appearance_lower = appearance_text.lower()

        # Common appearance features to track
        feature_keywords = [
            "goggles", "monocle", "top hat", "cane",
            "scar", "tattoo", "piercing", "implant",
            "leather jacket", "brass buttons", "tool belt",
            "flight jacket", "trench coat", "hood",
            "cybernetic eye", "facial implant", "neon tattoo",
            "gas mask", "respirator", "visor",
            "mechanical arm", "prosthetic",
            "braid", "mohawk", "bald", "dreadlocks",
            "beard", "mustache", "clean-shaven",
        ]

        found_features = []
        for keyword in feature_keywords:
            if keyword in appearance_lower:
                found_features.append(keyword)

        return found_features


# Global singleton instance
_tracker = AppearanceTracker()


def add_generated_features(appearance_text: str):
    """Extract and track features from generated appearance text."""
    features = _tracker.extract_features_from_text(appearance_text)
    _tracker.add_features(features)


def get_excluded_features(limit: int = 15) -> list[str]:
    """Get recently used features to exclude from generation."""
    return _tracker.get_excluded_features(limit)


# Appearance constraint options for variety
AGE_OPTIONS = [
    "young adult (early 20s)",
    "mid-20s",
    "late 20s to early 30s",
    "mid-30s",
    "late 30s to early 40s",
    "middle-aged (40s)",
    "mature (50s)",
    "elderly (60s+)",
]

BUILD_OPTIONS = [
    "slim and wiry",
    "lean and athletic",
    "muscular and broad-shouldered",
    "stocky and compact",
    "heavyset and imposing",
    "lanky and tall",
    "petite and agile",
    "average build",
]

DISTINCTIVE_FEATURE_OPTIONS = [
    "striking eye color (unusual shade)",
    "unique hair color or style",
    "prominent birthmark",
    "distinctive tattoo (non-facial)",
    "unusual gait or posture",
    "memorable voice or accent markers",
    "distinctive hands (artistic, calloused, elegant)",
    "unique jewelry or accessory",
    "asymmetrical features",
    "distinctive nose or jawline",
    "prominent cheekbones",
    "expressive eyebrows",
]


def get_random_constraints() -> dict[str, str]:
    """Get random appearance constraints for variety."""
    return {
        "age": random.choice(AGE_OPTIONS),
        "build": random.choice(BUILD_OPTIONS),
        "distinctive_feature": random.choice(DISTINCTIVE_FEATURE_OPTIONS),
    }
