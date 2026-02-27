# E2E Test Suite (Playwright, Real Backend)

## Purpose
This suite is the production gate for frontend + backend integration.

Key rules:
- Real backend only (`VITE_USE_MOCK_BACKEND=false`)
- Chromium only in gate mode
- Strict failure gate (any test failure blocks release)
- Legacy mock E2E specs are excluded from the gate run

## Prepare Environment
From `clinic-booking-systemc-frontend`:

```bash
npm run test:e2e:prepare
```

What it does:
1. Starts backend docker stack
2. Resets and seeds all DBs (`--small` profile by default)
3. Seeds deterministic E2E accounts
4. Runs gateway/auth preflight

## Run Commands
- Full gate suite: `npm run test:e2e`
- CI sequence: `npm run test:e2e:ci`
- Smoke subset: `npm run test:e2e:smoke`
- Critical subset: `npm run test:e2e:critical`
- Open HTML report: `npm run test:e2e:report`

## Deterministic Accounts
Default credentials (override via env if needed):
- Patient: `patient1@clinic.com / password`
- Doctor: `dr.sarah@clinic.com / password`
- Admin: `admin@clinic.com / password`

## Artifacts
- HTML report: `playwright-report/`
- JSON report: `test-results/e2e-results.json`
- Traces/screenshots on failure: `test-results/playwright-artifacts/`

## Notes
- Payment E2E is currently out of scope for gate tests.
- Mock-based legacy specs remain in `tests/e2e/*.spec.js` but are ignored by current config.
