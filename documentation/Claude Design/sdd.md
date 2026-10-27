# SDD — ProviderOnboarding

Case Definition Blueprint for the Provider Onboarding demo. Defines the Maestro case plan
that orchestrates onboarding a new provider at a hospital system, from the moment a
navigator enters a candidate email address through to confirmed start.

## Table of Contents

1. [Case Definition](#section-1-case-definition) — Metadata, Triggers, Exit Conditions, Variables
2. [Stages & Tasks](#section-2-stages--tasks)
   - [Stage 1: Initial Intake](#stage-1-initial-intake) — 7 tasks
   - [Stage 2: Collection](#stage-2-collection) — 14 tasks
   - [Stage 3: Onboarding Confirmed](#stage-3-onboarding-confirmed) — 3 tasks
3. [Personas & App Views](#section-3-personas--app-views)
4. [Integrations](#section-4-integrations)
5. [External Contracts](#section-5-external-contracts)
6. [Open Items](#section-6-open-items)

---

## Section 1: Case Definition

### Case Metadata

| Property | Value |
|----------|-------|
| Case Name | ProviderOnboarding |
| Case Description | Manages onboarding of a newly hired provider at Spearwell Health. Tracks seven documents owed by the new hire and five clearance items owed by internal teams, sends reminders on demand, and completes when every item is satisfied. |
| Case Identifier | Type: constant. Prefix: `POD` |
| Priority | Choiceset: Low, Medium, High — Default: Medium |
| Case-Level SLA | — |
| SLA Type | — |
| Case App | Enabled |
| Task-output passing | Direct |
| Case Identifier source | `=metadata.ExternalId` |

SLA and escalation are intentionally omitted. This is a demo following a happy path; SLA
rules add configuration surface without adding anything to the story being told.

### Case Triggers

| T# | Trigger Type | Source | Configuration |
|----|-------------|--------|---------------|
| T02 | Manual | Manual | N/A |

The case is started from the Main App, which supplies the candidate's email address.
Ingestion of inbound email is deliberately NOT a case trigger — see
[Section 5](#section-5-external-contracts).

### Case Exit Conditions

| WHEN | IF | THEN | Marks Case Complete | Display Name |
|------|-----|------|---------------------|--------------|
| `required-stages-completed` | — | Case exited | Yes | — |

### Case Variables

| Name | Category | Type | sourceTriggers | sourceFields | Default | Description |
|------|----------|------|----------------|--------------|---------|-------------|
| candidateEmail | In | string | | | | Email address of the new hire, entered by the navigator in the Main App |
| mainRecordId | Variable | string | | | | Id of the ProviderOnboardingMainRecord row for this case |
| candidateName | Variable | string | | | | Full name of the new hire |
| targetStartDate | Variable | date | | | | Planned first day, read from the candidate list |

Deliberately absent: variables mirroring the twelve tracked items. Each item is represented
by a wait task, so task completion is the state. Adding twelve boolean case variables would
duplicate state that already lives in Data Fabric and on the canvas.

---

## Section 2: Stages & Tasks

### Shared Connector Configuration

Two connector configurations are referenced throughout this section. Each connector task
detail block below names which one it uses rather than repeating it.

**DF — UiPath Data Fabric**

- Connector: UiPath Data Fabric · Connector Key: `uipath-uipath-dataservice`
- Connection: Data Service #11 · Connection ID: `c2d32951-ee8f-49c9-89fd-f1410ee4f86f`
- Activity Type ID: `<UNRESOLVED>` — resolved per operation at build time
- Auth Method: `—`
- Account / Endpoint: `—`

**MAIL — Microsoft Outlook 365**

- Connector: Microsoft Outlook 365 · Connector Key: `uipath-microsoft-outlook365`
- Connection: joseph.rumpza@uipath.com · Connection ID: `36e7d52f-b038-4898-8d71-db84048d3eb7`
- Activity Type ID: `<UNRESOLVED>` — resolved at build time
- Auth Method: `—`
- Account / Endpoint: `—`
- Operation: Send Email

Use the `uipath-microsoft-outlook365` connector, not the `uipath-microsoft-outlook365ews`
legacy variant.

### Folder topology

The case plan is deployed to `AMER Presales/HLS/Demo/Provider Onboarding/Provider Onboarding Solution`
(`8e11695d-0656-4b70-937c-266e7b6e7475`). Everything it addresses lives one level up, in
`AMER Presales/HLS/Demo/Provider Onboarding` (`43da200c-7c81-49b9-8831-9467eedb697b`) —
all four Data Fabric entities and the Outlook connection. Every connector task in this case
therefore reaches across the folder boundary from child to parent.

This has been verified by reading a parent-folder entity while scoped to the solution
folder: Data Fabric resolves entities by id and does not gate on the folder key. Note that
entities scoped to the solution folder list as empty — that reflects where the entities
live, not whether they are reachable.

---

### Stage 1: Initial Intake

**Type:** Stage
**Description:** Establishes the case. Resolves the candidate from the seeded candidate
list, creates the tracking record, then issues the outbound requests that everything else
in the case waits on — one email to the new hire listing all seven required documents, and
three emails to the internal owners of the five clearance items.
**Required for Case Completion:** Yes

#### Stage Entry Conditions

| WHEN | IF | Interrupting | Display Name |
|------|-----|-------------|--------------|
| `case-entered` | — | No | — |

#### Stage Exit Conditions

| WHEN | IF | Exit Type | Marks Stage Complete | Display Name |
|------|-----|-----------|---------------------|--------------|
| `required-tasks-completed` | — | exit-only | Yes | — |

#### Tasks

| # | Task Name | Type | Required | Run Only Once | Persona | SLA |
|---|-----------|------|----------|---------------|---------|-----|
| 1 | Look Up Candidate | execute-connector-activity | Yes | Yes | — | — |
| 2 | Create Onboarding Record | execute-connector-activity | Yes | Yes | — | — |
| 3 | Send Welcome Email | execute-connector-activity | Yes | Yes | — | — |
| 4 | Send HR Request | execute-connector-activity | Yes | Yes | — | — |
| 5 | Send HRIS Request | execute-connector-activity | Yes | Yes | — | — |
| 6 | Send Employee Health Request | execute-connector-activity | Yes | Yes | — | — |
| 7 | Log Case Started | rpa | Yes | Yes | — | — |

All seven tasks carry `runs-sequentially` as their only entry condition. The order matters:
the record must exist before its id can go into an email subject line.

##### Task 1.1: Look Up Candidate

**Type:** execute-connector-activity
**Description:** Finds the new hire in the seeded candidate list using the email address
supplied at case start, and pulls forward the name and planned start date that later emails
and the status summary depend on.

**Entry Condition:**

| WHEN | IF | Display Name |
|------|-----|--------------|
| `runs-sequentially` | — | — |

| Required | Run Only Once | Skip Condition |
|----------|---------------|----------------|
| Yes | Yes | — |

**Connector:** DF · **Operation:** Query Entity Records · **Trigger / Event:** —

**Inputs:**

| Field | Type | Binding |
|-------|------|---------|
| entityName | string | `"ProviderOnboardingCandidateList"` |
| filter | string | Candidate email equals the address supplied at case start (`=vars.candidateEmail`) |

**Outputs:**

| Field | Binding / Value |
|-------|------------------|
| response.value[0].CandidateName | -> candidateName |
| response.value[0].StartDate | -> targetStartDate |

##### Task 1.2: Create Onboarding Record

**Type:** execute-connector-activity
**Description:** Creates the ProviderOnboardingMainRecord row that is the single source of
truth for this onboarding. Every wait task in Stage 2 filters on the id this task returns,
and the deployed email workflows write their flags to this same row.

**Entry Condition:**

| WHEN | IF | Display Name |
|------|-----|--------------|
| `runs-sequentially` | — | — |

| Required | Run Only Once | Skip Condition |
|----------|---------------|----------------|
| Yes | Yes | — |

**Connector:** DF · **Operation:** Create Entity Record · **Trigger / Event:** —

**Inputs:**

| Field | Type | Binding |
|-------|------|---------|
| entityName | string | `"ProviderOnboardingMainRecord"` |
| CandidateEmail | string | `=vars.candidateEmail` |
| CandidateName | string | `=vars.candidateName` |
| TargetStartDate | date | `=vars.targetStartDate` |
| CaseReferenceID | string | `=metadata.ExternalId` |
| OnboardingPhase | string | `"Initial Preboarding"` |
| FacilityName | string | `"Spearwell Health"` |

**Outputs:**

| Field | Binding / Value |
|-------|------------------|
| response.Id | -> mainRecordId |

##### Task 1.3: Send Welcome Email

**Type:** execute-connector-activity
**Description:** Sends the new hire a welcome message listing all seven documents they owe.
The subject carries the case correlation token so replies can be routed back to this case.

**Entry Condition:**

| WHEN | IF | Display Name |
|------|-----|--------------|
| `runs-sequentially` | — | — |

| Required | Run Only Once | Skip Condition |
|----------|---------------|----------------|
| Yes | Yes | — |

**Connector:** MAIL · **Operation:** Send Email · **Trigger / Event:** —

**Inputs:**

| Field | Type | Binding |
|-------|------|---------|
| to | string | `=vars.candidateEmail` |
| subject | string | Provider Onboarding, the case reference in square brackets, then "Documents Required" |
| body | string | Welcome message addressed to the candidate by name, listing the seven required documents: Government ID, headshot photo, list of credentials, I-9, NJ License / CDS / DEA, DCA / OIG / Debarment, and completed New Hire Paperwork. States the planned start date and asks the candidate to reply to this message with attachments. |

**Outputs:** none.

##### Task 1.4: Send HR Request

**Type:** execute-connector-activity
**Description:** Asks HR to complete the three clearance items they own — the background
check, the cleared-to-hire list entry, and confirmation of the start date.

**Entry Condition:**

| WHEN | IF | Display Name |
|------|-----|--------------|
| `runs-sequentially` | — | — |

| Required | Run Only Once | Skip Condition |
|----------|---------------|----------------|
| Yes | Yes | — |

**Connector:** MAIL · **Operation:** Send Email · **Trigger / Event:** —

**Inputs:**

| Field | Type | Binding |
|-------|------|---------|
| to | string | HR owner address for the Background Check, New Hire List and start-date items |
| subject | string | Provider Onboarding, the case reference in square brackets, then "HR Action Required" |
| body | string | Names the candidate and start date, and asks HR to confirm three items by replying: background check complete, candidate added to the cleared-to-hire list, and start date confirmed or pushed. |

**Outputs:** none.

##### Task 1.5: Send HRIS Request

**Type:** execute-connector-activity
**Description:** Asks the HRIS team to create the employee identifier for this hire.

**Entry Condition:**

| WHEN | IF | Display Name |
|------|-----|--------------|
| `runs-sequentially` | — | — |

| Required | Run Only Once | Skip Condition |
|----------|---------------|----------------|
| Yes | Yes | — |

**Connector:** MAIL · **Operation:** Send Email · **Trigger / Event:** —

**Inputs:**

| Field | Type | Binding |
|-------|------|---------|
| to | string | HRIS owner address for the EID item |
| subject | string | Provider Onboarding, the case reference in square brackets, then "HRIS Action Required" |
| body | string | Names the candidate and start date and asks HRIS to reply once the employee identifier has been created, including the identifier in the reply. |

**Outputs:** none.

##### Task 1.6: Send Employee Health Request

**Type:** execute-connector-activity
**Description:** Asks Employee Health to schedule the new hire's pre-employment physical.

**Entry Condition:**

| WHEN | IF | Display Name |
|------|-----|--------------|
| `runs-sequentially` | — | — |

| Required | Run Only Once | Skip Condition |
|----------|---------------|----------------|
| Yes | Yes | — |

**Connector:** MAIL · **Operation:** Send Email · **Trigger / Event:** —

**Inputs:**

| Field | Type | Binding |
|-------|------|---------|
| to | string | Employee Health owner address for the physical exam item |
| subject | string | Provider Onboarding, the case reference in square brackets, then "Employee Health Action Required" |
| body | string | Names the candidate and start date and asks Employee Health to reply once the physical has been scheduled. |

**Outputs:** none.

##### Task 1.7: Log Case Started

**Type:** rpa
**Description:** Writes the opening entry to the activity log so the case timeline and the
Main App both show when onboarding began.

**Entry Condition:**

| WHEN | IF | Display Name |
|------|-----|--------------|
| `runs-sequentially` | — | — |

| Required | Run Only Once | Skip Condition |
|----------|---------------|----------------|
| Yes | Yes | — |

**Resolved Resource:** RPA - Log Activity
**Folder Path:** AMER Presales/HLS/Demo/Provider Onboarding/Provider Onboarding Solution
**Resource Identity:** `95772472-9a76-45b4-87d2-d5fe05cd7d55`
**Binding Sub-Type:** —
**Dispatch / Operation:** —

**Inputs:**

| Field | Type | Binding |
|-------|------|---------|
| in_MainRecordId | string | `=vars.mainRecordId` |
| in_CaseInstanceid | string | `=metadata.ExternalId` |
| in_ActivityName | string | `"Onboarding Started"` |
| in_ActivityCategory | string | `"Case"` |
| in_ActivityDetails | string | `=js:("Onboarding case opened for " + vars.candidateName)` |
| in_SourceSystem | string | `"Maestro Case"` |

**Outputs:** none.

---

### Stage 2: Collection

**Type:** Stage
**Description:** The working stage of the case. Twelve parallel waits track the seven
documents owed by the new hire and the five clearance items owed by internal teams. Each
wait watches the onboarding record for its own flag turning true, so the case reacts to
processed state rather than to raw email. A navigator can request a status summary at any
point without disturbing the waits.
**Required for Case Completion:** Yes

#### Stage Entry Conditions

| WHEN | IF | Interrupting | Display Name |
|------|-----|-------------|--------------|
| `selected-stage-completed("Initial Intake")` | — | No | — |

#### Stage Exit Conditions

| WHEN | IF | Exit Type | Marks Stage Complete | Display Name |
|------|-----|-----------|---------------------|--------------|
| `required-tasks-completed` | — | exit-only | Yes | — |

The two status-summary tasks are `Required: No`, so they never gate completion. The stage
completes exactly when all twelve tracked items are satisfied.

#### Tasks

| # | Task Name | Type | Required | Run Only Once | Persona | SLA |
|---|-----------|------|----------|---------------|---------|-----|
| 1 | Await Government ID | wait-for-connector | Yes | Yes | — | — |
| 2 | Await Headshot Photo | wait-for-connector | Yes | Yes | — | — |
| 3 | Await Credential List | wait-for-connector | Yes | Yes | — | — |
| 4 | Await I-9 | wait-for-connector | Yes | Yes | — | — |
| 5 | Await License CDS DEA | wait-for-connector | Yes | Yes | — | — |
| 6 | Await DCA OIG Debarment | wait-for-connector | Yes | Yes | — | — |
| 7 | Await New Hire Paperwork | wait-for-connector | Yes | Yes | — | — |
| 8 | Await Background Check | wait-for-connector | Yes | Yes | — | — |
| 9 | Await Employee ID | wait-for-connector | Yes | Yes | — | — |
| 10 | Await Physical Scheduled | wait-for-connector | Yes | Yes | — | — |
| 11 | Await Cleared To Hire | wait-for-connector | Yes | Yes | — | — |
| 12 | Await Start Date Confirmation | wait-for-connector | Yes | Yes | — | — |
| 13 | Send Status Summary | agent | No | No | Navigator | — |
| 14 | Send Status Reminder | execute-connector-activity | No | No | — | — |

Tasks 1 through 7 are owed by the new hire. Tasks 8 through 12 are owed by internal teams.

##### Tasks 2.1 through 2.12: The tracked items

All twelve share an identical shape and differ only in which field they watch. Rather than
repeat the same block twelve times, the common definition is stated once here and the
per-task variation is tabulated below.

**Type:** wait-for-connector

**Entry Condition** (all twelve):

| WHEN | IF | Display Name |
|------|-----|--------------|
| `current-stage-entered` | — | — |

| Required | Run Only Once | Skip Condition |
|----------|---------------|----------------|
| Yes | Yes | — |

**Connector Rule Detail** (all twelve):

- Connector: UiPath Data Fabric
- Connection: Data Service #11
- Event: New record created
- Event Parameters: the entity named in the table below
- Filter: `MainRecordID` equals this case's onboarding record (`=vars.mainRecordId`) AND the
  discriminator field equals the value named in the table below.

**Connector Rule Outputs:** none. Each task is a gate; satisfying it is the whole point.

| # | Task Name | Entity | Discriminator | Value |
|---|-----------|--------|---------------|-------|
| 1 | Await Government ID | Documents | `DocumentType` | `Government ID` |
| 2 | Await Headshot Photo | Documents | `DocumentType` | `Headshot` |
| 3 | Await Credential List | Documents | `DocumentType` | `Credential List` |
| 4 | Await I-9 | Documents | `DocumentType` | `I-9` |
| 5 | Await License CDS DEA | Documents | `DocumentType` | `NJ License CDS DEA` |
| 6 | Await DCA OIG Debarment | Documents | `DocumentType` | `DCA OIG Debarment` |
| 7 | Await New Hire Paperwork | Documents | `DocumentType` | `New Hire Paperwork` |
| 8 | Await Background Check | ActivityLog | `ActivityName` | `Background Check Complete` |
| 9 | Await Employee ID | ActivityLog | `ActivityName` | `Employee ID Created` |
| 10 | Await Physical Scheduled | ActivityLog | `ActivityName` | `Physical Scheduled` |
| 11 | Await Cleared To Hire | ActivityLog | `ActivityName` | `Cleared To Hire` |
| 12 | Await Start Date Confirmation | ActivityLog | `ActivityName` | `Start Date Confirmed` |

Task descriptions, in order: each waits until the named document has been received and
processed (1 to 7), or until the named internal confirmation has been recorded (8 to 12).

Both watched entities are append-only, and that is the point. `ProviderOnboardingDocuments`
receives one record per uploaded file and `ProviderOnboardingActivityLog` receives one
record per logged event, so every event matches exactly one waiting task. No event has to
fan out to several subscribers.

This matters because the alternative does. `RPA - Process Received Documents` makes a
**single** update to the onboarding record carrying every flag it just set, so an email
bearing four documents produces one update event that four waits would have to share. The
same applies to the internal lane: one HR reply can confirm three items at once. Watching
the append-only entities sidesteps both cases.

The onboarding record's `Received*` and `Completed*` flags remain the source of truth for
the Main App checklist and the status agent. Only what the waits *watch* has changed; the
data model has not.

The cost of this choice is that record-created events are one-shot — unlike a state filter,
a missed event is not re-evaluated later. The only window is a document arriving before
Stage 2 is entered, which would require a reply within the few seconds Stage 1 takes to run.

##### Task 2.13: Send Status Summary

**Type:** agent
**Description:** Summarises the case on demand — what has been received, what is still
outstanding, and which person owns each outstanding item. Started by a navigator from the
Main App whenever they want a current picture, and re-runnable for the life of the case.

**Entry Condition:**

| WHEN | IF | Display Name |
|------|-----|--------------|
| `adhoc` | — | — |

| Required | Run Only Once | Skip Condition |
|----------|---------------|----------------|
| No | No | — |

**Resolved Resource:** Agent - Onboarding Status
**Folder Path:** AMER Presales/HLS/Demo/Provider Onboarding/Provider Onboarding Solution
**Resource Identity:** `6fc73437-5683-458a-9bbf-1477357b303b`
**Binding Sub-Type:** Agent
**Dispatch / Operation:** —

**Inputs:**

| Field | Type | Binding |
|-------|------|---------|
| recordId | string | `=vars.mainRecordId` |

**Outputs:** none held as case state. The agent returns `onboardingSummary` (a prose
end-of-day summary) and `openItems` (one entry per outstanding requirement, each carrying
the item, source field, category, responsible party, status and recommended next action).
The reminder task reads these directly.

##### Task 2.14: Send Status Reminder

**Type:** execute-connector-activity
**Description:** Emails the status summary to the owner of the outstanding work, so the
summary produced by the previous task actually reaches the person who has to act on it.

**Entry Condition:**

| WHEN | IF | Display Name |
|------|-----|--------------|
| `selected-tasks-completed("Send Status Summary")` | — | — |

| Required | Run Only Once | Skip Condition |
|----------|---------------|----------------|
| No | No | — |

**Connector:** MAIL · **Operation:** Send Email · **Trigger / Event:** —

**Inputs:**

| Field | Type | Binding |
|-------|------|---------|
| to | string | The new hire plus the three internal owners (HR, HRIS, Employee Health) |
| subject | string | Provider Onboarding, the case reference in square brackets, then "Outstanding Items" |
| body | string | `=js:vars.$xref('Collection','Send Status Summary','onboardingSummary')` |

**Outputs:** none.

The agent returns `openItems` as an array with a `responsibleParty` per entry, so a strictly
targeted reminder would mean one email per distinct party — an iteration the case plan
cannot express without an additional workflow. This task instead sends one email to all
owners, with the summary body naming who owns what. In this demo every contact resolves to
the same mailbox, so the two approaches are indistinguishable on screen. A production
build would iterate `openItems` and send per party.

---

### Stage 3: Onboarding Confirmed

**Type:** Stage
**Description:** Closes the case. Every document and clearance item is satisfied, so the
record is marked complete, the new hire and internal teams are told the provider is
confirmed to start, and the closing entry is written to the activity log.
**Required for Case Completion:** Yes

#### Stage Entry Conditions

| WHEN | IF | Interrupting | Display Name |
|------|-----|-------------|--------------|
| `selected-stage-completed("Collection")` | — | No | — |

#### Stage Exit Conditions

| WHEN | IF | Exit Type | Marks Stage Complete | Display Name |
|------|-----|-----------|---------------------|--------------|
| `required-tasks-completed` | — | exit-only | Yes | — |

#### Tasks

| # | Task Name | Type | Required | Run Only Once | Persona | SLA |
|---|-----------|------|----------|---------------|---------|-----|
| 1 | Mark Onboarding Complete | execute-connector-activity | Yes | Yes | — | — |
| 2 | Send Confirmation Email | execute-connector-activity | Yes | Yes | — | — |
| 3 | Log Onboarding Complete | rpa | Yes | Yes | — | — |

All three carry `runs-sequentially` as their only entry condition.

##### Task 3.1: Mark Onboarding Complete

**Type:** execute-connector-activity
**Description:** Advances the onboarding record to its final phase so downstream reporting
and the Main App both show the case as closed.

**Entry Condition:**

| WHEN | IF | Display Name |
|------|-----|--------------|
| `runs-sequentially` | — | — |

| Required | Run Only Once | Skip Condition |
|----------|---------------|----------------|
| Yes | Yes | — |

**Connector:** DF · **Operation:** Update Entity Record · **Trigger / Event:** —

**Inputs:**

| Field | Type | Binding |
|-------|------|---------|
| entityName | string | `"ProviderOnboardingMainRecord"` |
| recordId | string | `=vars.mainRecordId` |
| OnboardingPhase | string | `"Complete"` |
| NextAction | string | `"None - onboarding complete"` |

**Outputs:** none.

##### Task 3.2: Send Confirmation Email

**Type:** execute-connector-activity
**Description:** Tells the new hire and the internal owners that every requirement is
satisfied and the provider is confirmed to start.

**Entry Condition:**

| WHEN | IF | Display Name |
|------|-----|--------------|
| `runs-sequentially` | — | — |

| Required | Run Only Once | Skip Condition |
|----------|---------------|----------------|
| Yes | Yes | — |

**Connector:** MAIL · **Operation:** Send Email · **Trigger / Event:** —

**Inputs:**

| Field | Type | Binding |
|-------|------|---------|
| to | string | `=vars.candidateEmail` |
| subject | string | Provider Onboarding, the case reference in square brackets, then "Onboarding Complete" |
| body | string | Confirms to the candidate by name that all documentation and clearances are complete and states the confirmed start date. |

**Outputs:** none.

##### Task 3.3: Log Onboarding Complete

**Type:** rpa
**Description:** Writes the closing entry to the activity log, giving the case timeline a
clean end point.

**Entry Condition:**

| WHEN | IF | Display Name |
|------|-----|--------------|
| `runs-sequentially` | — | — |

| Required | Run Only Once | Skip Condition |
|----------|---------------|----------------|
| Yes | Yes | — |

**Resolved Resource:** RPA - Log Activity
**Folder Path:** AMER Presales/HLS/Demo/Provider Onboarding/Provider Onboarding Solution
**Resource Identity:** `95772472-9a76-45b4-87d2-d5fe05cd7d55`
**Binding Sub-Type:** —
**Dispatch / Operation:** —

**Inputs:**

| Field | Type | Binding |
|-------|------|---------|
| in_MainRecordId | string | `=vars.mainRecordId` |
| in_CaseInstanceid | string | `=metadata.ExternalId` |
| in_ActivityName | string | `"Onboarding Complete"` |
| in_ActivityCategory | string | `"Case"` |
| in_ActivityDetails | string | `=js:(vars.candidateName + " is confirmed to start")` |
| in_SourceSystem | string | `"Maestro Case"` |

**Outputs:** none.

---

## Section 3: Personas & App Views

### Personas

| Persona | Stage Scope | Permissions | Description |
|---------|-------------|-------------|-------------|
| Navigator | All | View, Act | Owns the onboarding end to end. Starts the case, requests status summaries, and monitors progress from the Main App. |

New hires and internal team members are not personas. They participate entirely by email
and never sign in to any UiPath surface.

### Process App Views

| App | View | Persona | Purpose | Key Components |
|-----|------|---------|---------|----------------|
| Main App | Start Onboarding | Navigator | Enter a candidate email address and start a case | Email input, start button |
| Main App | Case List | Navigator | See all onboarding cases and their phase | Table of cases with phase and start date |
| Main App | Case Detail | Navigator | Inspect one case and act on it | Twelve-item checklist, activity timeline, Send Status Summary button |

---

## Section 4: Integrations

| Kind | Name | Folder | Status |
|------|------|--------|--------|
| Agent | Agent - Onboarding Status | Provider Onboarding Solution | Deployed |
| Agent | Agent - Email Intake | Provider Onboarding Solution | Deployed, used outside the case |
| RPA | RPA - Log Activity | Provider Onboarding Solution | Deployed |
| RPA | RPA - Process Incoming Email | Provider Onboarding Solution | Deployed, used outside the case |
| RPA | RPA - Process Received Documents | Provider Onboarding Solution | Deployed, used outside the case |
| IS Connector | UiPath Data Fabric | Tenant | Connection exists |
| IS Connector | Microsoft Outlook 365 | Provider Onboarding | Connection exists |
| Entity | ProviderOnboardingMainRecord | Provider Onboarding | Deployed |
| Entity | ProviderOnboardingCandidateList | Provider Onboarding | Deployed, seeded with three candidates |
| Entity | ProviderOnboardingActivityLog | Provider Onboarding | Deployed, empty |
| Entity | ProviderOnboardingDocuments | Provider Onboarding | Deployed, empty |

Nothing new is built inside the solution beyond the case plan itself. The only new project
is the Main App, which is a coded app deployed to the Provider Onboarding folder.

---

## Section 5: External Contracts

The case does not ingest email. Ingestion runs an unbounded number of times per case, which
a case task cannot express, so it lives in Orchestrator as an Integration Service event
trigger on `RPA - Process Incoming Email`. The case only watches the resulting state. This
split is what lets the twelve tracked items be simple one-shot waits.

### Correlation

Every candidate in the candidate list and every internal contact shares one email address,
so neither the sender nor the recipient identifies a case. Correlation is carried in the
subject line instead.

The case writes every outbound subject as:

```
Provider Onboarding [POD-0007] - <purpose>
```

Replies preserve the subject, so the token survives the round trip.

### Required behaviour of RPA - Process Incoming Email

The trigger fires on any inbound email whose subject contains "provider onboarding". The
workflow must then:

1. Parse the bracketed token from the subject and look up the onboarding record by
   `CaseReferenceID`.
2. Run `Agent - Email Intake` to classify the sender as the new hire or an internal team
   member and extract the action items.
3. When attachments are present, invoke `RPA - Process Received Documents`, which sets the
   candidate document flags on the record.
4. When no attachments are present, set the internal flag matching each extracted action
   item: `CompletedBackgroundCheck`, `ReceivedEID`, `CompletedPhysical`,
   `ReceivedNewHireList`, or `StartDatePushed`.
5. Write **one activity log entry per confirmed item**, using the `ActivityName` vocabulary
   below. One reply confirming three items writes three rows.

Steps 4 and 5 are new behaviour. Without step 4 an internal reply carries no attachment,
document processing never runs, and nothing on the record changes. Without step 5 the five
internal waits have no event to fire on, because a single reply confirming several items
would otherwise produce a single record update that several waits would have to share.

### Controlled vocabularies

The case filters on exact string values. These are a contract: the workflows write them,
the case matches them, and a mismatch means a wait that never fires.

**`ProviderOnboardingDocuments.DocumentType`** — written by `RPA - Process Received Documents`,
one record per uploaded file:

`Government ID` · `Headshot` · `Credential List` · `I-9` · `NJ License CDS DEA` ·
`DCA OIG Debarment` · `New Hire Paperwork`

**`ProviderOnboardingActivityLog.ActivityName`** — written by `RPA - Process Incoming Email`,
one record per confirmed internal item:

`Background Check Complete` · `Employee ID Created` · `Physical Scheduled` ·
`Cleared To Hire` · `Start Date Confirmed`

The IXP project `ProviderOnboarding_IntakeForms` carries extraction field groups for four
document types only — New Hire Paperwork, NJ License CDS DEA, DCA OIG Debarment, and
Background Check. Government ID, Headshot, Credential List and I-9 have no field group, so
`DocumentType` for those must be set from the filename or the intake agent's
classification rather than from an IXP extraction result. Receipt tracking works either
way; extracted field data will only exist for the four typed documents.

---

## Section 6: Open Items

| # | Item | Impact if unresolved |
|---|------|---------------------|
| 1 | `DocumentType` must be set to the exact vocabulary for all seven documents, including the four with no IXP field group | A document whose type does not match lands in the entity but satisfies no wait, and that item never completes |
| 2 | Cross-folder reach was verified with an interactive user token, not the case runtime identity | If the runtime identity is scoped more narrowly, connector tasks fail at run time rather than at build time |

Item 1 is a build-time decision in `RPA - Process Received Documents`, not a discovery —
it is listed here because it is the dependency most likely to be overlooked. Item 2 can
only fail at run time, and the first end-to-end run settles it.
