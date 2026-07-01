import { useMemo, useState, type ChangeEvent } from "react";
import { BadgeCheck, BriefcaseBusiness, ClipboardList, HeartPulse, MonitorCog, Search } from "lucide-react";

type Screen = "hris" | "itsm" | "credentialing" | "health";

type SimulatorState = {
  candidateName: string;
  employeeId: string;
  specialty: string;
  facility: string;
  positionControlNumber: string;
  targetStartDate: string;
  employmentStatus: string;
  transferType: string;
  sourceFacility: string;
  targetFacility: string;
  itsmTicketNumber: string;
  itsmTicketStatus: string;
  accessProfile: string;
  licenseStatus: string;
  deaStatus: string;
  cdsStatus: string;
  backgroundStatus: string;
  exclusionStatus: string;
  payorEnrollmentStatus: string;
  immunizationStatus: string;
  tbStatus: string;
  fitTestStatus: string;
  employeeHealthClearance: string;
};

const initialState: SimulatorState = {
  candidateName: "Jordan Avery",
  employeeId: "",
  specialty: "Emergency Medicine",
  facility: "St. Agnes Medical Center",
  positionControlNumber: "PCN-8842",
  targetStartDate: "2026-07-13",
  employmentStatus: "Preboarding",
  transferType: "Internal transfer",
  sourceFacility: "Central Hospital",
  targetFacility: "Northlake Clinic",
  itsmTicketNumber: "REQ-10293",
  itsmTicketStatus: "Pending approval",
  accessProfile: "Provider standard access",
  licenseStatus: "Needs DEA update",
  deaStatus: "Missing",
  cdsStatus: "Not required",
  backgroundStatus: "Clear",
  exclusionStatus: "Clear",
  payorEnrollmentStatus: "In progress",
  immunizationStatus: "Complete",
  tbStatus: "Pending read",
  fitTestStatus: "Scheduled",
  employeeHealthClearance: "Conditional"
};

const screens: Array<{ id: Screen; label: string; icon: JSX.Element }> = [
  { id: "hris", label: "HRIS", icon: <BriefcaseBusiness aria-hidden="true" /> },
  { id: "itsm", label: "ITSM", icon: <MonitorCog aria-hidden="true" /> },
  { id: "credentialing", label: "Credentialing", icon: <ClipboardList aria-hidden="true" /> },
  { id: "health", label: "Employee Health", icon: <HeartPulse aria-hidden="true" /> }
];

function App() {
  const [screen, setScreen] = useState<Screen>("hris");
  const [state, setState] = useState<SimulatorState>(initialState);
  const [lastAction, setLastAction] = useState("Ready");

  const pageTitle = useMemo(() => screens.find((item) => item.id === screen)?.label ?? "Simulator", [screen]);

  const updateField = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setState((current) => ({ ...current, [name]: value }));
  };

  const save = (label: string) => {
    setLastAction(`${label} saved at ${new Date().toLocaleTimeString()}`);
  };

  return (
    <main className="sim-shell" data-testid="provider-onboarding-legacy-simulator">
      <aside className="sim-nav" aria-label="Legacy simulator screens">
        <div className="brand-lockup">
          <div className="brand-mark">Ui</div>
          <div>
            <strong>Legacy Simulator</strong>
            <span>Provider onboarding</span>
          </div>
        </div>
        <nav>
          {screens.map((item) => (
            <button
              key={item.id}
              type="button"
              className={screen === item.id ? "active" : undefined}
              data-testid={`nav-${item.id}`}
              onClick={() => setScreen(item.id)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <section className="sim-content">
        <header className="sim-header">
          <div>
            <p className="eyebrow">Provider Onboarding Demo</p>
            <h1>{pageTitle}</h1>
          </div>
          <label className="lookup-box">
            <Search aria-hidden="true" />
            <input
              id="global-provider-lookup"
              name="globalProviderLookup"
              data-testid="global-provider-lookup"
              value={state.candidateName}
              onChange={(event) => setState((current) => ({ ...current, candidateName: event.target.value }))}
              aria-label="Provider lookup"
            />
          </label>
        </header>

        <div className="status-row" role="status" data-testid="legacy-last-action">
          <BadgeCheck aria-hidden="true" />
          {lastAction}
        </div>

        {screen === "hris" ? <HrisScreen state={state} onChange={updateField} onSave={() => save("HRIS record")} /> : null}
        {screen === "itsm" ? <ItsmScreen state={state} onChange={updateField} onSave={() => save("ITSM ticket")} /> : null}
        {screen === "credentialing" ? (
          <CredentialingScreen state={state} onChange={updateField} onSave={() => save("Credentialing record")} />
        ) : null}
        {screen === "health" ? <HealthScreen state={state} onChange={updateField} onSave={() => save("Employee health record")} /> : null}
      </section>
    </main>
  );
}

function HrisScreen({
  state,
  onChange,
  onSave
}: {
  state: SimulatorState;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSave: () => void;
}) {
  return (
    <section className="legacy-panel" aria-labelledby="hris-title" data-testid="screen-hris">
      <PanelTitle id="hris-title" title="HRIS employee record" />
      <div className="form-grid">
        <Field id="hris-candidate-name" label="Candidate Name" name="candidateName" value={state.candidateName} onChange={onChange} />
        <Field id="hris-employee-id" label="Employee ID" name="employeeId" value={state.employeeId} onChange={onChange} />
        <Field id="hris-specialty" label="Specialty" name="specialty" value={state.specialty} onChange={onChange} />
        <Field id="hris-facility" label="Facility" name="facility" value={state.facility} onChange={onChange} />
        <Field
          id="hris-position-control-number"
          label="Position Control Number"
          name="positionControlNumber"
          value={state.positionControlNumber}
          onChange={onChange}
        />
        <Field
          id="hris-target-start-date"
          label="Target Start Date"
          name="targetStartDate"
          type="date"
          value={state.targetStartDate}
          onChange={onChange}
        />
        <SelectField
          id="hris-employment-status"
          label="Employment Status"
          name="employmentStatus"
          value={state.employmentStatus}
          options={["Preboarding", "Active", "On hold", "Transfer pending"]}
          onChange={onChange}
        />
      </div>
      <ActionBar buttonId="hris-save-record" label="Save HRIS Record" onSave={onSave} />
    </section>
  );
}

function ItsmScreen({
  state,
  onChange,
  onSave
}: {
  state: SimulatorState;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSave: () => void;
}) {
  return (
    <section className="legacy-panel" aria-labelledby="itsm-title" data-testid="screen-itsm">
      <PanelTitle id="itsm-title" title="ITSM access request" />
      <div className="form-grid">
        <SelectField
          id="itsm-transfer-type"
          label="Transfer Type"
          name="transferType"
          value={state.transferType}
          options={["New hire", "Internal transfer", "Facility transfer", "Reactivation"]}
          onChange={onChange}
        />
        <Field id="itsm-source-facility" label="Source Facility" name="sourceFacility" value={state.sourceFacility} onChange={onChange} />
        <Field id="itsm-target-facility" label="Target Facility" name="targetFacility" value={state.targetFacility} onChange={onChange} />
        <Field id="itsm-ticket-number" label="Ticket Number" name="itsmTicketNumber" value={state.itsmTicketNumber} onChange={onChange} />
        <SelectField
          id="itsm-ticket-status"
          label="Ticket Status"
          name="itsmTicketStatus"
          value={state.itsmTicketStatus}
          options={["Draft", "Submitted", "Pending approval", "Provisioning", "Complete", "Rejected"]}
          onChange={onChange}
        />
        <Field id="itsm-access-profile" label="Access Profile" name="accessProfile" value={state.accessProfile} onChange={onChange} />
      </div>
      <ActionBar buttonId="itsm-save-ticket" label="Save ITSM Ticket" onSave={onSave} />
    </section>
  );
}

function CredentialingScreen({
  state,
  onChange,
  onSave
}: {
  state: SimulatorState;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSave: () => void;
}) {
  return (
    <section className="legacy-panel" aria-labelledby="credentialing-title" data-testid="screen-credentialing">
      <PanelTitle id="credentialing-title" title="Credentialing clearance" />
      <div className="form-grid">
        <SelectField
          id="credentialing-license-status"
          label="License Status"
          name="licenseStatus"
          value={state.licenseStatus}
          options={["Clear", "Needs DEA update", "Expired", "Pending verification"]}
          onChange={onChange}
        />
        <SelectField
          id="credentialing-dea-status"
          label="DEA Status"
          name="deaStatus"
          value={state.deaStatus}
          options={["Clear", "Missing", "Expired", "Pending verification"]}
          onChange={onChange}
        />
        <SelectField
          id="credentialing-cds-status"
          label="CDS Status"
          name="cdsStatus"
          value={state.cdsStatus}
          options={["Clear", "Not required", "Missing", "Expired"]}
          onChange={onChange}
        />
        <SelectField
          id="credentialing-background-status"
          label="Background Status"
          name="backgroundStatus"
          value={state.backgroundStatus}
          options={["Clear", "Pending", "Exception", "Escalated"]}
          onChange={onChange}
        />
        <SelectField
          id="credentialing-exclusion-status"
          label="OIG/Exclusion Status"
          name="exclusionStatus"
          value={state.exclusionStatus}
          options={["Clear", "Pending", "Exception", "Escalated"]}
          onChange={onChange}
        />
        <SelectField
          id="credentialing-payor-status"
          label="Payor Enrollment Status"
          name="payorEnrollmentStatus"
          value={state.payorEnrollmentStatus}
          options={["Not started", "In progress", "Complete", "Blocked"]}
          onChange={onChange}
        />
      </div>
      <ActionBar buttonId="credentialing-save-clearance" label="Save Credentialing Clearance" onSave={onSave} />
    </section>
  );
}

function HealthScreen({
  state,
  onChange,
  onSave
}: {
  state: SimulatorState;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSave: () => void;
}) {
  return (
    <section className="legacy-panel" aria-labelledby="employee-health-title" data-testid="screen-employee-health">
      <PanelTitle id="employee-health-title" title="Employee health clearance" />
      <div className="form-grid">
        <SelectField
          id="health-immunization-status"
          label="Immunization Status"
          name="immunizationStatus"
          value={state.immunizationStatus}
          options={["Not started", "Pending", "Complete", "Exception"]}
          onChange={onChange}
        />
        <SelectField
          id="health-tb-status"
          label="TB Status"
          name="tbStatus"
          value={state.tbStatus}
          options={["Not started", "Pending read", "Clear", "Exception"]}
          onChange={onChange}
        />
        <SelectField
          id="health-fit-test-status"
          label="Fit Test Status"
          name="fitTestStatus"
          value={state.fitTestStatus}
          options={["Not scheduled", "Scheduled", "Complete", "Exception"]}
          onChange={onChange}
        />
        <SelectField
          id="health-clearance-status"
          label="Employee Health Clearance"
          name="employeeHealthClearance"
          value={state.employeeHealthClearance}
          options={["Not clear", "Conditional", "Clear", "Escalated"]}
          onChange={onChange}
        />
      </div>
      <ActionBar buttonId="health-save-clearance" label="Save Employee Health Clearance" onSave={onSave} />
    </section>
  );
}

function PanelTitle({ id, title }: { id: string; title: string }) {
  return (
    <div className="panel-title">
      <h2 id={id}>{title}</h2>
      <span>Stable labels and selectors are enabled for RPA capture.</span>
    </div>
  );
}

function Field({
  id,
  label,
  name,
  value,
  onChange,
  type = "text"
}: {
  id: string;
  label: string;
  name: keyof SimulatorState;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) {
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <input id={id} name={name} data-testid={id} type={type} value={value} onChange={onChange} />
    </label>
  );
}

function SelectField({
  id,
  label,
  name,
  value,
  options,
  onChange
}: {
  id: string;
  label: string;
  name: keyof SimulatorState;
  value: string;
  options: string[];
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <select id={id} name={name} data-testid={id} value={value} onChange={onChange}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function ActionBar({ buttonId, label, onSave }: { buttonId: string; label: string; onSave: () => void }) {
  return (
    <div className="action-bar">
      <button id={buttonId} data-testid={buttonId} type="button" onClick={onSave}>
        {label}
      </button>
    </div>
  );
}

export default App;
