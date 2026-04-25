export interface PlanGenerationInput {
  originCountry: string;
  destinationCountry: string;
  targetRole: string;
  salaryExpectation: number;
  salaryCurrencyCode: string;
  timelineMonths: number;
  requiresSponsorship: boolean;
}

export interface DeterministicAssessmentResult {
  isDataAvailable: boolean;
  isSalaryEligible: boolean;
  isTimelineFeasible: boolean;
  isAuthorizationCompatible: boolean;
  warnings: string[];
  rankedActionPlan: string[];
  dataConfidenceSummary: Record<string, string>;
}
