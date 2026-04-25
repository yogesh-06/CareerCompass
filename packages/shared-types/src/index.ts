export interface PlanGenerationRequest {
  originCountry: string;
  destinationCountry: string;
  targetRole: string;
  salaryExpectation: number;
  salaryCurrencyCode: string;
  timelineMonths: number;
  requiresSponsorship: boolean;
}

export interface PlanGenerationResponse {
  planId: string;
  deterministicAssessment: Record<string, unknown>;
  rankedActionPlan: string[];
  dataConfidenceSummary: Record<string, string>;
  warnings: string[];
  llmNarrative: string;
  narrativeStatus: "generated" | "fallback";
}
