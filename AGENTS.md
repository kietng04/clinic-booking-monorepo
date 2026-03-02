# AGENTS.md

## Cursor Cloud specific instructions

### Overview

This is a **HealthFlow** clinic booking monorepo with:

- **Frontend** (`frontend/`): React 18 + Vite SPA (port 3000)
- **Backend** (`backend/`): Java 21 Spring Boot microservices with Docker Compose orchestration

### Frontend

- Package manager: **npm** (lockfile: `package-lock.json`)
- Dev server: `npm run dev` (Vite on port 3000)
- Unit tests: `npx vitest --run` (52 vitest tests pass; ignore the 10 Playwright E2E "failures" — those are E2E test files incorrectly picked up by vitest and not actual vitest test failures)
- Build: `npm run build` (Vite production build)
- Lint: The `npm run lint` command is defined in `package.json` but the ESLint config file is **missing** from the repo. Lint will fail until an `.eslintrc.cjs` or equivalent is added.
- E2E tests require Playwright browsers installed (`npx playwright install`) and the full backend running.
- The `.env` file has `VITE_USE_MOCK_BACKEND=false` by default, pointing the frontend at the real backend API gateway on port 8080. Set to `true` to use mock data without a backend.

### Backend

- Build: `cd backend && mvn clean package -DskipTests`
- Tests: `cd backend && mvn test` — some pre-existing test failures exist in `user-service` (locale-dependent month-name assertion), `appointment-service`, and `payment-service`. `eureka-server`, `api-gateway`, `medical-service`, and `consultation-service` tests pass cleanly.
- Infrastructure: `cd backend && docker compose up -d` starts all 16 containers (5 PostgreSQL instances, Redis, Kafka, Zookeeper, MailHog, Eureka, API Gateway, and 5 microservices).
- See `backend/README.md` for full service list and troubleshooting.

### Starting services

1. Start Docker daemon: `sudo dockerd &>/tmp/dockerd.log &` (wait ~5s), then `sudo chmod 666 /var/run/docker.sock`
2. Build backend JARs: `cd /workspace/backend && mvn clean package -DskipTests`
3. Start all containers: `cd /workspace/backend && docker compose up -d` (takes ~2–3 min for all services to become healthy due to sequential health-check dependencies)
4. Seed databases: `cd /workspace/backend && bash scripts/reset_and_seed_all_dbs.sh --small` then `bash scripts/seed_e2e_accounts.sh`
5. Start frontend: `cd /workspace/frontend && npx vite --host 0.0.0.0 --port 3000`

### Key gotchas

- **Auth route path**: The API gateway exposes auth endpoints at `/api/auth/**` (no JWT filter). All other routes at `/api/users/**`, `/api/appointments/**`, etc. require a JWT token via `AuthenticationFilter`.
- **Seeded test accounts** (password is `password` for all):
  - `patient1@clinic.com` (PATIENT)
  - `dr.sarah@clinic.com` (DOCTOR)
  - `admin@clinic.com` (ADMIN)
- **Docker in Cloud Agent**: Requires `fuse-overlayfs` storage driver, `iptables-legacy`, and `sudo chmod 666 /var/run/docker.sock` after starting `dockerd`.
- **Maven** must be installed separately (`sudo apt-get install -y maven`).
- The `docker-compose.yml` `version` attribute triggers a warning but is harmless.
- Medical and payment services depend on user-service and appointment-service being healthy first, so full stack startup takes ~3 minutes.
