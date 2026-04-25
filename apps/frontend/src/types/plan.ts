export interface PlanPayload {
  originCountry: string;
  destinationCountry: string;
  targetRole: string;
  salaryExpectation: number;
  salaryCurrencyCode: string;
  timelineMonths: number;
  requiresSponsorship: boolean;
}

export interface SavedPlanSummary {
  id: string;
  destinationCountry: string;
  targetRole: string;
  timelineMonths: number;
  createdAt: string;
  llmNarrativeStatus: string;
  warningMessages: string[];
}
