import { buildDashboardModel } from "../services/providerData";

const model = buildDashboardModel({
  providers: [
    {
      id: "p1",
      CandidateName: "Case One",
      HireCategory: "New",
      ProviderSpecialty: "Family Medicine",
      FacilityName: "Clinic A",
      TargetStartDate: "2026-07-01",
      OnboardingPhase: "Intake",
      ClearanceState: "Needs review",
      SlaRiskLevel: "High",
      AssignedNavigator: "Navigator",
      EmployeeIdentifier: "",
      PositionControlNumber: "PCN-1",
      ItsmTicketNumber: "",
      NextAction: "Review"
    }
  ],
  documents: [
    {
      id: "d1",
      ProviderRecord: "p1",
      DocumentCategory: "Packet",
      SourceFileName: "packet.pdf",
      ReceivedAt: "",
      ExtractionState: "Needs review",
      ExtractionConfidence: 0.9,
      MissingFieldSummary: "DEA",
      ReviewerDecision: "Pending",
      StorageBucketPath: ""
    }
  ],
  requirements: [
    {
      id: "r1",
      ProviderRecord: "p1",
      RequirementCategory: "License",
      OwnerGroup: "Credentialing",
      DueDate: "",
      CompletedAt: "",
      RequirementState: "Blocked",
      IsBlocking: true,
      RequirementNotes: ""
    }
  ],
  activities: [],
  drafts: []
});

if (model.metrics.activeProviders !== 1) {
  throw new Error("Expected one provider.");
}

if (model.metrics.blockingRequirements !== 1) {
  throw new Error("Expected one blocking requirement.");
}
