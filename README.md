# RepoPilot Testbed

This repository is the deterministic demo target for the RepoPilot Agent Infra project.

It contains production-realistic defects that can be reproduced without external services. The repository is designed for an auditable maintenance exercise:

1. A GitHub Issue describes the observed behavior.
2. CI supplies a deterministic failing regression test.
3. RepoPilot triages, locates, patches, verifies, and archives the repair.
4. RepoPilot may open a pull request, but it must not merge without human approval.

## Local validation

```bash
npm ci
npm run typecheck
npm test
```

## Demo scenarios

- `main`: zero-score normalization regression tracked by Issue #1.
- `repopilot/demo-webhook-replay-baseline`: concurrent retries of the same GitHub
  Issue delivery create and dispatch more than one maintenance task.

Demo baselines are intentionally red. Do not fix a defect directly on its
baseline branch; the repair should arrive through a RepoPilot pull request.
