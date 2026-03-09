# AGENTS.md

## Cursor Cloud specific instructions

### Overview

HealthFlow is a clinic booking system with a **React frontend** (`frontend/`) and **Java Spring Boot microservices backend** (`backend/`). The backend runs 8 services (eureka-server, api-gateway, user-service, appointment-service, medical-service, consultation-service, payment-service, chatbot-service) plus infrastructure (PostgreSQL x5, Redis, Kafka/Zookeeper, MailHog) via Docker Compose.

### Starting services

- **Backend**: `cd backend && docker compose up -d` — builds and starts all infrastructure + microservices. First run takes ~90s; subsequent starts are faster. Wait for all containers to report `(healthy)` via `docker compose ps`.
- **Frontend**: `cd frontend && npm run dev` — Vite dev server on port 3000.
- The frontend `.env` has `VITE_USE_MOCK_BACKEND=false` by default, so it connects to the real API Gateway at `localhost:8080`.

### Database seeding

Run `bash backend/scripts/reset_and_seed_all_dbs.sh --small` to populate all databases with demo data. Deterministic demo accounts (password: `password`):
- Patient: `patient.1@healthflow.vn`
- Doctor: `doctor.1@healthflow.vn`
- Admin: `admin.1@healthflow.vn`

### Running tests

- **Frontend unit tests**: `cd frontend && npx vitest --run` (18 test files, 59 tests)
- **Frontend E2E tests**: `cd frontend && npx playwright test` (requires Playwright browsers installed via `npx playwright install --with-deps`)
- **Frontend build**: `cd frontend && npm run build`
- **Backend tests**: `cd backend && ./mvnw test` (or per-module)

### Known issues

- The `npm run lint` command fails because no ESLint configuration file (`.eslintrc.*`) exists in the frontend — this is a pre-existing repo issue, not an environment problem.
- Docker must be installed and running (the environment needs `sudo dockerd` started and `sudo chmod 666 /var/run/docker.sock` for non-root access).
- The `version` attribute in `backend/docker-compose.yml` triggers a deprecation warning — safe to ignore.

### Ports

| Service | Port |
|---------|------|
| Frontend (Vite) | 3000 |
| API Gateway | 8080 |
| Eureka Server | 8761 |
| User Service | 8081 |
| Appointment Service | 8082 |
| Medical Service | 8083 |
| Payment Service | 8084 |
| Consultation Service | 8085 |
| Chatbot Service | 8086 |
| MailHog UI | 8025 |
