Continue the existing long-running manual regression mission for the clinic frontend by using MCP Playwright against the real local frontend and backend until the QA catalog is fully closed.

Push coverage forward from the current state in `qa/manual-regression/`. Every turn must execute real browser checks, capture evidence, and update the persistent QA state files so the work remains resumable. Favor broad closure of remaining `Not started` rows first, then re-check blocked or failed rows only when environment or data conditions changed enough to make progress honest.

Do not restart discovery from scratch. Continue from the existing catalog, existing bug log, and existing execution history.

Keep each loop turn bounded. Prefer closing one coherent slice at a time, roughly 8-12 cases or another similarly sized chunk that can finish comfortably within the command timeout. Do not attempt to consume the entire remaining backlog in one turn if that would risk another timeout before the JSON state is returned.
