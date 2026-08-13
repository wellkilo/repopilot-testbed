# RepoPilot Testbed

This repository is the deterministic demo target for the RepoPilot Agent Infra project.

It intentionally contains a small but production-realistic bug in evaluation normalization. The repository is designed for an auditable maintenance exercise:

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

The initial `main` branch is intentionally red. Do not fix the defect directly on `main`; the repair should arrive through a RepoPilot pull request.
