# LoreSmith - Modular AI-Powered Lore Generator

<p align="center">
  <img src="assets/logo.png" alt="LoreSmith Logo" width="200" />
</p>

[![Python](https://img.shields.io/badge/python-3.10%2B-purple)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-purple)](https://fastapi.tiangolo.com/)
![Redis](https://img.shields.io/badge/Redis-8.0.2-purple?logo=redis)
![OpenRouter](https://img.shields.io/badge/OpenRouter-API-purple)
[![Docker](https://img.shields.io/badge/Docker-28.1-purple?logo=docker)](https://www.docker.com/)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-purple?logo=postgresql)
![Kubernetes](https://img.shields.io/badge/Kubernetes-purple?logo=kubernetes)

## Overview

LoreSmith is a backend service that generates modular AI-driven lore pieces - characters, factions, settings, events, and relics, using asynchronous chains and OpenRouter API.

The system supports caching generated lore variants in Redis for improved performance and includes a mechanism to regenerate lore on demand bypassing cache when needed.

## Features

- Modular AI-powered generation of lore pieces: characters, factions, settings, events and relics
- Supports multiple thematic styles (e.g., post-apocalyptic, fantasy) to tailor generated content
- Intelligent prompt chaining to produce coherent and rich lore narratives
- Caching generated lore results in Redis to improve response times and reduce redundant AI calls
- Option to regenerate lore on demand, bypassing cache when users want fresh content
- RESTful API with clear endpoints for each lore type and full lore bundles
- Easily extendable architecture to add new lore categories or themes
- Docker Compose setup for streamlined development with integrated monitoring and observability
- Optional Kubernetes deployment available for scalable infrastructure

---

## ⚙️ Continuous Integration (CI/CD)

LoreSmith uses GitHub Actions for CI/CD to ensure code quality, formatting consistency, and automated Docker deployment.

### ✅ What's Automated

When you push to `main` branch:

1. **Code is linted** using `ruff`
2. **Code is formatted** (checked) using `black`
3. **Tests run** with `pytest`
4. **Docker image is built** and tagged as `vexenbay/loresmith-backend:latest`
5. **Docker image is pushed** to Docker Hub

All of the above steps run automatically via GitHub Actions on push or pull request.

### 🔧 Pre-commit Hooks

This project uses pre-commit to auto-format Python files before commits using **black**.

To enable locally:

```bash
pip install pre-commit
pre-commit install
```

You can run it manually with:

```bash
pre-commit run --all-files
```

---

## 🛠️ Tech Stack & Tooling

LoreSmith uses a modern Python backend stack optimized for asynchronous workflows and production readiness:

- **FastAPI** - High-performance web framework for building async APIs
- **SQLAlchemy** - Declarative, type-safe ORM for interacting with PostgreSQL
- **Alembic** - Schema migration tool for SQLAlchemy, used to version and manage database changes
- **PostgreSQL** - Relational database for persistent lore and user data
- **Redis** - Used for caching AI-generated content and improving performance
- **Docker & Docker Compose** - Containerized development environment with built-in Redis/PostgreSQL support and integrated monitoring stack
- **Kubernetes** - Optional container orchestration for production deployments requiring high availability and auto-scaling

---

## 🐳 Getting Started with Docker Compose

The easiest way to run LoreSmith is using Docker Compose, which provides a complete development environment with all dependencies and monitoring tools.

### Prerequisites

- Docker and Docker Compose installed
- OpenRouter API key

### Quick Start

1. **Clone the repository**:

   ```bash
   git clone https://github.com/mdombrov-33/loresmith.git
   cd loresmith
   ```

2. **Set up environment variables**:

Create a `.env` file in the project root with the following variables:

```env
# OpenRouter API Configuration
OPENROUTER_API_KEY=your_api_key_here

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_DB=0

# PostgreSQL Configuration
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=loresmith
POSTGRES_USER=loresmith_user
POSTGRES_PASSWORD=somepassword

# Database URL (optional, usually constructed automatically)
DATABASE_URL=postgresql+asyncpg://loresmith_user:somepassword@postgres:5432/loresmith

# Sentry (Error Monitoring)
SENTRY_DSN=your_sentry_dsn_here
```

3. **Start the application**:

   ```bash
   docker-compose up --build
   ```

4. **Access the services**:
   - **API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
   - **Grafana Dashboard**: [http://localhost:3000](http://localhost:3000) (admin/admin)
   - **Prometheus Metrics**: [http://localhost:9090](http://localhost:9090)

### What's Included

The Docker Compose setup provides:

- **Backend API** - FastAPI application with hot reload for development
- **PostgreSQL** - Persistent database for lore storage
- **Redis** - Caching layer for improved performance
- **Monitoring Stack** - Comprehensive observability tools (Prometheus, Grafana, etc.)

To stop all services:

```bash
docker-compose down
```

---

## 📊 Monitoring & Observability

LoreSmith includes a comprehensive monitoring stack integrated into the Docker Compose setup, providing deep insights into application performance, system health, and user behavior.

#### **Prometheus** - Metrics Collection ✅

- **Endpoint**: [http://localhost:9090](http://localhost:9090)
- **Purpose**: Time-series metrics collection and alerting
- **Metrics Tracked**:
  - Total number of lore generation requests by theme and lore type
  - AI generation success and failure counts by model and error type

#### **Grafana** - Data Visualization ✅

- **Endpoint**: [http://localhost:3000](http://localhost:3000)
- **Credentials**: `admin` / `admin` (change on first login)
- **Dashboards**:
  - Visualization of lore generation request volumes
  - AI generation success and failure trends

#### **OpenTelemetry** - Distributed Tracing

- **Integration**: Built into FastAPI application
- **Capabilities**:
  - End-to-end request tracing across services
  - AI generation pipeline visibility
  - Database query performance analysis
  - Cache operation tracing

#### **Loki** - Centralized Logging

- **Purpose**: Log aggregation and search
- **Features**:
  - Structured application logs
  - Error tracking and alerting
  - Request/response logging
  - AI generation audit trails

#### **Sentry** - Error Monitoring ✅

- **Purpose**: Real-time error tracking and alerting
- **Features**:
  - Automatic capture of exceptions and errors
  - Contextual breadcrumbs for debugging
  - Performance monitoring integration
  - Alert notifications via email, Slack, etc.

### 🚨 Alerting & Health Checks

**Automated Alerts:**

- High error rates (>5% over 5 minutes)
- Slow response times (>2s p95 latency)
- Database connection failures
- Redis cache unavailability
- High system resource usage (>80% CPU/memory)

**Health Check Endpoints:**

- `/health` - Basic application health
- `/metrics` - Prometheus metrics endpoint
- `/ready` - Readiness probe for orchestration

---

## Running Locally (Development)

For development without Docker, you can run LoreSmith directly with Python:

### Prerequisites

- Python 3.10 or higher
- Redis server running locally or accessible remotely
- PostgreSQL database (optional, for persistence)
- OpenRouter API key set as environment variable

### Steps

1. **Clone and setup**:

   ```bash
   git clone https://github.com/mdombrov-33/loresmith.git
   cd loresmith
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**:

   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

3. **Start Redis locally**:

   ```bash
   redis-server
   ```

4. **Set environment variables**:

   - `OPENROUTER_API_KEY=your_api_key`
   - `REDIS_HOST=localhost`
   - `REDIS_PORT=6379`
   - `REDIS_DB=0`

5. **Run the application**:

   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

6. **Access the API**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🚀 Production Deployment Options

### Docker Compose (Recommended for most use cases)

The Docker Compose setup is production-ready and includes:

- Health checks and restart policies
- Persistent volumes for data
- Integrated monitoring and logging
- Resource limits and security configurations

### Kubernetes (For enterprise/high-scale deployments)

For organizations requiring advanced orchestration, auto-scaling, and high availability, Kubernetes deployment files are available in the `k8s/` folder.

**Kubernetes Benefits:**

- Automatic pod scaling and self-healing
- Advanced traffic management and load balancing
- Integration with cloud provider services
- GitOps-compatible deployment workflows

**To deploy on Kubernetes:**

```bash
# Local development with Minikube
minikube start
minikube addons enable ingress
kubectl apply -f k8s/

# Production deployment
kubectl apply -f k8s/
kubectl rollout restart deployment/loresmith-backend
```

The Kubernetes setup includes ingress configuration for external access and can be extended with service mesh (Istio) and GitOps tools (ArgoCD) for advanced production requirements.

**Manual Deployment Approach:**

Kubernetes deployment remains manual for security and control reasons:

- **Local Environment Isolation**: GitHub runners don't have access to local Minikube clusters
- **Security Considerations**: Automated deployments require sensitive credentials
- **Deployment Control**: Manual deployment allows proper verification and rollback capabilities
- **Environment-Specific Configuration**: Different environments require tailored configurations

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

- **PostgreSQL Integration** ✅  
  Introducing persistent storage of AI-generated lore using PostgreSQL with SQLAlchemy 2.x and asyncpg.  
  This enables saving user-selected content, tracking generations, and supporting future analytics.

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

---

## ⚠️ Known Issues

The PostgreSQL database integration has some known issues in the Kubernetes deployment.

- Kubernetes database connection may cause runtime errors or 500 Internal Server Errors
- Database persistence in K8s environments requires further configuration refinement
- Local development with Docker Compose works reliably
- The project primarily focuses on AI lore generation and caching via Redis

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
