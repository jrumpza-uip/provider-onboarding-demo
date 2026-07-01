# ACME Health Provider Onboarding Demo

## Summary
Use Maestro Case Management as the primary design, not a standalone Maestro Flow. The source workflow is a long-running provider onboarding case with parallel workstreams, prerequisites, manual reviews, SLA risk, start-date changes, and 30/90-day follow-up. A Flow is better for a linear transaction; this needs persistent case state.

The demo should show ACME Health managing one provider from intake through post-start follow-up, with Maestro coordinating agents, RPA, Data Fabric, Action Center, and custom UIs.

## Source Documents
Use these source artifacts located in /documentation as business-reference material only:

* Physician and APP Step by Step Workflow.pdf (for overall workflow guidance)
* NHDS (Revised v3) (002).pdf (example new hire data sheet)
* PAF.pdf (example personnel action form)
* INTRAFACILITY TRANSFER FORM - Blank.pdf (example intra-facility transfer employee data sheet)

Do not surface the source customer's name, logos, email domains, employee names, facility names, or document branding in demo artifacts. Use ACME Health naming, sanitized sample providers, and sanitized form/document variants.

## Deliverables
The intended deliverable is a demo-grade UiPath solution design that can be implemented as separate buildable artifacts:

* Maestro Case Management project as the top-level orchestrator.
* Data Fabric schema and sample seed records.
* RPA workflow projects for legacy/simulator UI automation.
* UiPath agents for triage, document validation, credential readiness, and touchpoint drafting.
* Coded web app for the ACME Onboarding Command Center.
* Coded action app or Action Center quick forms for human review tasks.
* Stand-in legacy/third-party simulator app for HRIS, ITSM, credentialing, and employee health interactions.

Case/RPA/agent assets should be solution-managed where applicable. Coded web apps and coded action apps deploy independently through `uip codedapp`, not as projects inside the `.uipx` solution.

## Key Design
* Maestro Case stages: Intake, Document Collection, HRIS/Transfer Setup, Employee Health and Credentialing, Pre-Start Readiness, Post-Start Touchpoints, Closeout and Reporting.
* Data Fabric entities: ProviderOnboardingRecord, OnboardingDocument, RequirementChecklist, OnboardingActivity.
* Optional Data Fabric entity: CommunicationDraft, only if the AI-drafted communication story needs its own review/audit table.
* Document handling: store PDFs in an Orchestrator Storage Bucket; store extracted metadata, missing-field summaries, confidence, storage paths, and reviewer decisions in Data Fabric.
* Agents: Intake Triage Agent, Document Extraction/Validation Agent, Credential Readiness Agent, and Touchpoint Concierge Agent.
* RPA workflows: automate an ACME HRIS simulator to create PCN/EID, an ACME ITSM simulator for transfer tickets, and an ACME credentialing/employee-health simulator for clearance updates.
* UIs: ACME Onboarding Command Center coded web app, Provider Intake Review coded action app or QuickForm, and a standalone legacy-system simulator app for RPA.

## Process Flow
1. Case starts from uploaded onboarding packet or manual intake.
2. Intake Agent classifies hire category and determines required packets/forms.
3. Document Agent extracts and validates New Hire Data Sheet, Personnel Action Form, transfer form, I-9/background/license/credentialing evidence.
4. Human reviewer approves extracted data and resolves missing fields.
5. Case gates HRIS submission until packet, I-9, and background prerequisites are complete.
6. RPA creates PCN/EID in the HRIS simulator and writes results back to Data Fabric.
7. Credentialing and Employee Health run in parallel with human exception review for delays.
8. Pre-start stage handles badge, orientation, start confirmation, or start-date push.
9. Touchpoint Agent drafts Day 1, 5-day, 30-day, and 90-day follow-up messages for human approval.
10. Command Center shows SLA risk, missing items, clearances, next actions, and weekly report-outs.

## Data Fabric Model
Use a compact model for the first demo. Avoid over-normalizing unless reporting or UI behavior requires it.

### ProviderOnboarding_MainRecord
The main case row. One record per provider onboarding.

Suggested fields:
* CandidateName
* HireCategory
* ProviderSpecialty
* FacilityName
* TargetStartDate
* OnboardingPhase
* ClearanceState
* SlaRiskLevel
* AssignedNavigator
* EmployeeIdentifier
* PositionControlNumber
* ItsmTicketNumber
* NextAction

### ProviderOnboarding_Documents
One row per submitted document or form.

Suggested fields:
* ProviderRecord
* DocumentCategory
* SourceFileName
* ReceivedAt
* ExtractionState
* ExtractionConfidence
* MissingFieldSummary
* ReviewerDecision
* StorageBucketPath

This can cover New Hire Data Sheet, PAF, transfer form, I-9, background check, license, CDS, DEA, OIG/debarment, MSO forms, and payor forms.

### ProviderOnboarding_RequirementChecklist
One row per required onboarding item.

Suggested fields:
* ProviderRecord
* RequirementCategory
* OwnerGroup
* DueDate
* CompletedAt
* RequirementState
* IsBlocking
* RequirementNotes

This absorbs credentialing, employee health, background, license, onboarding packet, HRIS, and badge/orientation checklist items.

### ProviderOnboarding_Activity
Timeline/audit/event table.

Suggested fields:
* ProviderRecord
* ActivityCategory
* SourceSystem
* ActivityOwner
* ActivityTimestamp
* ActivityOutcome
* MessageSummary
* ExternalReference

This covers communications, RPA transactions, touchpoints, start-date pushes, weekly report-outs, exceptions, and case milestones.

### Optional: ProviderOnboarding_CommunicationDraft
Add only if the demo needs a richer AI-agent review story around drafted emails/touchpoints.

Suggested fields:
* ProviderRecord
* DraftCategory
* Audience
* DraftText
* DraftState
* ReviewerDecision
* ApprovedAt

## Human Handoffs
* Intake review: confirm extracted demographics, role, facility, hire category, compensation/stipend, and missing documents.
* HRIS approval: approve PCN/EID submission only when required prerequisites are met.
* Credentialing exception: review missing license, DEA/CDS, background, exclusion, or payor forms.
* Start-date push: approve revised start date and generated explanation.
* Touchpoint approval: review AI-drafted employee/manager communications before sending.

## Demo Acceptance Criteria
* Upload packet, AI extracts key fields, and a human validates missing or low-confidence data.
* Maestro blocks HRIS submission until packet, I-9, and background prerequisites are complete.
* RPA creates or updates PCN/EID/ticket data in the simulator and writes results back to Data Fabric.
* Parallel credentialing and employee-health workstreams are visible in the case and dashboard.
* SLA risk appears when clearances delay the start date.
* An agent drafts a start-date push or touchpoint message and routes it for human approval.
* Command Center reflects case state, checklist completion, missing documents, next actions, and weekly report-out data.

## Test Plan
* Happy path: full-time provider with complete packet reaches start confirmation and post-start touchpoints.
* Missing document path: case pauses, requests missing evidence, resumes after reviewer approval.
* Internal transfer path: transfer details route through the ITSM simulator and HRIS update.
* Credentialing delay path: SLA risk appears, start-date push is generated, human approves.
* RPA path: robot logs into simulator, creates external record, returns ID/ticket values.
* Dashboard path: Command Center reflects every state change from Data Fabric and Maestro.

## Open Decisions
* Decide whether agents should be low-code Agent Builder projects or coded Python agents.
* Decide whether Data Fabric entities should be created in the tenant during the demo build or represented with local seed/mock data first.
* Decide whether the legacy simulator app should be local-only for RPA capture or deployed as a coded web app.
* Decide whether to produce an SDD first, then derive implementation tasks, or move directly into building the demo artifacts.
* Decide whether human review should use QuickForms for speed or coded action apps for a richer branded UI.

## Assumptions
* Demo branding uses ACME Health only.
* Build should be demo-grade, not production-hardened.
* Case Management is the top-level orchestrator; Flow is optional only for small subordinate automations if implementation later needs it.
* Existing PDFs are source examples; implementation should create sanitized sample data and forms.
* Data Fabric field names should avoid reserved words such as Case, Status, Type, User, Role, Order, Select, From, Where, Group, and Key.
