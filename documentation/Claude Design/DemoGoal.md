# Provider Onboarding Demo

## Goal
The overall goal of this demo is to be able to do a live run of a provider onboarding scenario. This demo will be managed by a Maestro Case Plan (not yet designed). At a high level, the scenario will follow these general steps:
1. In a "Main App", the demo user will enter an email address of the new hire and initiate the onboarding process. A welcome email will be sent to the new hire requesting that they respond with some required documentation
2. Acting as the new hire, the demo user will respond with some of the required documentation, but not all of it
3. The solution will automatically trigger an email intake workflow to ingest the new hire's response, process the attached documentation, and track what has been received
4. The solution will also automatically send an email to an "internal team member" who also has action items to complete to assist in the onboarding process
5. In the Main App, there will be a button to send out a current status summary of the selected case, which will run the Onboarding Status Agent that summarizes what has been accomplished so far and what is still remaining, and who owns those remaining items. Part of that summary will also be a reminder email sent to the owner of any outstanding items (the owner could be the new hire or an assisting internal team member)
6. The demo user, now acting as the internal team member, will respond to the email that was sent to them, confirming the action item requested. The Email Intake agent will process this response (i.e. the Email Intake Agent processes responses from both the new hire as well as assisting team members)
7. Once all outstanding documentation and action items have been complete, the case will be complete and the new hire is confirmed to start


## Demo planning requirements
1. This is a demo, NOT a fully-designed and error-proof workflow. It is meant to follow a specific, happy path
2. There are already elements that have been created and deployed to assist in this demo, as outlined in UiPathArchitecture.md. None of the existing elements should be modified.
3. One key element that still needs to be defined is the case plan. It is possible that more RPA workflows or Agents may be required, but it is highly unlikely that any new Storage Buckets, Data Fabric Entities, or IXP projects need to be created
4. The Main App also still needs to be defined