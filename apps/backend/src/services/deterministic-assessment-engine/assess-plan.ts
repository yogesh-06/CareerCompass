import type {
  DeterministicAssessmentResult,
  PlanGenerationInput,
} from "./types.js";

type WorkAuthorizationRouteRecord = {
  sponsorshipRequired: boolean;
  processingTimeMax: number;
};

type DataFieldConfidenceRecord = {
  fieldName: string;
  confidence: string;
};

type DestinationWithRelations = {
  salaryMin: number;
  typicalHiringDurationMonths: number;
  workAuthorizationRoutes: WorkAuthorizationRouteRecord[];
  fieldConfidence: DataFieldConfidenceRecord[];
};

export function assessPlanDeterministically(
  input: PlanGenerationInput,
  marketData: DestinationWithRelations | null,
): DeterministicAssessmentResult {
  if (!marketData) {
    return {
      isDataAvailable: false,
      isSalaryEligible: false,
      isTimelineFeasible: false,
      isAuthorizationCompatible: false,
      warnings: [
        "No reference data available for requested destination and role combination.",
      ],
      rankedActionPlan: [],
      dataConfidenceSummary: {},
    };
  }

  const warnings: string[] = [];
  const salaryThreshold = marketData.salaryMin;
  const salaryShortfall = salaryThreshold - input.salaryExpectation;
  const isSalaryEligible = salaryShortfall <= 0;

  if (!isSalaryEligible) {
    warnings.push(
      `Salary shortfall detected. Your expected salary is ${salaryShortfall} ${input.salaryCurrencyCode} below the minimum threshold.`,
    );
  }

  const fastestRouteMonths = Math.min(
    ...marketData.workAuthorizationRoutes.map((route) => route.processingTimeMax),
  );
  const minimumTimeToStart = marketData.typicalHiringDurationMonths + fastestRouteMonths;
  const isTimelineFeasible = input.timelineMonths >= minimumTimeToStart;

  if (!isTimelineFeasible) {
    warnings.push(
      `Timeline conflict detected. Minimum estimated time-to-start is ${minimumTimeToStart} months.`,
    );
  }

  const hasCompatibleRoute = marketData.workAuthorizationRoutes.some((route) =>
    input.requiresSponsorship ? route.sponsorshipRequired : true,
  );

  if (!hasCompatibleRoute) {
    warnings.push("No compatible work authorization route found for current constraints.");
  }

  const rankedActionPlan = [
    "Validate role-market fit using listed qualification requirements.",
    "Prioritize employers aligned with your authorization route.",
    "Align compensation expectations with route thresholds and market bands.",
    "Sequence applications by shortest hiring and authorization windows.",
  ];

  const dataConfidenceSummary = marketData.fieldConfidence.reduce<Record<string, string>>(
    (summary, confidenceRecord) => {
      summary[confidenceRecord.fieldName] = confidenceRecord.confidence;
      return summary;
    },
    {},
  );

  return {
    isDataAvailable: true,
    isSalaryEligible,
    isTimelineFeasible,
    isAuthorizationCompatible: hasCompatibleRoute,
    warnings,
    rankedActionPlan,
    dataConfidenceSummary,
  };
}
