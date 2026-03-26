# =============================================================================
# Evelynn — Inference Service Makefile
# =============================================================================

SERVICE_DIR	 := services/inference
COMPOSE      := docker compose -f ${SERVICE_DIR}/docker-compose.yml
COMPOSE_PROD := docker compose -f ${SERVICE_DIR}/docker-compose.yml \
							   -f ${SERVICE_DIR}/docker-compose.prod.yml
COMPOSE_MON	 := docker compose -f ${SERVICE_DIR}/docker-compose.yml \
							   -f ${SERVICE_DIR}/docker-compose.monitoring.yml

.PHONY: help dev stop logs shell test test-local lint format typecheck \
		build push prod-up prod-down monitor monitor-stop clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
	awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# =============================================================================
# Development
# =============================================================================

dev: ## Start the inference service in development mode (hot reload)
	$(COMPOSE) up --build

stop: ## Stop all containers
	$(COMPOSE) down

logs: ## Tail container logs
	$(COMPOSE) logs -f inference

shell: ## Open a shell inside the running container
	$(COMPOSE) exec inference bash

# =============================================================================
# Testing & Quality
# =============================================================================

test: ## Run tests inside Docker (no local GPU/AWS needed)
	$(COMPOSE) run --rm inference \
		pytest --tb=short -v

test-local: ## Run tests locally (requires venv with dev deps)
	cd $(SERVICE_DIR) && pytest --tb=short -v

lint: ## Run ruff lint + format check
	cd $(SERVICE_DIR) && ruff check app/ tests/ && ruff format --check app/ tests/

format: ## Auto-fix formatting with ruff
	cd $(SERVICE_DIR) && ruff format app/ tests/ && ruff check --fix app/ tests/

typecheck: ## Run mypy type checker
	cd $(SERVICE_DIR) && mypy app/

# =============================================================================
# Docker
# =============================================================================

build: ## Build the production Docker image
	docker build \
		-t evelynn-inference:latest \
		-f $(SERVICE_DIR)/Dockerfile \
		$(SERVICE_DIR)

push: build ## Build and push to GHCR (requires IMAGE_TAG env var)
	@test -n "$(IMAGE_TAG)" || (echo "IMAGE_TAG is required, e.g. make push IMAGE_TAG=v1.0.0" && exit 1)
	docker tag evelynn-inference:latest \
		ghcr.io/$(shell git config --get remote.origin.url | sed 's/.*github.com[:/]//' | sed 's/\.git//')/evelynn-inference:$(IMAGE_TAG)
	docker push \
		ghcr.io/$(shell git config --get remote.origin.url | sed 's/.*github.com[:/]//' | sed 's/\.git//')/evelynn-inference:$(IMAGE_TAG)

# =============================================================================
# Production (local)
# =============================================================================

prod-up: ## Start with production compose overlay
	$(COMPOSE_PROD) up -d

prod-down: ## Stop production stack
	$(COMPOSE_PROD) down

# =============================================================================
# Monitoring
# =============================================================================

monitor: ## Start app + Prometheus + Grafana
	$(COMPOSE_MON) up --build
	@echo ""
	@echo "  Prometheus : http://localhost:9090"
	@echo "  Grafana    : http://localhost:3001 (admin / admin)"
	@echo "  App        : http://localhost:8000/docs"
	@echo ""

monitor-stop: ## Stop monitoring stack
	$(COMPOSE_MON) down

# =============================================================================
# Cleanup
# =============================================================================

clean: ## Remove containers, volumes, and dangling images
	$(COMPOSE) down -v --remove-orphans
	docker image prune -f