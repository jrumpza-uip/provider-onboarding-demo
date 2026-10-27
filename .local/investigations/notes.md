# Agent Builder policy notification investigation

## Anchor

- System: UiPath Studio Web Agent Builder / AOps product governance.
- Reported organization: `82e69757-09ff-4e6d-83e7-d530f2ac4e7b`.
- Reported tenant: `bd829329-42ff-40aa-96dc-95a78168275a`.
- Reported signal: `Unable to deserialize policy for organization: ... tenant: ... from`.
- Expected outcome inferred: explain the recurring notification and identify a safe next action.
- Time window: current/recurrent; exact first occurrence not provided.

## Signals

- Explicit fault message says a policy could not be deserialized; the suffix after `from` is absent from the supplied text.
- Exact and shortened error strings produced no troubleshooting playbook match.
- Current UiPath CLI version observed: `0.1.9`.
- `.local/investigations/raw/login-status.json` records that the installed CLI rejects the documented `--output` option for `uip login status`.
- `.local/investigations/raw/login-status.txt` plus command stderr show token refresh failed with `invalid_grant`; tenant policy data is therefore not currently reachable.
- CLI tool-registration warnings were also emitted for several unrelated extensions; they are not correlated to Studio Web and are not used as causal evidence.

## Escalation candidates

### H1 — malformed or schema-incompatible effective Agent Builder AOps policy

- Supporting signal: the notification explicitly names policy deserialization and the affected organization/tenant.
- Source: governance failure-mode references for malformed JSON / invalid AOps template structure.
- To confirm: retrieve the effective Agent Builder policy and inspect whether the service returns malformed/incompatible policy data.
- To eliminate: show no policy applies, or retrieve an effective policy that validates against the current Agent Builder template.

### H2 — originating fault is upstream/platform-side or a stale notification artifact

- Supporting signal: the message is emitted by Studio Web and is truncated before its `from` source discriminator; no local playbook matches it.
- Source: generic internal-platform boundary and documentation/KB search.
- To confirm: official known-issue evidence or a complete notification/support correlation identifying a platform component.
- To eliminate: tenant-effective policy evidence that independently reproduces a deserialization failure.

## Current gaps

- Full notification text after `from` is missing.
- Current tenant policy inspection is blocked by an expired/revoked CLI refresh grant.
- No timestamp, recent governance change, or reproduction sequence has been supplied.

## Probe h1 — malformed/schema-incompatible effective policy

- Confirm known cause class: **supported as a documented possibility, not as this tenant's cause**. Governance references name malformed JSON, invalid AOps template structure, schema drift, unknown/missing keys, and wrong native value types.
- Confirm live effective Agent Builder policy exists: **no data**. `.local/investigations/raw/h1-tenant-deployment.json` contains `Result=ValidationError` and `Message=error: unknown command 'gov'`; the governance request never reached the tenant.
- Confirm effective payload is malformed/incompatible: **no data**. No `Data.data` or current Agent Builder template was retrieved.
- Eliminate because no policy applies: **no data**. The required `deployed-policy get/list` discriminator was unreachable.
- Eliminate because the effective policy is structurally valid: **no data**. The effective policy and current template could not be compared.
- Cross-domain signal: the local UiPath CLI has incompatible tool-registration errors. This is an evidence-collection blocker and is not correlated to the Studio Web notification.

## Probe h2 — platform-side or stale notification artifact

- Confirm exact official/KB match: **no data**. `.local/investigations/raw/h2-exact-kb.json` and `h2-exact-docs.json` state no compatible Docs AI tool is installed for CLI v0.1.9; the searches did not execute.
- Confirm documented support disposition: **no data** for the same reason.
- Confirm source discriminator after `from`: **no data** because the user-provided notification ends there.
- Eliminate because official evidence always maps the message to an editable malformed policy: **no data**.
- Cross-domain signal: organization/tenant wording makes governance adjacent, while the reporting surface is Studio Web. Neither identifies the origin without the missing suffix or live policy data.

## Adjudication

- H1 survives only as a plausible documented cause class. It cannot win because no correlated tenant policy payload was retrieved.
- H2 is neither supported nor contradicted. The sanctioned documentation search did not execute and the source suffix is missing.
- No candidate is confirmed. The correct terminal is **no root cause found**, with the effective-policy query and full notification as the next discriminating evidence.

## Verification checklist

1. Cause named: **fail** — no playbook item is confirmed for this tenant.
2. Evidence pinned: **fail** — symptom-level text does not distinguish malformed JSON, schema drift, stale policy, or a platform-side defect.
3. Runtime evidence: **fail/not available** — the Studio Web notification is current, but tenant policy queries never reached the service.
4. Resolution aligned: **not applicable** — no exact cause branch won.
5. Causal precedence: **unresolved** — deserialization occurred, but why it occurred is not available in the truncated message or reachable policy data.
6. Fix scope: **no mutation proposed**. Repairing/redeploying a policy would be speculative.

## Self-verify

- Specific cause: shallow; missing effective Agent Builder policy payload and current template.
- Evidence: shallow; raw files prove only CLI/auth/tooling blockers, not the Studio Web cause.
- Resolution: shallow; diagnostic collection must precede any policy change.
- Causal precedence: shallow; the originating policy source after `from` remains missing.
- Verdict: **no root cause found; reduced-confidence diagnostic terminal**.
