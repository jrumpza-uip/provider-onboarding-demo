# Provider Onboarding Demo

UiPath demo solution for ACME Health provider onboarding.

## Contents

- `provider-onboarding-case/` - Maestro Case Management project.
- `docs/solution-design.md` - sanitized solution design based on `PROMPT.md`.
- `data/data-fabric-schema.json` - compact Data Fabric entity schema.
- `data/sample-seed-records.json` - sanitized sample records for demo setup.

## Validation

Run from this directory:

```bash
../node_modules/.bin/uip maestro case validate provider-onboarding-case/content/caseplan.json
../node_modules/.bin/uip solution upload . --force
```
