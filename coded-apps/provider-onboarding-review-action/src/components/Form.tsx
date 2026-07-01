import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { AlertTriangle, CheckCircle2, ClipboardCheck, MessageSquareText, Send, XCircle } from "lucide-react";
import { Theme } from "@uipath/coded-action-app";
import { codedActionAppService } from "../uipath";

type ReviewItem = Record<string, unknown>;

type FormData = {
  reviewType: string;
  providerRecordId: string;
  candidateName: string;
  hireCategory: string;
  providerSpecialty: string;
  facilityName: string;
  targetStartDate: string;
  onboardingPhase: string;
  clearanceState: string;
  slaRiskLevel: string;
  assignedNavigator: string;
  nextAction: string;
  documents: ReviewItem[];
  requirements: ReviewItem[];
  activities: ReviewItem[];
  communicationDraft: ReviewItem;
  reviewerDecision: string;
  reviewerNotes: string;
  resolvedMissingFields: string;
  updatedStartDate: string;
  approvedCommunicationText: string;
  escalationReason: string;
};

type ActionOutcome = "Approve" | "RequestInfo" | "Reject" | "Escalate" | "Close";

const initialFormData: FormData = {
  reviewType: "",
  providerRecordId: "",
  candidateName: "",
  hireCategory: "",
  providerSpecialty: "",
  facilityName: "",
  targetStartDate: "",
  onboardingPhase: "",
  clearanceState: "",
  slaRiskLevel: "",
  assignedNavigator: "",
  nextAction: "",
  documents: [],
  requirements: [],
  activities: [],
  communicationDraft: {},
  reviewerDecision: "",
  reviewerNotes: "",
  resolvedMissingFields: "",
  updatedStartDate: "",
  approvedCommunicationText: "",
  escalationReason: ""
};

const isDarkTheme = (theme: Theme) => theme === Theme.Dark || theme === Theme.DarkHighContrast;

type FormProps = {
  onInitTheme: (isDark: boolean) => void;
};

function Form({ onInitTheme }: FormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submittingOutcome, setSubmittingOutcome] = useState<ActionOutcome | null>(null);

  useEffect(() => {
    codedActionAppService
      .getTask()
      .then((task) => {
        const taskData = (task.data ?? {}) as Partial<FormData>;
        setFormData((current) => ({ ...current, ...taskData }));
        setIsReadOnly(Boolean(task.isReadOnly));
        onInitTheme(isDarkTheme(task.theme));
      })
      .catch((error) => {
        setLoadError(error instanceof Error ? error.message : "Unable to load the Action Center task.");
      });
  }, [onInitTheme]);

  const reviewProfile = useMemo(() => getReviewProfile(formData.reviewType), [formData.reviewType]);
  const isValid = !isReadOnly && Boolean(formData.reviewerDecision.trim());

  const updateData = (updated: FormData) => {
    setFormData(updated);
    void codedActionAppService.setTaskData(updated);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (isReadOnly) {
      return;
    }
    const { name, value } = event.target;
    updateData({ ...formData, [name]: value });
  };

  const complete = async (outcome: ActionOutcome) => {
    if (!isValid && outcome !== "Close") {
      return;
    }
    setSubmittingOutcome(outcome);
    const payload: FormData = {
      ...formData,
      reviewerDecision: formData.reviewerDecision || outcome
    };
    await codedActionAppService.completeTask(outcome, payload);
  };

  return (
    <form className="action-form" aria-labelledby="review-title">
      <header className="action-header">
        <div>
          <p className="eyebrow">Provider review</p>
          <h1 id="review-title">{reviewProfile.title}</h1>
          <p>{reviewProfile.summary}</p>
        </div>
        <span className="review-chip">{formData.reviewType || "Review"}</span>
      </header>

      {loadError ? (
        <div className="notice" role="alert">
          <AlertTriangle aria-hidden="true" />
          <span>{loadError}</span>
        </div>
      ) : null}

      <section className="provider-strip" aria-label="Provider summary">
        <SummaryItem label="Candidate" value={formData.candidateName || "Not supplied"} />
        <SummaryItem label="Specialty" value={formData.providerSpecialty || "Not supplied"} />
        <SummaryItem label="Facility" value={formData.facilityName || "Not supplied"} />
        <SummaryItem label="Start date" value={formData.targetStartDate || "Not set"} />
        <SummaryItem label="Phase" value={formData.onboardingPhase || "Not supplied"} />
        <SummaryItem label="SLA" value={formData.slaRiskLevel || "Low"} />
      </section>

      <section className="review-grid">
        <div className="review-main">
          <Panel title="Review focus" icon={<ClipboardCheck />}>
            <dl className="context-list">
              <Context label="Provider record" value={formData.providerRecordId} />
              <Context label="Hire category" value={formData.hireCategory} />
              <Context label="Clearance" value={formData.clearanceState} />
              <Context label="Navigator" value={formData.assignedNavigator} />
              <Context label="Next action" value={formData.nextAction} />
            </dl>
          </Panel>

          <Panel title={reviewProfile.primarySection} icon={<AlertTriangle />}>
            <ReviewCollection items={reviewProfile.collection(formData)} emptyLabel={reviewProfile.emptyLabel} />
          </Panel>

          <Panel title="Recent activity" icon={<MessageSquareText />}>
            <ReviewCollection items={formData.activities} emptyLabel="No activity context was passed to this task." />
          </Panel>
        </div>

        <aside className="decision-panel">
          <h2>Reviewer action</h2>
          <label>
            Decision
            <select name="reviewerDecision" value={formData.reviewerDecision} onChange={handleChange} disabled={isReadOnly}>
              <option value="">Select decision</option>
              <option value="Approve">Approve</option>
              <option value="RequestInfo">Request information</option>
              <option value="Reject">Reject</option>
              <option value="Escalate">Escalate</option>
              <option value="Close">Close</option>
            </select>
          </label>

          <label>
            Notes
            <textarea
              name="reviewerNotes"
              value={formData.reviewerNotes}
              onChange={handleChange}
              readOnly={isReadOnly}
              rows={5}
            />
          </label>

          <label>
            Resolved missing fields
            <textarea
              name="resolvedMissingFields"
              value={formData.resolvedMissingFields}
              onChange={handleChange}
              readOnly={isReadOnly}
              rows={3}
            />
          </label>

          <label>
            Updated start date
            <input
              name="updatedStartDate"
              type="date"
              value={formData.updatedStartDate}
              onChange={handleChange}
              readOnly={isReadOnly}
            />
          </label>

          <label>
            Approved communication text
            <textarea
              name="approvedCommunicationText"
              value={formData.approvedCommunicationText || textValue(formData.communicationDraft, "DraftText")}
              onChange={handleChange}
              readOnly={isReadOnly}
              rows={5}
            />
          </label>

          <label>
            Escalation reason
            <textarea
              name="escalationReason"
              value={formData.escalationReason}
              onChange={handleChange}
              readOnly={isReadOnly}
              rows={3}
            />
          </label>

          <div className="outcome-bar" aria-label="Task outcomes">
            <button type="button" className="primary" onClick={() => void complete("Approve")} disabled={!isValid || Boolean(submittingOutcome)}>
              <CheckCircle2 aria-hidden="true" />
              Approve
            </button>
            <button type="button" onClick={() => void complete("RequestInfo")} disabled={!isValid || Boolean(submittingOutcome)}>
              <Send aria-hidden="true" />
              RequestInfo
            </button>
            <button type="button" onClick={() => void complete("Reject")} disabled={!isValid || Boolean(submittingOutcome)}>
              <XCircle aria-hidden="true" />
              Reject
            </button>
            <button type="button" onClick={() => void complete("Escalate")} disabled={!isValid || Boolean(submittingOutcome)}>
              <AlertTriangle aria-hidden="true" />
              Escalate
            </button>
            <button type="button" onClick={() => void complete("Close")} disabled={isReadOnly || Boolean(submittingOutcome)}>
              Close
            </button>
          </div>
        </aside>
      </section>
    </form>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong title={value}>{value}</strong>
    </div>
  );
}

function Panel({ title, icon, children }: { title: string; icon: JSX.Element; children: React.ReactNode }) {
  return (
    <section className="panel">
      <h2>
        {icon}
        {title}
      </h2>
      {children}
    </section>
  );
}

function Context({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt>{label}</dt>
      <dd title={value}>{value || "Not supplied"}</dd>
    </>
  );
}

function ReviewCollection({ items, emptyLabel }: { items: ReviewItem[]; emptyLabel: string }) {
  if (!items.length) {
    return <p className="empty-state">{emptyLabel}</p>;
  }

  return (
    <div className="item-list">
      {items.map((item, index) => (
        <article className="context-item" key={`${textValue(item, "id")}-${index}`}>
          <strong>{recordTitle(item, index)}</strong>
          <dl>
            {Object.entries(item)
              .filter(([key]) => !["id", "ProviderRecord"].includes(key))
              .slice(0, 5)
              .map(([key, value]) => (
                <Context key={key} label={splitLabel(key)} value={formatValue(value)} />
              ))}
          </dl>
        </article>
      ))}
    </div>
  );
}

function getReviewProfile(reviewType: string) {
  const normalized = reviewType.toLowerCase();

  if (normalized.includes("document")) {
    return {
      title: "Document Exception Review",
      summary: "Confirm extracted document fields and decide whether missing information must be requested.",
      primarySection: "Documents",
      emptyLabel: "No document rows were passed to this task.",
      collection: (data: FormData) => data.documents
    };
  }

  if (normalized.includes("credential")) {
    return {
      title: "Credentialing Exception Review",
      summary: "Review blocking credentialing requirements and decide the next clearance action.",
      primarySection: "Requirements",
      emptyLabel: "No credentialing requirements were passed to this task.",
      collection: (data: FormData) => data.requirements
    };
  }

  if (normalized.includes("touchpoint") || normalized.includes("communication") || normalized.includes("push")) {
    return {
      title: "Communication Approval",
      summary: "Review the proposed communication and approve, revise, or escalate it.",
      primarySection: "Communication draft",
      emptyLabel: "No communication draft was passed to this task.",
      collection: (data: FormData) => (Object.keys(data.communicationDraft).length ? [data.communicationDraft] : [])
    };
  }

  return {
    title: "Provider Onboarding Review",
    summary: "Review the provider onboarding context and select the outcome for this step.",
    primarySection: "Requirements",
    emptyLabel: "No requirements were passed to this task.",
    collection: (data: FormData) => data.requirements
  };
}

function recordTitle(item: ReviewItem, index: number): string {
  return (
    textValue(item, "DocumentCategory") ||
    textValue(item, "RequirementCategory") ||
    textValue(item, "ActivityOutcome") ||
    textValue(item, "DraftCategory") ||
    `Item ${index + 1}`
  );
}

function textValue(item: ReviewItem, key: string): string {
  return formatValue(item[key]);
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "Not supplied";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

function splitLabel(value: string): string {
  return value.replace(/([A-Z])/g, " $1").trim();
}

export default Form;
