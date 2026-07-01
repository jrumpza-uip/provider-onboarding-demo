# Provider Onboarding Demo Solution Design

## Scope

Build a demo-grade UiPath solution for ACME Health provider onboarding. Maestro Case Management is the top-level orchestrator because the process is long-running and needs persistent case state, manual review, parallel workstreams, SLA visibility, and post-start follow-up.

## Case Stages

1. Intake
2. Document Collection
3. HRIS / Transfer Setup
4. Employee Health and Credentialing
5. Pre-Start Readiness
6. Post-Start Touchpoints
7. Closeout and Reporting

## Included UiPath Artifact

The solution contains one registered Case Management project:

- `provider-onboarding-case`
- Case definition: `provider-onboarding-case/content/caseplan.json`
- Case identifier prefix: `POD`

The case includes representative placeholder tasks for:

- Intake Triage Agent
- Document Extraction and Validation Agent
- Credential Readiness Agent
- Touchpoint Concierge Agent
- HRIS, ITSM, and Employee Health simulator RPA
- Human review actions for intake, document exceptions, HRIS approval, credentialing exceptions, start-date push, touchpoints, and closeout
- Demo timers for missing documents, SLA risk, and follow-up cadence

## Data Fabric Model

The compact Data Fabric model is captured in `data/data-fabric-schema.json`.

Entities:

- `ProviderOnboarding_MainRecord`
- `ProviderOnboarding_Documents`
- `ProviderOnboarding_RequirementChecklist`
- `ProviderOnboarding_Activity`
- `ProviderOnboarding_CommunicationDraft`

## Independent Artifacts

These are represented as named placeholder tasks in the case and should be built/deployed separately when the demo is expanded:

- ACME Onboarding Command Center coded web app
- Provider Intake Review coded action app or Action Center form
- HRIS, ITSM, credentialing, and employee-health simulator RPA projects
- Four UiPath agents for triage, document validation, credential readiness, and touchpoint drafting

## Sanitization Rules

All demo artifacts use ACME Health names, sample providers, and example-domain addresses. Source PDFs in the repository are business references only and are not copied into this design.

## Acceptance Coverage

- Packet intake and AI triage are represented by the Intake stage.
- Document extraction, validation, and human review are represented by Document Collection.
- HRIS submission is gated behind required stage and task completion rules.
- Simulator automation is represented by RPA placeholder tasks.
- Credentialing and employee health run as parallel lanes inside one stage.
- SLA risk and follow-up paths are represented by timer tasks.
- Human approval is represented by Action Center placeholder tasks.
- Weekly report-out is represented by the Closeout and Reporting stage.
