Workspace:
- Frontend repo: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend`
- Backend repo: `/home/ubuntu/clinic-projects/clinic-booking-system`
- Existing QA state directory: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression`
- Previous long-running loop artifacts: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend/qa/manual-regression/runs/20260317T134435Z-full-catalog`
- Previous thread id: `019cfc0a-8e66-7ed1-862e-3e469b415610`

Current QA facts as of 2026-03-18 UTC:
- `coverage-status.md` currently totals: 166 Passed, 44 Failed, 15 Blocked, 43 Not started, 2 Skipped.
- The latest recorded turn in `execution-log.md` is 2026-03-17T16:09:18Z and still reports unfinished coverage.
- `next-targets.md` currently prioritizes untested cross-role validation and auth coverage:
  - `SC-X-001`, `SC-X-002`, `SC-X-005`, `SC-X-009`, `SC-X-010`, `SC-X-011`, `SC-X-012`, `SC-X-015`, `SC-X-016`
  - `SC-AUTH-013`, `SC-AUTH-017`, `SC-AUTH-018`, `SC-AUTH-019`, `SC-AUTH-022`, `SC-AUTH-023`, `SC-AUTH-032`, `SC-AUTH-034`, `SC-AUTH-035`, `SC-AUTH-036`, `SC-AUTH-037`, `SC-AUTH-038`, `SC-AUTH-039`
- There are still many `Not started` rows in `coverage-status.md`, including most of the remaining `SC-X-*` validation catalog.

Behavior and execution expectations:
- Read and trust the current QA markdown files first:
  - `qa/manual-regression/test-cases.md`
  - `qa/manual-regression/coverage-status.md`
  - `qa/manual-regression/bug-log.md`
  - `qa/manual-regression/execution-log.md`
  - `qa/manual-regression/next-targets.md`
- Use real backend mode, not mock mode.
- If the environment is stale, run the existing E2E preparation flow before testing.
- If the frontend is down, restore it yourself.
- Use MCP Playwright for the actual manual checks, screenshots, console/network capture, and route validation.
- Save artifacts under `qa/manual-regression/artifacts/<timestamp>/` and record absolute paths.
- Update all persistent QA files before ending each loop turn.
- For every failed behavior, ensure a matching bug entry exists with reproduction steps, expected vs actual, and evidence.
- If a case cannot be honestly completed because of missing data or environment constraints, mark it `Blocked` with evidence instead of guessing.

Useful repo signals:
- Existing E2E prepare command: `npm run test:e2e:prepare`
- Existing local frontend command: `npm run dev -- --host 127.0.0.1 --port 3000`
- Existing contract/spec files:
  - `tests/e2e/contracts/routeCoverage.contract.js`
  - `tests/e2e/specs/public-routes.spec.js`
  - `tests/e2e/specs/auth-flows.spec.js`
  - `tests/e2e/specs/cross-role-authorization.spec.js`
  - `tests/e2e/specs/patient-exhaustive.spec.js`
  - `tests/e2e/specs/doctor-exhaustive.spec.js`
  - `tests/e2e/specs/admin-exhaustive.spec.js`
  - `tests/e2e/specs/negative-and-resilience.spec.js`
  - `tests/e2e/specs/consultation-realtime.spec.js`

Known seeded accounts:
- Patient: `patient1@clinic.com / password`
- Doctor: `dr.sarah@clinic.com / password`
- Admin: `admin@clinic.com / password`
- Fallback real-mode accounts:
  - `patient.1@healthflow.vn / password`
  - `doctor.1@healthflow.vn / password`
  - `admin.1@healthflow.vn / password`

Important constraint:
- This is a long-running coverage mission. Do not claim completion unless every row in the catalog is no longer `Not started` and every failed row has a bug entry.
