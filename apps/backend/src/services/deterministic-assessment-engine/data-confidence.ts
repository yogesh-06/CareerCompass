type ConfidenceRecord = {
  fieldName: string;
  confidence: string;
};

interface DataConfidenceContext {
  hasSalaryData: boolean;
  hasTimelineData: boolean;
  hasCredentialsData: boolean;
  hasMarketDemandData: boolean;
  hasWorkAuthorizationRoutesData: boolean;
}

function getDefaultSummaryFromContext(context: DataConfidenceContext): Record<string, string> {
  return {
    salary: context.hasSalaryData ? "estimated" : "placeholder",
    timeline: context.hasTimelineData ? "estimated" : "placeholder",
    credentials: context.hasCredentialsData ? "estimated" : "placeholder",
    market_demand: context.hasMarketDemandData ? "estimated" : "placeholder",
    work_authorization_routes: context.hasWorkAuthorizationRoutesData
      ? "estimated"
      : "placeholder",
  };
}

export function buildDataConfidenceSummary(
  fieldConfidence: ConfidenceRecord[] | undefined,
  context: DataConfidenceContext,
): Record<string, string> {
  const summary = getDefaultSummaryFromContext(context);

  for (const record of fieldConfidence ?? []) {
    // Verified always wins when explicitly provided.
    if (record.confidence === "verified") {
      summary[record.fieldName] = "verified";
      continue;
    }

    // For synthetic datasets, modeled fields should be estimated, not placeholder.
    if (record.fieldName in summary && summary[record.fieldName] === "estimated") {
      summary[record.fieldName] = "estimated";
      continue;
    }

    summary[record.fieldName] = record.confidence === "estimated" ? "estimated" : "placeholder";
  }

  return summary;
}
