# R2 Portrait Upload Flow

**Core Concept:** Character portraits are generated as base64 during character generation, then uploaded to R2 storage after world creation.

---

## Flow Overview

### Phase 1: Character Generation
- User generates characters → Python creates image → Returns as base64 string
- **Why base64?** No `world_id` exists yet (user hasn't created the world)
- Frontend displays via data URI: `data:image/png;base64,{base64string}`

### Phase 2: World Creation → R2 Upload
- User creates world → Go saves to database → Gets `world_id`
- Go retrieves character lore piece with base64 data
- Go → Python gRPC: sends base64 + world_id + character_id
- Python: decodes base64 → uploads to R2 → returns public URL
- Go: updates database with R2 URL, deletes base64

### Phase 3: Display
- Frontend displays: `<img src={character.details.image_portrait} />`
- Browser loads directly from R2 CDN (public URL)

---

## Data Journey

```
1. GENERATION
   Python generates image → Returns as base64 string
   Storage: Memory only

2. PREVIEW (before world creation)
   Frontend displays via data URI: data:image/png;base64,{string}
   Storage: Client-side only

3. WORLD CREATION
   Go saves character with base64 to database
   Storage: PostgreSQL lore_pieces.details["image_portrait_base64"]

4. R2 UPLOAD (immediate after world creation)
   Go → Python gRPC: sends base64 + world_id + character_id
   Python: Decodes → Uploads to R2 → Returns URL
   Storage: Cloudflare R2

5. DATABASE UPDATE
   Go updates: details["image_portrait"] = R2_URL
   Go deletes: details["image_portrait_base64"]
   Storage: PostgreSQL lore_pieces.details["image_portrait"]

6. DISPLAY
   Frontend: <img src={character.details.image_portrait} />
   Browser: Loads from R2 CDN
```

---

## Database Field Changes

**During world creation:**
```json
details: {
  "image_portrait_base64": "iVBORw0KG...",
  "traits": ["Fearless"]
}
```

**After R2 upload:**
```json
details: {
  "image_portrait": "https://{r2-url}/portraits/123/456_portrait.png",
  "traits": ["Fearless"]
}
```

---

## R2 Storage Pattern

```
portraits/{world_id}/{character_id}_portrait.png
```
