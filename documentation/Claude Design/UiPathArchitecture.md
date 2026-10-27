# Demo Design
Below you will find the current state of the UiPath design of the Provider Onboarding solution.

## 1. Environment information
- Environment Type: staging
- Organization: uipathlabs
- Tenant: Playground
- Full URL: https://staging.uipath.com/uipathlabs/Playground
- External App ID: 8b521978-361e-4f1f-85cf-9ab26468788f

## 1. Already-designed components outside of Studio Web Solution
The following components have been created and deployed to Orchestrator. Their definition does NOT reside within a Studio Web solution, though items within a Studio Web solution may reference them.

### Data Fabric Entities
The following Data Fabric entities are folder-scoped to Orchestrator folder "AMER Presales/HLS/Demo/Provider Onboarding":
- ProviderOnboarding_MainRecord
- ProviderOnboarding_Documents
- ProviderOnboarding_ActivityLog
- ProviderOnboarding_CandidateList

### Storage Buckets
The following Storage Buckets exist in Orchestrator folder "AMER Presales/HLS/Demo/Provider Onboarding":
- ProviderOnboarding_Documentation
- ProviderOnboarding_InternalProcedures

### Context Grounding
The following Context Grounding Index exists in Orchestrator folder "AMER Presales/HLS/Demo/Provider Onboarding":
- ProviderOnboarding_InternalProcedure

### IXP Project
The following IXP project has been deployed in Orchestrator folder "AMER Presales/HLS/Demo/Provider Onboarding":
- ProviderOnboarding_IntakeForms

## 2. Studio Web Solution
Name: Provider Onboarding

The Studio Web solution currently contains the following resources:

## Agents
- Agent - Email Intake
	- Interprets an email message. Outputs the action items from the email and a list of documents that were attached to it.
	
- Agent - Onboarding Status
	- Outputs a summary of a given ProviderOnboarding_MainRecord data row, including what has been done/what is still missing and which team member is responsible for it (using a Context Grounding index with a list of team members ownership). This agent will be used as a daily status updater.

## RPA Workflows
-	RPA – Process Received Documents
	- Runs each input document through an IXP extractor which outputs all the relevant fields, uploads docs to data fabric, and updates main record indicating which required documents were received

-	RPA – Process Incoming Email
	- Triggered on each email matching a subject filter. Triggers the Email Intake Agent and document processing workflow if there are any attachments

-	RPA – Log Activity
	- Adds entry to the Data Fabric activity log entity


## Case Plan
No case plan currently exists.