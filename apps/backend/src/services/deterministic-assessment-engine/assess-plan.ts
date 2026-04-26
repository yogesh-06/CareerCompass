import type {
  DeterministicAssessmentResult,
  PlanGenerationInput,
} from "./types.js";
import { buildDataConfidenceSummary } from "./data-confidence.js";
import { calculateFeasibilityScore } from "./feasibility-score.js";

type WorkAuthorizationRouteRecord = {
  sponsorshipRequired: boolean;
  processingTimeMax: number;
};

type DataFieldConfidenceRecord = {
  fieldName: string;
  confidence: string;
};

type DestinationWithRelations = {
  destinationCountry: string;
  targetRole: string;
  salaryMin: number;
  salaryMedian: number;
  typicalHiringDurationMonths: number;
  requiredQualifications: string[];
  languageRequirements: string[];
  marketDemandLevel?: string;
  workAuthorizationRoutes: WorkAuthorizationRouteRecord[];
  fieldConfidence: DataFieldConfidenceRecord[];
};

export function assessPlanDeterministically(
  input: PlanGenerationInput,
  marketData: DestinationWithRelations | null,
): DeterministicAssessmentResult {
  const isDomesticTransition = input.originCountry === input.destinationCountry;
  const effectiveMarketData = marketData ?? (isDomesticTransition ? buildDomesticAssumption(input) : null);

  if (!effectiveMarketData) {
    const warningMessages = ["No data available for this role-country combination."];
    return {
      isDataAvailable: false,
      message: "No data available for this role-country combination",
      feasibilityScore: 0,
      isSalaryEligible: false,
      isTimelineFeasible: false,
      isAuthorizationCompatible: false,
      warningMessages,
      rankedActionPlan: [],
      dataConfidenceSummary: buildDataConfidenceSummary(undefined, {
        hasSalaryData: false,
        hasTimelineData: false,
        hasCredentialsData: false,
        hasMarketDemandData: false,
        hasWorkAuthorizationRoutesData: false,
      }),
      salaryShortfallAmount: 0,
      minimumTimeToStartMonths: 0,
      requiredVisaProcessingMonths: 0,
    };
  }

  const warningMessages: string[] = [];
  const salaryThreshold = effectiveMarketData.salaryMin;
  const salaryShortfall = salaryThreshold - input.salaryExpectation;
  const isSalaryEligible = salaryShortfall <= 0;

  if (!isSalaryEligible) {
    warningMessages.push(
      `Salary shortfall: expected ${input.salaryExpectation} ${input.salaryCurrencyCode}, minimum required ${salaryThreshold} ${input.salaryCurrencyCode}. Gap is ${salaryShortfall} ${input.salaryCurrencyCode}.`,
    );
  }

  const requiredVisaProcessingMonths = isDomesticTransition
    ? 0
    : Math.min(...effectiveMarketData.workAuthorizationRoutes.map((route) => route.processingTimeMax));
  const minimumTimeToStart = effectiveMarketData.typicalHiringDurationMonths + requiredVisaProcessingMonths;
  const isTimelineFeasible = input.timelineMonths >= minimumTimeToStart;

  if (!isTimelineFeasible) {
    warningMessages.push(
      `Timeline conflict: process requires ${minimumTimeToStart} months but user expects ${input.timelineMonths} months.`,
    );
  }

  const hasCompatibleRoute = isDomesticTransition
    ? true
    : effectiveMarketData.workAuthorizationRoutes.some((route) =>
        input.requiresSponsorship ? route.sponsorshipRequired : true,
      );

  if (!hasCompatibleRoute) {
    warningMessages.push(
      "Work authorization mismatch: no compatible route found for current sponsorship constraint.",
    );
  }

  if (isDomesticTransition) {
    warningMessages.push("This is a domestic transition; no visa or sponsorship required.");
  }

  const roleKeyword = effectiveMarketData.targetRole;
  const destinationKeyword = effectiveMarketData.destinationCountry;
  const compensationLowerBound = Math.max(input.salaryExpectation, effectiveMarketData.salaryMin);
  const compensationUpperBound = Math.max(compensationLowerBound, effectiveMarketData.salaryMedian);
  const compensationAdvice = isSalaryEligible
    ? `Target the ${compensationLowerBound}-${compensationUpperBound} ${input.salaryCurrencyCode} range to stay competitive while improving role quality.`
    : `Adjust compensation ask by at least ${salaryShortfall} ${input.salaryCurrencyCode} to meet baseline eligibility before applying.`;
  const sponsorshipAdvice = isDomesticTransition
    ? "Focus on internal mobility and domestic role transitions where onboarding can be faster."
    : input.requiresSponsorship
    ? "Prioritize employers with documented sponsorship history and confirm route timelines before interview loops."
    : "Prioritize direct-hiring employers and emphasize immediate work authorization in your profile.";

  const rankedActionPlan = [
    `Strengthen ${roleKeyword} capabilities required in ${destinationKeyword}, especially ${effectiveMarketData.requiredQualifications.slice(0, 2).join(" and ")}.`,
    `Target employers in ${destinationKeyword} where ${roleKeyword} demand is active and tailor your CV with measurable backend/product outcomes.`,
    compensationAdvice,
    sponsorshipAdvice,
    `Close language and documentation gaps early (${effectiveMarketData.languageRequirements.join(", ")}) to reduce offer-to-start delays.`,
  ];

  const dataConfidenceSummary = buildDataConfidenceSummary(effectiveMarketData.fieldConfidence, {
    hasSalaryData: effectiveMarketData.salaryMin > 0 && effectiveMarketData.salaryMedian > 0,
    hasTimelineData:
      effectiveMarketData.typicalHiringDurationMonths > 0 || requiredVisaProcessingMonths >= 0,
    hasCredentialsData:
      effectiveMarketData.requiredQualifications.length > 0 ||
      effectiveMarketData.languageRequirements.length > 0,
    hasMarketDemandData: Boolean(effectiveMarketData.marketDemandLevel),
    hasWorkAuthorizationRoutesData: isDomesticTransition
      ? false
      : effectiveMarketData.workAuthorizationRoutes.length > 0,
  });
  let feasibilityScore = calculateFeasibilityScore({
    isSalaryEligible,
    isTimelineFeasible,
    isAuthorizationCompatible: hasCompatibleRoute,
  });

  if (warningMessages.length === 0 && feasibilityScore === 100) {
    warningMessages.push("Market competition is high; strong profile required.");
    feasibilityScore = 95;
  }

  return {
    isDataAvailable: true,
    feasibilityScore,
    isSalaryEligible,
    isTimelineFeasible,
    isAuthorizationCompatible: hasCompatibleRoute,
    warningMessages,
    rankedActionPlan,
    dataConfidenceSummary,
    salaryShortfallAmount: Math.max(0, salaryShortfall),
    minimumTimeToStartMonths: minimumTimeToStart,
    requiredVisaProcessingMonths,
  };
}

function buildDomesticAssumption(input: PlanGenerationInput): DestinationWithRelations {
  return {
    destinationCountry: input.destinationCountry,
    targetRole: input.targetRole,
    salaryMin: Math.round(input.salaryExpectation * 0.9),
    salaryMedian: Math.round(input.salaryExpectation * 1.2),
    typicalHiringDurationMonths: 2,
    requiredQualifications: ["Role-specific portfolio proof", "Recent quantified impact"],
    languageRequirements: ["Primary business language proficiency"],
    marketDemandLevel: "estimated",
    workAuthorizationRoutes: [],
    fieldConfidence: [
      { fieldName: "salary", confidence: "estimated" },
      { fieldName: "timeline", confidence: "estimated" },
      { fieldName: "credentials", confidence: "estimated" },
      { fieldName: "market_demand", confidence: "estimated" },
      { fieldName: "work_authorization_routes", confidence: "placeholder" },
    ],
  };
}
