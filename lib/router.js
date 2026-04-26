const ROUTES = {
  complaint: {
    name: "support-escalation",
    instructions: "Escalate to the support team with a priority review."
  },
  question: {
    name: "customer-success",
    instructions: "Route to customer success for informational follow-up."
  },
  refund: {
    name: "billing-operations",
    instructions: "Route to billing operations for refund validation."
  }
};

export function buildRouteForIntent(intent) {
  return (
    ROUTES[intent] || {
      name: "triage",
      instructions: "Route to general triage for manual review."
    }
  );
}
