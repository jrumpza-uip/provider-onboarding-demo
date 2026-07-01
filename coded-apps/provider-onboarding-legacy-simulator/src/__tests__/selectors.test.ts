const requiredSelectors = [
  "hris-candidate-name",
  "hris-position-control-number",
  "itsm-ticket-number",
  "credentialing-dea-status",
  "health-clearance-status"
];

if (new Set(requiredSelectors).size !== requiredSelectors.length) {
  throw new Error("Selector list contains duplicates.");
}
