# EchoForge - Modular AI-Powered Lore Generator

[![Python](https://img.shields.io/badge/python-3.10%2B-purple)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-purple)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/docker-28.1-blue?logo=docker)](https://www.docker.com/)
![Redis](https://img.shields.io/badge/Redis-8.0.2-red?logo=redis)
![OpenRouter](https://img.shields.io/badge/OpenRouter-API-purple)

## Overview

EchoForge is a backend service that generates modular AI-driven lore pieces - characters, factions, settings, events, and relics, using asynchronous chains and OpenRouter API.

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

## Running Locally

### Prerequisites

- Python 3.10 or higher
- Redis server running locally or accessible remotely
- OpenRouter API key set as environment variable

### Steps

1. Clone the repository and navigate into it:

```bash
git clone https://github.com/mdombrov-33/echoforge.git
cd echoforge
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

- **GET** `/generate/characters`

  Generate a list of character lore pieces.

  **Query parameters:**

  - `count` (int, optional): Number of items to generate. Default is 3. Range: 1-10.
  - `theme` (string, optional): Theme for generation. Default is `post_apocalyptic`.
  - `regenerate` (bool, optional): If `true`, bypass cache and generate fresh data.

- **GET** `/generate/factions`

  Similar to `/generate/characters` but for factions.

- **GET** `/generate/settings`

  Similar to above, for settings.

- **GET** `/generate/events`

  Similar to above, for events.

- **GET** `/generate/relics`

  Similar to above, for relics.

### Generate Full Lore Bundle

- **GET** `/generate/all`

  Generates all lore variants: characters, factions, settings, events, and relics at once.

  **Query parameters:**

  - `count` (int, optional): Number of items to generate for each lore type. Default is 3. Range: 1-10.
  - `theme` (string, optional): Theme for generation. Default is `post_apocalyptic`

### Generate Full Story

- **POST** `/generate/full-story`

  Generate a full story based on selected lore pieces.

  **Request body:**

  - JSON object with selected lore pieces (`SelectedLorePieces` model).

  **Query parameters:**

  - `theme` (string, optional): Theme for story generation. Default is `post_apocalyptic`.
