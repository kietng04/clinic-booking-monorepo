# Next Targets

Update this file at the end of every loop turn so the same resumed agent can continue immediately.

## Priority Order
1. Untested High priority cases
2. Failed cases that need confirmation or narrower reproduction
3. Blocked cases that may be unblocked after environment changes
4. Medium priority coverage expansion

## Current Queue
- Catalog status:
  - No `Not started` rows remain in `coverage-status.md`.
- Highest-priority follow-up if another loop is needed:
  - Revalidate the newly reconfirmed cross-cutting regressions when fixes land:
    - `BUG-002` / `SC-X-020`
    - `BUG-003` / `SC-X-019`, `SC-X-021`
    - `BUG-006` / `SC-X-025`
  - Revalidate the open doctor profile validation regression when fixes land:
    - `BUG-007` / `SC-X-002`
- Retry doctor data-dependent blocked rows only after fresh context is available:
  - `SC-DOC-016`, `SC-DOC-018`, `SC-DOC-025`
- Reconfirm payment-history cases only after the service outage clears:
  - `SC-PAT-020`, `SC-PAT-036`, `SC-PAT-037`, `SC-PAT-038`, `SC-PAT-041`
- Revisit blocked patient data-dependent rows only after fresh data is available:
  - `SC-PAT-044`, `SC-PAT-047`, `SC-PAT-054`, `SC-PAT-064`
- Revalidate open bugs if related fixes land:
  - `BUG-001`, `BUG-003`, `BUG-013`, `BUG-022`, `BUG-023`, `BUG-024`, `BUG-025`, `BUG-026`, `BUG-027`, `BUG-028`, `BUG-029`, `BUG-030`, `BUG-031`, `BUG-032`, `BUG-033`, `BUG-034`
