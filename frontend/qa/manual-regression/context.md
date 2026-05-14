Workspace:
- Frontend repo: `/home/ubuntu/clinic-projects/clinic-booking-systemc-frontend`
- Backend repo used by E2E prepare: `/home/ubuntu/clinic-projects/clinic-booking-system`

Primary goal:
- Run long-lived manual regression testing with MCP Playwright against the current application and keep persistent QA state in markdown files.

Environment facts:
- Frontend uses Vite and Playwright.
- Frontend `.env` sets:
  - `VITE_API_BASE_URL=http://localhost:8080`
  - `VITE_USE_MOCK_BACKEND=false`
- Existing E2E prepare script: `scripts/e2e-prepare.sh`
- Existing commands from `package.json`:
  - `npm run dev`
  - `npm run test:e2e:prepare`
  - `npm run test:e2e:smoke`
  - `npm run test:e2e:critical`
  - `npm run test:e2e:feature-contract`

Suggested local run flow:
1. From frontend repo, run `npm run test:e2e:prepare` if backend/data may be stale.
2. Start frontend dev server with `npm run dev`.
3. Use MCP Playwright to open the running app.
4. Execute the next highest-priority manual cases from the QA inventory.
5. Capture evidence and update QA markdown files before ending the turn.

Known routes from the route coverage contract and app router:
- Public:
  - `/`
  - `/login`
  - `/register`
  - `/forgot-password`
  - `/verify-email`
  - `/verify-phone`
- Patient:
  - `/dashboard`
  - `/find-doctors`
  - `/appointments/book`
  - `/appointments`
  - `/payments`
  - `/medical-records`
  - `/health-metrics`
  - `/family`
  - `/notifications`
  - `/patient/consultations`
  - `/profile`
  - `/profile/security`
  - `/profile/notifications`
- Doctor:
  - `/dashboard`
  - `/doctor/appointments`
  - `/schedule`
  - `/patients`
  - `/consultations`
  - `/doctor/analytics`
  - `/doctor/create-medical-record`
  - `/profile`
- Admin:
  - `/dashboard`
  - `/users`
  - `/doctors`
  - `/admin/clinics`
  - `/admin/services`
  - `/admin/rooms`
  - `/admin/reports`
  - `/profile`

Deterministic accounts referenced by existing E2E docs and tests:
- Patient: `patient1@clinic.com / password`
- Doctor: `dr.sarah@clinic.com / password`
- Admin: `admin@clinic.com / password`
- Real-mode fallback accounts seen in frontend tests:
  - `patient.1@healthflow.vn / password`
  - `doctor.1@healthflow.vn / password`
  - `admin.1@healthflow.vn / password`

Existing repo signals worth reusing:
- Route contract: `tests/e2e/contracts/routeCoverage.contract.js`
- Existing Playwright specs:
  - `tests/e2e/specs/public-routes.spec.js`
  - `tests/e2e/specs/auth-flows.spec.js`
  - `tests/e2e/specs/cross-role-authorization.spec.js`
  - `tests/e2e/specs/patient-exhaustive.spec.js`
  - `tests/e2e/specs/doctor-exhaustive.spec.js`
  - `tests/e2e/specs/admin-exhaustive.spec.js`
  - `tests/e2e/specs/negative-and-resilience.spec.js`
  - `tests/e2e/specs/consultation-realtime.spec.js`

Artifacts and notes:
- Prefer saving screenshots, traces, logs, and exported pages under `qa/manual-regression/artifacts/` when practical.
- Record absolute artifact paths in the QA logs.
- Use UTC timestamps in markdown updates.

Quality bar:
- Manual testing must cover all current functional areas over time, not just auth smoke.
- Bugs need reproduction steps, expected vs actual behavior, and evidence.
- Coverage must remain resumable for the next turn without re-discovery.
