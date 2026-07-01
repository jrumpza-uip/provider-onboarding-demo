import schema from "../../action-schema.json";

const outcomes = Object.keys(schema.outcomes.properties);

for (const expected of ["Approve", "RequestInfo", "Reject", "Escalate", "Close"]) {
  if (!outcomes.includes(expected)) {
    throw new Error(`Missing outcome ${expected}`);
  }
}

if (!schema.inputs.properties.reviewType.required) {
  throw new Error("reviewType must be required.");
}
