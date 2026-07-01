import { Entities } from "@uipath/uipath-typescript/entities";

export const ENTITY_IDS = {
  providers: "1c2defbb-9c74-f111-ac9b-000d3a68f6f7",
  documents: "289c15eb-9c74-f111-ac9b-000d3a68f6f7",
  requirements: "489c15eb-9c74-f111-ac9b-000d3a68f6f7",
  activities: "619c15eb-9c74-f111-ac9b-000d3a68f6f7",
  drafts: "799c15eb-9c74-f111-ac9b-000d3a68f6f7"
} as const;

export type ProviderRecord = {
  id: string;
  CandidateName: string;
  HireCategory: string;
  ProviderSpecialty: string;
  FacilityName: string;
  TargetStartDate: string;
  OnboardingPhase: string;
  ClearanceState: string;
  SlaRiskLevel: string;
  AssignedNavigator: string;
  EmployeeIdentifier: string;
  PositionControlNumber: string;
  ItsmTicketNumber: string;
  NextAction: string;
};

export type DocumentRecord = {
  id: string;
  ProviderRecord?: unknown;
  DocumentCategory: string;
  SourceFileName: string;
  ReceivedAt: string;
  ExtractionState: string;
  ExtractionConfidence: number;
  MissingFieldSummary: string;
  ReviewerDecision: string;
  StorageBucketPath: string;
};

export type RequirementRecord = {
  id: string;
  ProviderRecord?: unknown;
  RequirementCategory: string;
  OwnerGroup: string;
  DueDate: string;
  CompletedAt: string;
  RequirementState: string;
  IsBlocking: boolean;
  RequirementNotes: string;
};

export type ActivityRecord = {
  id: string;
  ProviderRecord?: unknown;
  ActivityCategory: string;
  SourceSystem: string;
  ActivityOwner: string;
  ActivityTimestamp: string;
  ActivityOutcome: string;
  MessageSummary: string;
  ExternalReference: string;
};

export type CommunicationDraftRecord = {
  id: string;
  ProviderRecord?: unknown;
  DraftCategory: string;
  Audience: string;
  DraftText: string;
  DraftState: string;
  ReviewerDecision: string;
  ApprovedAt: string;
};

export type ProviderBundle = {
  provider: ProviderRecord;
  documents: DocumentRecord[];
  requirements: RequirementRecord[];
  activities: ActivityRecord[];
  drafts: CommunicationDraftRecord[];
};

export type DashboardData = {
  providers: ProviderBundle[];
  metrics: {
    activeProviders: number;
    slaRisk: number;
    blockingRequirements: number;
    pendingDocumentReviews: number;
    draftCommunications: number;
  };
  filters: {
    phases: string[];
    risks: string[];
    navigators: string[];
    facilities: string[];
  };
};

type DataSet = {
  providers: ProviderRecord[];
  documents: DocumentRecord[];
  requirements: RequirementRecord[];
  activities: ActivityRecord[];
  drafts: CommunicationDraftRecord[];
};

type RecordPage = {
  value?: unknown[];
  data?: unknown[];
  items?: unknown[];
  nextLink?: string;
  nextPageToken?: string;
  cursor?: string;
};

const sampleData: DataSet = {
  providers: [
    {
      id: "a995ece3-0cec-45ce-a500-019f19440cdc",
      CandidateName: "Jordan Avery",
      HireCategory: "New provider",
      ProviderSpecialty: "Emergency Medicine",
      FacilityName: "St. Agnes Medical Center",
      TargetStartDate: "2026-07-13",
      OnboardingPhase: "Document intake",
      ClearanceState: "Needs review",
      SlaRiskLevel: "High",
      AssignedNavigator: "Morgan Lee",
      EmployeeIdentifier: "",
      PositionControlNumber: "PCN-8842",
      ItsmTicketNumber: "",
      NextAction: "Resolve missing DEA number on new-hire data sheet."
    },
    {
      id: "fdf5ab38-264d-4db9-abe9-019f19440cdd",
      CandidateName: "Riley Chen",
      HireCategory: "Internal transfer",
      ProviderSpecialty: "Pediatrics",
      FacilityName: "Northlake Clinic",
      TargetStartDate: "2026-07-20",
      OnboardingPhase: "HRIS and access",
      ClearanceState: "In progress",
      SlaRiskLevel: "Medium",
      AssignedNavigator: "Dana Brooks",
      EmployeeIdentifier: "EID-44182",
      PositionControlNumber: "PCN-3110",
      ItsmTicketNumber: "REQ-10293",
      NextAction: "Approve transfer ticket after HRIS verification."
    }
  ],
  documents: [
    {
      id: "3a75d835-9d74-f111-ac9a-000d3adae0ea",
      ProviderRecord: "a995ece3-0cec-45ce-a500-019f19440cdc",
      DocumentCategory: "New hire data sheet",
      SourceFileName: "jordan-avery-new-hire-data-sheet.pdf",
      ReceivedAt: "2026-06-29T14:15:00Z",
      ExtractionState: "Needs review",
      ExtractionConfidence: 0.82,
      MissingFieldSummary: "DEA number, supervisor attestation",
      ReviewerDecision: "Pending",
      StorageBucketPath: "provider-onboarding/jordan-avery/new-hire-data-sheet.pdf"
    }
  ],
  requirements: [
    {
      id: "09bb13e5-d3a8-47a3-87e0-019f19455220",
      ProviderRecord: "a995ece3-0cec-45ce-a500-019f19440cdc",
      RequirementCategory: "License",
      OwnerGroup: "Credentialing",
      DueDate: "2026-07-03",
      CompletedAt: "",
      RequirementState: "Blocked",
      IsBlocking: true,
      RequirementNotes: "State license image is readable, DEA number is missing."
    },
    {
      id: "2531046c-f5ed-43eb-9aec-019f19455221",
      ProviderRecord: "fdf5ab38-264d-4db9-abe9-019f19440cdd",
      RequirementCategory: "ITSM transfer",
      OwnerGroup: "IT",
      DueDate: "2026-07-08",
      CompletedAt: "",
      RequirementState: "Pending approval",
      IsBlocking: true,
      RequirementNotes: "Access profile differs between source and target facility."
    }
  ],
  activities: [
    {
      id: "3d75d835-9d74-f111-ac9a-000d3adae0ea",
      ProviderRecord: "a995ece3-0cec-45ce-a500-019f19440cdc",
      ActivityCategory: "Automation",
      SourceSystem: "Studio Web",
      ActivityOwner: "Provider onboarding flow",
      ActivityTimestamp: "2026-06-29T15:20:00Z",
      ActivityOutcome: "Routed to review",
      MessageSummary: "Document extraction found missing values and opened navigator review.",
      ExternalReference: "POD-DEMO-0001"
    }
  ],
  drafts: [
    {
      id: "3e75d835-9d74-f111-ac9a-000d3adae0ea",
      ProviderRecord: "a995ece3-0cec-45ce-a500-019f19440cdc",
      DraftCategory: "Start date push",
      Audience: "Provider and clinic manager",
      DraftText: "We are moving the tentative start date while credentialing resolves one missing field.",
      DraftState: "Drafted",
      ReviewerDecision: "Pending",
      ApprovedAt: ""
    }
  ]
};

export async function fetchProviderData(sdk: unknown): Promise<DashboardData> {
  const entities = new (Entities as unknown as { new (client: unknown): unknown })(sdk);
  const [providerEntity, documentEntity, requirementEntity, activityEntity, draftEntity] = await Promise.all([
    getEntity(entities, ENTITY_IDS.providers),
    getEntity(entities, ENTITY_IDS.documents),
    getEntity(entities, ENTITY_IDS.requirements),
    getEntity(entities, ENTITY_IDS.activities),
    getEntity(entities, ENTITY_IDS.drafts)
  ]);

  const data: DataSet = {
    providers: (await getAllRecords(providerEntity)).map(toProviderRecord),
    documents: (await getAllRecords(documentEntity)).map(toDocumentRecord),
    requirements: (await getAllRecords(requirementEntity)).map(toRequirementRecord),
    activities: (await getAllRecords(activityEntity)).map(toActivityRecord),
    drafts: (await getAllRecords(draftEntity)).map(toDraftRecord)
  };

  return buildDashboardModel(data);
}

export function getSampleDashboardData(): DashboardData {
  return buildDashboardModel(sampleData);
}

export function buildDashboardModel(data: DataSet): DashboardData {
  const providers = data.providers.map((provider) => ({
    provider,
    documents: data.documents.filter((record) => relatesToProvider(record.ProviderRecord, provider)),
    requirements: data.requirements.filter((record) => relatesToProvider(record.ProviderRecord, provider)),
    activities: data.activities
      .filter((record) => relatesToProvider(record.ProviderRecord, provider))
      .sort((left, right) => new Date(right.ActivityTimestamp || 0).getTime() - new Date(left.ActivityTimestamp || 0).getTime()),
    drafts: data.drafts.filter((record) => relatesToProvider(record.ProviderRecord, provider))
  }));

  const allRequirements = providers.flatMap((bundle) => bundle.requirements);
  const allDocuments = providers.flatMap((bundle) => bundle.documents);
  const allDrafts = providers.flatMap((bundle) => bundle.drafts);

  return {
    providers,
    metrics: {
      activeProviders: providers.length,
      slaRisk: providers.filter((bundle) => normalize(bundle.provider.SlaRiskLevel) !== "low" && normalize(bundle.provider.SlaRiskLevel) !== "").length,
      blockingRequirements: allRequirements.filter((record) => record.IsBlocking && normalize(record.RequirementState) !== "complete").length,
      pendingDocumentReviews: allDocuments.filter((record) =>
        ["needs review", "pending", "exception"].includes(normalize(record.ExtractionState || record.ReviewerDecision))
      ).length,
      draftCommunications: allDrafts.filter((record) => ["drafted", "pending"].includes(normalize(record.DraftState || record.ReviewerDecision))).length
    },
    filters: {
      phases: unique(data.providers.map((record) => record.OnboardingPhase)),
      risks: unique(data.providers.map((record) => record.SlaRiskLevel)),
      navigators: unique(data.providers.map((record) => record.AssignedNavigator)),
      facilities: unique(data.providers.map((record) => record.FacilityName))
    }
  };
}

async function getEntity(entities: unknown, entityId: string): Promise<unknown> {
  const service = entities as {
    getById?: (id: string) => Promise<unknown>;
    getEntityById?: (id: string) => Promise<unknown>;
  };

  if (service.getById) {
    return service.getById(entityId);
  }

  if (service.getEntityById) {
    return service.getEntityById(entityId);
  }

  throw new Error("The UiPath Entities SDK does not expose an entity lookup method.");
}

async function getAllRecords(entity: unknown): Promise<unknown[]> {
  const records: unknown[] = [];
  let cursor: string | undefined;

  do {
    const page = await getRecordPage(entity, cursor);
    const items = page.value ?? page.data ?? page.items ?? [];
    records.push(...items);
    cursor = page.nextPageToken ?? page.cursor ?? extractCursor(page.nextLink);
  } while (cursor);

  return records;
}

async function getRecordPage(entity: unknown, cursor?: string): Promise<RecordPage> {
  const service = entity as {
    getAllRecords?: (options: Record<string, unknown>) => Promise<RecordPage>;
    queryRecords?: (options: Record<string, unknown>) => Promise<RecordPage>;
    getRecords?: (options: Record<string, unknown>) => Promise<RecordPage>;
  };
  const options = { pageSize: 100, cursor };

  if (service.getAllRecords) {
    return service.getAllRecords(options);
  }
  if (service.queryRecords) {
    return service.queryRecords(options);
  }
  if (service.getRecords) {
    return service.getRecords(options);
  }

  throw new Error("The UiPath entity object does not expose a record listing method.");
}

function extractCursor(nextLink?: string): string | undefined {
  if (!nextLink) {
    return undefined;
  }
  try {
    return new URL(nextLink).searchParams.get("cursor") ?? undefined;
  } catch {
    return undefined;
  }
}

function relatesToProvider(value: unknown, provider: ProviderRecord): boolean {
  if (!value) {
    return false;
  }

  if (typeof value === "string") {
    return value === provider.id || value === provider.CandidateName;
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    return [record.Id, record.id, record.RecordId, record.recordId, record.Name, record.name, record.CandidateName].some(
      (candidate) => candidate === provider.id || candidate === provider.CandidateName
    );
  }

  return false;
}

function toProviderRecord(value: unknown): ProviderRecord {
  const record = asRecord(value);
  return {
    id: getId(record),
    CandidateName: text(record.CandidateName),
    HireCategory: text(record.HireCategory),
    ProviderSpecialty: text(record.ProviderSpecialty),
    FacilityName: text(record.FacilityName),
    TargetStartDate: text(record.TargetStartDate),
    OnboardingPhase: text(record.OnboardingPhase),
    ClearanceState: text(record.ClearanceState),
    SlaRiskLevel: text(record.SlaRiskLevel),
    AssignedNavigator: text(record.AssignedNavigator),
    EmployeeIdentifier: text(record.EmployeeIdentifier),
    PositionControlNumber: text(record.PositionControlNumber),
    ItsmTicketNumber: text(record.ItsmTicketNumber),
    NextAction: text(record.NextAction)
  };
}

function toDocumentRecord(value: unknown): DocumentRecord {
  const record = asRecord(value);
  return {
    id: getId(record),
    ProviderRecord: record.ProviderRecord,
    DocumentCategory: text(record.DocumentCategory),
    SourceFileName: text(record.SourceFileName),
    ReceivedAt: text(record.ReceivedAt),
    ExtractionState: text(record.ExtractionState),
    ExtractionConfidence: Number(record.ExtractionConfidence ?? 0),
    MissingFieldSummary: text(record.MissingFieldSummary),
    ReviewerDecision: text(record.ReviewerDecision),
    StorageBucketPath: text(record.StorageBucketPath)
  };
}

function toRequirementRecord(value: unknown): RequirementRecord {
  const record = asRecord(value);
  return {
    id: getId(record),
    ProviderRecord: record.ProviderRecord,
    RequirementCategory: text(record.RequirementCategory),
    OwnerGroup: text(record.OwnerGroup),
    DueDate: text(record.DueDate),
    CompletedAt: text(record.CompletedAt),
    RequirementState: text(record.RequirementState),
    IsBlocking: Boolean(record.IsBlocking),
    RequirementNotes: text(record.RequirementNotes)
  };
}

function toActivityRecord(value: unknown): ActivityRecord {
  const record = asRecord(value);
  return {
    id: getId(record),
    ProviderRecord: record.ProviderRecord,
    ActivityCategory: text(record.ActivityCategory),
    SourceSystem: text(record.SourceSystem),
    ActivityOwner: text(record.ActivityOwner),
    ActivityTimestamp: text(record.ActivityTimestamp),
    ActivityOutcome: text(record.ActivityOutcome),
    MessageSummary: text(record.MessageSummary),
    ExternalReference: text(record.ExternalReference)
  };
}

function toDraftRecord(value: unknown): CommunicationDraftRecord {
  const record = asRecord(value);
  return {
    id: getId(record),
    ProviderRecord: record.ProviderRecord,
    DraftCategory: text(record.DraftCategory),
    Audience: text(record.Audience),
    DraftText: text(record.DraftText),
    DraftState: text(record.DraftState),
    ReviewerDecision: text(record.ReviewerDecision),
    ApprovedAt: text(record.ApprovedAt)
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

function getId(record: Record<string, unknown>): string {
  return text(record.Id ?? record.id ?? record.RecordId ?? record.recordId);
}

function text(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort((left, right) => left.localeCompare(right));
}
