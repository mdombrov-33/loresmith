# Run 'make <command>' to execute(from root project directory)

# Build and run development environment (with hot reload)
docker-dev:
	docker compose -f docker-compose.dev.yml up --build

# Build and run production environment
prod:
	docker compose -f docker-compose.prod.yml up --build

# Run development environment (without building)
run-docker-dev:
	docker compose -f docker-compose.dev.yml up

# Run production environment (without building)
run-docker-prod:
	docker compose -f docker-compose.prod.yml up

# Stop development environment
stop-docker-dev:
	docker compose -f docker-compose.dev.yml down

# Stop production environment
stop-docker-prod:
	docker compose -f docker-compose.prod.yml down

# Clean up unused Docker resources
clean-docker:
	docker system prune -f