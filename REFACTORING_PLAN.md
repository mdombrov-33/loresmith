# Lore Generation Refactoring Plan

## Problem Statement

Current generation chains have several issues:
1. **Manual prompt file reading** - `open()` calls scattered everywhere
2. **No structured validation** - Manual string parsing with regex (lines 159-198 in character.py)
3. **Complex guardrails** - Hardcoded cleanup logic for LLM mistakes
4. **Hard to maintain** - Each chain reimplements similar patterns
5. **No type safety** - String outputs that need manual validation

## Solution: Pydantic Structured Outputs

Use LangChain's `.with_structured_output()` to force LLMs to return validated Pydantic models.

### Why NOT LangGraph?

LangGraph is for:
- Stateful multi-agent systems
- Complex decision trees with memory
- Tool calling and human-in-the-loop
- Conversational agents with state management

Our use case is **simpler**: Generate structured data in a linear pipeline.

### Why Structured Outputs?

**Before (manual parsing):**
```python
# Manual prompt reading
with open("prompts/character_name.txt", "r") as f:
    prompt = f.read()

# LLM returns unstructured text
raw_output = await chain.ainvoke(...)

# Manual cleanup (brittle!)
cleaned = raw_output.strip('"')
if ":" in cleaned:
    cleaned = cleaned.split(":")[-1]
# ... 50 more lines of cleanup
```

**After (structured):**
```python
from pydantic import BaseModel

class CharacterName(BaseModel):
    name: str = Field(description="Character's full name")

# LLM returns validated Pydantic model
llm = get_llm().with_structured_output(CharacterName)
result = await chain.ainvoke(...)  # Already validated!
name = result.name  # Type-safe, guaranteed valid
```

## Benefits

1. **No manual parsing** - LLM is forced to return valid structure
2. **Automatic validation** - Pydantic validates types, ranges, lengths
3. **Type safety** - Editor autocomplete, no typos
4. **Cleaner code** - Remove all regex/string manipulation
5. **Better errors** - Pydantic shows exactly what's invalid
6. **Retry logic** - Can automatically retry on validation failure

## Migration Strategy

### Phase 1: Create Schemas (Quick Win)
- Create Pydantic models for all lore types
- Define validation rules (lengths, ranges, types)
- Keep existing chains working

### Phase 2: Refactor One Chain (Proof of Concept)
- Start with `character.py` → `character_structured.py`
- Compare outputs side-by-side
- Measure reliability improvement

### Phase 3: Migrate All Chains
- Faction, Setting, Event, Relic
- Full Story orchestrator
- Remove old chains when confident

### Phase 4: Centralize Prompts
- Move prompts to Python strings/templates
- No more manual file reading
- Version control friendly

## Example Comparison

### Old Approach (character.py lines 159-198)
```python
# 40+ lines of manual cleanup
traits_text = clean_ai_text(traits_raw)
traits_text = traits_text.strip('"').strip("'")
if "." in traits_text:
    traits_text = traits_text.split(".")[0]
if " - " in traits_text:
    traits_text = traits_text.split(" - ")[0]
# ... 30 more lines
personality_traits = [t.strip() for t in traits_text.split(",")]
```

### New Approach
```python
class CharacterTraits(BaseModel):
    traits: List[str] = Field(min_length=3, max_length=3)

llm = get_llm().with_structured_output(CharacterTraits)
result = await chain.ainvoke(...)
personality_traits = result.traits  # Already validated!
```

## Files Created

1. `generate/schemas/character_schema.py` - Pydantic models
2. `generate/chains/character_structured.py` - Refactored chain

## Next Steps

1. Test `generate_character_structured()` alongside old version
2. Compare outputs, reliability, error handling
3. If successful, create schemas for other lore types
4. Build base generator class to reduce duplication
5. Migrate remaining chains

## When to Consider LangGraph

Only if you later need:
- Multi-turn conversations with memory
- Agent choosing between multiple tools
- Complex state machines with branching
- Human approval steps mid-generation

For now, structured outputs solve 90% of the problems with 10% of the complexity.
