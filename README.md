# LoreSmith

[![Go](https://img.shields.io/badge/go-1.24+-blue)](https://golang.org/)
[![Python](https://img.shields.io/badge/python-3.12+-blue)](https://www.python.org/)
[![gRPC](https://img.shields.io/badge/grpc-1.75+-blue)](https://grpc.io/)
[![Docker](https://img.shields.io/badge/docker-28+-blue)](https://www.docker.com/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-16-blue)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/redis-8-blue)](https://redis.io/)

A microservices AI-powered lore generator that creates characters, factions, settings, events, and relics using Go (HTTP) and Python (gRPC + AI chains). Supports JWT auth, caching, regeneration, and Docker orchestration.

## Overview

LoreSmith generates thematic lore pieces for storytelling or world-building. It uses AI prompts via OpenRouter, caches in Redis, and stores in PostgreSQL. Architecture: Go service handles HTTP/auth, Python service handles gRPC-based generation.

## Features

- **Lore Generation**: Characters, factions, settings, events, relics with themes (e.g., post-apocalyptic, cyberpunk).
- **AI Integration**: OpenRouter API for prompt chaining and text generation.
- **Caching & Auth**: Redis caching; JWT-based auth for protected endpoints.
- **Microservices**: Go (HTTP server) + Python (gRPC server) via Docker Compose.
- **Observability**: Prometheus, Grafana, Sentry.

## Tech Stack

- **Go Service**: HTTP server, JWT auth, Chi router.
- **Python Service**: gRPC server, AI chains, OpenRouter client.
- **Database**: PostgreSQL (users/lore), Redis (caching).
- **Deployment**: Docker Compose.

## Getting Started

### Prerequisites

- Docker and Docker Compose
- OpenRouter API key

### Setup

1. Clone and switch to branch:

   ```bash
   git clone https://github.com/mdombrov-33/loresmith.git
   cd loresmith
   git checkout revamp-go-python
   ```

2. Copy `.env.example` to `.env` and fill secrets:

   ```env
   OPENROUTER_API_KEY=your_api_key_here
   POSTGRES_HOST=postgres
   POSTGRES_PORT=5432
   POSTGRES_DB=loresmith
   POSTGRES_USER=loresmithuser
   POSTGRES_PASSWORD=your_password
   REDIS_HOST=redis
   REDIS_PORT=6379
   JWT_SECRET=your_secret
   ```

3. Run:

   ```bash
   docker-compose up --build
   ```

4. Access:
   - Go service: http://localhost:8080
   - Health: http://localhost:8080/health

## How It Works

1. **Request**: GET to Go service (e.g., `/generate/characters?count=3&theme=post-apocalyptic&regenerate=false`).
2. **Auth**: JWT checked via middleware.
3. **gRPC Call**: Go calls Python service for generation.
4. **AI Processing**: Python loads prompts, calls OpenRouter, cleans text, returns lore.
5. **Response**: JSON with lore pieces.

## API Endpoints (Go Service)

All require JWT auth (except `/health`, `/register`, `/login`).

- `POST /register` - Register user (body: `{"username": "string", "email": "string", "password": "string"}`)
- `POST /login` - Login (body: `{"username": "string", "password": "string"}`) → returns `{"token": "jwt"}`
- `GET /generate/characters`
- `GET /generate/factions`
- `GET /generate/settings`
- `GET /generate/events`
- `GET /generate/relics`
- `GET /health` - Health check

**Query Params** (for `/generate/*` endpoints):

- `count`: Number of items (1-10).
- `theme`: See [`constants/themes.py`](python-service/constants/themes.py) for options (e.g., post-apocalyptic, fantasy).
- `regenerate`: Bool; if true, skip Redis cache for fresh generation.

Example Response:

```json
{
  "characters": [
    {
      "name": "Frost Vesper",
      "description": "Resilient scavenger...",
      "details": { "appearance": "...", "personality": "..." },
      "type": "character"
    }
  ]
}
```

## CI/CD

GitHub Actions lint (Ruff/Black), build Go/Python, push Docker images on pushes/PRs.
