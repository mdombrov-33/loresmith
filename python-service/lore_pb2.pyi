from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from collections.abc import Iterable as _Iterable, Mapping as _Mapping
from typing import ClassVar as _ClassVar, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class CharactersRequest(_message.Message):
    __slots__ = ("theme", "count", "regenerate")
    THEME_FIELD_NUMBER: _ClassVar[int]
    COUNT_FIELD_NUMBER: _ClassVar[int]
    REGENERATE_FIELD_NUMBER: _ClassVar[int]
    theme: str
    count: int
    regenerate: bool
    def __init__(self, theme: _Optional[str] = ..., count: _Optional[int] = ..., regenerate: bool = ...) -> None: ...

class FactionsRequest(_message.Message):
    __slots__ = ("theme", "count", "regenerate")
    THEME_FIELD_NUMBER: _ClassVar[int]
    COUNT_FIELD_NUMBER: _ClassVar[int]
    REGENERATE_FIELD_NUMBER: _ClassVar[int]
    theme: str
    count: int
    regenerate: bool
    def __init__(self, theme: _Optional[str] = ..., count: _Optional[int] = ..., regenerate: bool = ...) -> None: ...

class SettingsRequest(_message.Message):
    __slots__ = ("theme", "count", "regenerate")
    THEME_FIELD_NUMBER: _ClassVar[int]
    COUNT_FIELD_NUMBER: _ClassVar[int]
    REGENERATE_FIELD_NUMBER: _ClassVar[int]
    theme: str
    count: int
    regenerate: bool
    def __init__(self, theme: _Optional[str] = ..., count: _Optional[int] = ..., regenerate: bool = ...) -> None: ...

class EventsRequest(_message.Message):
    __slots__ = ("theme", "count", "regenerate")
    THEME_FIELD_NUMBER: _ClassVar[int]
    COUNT_FIELD_NUMBER: _ClassVar[int]
    REGENERATE_FIELD_NUMBER: _ClassVar[int]
    theme: str
    count: int
    regenerate: bool
    def __init__(self, theme: _Optional[str] = ..., count: _Optional[int] = ..., regenerate: bool = ...) -> None: ...

class RelicsRequest(_message.Message):
    __slots__ = ("theme", "count", "regenerate")
    THEME_FIELD_NUMBER: _ClassVar[int]
    COUNT_FIELD_NUMBER: _ClassVar[int]
    REGENERATE_FIELD_NUMBER: _ClassVar[int]
    theme: str
    count: int
    regenerate: bool
    def __init__(self, theme: _Optional[str] = ..., count: _Optional[int] = ..., regenerate: bool = ...) -> None: ...

class LorePiece(_message.Message):
    __slots__ = ("name", "description", "details", "type")
    class DetailsEntry(_message.Message):
        __slots__ = ("key", "value")
        KEY_FIELD_NUMBER: _ClassVar[int]
        VALUE_FIELD_NUMBER: _ClassVar[int]
        key: str
        value: str
        def __init__(self, key: _Optional[str] = ..., value: _Optional[str] = ...) -> None: ...
    NAME_FIELD_NUMBER: _ClassVar[int]
    DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    DETAILS_FIELD_NUMBER: _ClassVar[int]
    TYPE_FIELD_NUMBER: _ClassVar[int]
    name: str
    description: str
    details: _containers.ScalarMap[str, str]
    type: str
    def __init__(self, name: _Optional[str] = ..., description: _Optional[str] = ..., details: _Optional[_Mapping[str, str]] = ..., type: _Optional[str] = ...) -> None: ...

class CharactersResponse(_message.Message):
    __slots__ = ("characters",)
    CHARACTERS_FIELD_NUMBER: _ClassVar[int]
    characters: _containers.RepeatedCompositeFieldContainer[LorePiece]
    def __init__(self, characters: _Optional[_Iterable[_Union[LorePiece, _Mapping]]] = ...) -> None: ...

class FactionsResponse(_message.Message):
    __slots__ = ("factions",)
    FACTIONS_FIELD_NUMBER: _ClassVar[int]
    factions: _containers.RepeatedCompositeFieldContainer[LorePiece]
    def __init__(self, factions: _Optional[_Iterable[_Union[LorePiece, _Mapping]]] = ...) -> None: ...

class SettingsResponse(_message.Message):
    __slots__ = ("settings",)
    SETTINGS_FIELD_NUMBER: _ClassVar[int]
    settings: _containers.RepeatedCompositeFieldContainer[LorePiece]
    def __init__(self, settings: _Optional[_Iterable[_Union[LorePiece, _Mapping]]] = ...) -> None: ...

class EventsResponse(_message.Message):
    __slots__ = ("events",)
    EVENTS_FIELD_NUMBER: _ClassVar[int]
    events: _containers.RepeatedCompositeFieldContainer[LorePiece]
    def __init__(self, events: _Optional[_Iterable[_Union[LorePiece, _Mapping]]] = ...) -> None: ...

class RelicsResponse(_message.Message):
    __slots__ = ("relics",)
    RELICS_FIELD_NUMBER: _ClassVar[int]
    relics: _containers.RepeatedCompositeFieldContainer[LorePiece]
    def __init__(self, relics: _Optional[_Iterable[_Union[LorePiece, _Mapping]]] = ...) -> None: ...

class AllRequest(_message.Message):
    __slots__ = ("theme", "count", "regenerate")
    THEME_FIELD_NUMBER: _ClassVar[int]
    COUNT_FIELD_NUMBER: _ClassVar[int]
    REGENERATE_FIELD_NUMBER: _ClassVar[int]
    theme: str
    count: int
    regenerate: bool
    def __init__(self, theme: _Optional[str] = ..., count: _Optional[int] = ..., regenerate: bool = ...) -> None: ...

class AllResponse(_message.Message):
    __slots__ = ("characters", "factions", "settings", "events", "relics")
    CHARACTERS_FIELD_NUMBER: _ClassVar[int]
    FACTIONS_FIELD_NUMBER: _ClassVar[int]
    SETTINGS_FIELD_NUMBER: _ClassVar[int]
    EVENTS_FIELD_NUMBER: _ClassVar[int]
    RELICS_FIELD_NUMBER: _ClassVar[int]
    characters: _containers.RepeatedCompositeFieldContainer[LorePiece]
    factions: _containers.RepeatedCompositeFieldContainer[LorePiece]
    settings: _containers.RepeatedCompositeFieldContainer[LorePiece]
    events: _containers.RepeatedCompositeFieldContainer[LorePiece]
    relics: _containers.RepeatedCompositeFieldContainer[LorePiece]
    def __init__(self, characters: _Optional[_Iterable[_Union[LorePiece, _Mapping]]] = ..., factions: _Optional[_Iterable[_Union[LorePiece, _Mapping]]] = ..., settings: _Optional[_Iterable[_Union[LorePiece, _Mapping]]] = ..., events: _Optional[_Iterable[_Union[LorePiece, _Mapping]]] = ..., relics: _Optional[_Iterable[_Union[LorePiece, _Mapping]]] = ...) -> None: ...

class SelectedLorePieces(_message.Message):
    __slots__ = ("character", "faction", "setting", "event", "relic")
    CHARACTER_FIELD_NUMBER: _ClassVar[int]
    FACTION_FIELD_NUMBER: _ClassVar[int]
    SETTING_FIELD_NUMBER: _ClassVar[int]
    EVENT_FIELD_NUMBER: _ClassVar[int]
    RELIC_FIELD_NUMBER: _ClassVar[int]
    character: LorePiece
    faction: LorePiece
    setting: LorePiece
    event: LorePiece
    relic: LorePiece
    def __init__(self, character: _Optional[_Union[LorePiece, _Mapping]] = ..., faction: _Optional[_Union[LorePiece, _Mapping]] = ..., setting: _Optional[_Union[LorePiece, _Mapping]] = ..., event: _Optional[_Union[LorePiece, _Mapping]] = ..., relic: _Optional[_Union[LorePiece, _Mapping]] = ...) -> None: ...

class FullStory(_message.Message):
    __slots__ = ("content", "theme", "pieces", "quest")
    class QuestEntry(_message.Message):
        __slots__ = ("key", "value")
        KEY_FIELD_NUMBER: _ClassVar[int]
        VALUE_FIELD_NUMBER: _ClassVar[int]
        key: str
        value: str
        def __init__(self, key: _Optional[str] = ..., value: _Optional[str] = ...) -> None: ...
    CONTENT_FIELD_NUMBER: _ClassVar[int]
    THEME_FIELD_NUMBER: _ClassVar[int]
    PIECES_FIELD_NUMBER: _ClassVar[int]
    QUEST_FIELD_NUMBER: _ClassVar[int]
    content: str
    theme: str
    pieces: SelectedLorePieces
    quest: _containers.ScalarMap[str, str]
    def __init__(self, content: _Optional[str] = ..., theme: _Optional[str] = ..., pieces: _Optional[_Union[SelectedLorePieces, _Mapping]] = ..., quest: _Optional[_Mapping[str, str]] = ...) -> None: ...

class FullStoryRequest(_message.Message):
    __slots__ = ("pieces", "theme")
    PIECES_FIELD_NUMBER: _ClassVar[int]
    THEME_FIELD_NUMBER: _ClassVar[int]
    pieces: SelectedLorePieces
    theme: str
    def __init__(self, pieces: _Optional[_Union[SelectedLorePieces, _Mapping]] = ..., theme: _Optional[str] = ...) -> None: ...

class FullStoryResponse(_message.Message):
    __slots__ = ("story",)
    STORY_FIELD_NUMBER: _ClassVar[int]
    story: FullStory
    def __init__(self, story: _Optional[_Union[FullStory, _Mapping]] = ...) -> None: ...
