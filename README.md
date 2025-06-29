# LoreSmith - Modular AI-Powered Lore Generator

<p align="center">
  <img src="assets/logo.png" alt="LoreSmith Logo" width="200" />
</p>

[![Python](https://img.shields.io/badge/python-3.10%2B-purple)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-purple)](https://fastapi.tiangolo.com/)
![Redis](https://img.shields.io/badge/Redis-8.0.2-purple?logo=redis)
![OpenRouter](https://img.shields.io/badge/OpenRouter-API-purple)
[![Docker](https://img.shields.io/badge/docker-28.1-purple?logo=docker)](https://www.docker.com/)

## Overview

LoreSmith is a backend service that generates modular AI-driven lore pieces - characters, factions, settings, events, and relics, using asynchronous chains and OpenRouter API.

The system supports caching generated lore variants in Redis for improved performance and includes a mechanism to regenerate lore on demand, bypassing cache when needed.

## Features

- Modular AI-powered generation of lore pieces: characters, factions, settings, events and relics
- Supports multiple thematic styles (e.g., post-apocalyptic, fantasy) to tailor generated content
- Intelligent prompt chaining to produce coherent and rich lore narratives
- Caching generated lore results in Redis to improve response times and reduce redundant AI calls
- Option to regenerate lore on demand, bypassing cache when users want fresh content
- RESTful API with clear endpoints for each lore type and full lore bundles
- Easily extendable architecture to add new lore categories or themes
- Docker-ready for easy deployment and development with Redis integration

---

## AI Feature Roadmap

This roadmap outlines planned AI-powered features for LoreSmith, designed to progressively enhance lore generation, interactivity, and immersion.

### Phase 1: Core Extensions

- **Lore Extensions**  
  Generate short thematic story hooks or rumors based on existing lore pieces to add depth and flavor.
- **Basic NPC Chatbot**  
  Provide a chat endpoint seeded with individual character or faction data, enabling simple interactive dialogues.
- **Thematic Name Generator**  
  Generate character and place names guided by user-provided style or mood input for thematic consistency.

### Phase 2: Immersion & Localization

- **Procedural World Description Generator**  
  Automatically generate text-based world or region descriptions to enrich lore settings.
- **Multi-Language Support**  
  Add a `language` query parameter to output generated content in multiple languages, broadening accessibility.

### Phase 3: Advanced UX & Experimental

- **Enhanced NPC Dialogues with Memory**  
  Implement session state and conversation history for NPC chatbots to allow richer, context-aware interactions.
- **Lore Consistency Checker**  
  Analyze lore pieces to detect contradictions or inconsistencies, improving story coherence.
- **AI Visual Storytelling**  
  Integrate text-to-image AI to generate character portraits or concept art, enhancing visual immersion.

### PostgreSQL Integration (**WIP**)

- Async PostgreSQL support via SQLAlchemy 2.x + asyncpg
- Storing generated lore for persistence and analytics
- Designed with production features like retry logic, error logging, and Docker-managed services

---

## Running Locally

### Prerequisites

- Python 3.10 or higher
- Redis server running locally or accessible remotely
- OpenRouter API key set as environment variable

### Steps

1. Clone the repository and navigate into it:

```bash
git clone https://github.com/mdombrov-33/loresmith.git
cd loresmith
```

2. Create and activate Python virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
```

3. Install Python dependencies:

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

4. Start your Redis server locally (or ensure remote Redis is accessible):

```bash
redis-server
```

5. Set ENV variables, example:

   - OPENROUTER_API_KEY=your_api_key
   - REDIS_HOST=localhost
   - REDIS_PORT=6379
   - REDIS_DB=0

6. Run the FastAPI application:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

7. Open [http://localhost:8000/docs](http://localhost:8000/docs) in your browser to explore and test the API.

---

## Using Docker Compose 🐳

This project uses Docker Compose to run the backend service alongside Redis.

To start the application:

- Run the following command in your terminal:

```bash
docker-compose up --build
```

- This command will:
  - Build the backend Docker image from Dockerfile
  - Start a Redis container
  - Launch the FastAPI backend accessible at [http://localhost:8000](http://localhost:8000)

To stop the containers:

- Use the command:

```bash
docker-compose down
```

---

## API Endpoints

The backend exposes RESTful endpoints for generating different lore pieces and full stories.

### Generate Multiple Lore Pieces

- **GET** `/api/generate/characters`

  Generate a list of character lore pieces.

  **Query parameters:**

  - `count` (int, optional): Number of items to generate. Default is 3. Range: 1-10.
  - `theme` (string, optional): Theme for generation. Default is `post_apocalyptic`.
  - `regenerate` (bool, optional): If `true`, bypass cache and generate fresh data.

- **GET** `/api/generate/factions`

  Similar to `/api/generate/characters` but for factions.

- **GET** `/api/generate/settings`

  Similar to above, for settings.

- **GET** `/api/generate/events`

  Similar to above, for events.

- **GET** `/api/generate/relics`

  Similar to above, for relics.

### Generate Full Lore Bundle

- **GET** `/api/generate/all`

  Generates all lore variants: characters, factions, settings, events, and relics at once.

  **Query parameters:**

  - `count` (int, optional): Number of items to generate for each lore type. Default is 3. Range: 1-10.
  - `theme` (string, optional): Theme for generation. Default is `post_apocalyptic`

### Generate Full Story

- **POST** `/api/generate/full-story`

  Generate a full story based on selected lore pieces.

  **Request body:**

  - JSON object with selected lore pieces (`SelectedLorePieces` model).

  **Query parameters:**

  - `theme` (string, optional): Theme for story generation. Default is `post_apocalyptic`.

---

### Example API Response

Below is a sample JSON responses from the endpoints illustrating the structure and content returned by the AI lore generator.

`/api/generate/characters?count=1&theme=steampunk&regenerate=false'`

```json
[
  {
    "name": "Cylindra Quicksprocket",
    "description": "Cylindra Quicksprocket, a spirited inventor hailing from the bustling airship docks of Mechanica, spent her childhood dismantling and reassembling her father's intricate clockwork gadgets, fueling her insatiable curiosity. With a heart full of wanderlust and a knack for crafting ingenious contraptions from scrap metal, she now traverses the cloud-laden skies on her steam-powered skiff, seeking daring escapades and the rarest blueprints to elevate her inventions to unimaginable heights.",
    "details": {
      "personality": "Inventive, resourceful, adventurous",
      "appearance": "Cylindra Quicksprocket has a slender, elongated figure adorned with intricate mechanical tattoos that shimmer with metallic hues, her long auburn hair is styled in elaborate braids interwoven with copper wires and tiny gears, she wears a fitted corset made of deep burgundy leather, accented by delicate lace and brass buckles, her skirts are layered with ruffled fabrics, showcasing a blend of rich greens and earthy browns, she sports knee-high lace-up boots made of sturdy yet elegant materials, her goggles, perched on her forehead, feature stained glass lenses that shift colors with the light, and her fingers are often adorned with steampunk-inspired rings, featuring clockwork designs and tiny gemstones, her expressive green eyes glint with curiosity and mischief, reflecting her adventurous spirit."
    },
    "type": "character"
  }
]
```

`/api/generate/full-story?theme=post-apocalyptic`

```json
{
  "title": "Full Story",
  "content": "In the ash-choked expanse of Ashfall City, where collapsed skyscrapers loom like forgotten giants and toxic rivers snake through the rubble, Echo, a cautious scavenger draped in a dust-covered cloak, inches through the remnants of a world lost to The Collapse. As she navigates the perilous terrain of radioactive zones and rogue drones, her reflective goggles catch the faint glow of a legendary artifact rumored to possess the key to a future—or a curse: the Pathseeker Map, a shimmering relic that could unlock the secrets of pre-war technology. Yet, the relentless Steel Reclaimers, clad in armored uniforms and marked by their metallic insignia, hunt her with ruthless intent, believing that only through the control of such relics can order rise from chaos. Burdened by the memories of a world she once knew, Echo must race against time to embrace the map's potential, defending it from those who would see it bent to tyranny. In a city laden with the ghosts of the past, her choices will determine whether the flicker of hope within the ruins can ignite a new dawn or extinguish beneath the weight of oppression.",
  "theme": "post-apocalyptic",
  "pieces": {
    "character": {
      "name": "Echo",
      "description": "A skilled scavenger navigating the ruins of a fallen city.",
      "details": {
        "personality": "Cautious, intelligent, burdened by the past",
        "appearance": "Dust-covered cloak, reflective goggles, scavenged tech gear"
      },
      "type": "character"
    },
    "faction": {
      "name": "Steel Reclaimers",
      "description": "A militant faction obsessed with recovering pre-war technology.",
      "details": {
        "ideology": "Technology must be controlled to enforce order",
        "appearance": "Armored uniforms, metallic insignia, glowing visors"
      },
      "type": "faction"
    },
    "setting": {
      "name": "Ashfall City",
      "description": "A ruined megacity buried in ash and fog.",
      "details": {
        "landscape": "Collapsed skyscrapers, toxic rivers, ash storms",
        "dangers": "Radioactive zones, rogue drones, scavenger gangs"
      },
      "type": "setting"
    },
    "event": {
      "name": "The Collapse",
      "description": "The catastrophic shutdown of global power grids that marked the end of the old world.",
      "details": {
        "impact": "Plunged the world into chaos and birthed new powers"
      },
      "type": "event"
    },
    "relic": {
      "name": "The Pathseeker Map",
      "description": "A shimmering, semi-holographic map once used for space exploration.",
      "details": {
        "history": "Said to hold data that could restart civilization",
        "appearance": "Translucent surface, faint glowing constellations"
      },
      "type": "relic"
    }
  }
}
```
