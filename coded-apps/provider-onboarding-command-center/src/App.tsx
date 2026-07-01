import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileWarning,
  LayoutDashboard,
  Loader2,
  MessageSquareText,
  Search,
  ShieldAlert,
  UserRoundCheck
} from "lucide-react";
import { useAuth } from "./hooks/useAuth";
import {
  fetchProviderData,
  getSampleDashboardData,
  type DashboardData,
  type ProviderBundle,
  type ProviderRecord
} from "./services/providerData";

const PAGE_SIZE = 25;

type Filters = {
  phase: string;
  risk: string;
  navigator: string;
  facility: string;
  query: string;
};

const emptyFilters: Filters = {
  phase: "",
  risk: "",
  navigator: "",
  facility: "",
  query: ""
};

function App() {
  const { sdk, status, error, signIn } = useAuth();
  const [data, setData] = useState<DashboardData>(() => getSampleDashboardData());
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [usingSampleData, setUsingSampleData] = useState(true);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!sdk) {
      return;
    }

    let cancelled = false;
    setLoadingData(true);
    fetchProviderData(sdk)
      .then((nextData) => {
        if (cancelled) {
          return;
        }
        setData(nextData);
        setUsingSampleData(false);
        setSelectedId((current) => current ?? nextData.providers[0]?.provider.id ?? null);
        setDataError(null);
      })
      .catch((fetchError) => {
        if (cancelled) {
          return;
        }
        setData(getSampleDashboardData());
        setUsingSampleData(true);
        setDataError(fetchError instanceof Error ? fetchError.message : "Unable to read provider onboarding entities.");
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingData(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [sdk]);

  useEffect(() => {
    setSelectedId((current) => current ?? data.providers[0]?.provider.id ?? null);
  }, [data.providers]);

  const filtered = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    return data.providers.filter(({ provider }) => {
      return (
        matches(provider.OnboardingPhase, filters.phase) &&
        matches(provider.SlaRiskLevel, filters.risk) &&
        matches(provider.AssignedNavigator, filters.navigator) &&
        matches(provider.FacilityName, filters.facility) &&
        (!query ||
          [
            provider.CandidateName,
            provider.ProviderSpecialty,
            provider.FacilityName,
            provider.AssignedNavigator,
            provider.NextAction,
            provider.EmployeeIdentifier,
            provider.ItsmTicketNumber
          ]
            .join(" ")
            .toLowerCase()
            .includes(query))
      );
    });
  }, [data.providers, filters]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visibleRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selected = data.providers.find((bundle) => bundle.provider.id === selectedId) ?? filtered[0] ?? data.providers[0];

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  if (status !== "authenticated") {
    return (
      <main className="auth-shell">
        <section className="auth-panel" aria-labelledby="auth-title">
          <div className="brand-mark">Ui</div>
          <p className="eyebrow">Provider onboarding</p>
          <h1 id="auth-title">Command Center</h1>
          <p className="auth-copy">
            Sign in to read the Provider Onboarding Demo Data Fabric entities from staging. This app uses the configured
            external application ID for read-only dashboard access.
          </p>
          <button className="primary-button" type="button" onClick={() => void signIn()} disabled={status === "loading"}>
            {status === "loading" ? <Loader2 className="spin" aria-hidden="true" /> : <ShieldAlert aria-hidden="true" />}
            Connect to UiPath
          </button>
          {error ? <p className="inline-error">{error}</p> : null}
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <aside className="side-rail" aria-label="Provider onboarding navigation">
        <div className="brand-lockup">
          <div className="brand-mark">Ui</div>
          <span>Onboarding</span>
        </div>
        <nav>
          <a className="active" href="#dashboard">
            <LayoutDashboard aria-hidden="true" />
            Dashboard
          </a>
          <a href="#reviews">
            <ClipboardCheck aria-hidden="true" />
            Reviews
          </a>
          <a href="#alerts">
            <Bell aria-hidden="true" />
            Alerts
          </a>
        </nav>
      </aside>

      <section className="content-shell">
        <header className="top-bar">
          <div>
            <p className="eyebrow">Provider Onboarding Demo</p>
            <h1>Command Center</h1>
          </div>
          <div className="runtime-status" data-state={usingSampleData ? "sample" : "live"}>
            {loadingData ? <Loader2 className="spin" aria-hidden="true" /> : <CheckCircle2 aria-hidden="true" />}
            {loadingData ? "Loading Data Fabric" : usingSampleData ? "Sample fallback" : "Live Data Fabric"}
          </div>
        </header>

        {dataError ? (
          <div className="notice" role="status">
            <AlertTriangle aria-hidden="true" />
            <span>{dataError}</span>
          </div>
        ) : null}

        <section className="kpi-grid" aria-label="Provider onboarding KPIs">
          <Kpi icon={<UserRoundCheck />} label="Active providers" value={data.metrics.activeProviders} />
          <Kpi icon={<ShieldAlert />} label="SLA risk" value={data.metrics.slaRisk} tone="risk" />
          <Kpi icon={<AlertTriangle />} label="Blocking requirements" value={data.metrics.blockingRequirements} tone="risk" />
          <Kpi icon={<FileWarning />} label="Pending document reviews" value={data.metrics.pendingDocumentReviews} />
          <Kpi icon={<MessageSquareText />} label="Draft communications" value={data.metrics.draftCommunications} tone="ai" />
        </section>

        <section className="workspace-grid">
          <div className="table-region" id="dashboard">
            <div className="filter-row" aria-label="Provider filters">
              <label className="search-field">
                <Search aria-hidden="true" />
                <input
                  value={filters.query}
                  onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
                  placeholder="Search providers"
                />
              </label>
              <SelectFilter
                label="Phase"
                value={filters.phase}
                options={data.filters.phases}
                onChange={(value) => setFilters((current) => ({ ...current, phase: value }))}
              />
              <SelectFilter
                label="SLA risk"
                value={filters.risk}
                options={data.filters.risks}
                onChange={(value) => setFilters((current) => ({ ...current, risk: value }))}
              />
              <SelectFilter
                label="Navigator"
                value={filters.navigator}
                options={data.filters.navigators}
                onChange={(value) => setFilters((current) => ({ ...current, navigator: value }))}
              />
              <SelectFilter
                label="Facility"
                value={filters.facility}
                options={data.filters.facilities}
                onChange={(value) => setFilters((current) => ({ ...current, facility: value }))}
              />
            </div>

            <div className="provider-table-wrap">
              <table className="provider-table">
                <thead>
                  <tr>
                    <th>Provider</th>
                    <th>Phase</th>
                    <th>SLA</th>
                    <th>Navigator</th>
                    <th>Facility</th>
                    <th>Target start</th>
                    <th>Next action</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((bundle) => (
                    <ProviderRow
                      key={bundle.provider.id}
                      bundle={bundle}
                      selected={bundle.provider.id === selected?.provider.id}
                      onSelect={() => setSelectedId(bundle.provider.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination-bar" aria-label="Table pagination">
              <span>
                {filtered.length} providers, page {page} of {pageCount}
              </span>
              <div>
                <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}>
                  <ChevronLeft aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                  disabled={page === pageCount}
                >
                  <ChevronRight aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          {selected ? <ProviderDetail bundle={selected} /> : <EmptyDetail />}
        </section>
      </section>
    </main>
  );
}

function Kpi({ icon, label, value, tone = "default" }: { icon: JSX.Element; label: string; value: number; tone?: "default" | "risk" | "ai" }) {
  return (
    <article className="kpi" data-tone={tone}>
      {icon}
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </article>
  );
}

function SelectFilter({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="select-filter">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function ProviderRow({ bundle, selected, onSelect }: { bundle: ProviderBundle; selected: boolean; onSelect: () => void }) {
  const { provider } = bundle;
  return (
    <tr className={selected ? "selected-row" : undefined} onClick={onSelect}>
      <td>
        <button className="table-link" type="button" onClick={onSelect} title={provider.CandidateName}>
          {provider.CandidateName || "Unnamed provider"}
        </button>
        <span className="subtle-line" title={provider.ProviderSpecialty}>
          {provider.ProviderSpecialty}
        </span>
      </td>
      <td title={provider.OnboardingPhase}>{provider.OnboardingPhase}</td>
      <td>
        <RiskPill value={provider.SlaRiskLevel} />
      </td>
      <td title={provider.AssignedNavigator}>{provider.AssignedNavigator}</td>
      <td title={provider.FacilityName}>{provider.FacilityName}</td>
      <td>{formatDate(provider.TargetStartDate)}</td>
      <td title={provider.NextAction}>{provider.NextAction}</td>
    </tr>
  );
}

function ProviderDetail({ bundle }: { bundle: ProviderBundle }) {
  const { provider } = bundle;
  return (
    <aside className="detail-panel" aria-label="Provider detail">
      <div className="detail-header">
        <div>
          <p className="eyebrow">Provider detail</p>
          <h2>{provider.CandidateName}</h2>
          <span>{provider.HireCategory}</span>
        </div>
        <RiskPill value={provider.SlaRiskLevel} />
      </div>

      <section className="detail-section">
        <h3>Overview</h3>
        <dl className="overview-list">
          <Detail label="Specialty" value={provider.ProviderSpecialty} />
          <Detail label="Facility" value={provider.FacilityName} />
          <Detail label="Target start" value={formatDate(provider.TargetStartDate)} />
          <Detail label="Clearance" value={provider.ClearanceState} />
          <Detail label="Navigator" value={provider.AssignedNavigator} />
          <Detail label="Employee ID" value={provider.EmployeeIdentifier || "Not assigned"} />
          <Detail label="PCN" value={provider.PositionControlNumber || "Not assigned"} />
          <Detail label="ITSM" value={provider.ItsmTicketNumber || "Not opened"} />
        </dl>
      </section>

      <section className="detail-section">
        <h3>Requirements</h3>
        <div className="stack-list">
          {bundle.requirements.length ? (
            bundle.requirements.map((item) => (
              <div className="list-row" key={item.id}>
                <CalendarClock aria-hidden="true" />
                <div>
                  <strong>{item.RequirementCategory}</strong>
                  <span>{item.OwnerGroup}</span>
                </div>
                <StatusText value={item.RequirementState} />
              </div>
            ))
          ) : (
            <p className="empty-state">No requirements recorded.</p>
          )}
        </div>
      </section>

      <section className="detail-section">
        <h3>Documents</h3>
        <div className="stack-list">
          {bundle.documents.length ? (
            bundle.documents.map((item) => (
              <div className="list-row" key={item.id}>
                <FileWarning aria-hidden="true" />
                <div>
                  <strong title={item.SourceFileName}>{item.SourceFileName}</strong>
                  <span title={item.MissingFieldSummary}>{item.MissingFieldSummary || item.DocumentCategory}</span>
                </div>
                <StatusText value={item.ExtractionState} />
              </div>
            ))
          ) : (
            <p className="empty-state">No documents recorded.</p>
          )}
        </div>
      </section>

      <section className="detail-section">
        <h3>Activity</h3>
        <div className="timeline">
          {bundle.activities.length ? (
            bundle.activities.map((item) => (
              <div className="timeline-item" key={item.id}>
                <span>{formatDateTime(item.ActivityTimestamp)}</span>
                <strong>{item.ActivityOutcome}</strong>
                <p>{item.MessageSummary}</p>
              </div>
            ))
          ) : (
            <p className="empty-state">No activity recorded.</p>
          )}
        </div>
      </section>

      <section className="detail-section">
        <h3>Communication drafts</h3>
        <div className="stack-list">
          {bundle.drafts.length ? (
            bundle.drafts.map((item) => (
              <div className="draft-row" key={item.id}>
                <div>
                  <strong>{item.DraftCategory}</strong>
                  <span>{item.Audience}</span>
                </div>
                <p>{item.DraftText}</p>
              </div>
            ))
          ) : (
            <p className="empty-state">No draft communications.</p>
          )}
        </div>
      </section>
    </aside>
  );
}

function EmptyDetail() {
  return (
    <aside className="detail-panel empty-detail">
      <p className="eyebrow">Provider detail</p>
      <h2>No provider selected</h2>
    </aside>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt>{label}</dt>
      <dd title={value}>{value}</dd>
    </>
  );
}

function RiskPill({ value }: { value: string }) {
  const normalized = value.trim().toLowerCase() || "low";
  return (
    <span className="risk-pill" data-risk={normalized}>
      {value || "Low"}
    </span>
  );
}

function StatusText({ value }: { value: string }) {
  return <span className="status-text">{value || "Open"}</span>;
}

function matches(value: string, filter: string): boolean {
  return !filter || value === filter;
}

function formatDate(value: string): string {
  if (!value) {
    return "Not set";
  }
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function formatDateTime(value: string): string {
  if (!value) {
    return "Not recorded";
  }
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

export default App;
