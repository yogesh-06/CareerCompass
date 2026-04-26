interface BuildPlanResponseInput {
  id: string;
  userId: string;
  originCountry: string;
  destinationCountry: string;
  targetRole: string;
  salaryExpectation: number;
  salaryCurrencyCode: string;
  timelineMonths: number;
  requiresSponsorship: boolean;
  feasibilityScore: number;
  isSalaryEligible: boolean;
  isTimelineFeasible: boolean;
  isAuthorizationCompatible: boolean;
  warningMessages: unknown;
  rankedActionPlan: unknown;
  dataConfidenceSummary: unknown;
  llmNarrative: string;
  llmNarrativeStatus: string;
  createdAt: Date;
  isDataAvailable?: boolean;
  message?: string;
}

export function buildPlanResponse(input: BuildPlanResponseInput) {
  return {
    id: input.id,
    userId: input.userId,
    originCountry: input.originCountry,
    destinationCountry: input.destinationCountry,
    targetRole: input.targetRole,
    salaryExpectation: input.salaryExpectation,
    salaryCurrencyCode: input.salaryCurrencyCode,
    timelineMonths: input.timelineMonths,
    requiresSponsorship: input.requiresSponsorship,
    feasibilityScore: input.feasibilityScore,
    isSalaryEligible: input.isSalaryEligible,
    isTimelineFeasible: input.isTimelineFeasible,
    isAuthorizationCompatible: input.isAuthorizationCompatible,
    warningMessages: input.warningMessages,
    rankedActionPlan: input.rankedActionPlan,
    dataConfidenceSummary: input.dataConfidenceSummary,
    llmNarrative: input.llmNarrative,
    llmNarrativeStatus: input.llmNarrativeStatus,
    createdAt: input.createdAt,
    isDataAvailable: input.isDataAvailable ?? true,
    message: input.message ?? null,
  };
}
