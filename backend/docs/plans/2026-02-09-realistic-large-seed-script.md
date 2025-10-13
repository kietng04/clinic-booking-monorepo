# Realistic Large Data Reset & Seed Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build one script that clears all service databases and inserts large, realistic clinic data for demo and load-style local testing.

**Architecture:** A Bash orchestrator executes deterministic SQL blocks inside each PostgreSQL Docker container. The script truncates non-migration tables, resets identities, and reseeds coherent records (users, family members, clinics, schedules, appointments, medical records, prescriptions, consultations/messages, payments/transactions/refunds). Seed scale is configurable via environment variables.

**Tech Stack:** Bash, Docker CLI, PostgreSQL SQL/PLpgSQL (`psql`), existing docker-compose containers.

---

### Task 1: Define and test script contract (TDD RED)

**Files:**
- Create: `scripts/tests/reset_and_seed_smoke_test.sh`
- Test: `scripts/tests/reset_and_seed_smoke_test.sh`

1. Write smoke test asserting script file exists and supports `--help`.
2. Run smoke test and confirm FAIL before script exists.
3. Keep this as regression contract.

### Task 2: Implement reset + realistic seed script (TDD GREEN)

**Files:**
- Create: `scripts/reset_and_seed_all_dbs.sh`
- Modify: `scripts/tests/reset_and_seed_smoke_test.sh`

1. Add strict Bash mode and Docker/psql helper.
2. Add configurable scale vars with production-like defaults.
3. Add DB reset block for each database (`TRUNCATE ... RESTART IDENTITY CASCADE`) excluding `flyway_schema_history` and keeping `permissions` + `medications` baseline where useful.
4. Add realistic data seed SQL for each DB:
   - user: patients, doctors, admins/receptionists, family members, verification/password tokens.
   - appointment: clinics/rooms/services/prices, schedules, appointments, notifications.
   - medical: records, prescriptions linked to meds, metrics timeline.
   - consultation: lifecycle statuses + message conversations.
   - payment: orders, payment txns, refunds consistent with status.
5. Add post-seed summary counts output.

### Task 3: Apply requested environment values

**Files:**
- Modify: `.env`

1. Set `CLOUDINARY_URL`, `AVATAR_MAX_FILE_SIZE_BYTES`, `AVATAR_FOLDER` in backend `.env` according to provided values.
2. Validate frontend `.env` already matches requested values.

### Task 4: Verify end-to-end and data realism

**Files:**
- Verify only (no file required)

1. Run smoke test.
2. Run seed script with default scale.
3. Query all key tables and verify non-trivial counts.
4. Print sample rows (names/statuses/topics) to ensure realistic quality.
5. Report exact commands and outcome.
