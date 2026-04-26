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
  message?: string;
  feasibilityScore: number;
  isSalaryEligible: boolean;
  isTimelineFeasible: boolean;
  isAuthorizationCompatible: boolean;
  warningMessages: string[];
  rankedActionPlan: string[];
  dataConfidenceSummary: Record<string, string>;
  salaryShortfallAmount: number;
  minimumTimeToStartMonths: number;
  requiredVisaProcessingMonths: number;
}
