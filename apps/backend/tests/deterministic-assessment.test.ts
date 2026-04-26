import { describe, expect, it } from "vitest";

import { assessPlanDeterministically } from "../src/services/deterministic-assessment-engine/assess-plan.js";

const baseMarketData = {
  id: "market-data-id",
  originCountry: "India",
  destinationCountry: "Germany",
  targetRole: "Senior Backend Engineer",
  salaryCurrencyCode: "EUR",
  salaryMin: 50000,
  salaryMedian: 70000,
  salaryMax: 90000,
  requiredQualifications: ["System design"],
  languageRequirements: ["English B2"],
  degreeEquivalencyNotes: "Equivalent",
  typicalHiringDurationMonths: 3,
  authorizationWindowMonths: 6,
  marketDemandLevel: "high",
  demandScaleDefinition: "high scale",
  workAuthorizationRoutes: [
    {
      id: "route-id",
      marketDataId: "market-data-id",
      name: "EU Blue Card",
      type: "employment",
      sponsorshipRequired: true,
      processingTimeMin: 4,
      processingTimeMax: 6,
      eligibilityCriteria: ["Offer letter"],
    },
  ],
  fieldConfidence: [{ id: "c1", marketDataId: "m1", fieldName: "salary", confidence: "estimated" }],
};

describe("assessPlanDeterministically", () => {
  it("flags timeline conflict when requested timeline is too short", () => {
    const result = assessPlanDeterministically(
      {
        originCountry: "India",
        destinationCountry: "Germany",
        targetRole: "Senior Backend Engineer",
        salaryExpectation: 60000,
        salaryCurrencyCode: "EUR",
        timelineMonths: 1,
        requiresSponsorship: true,
      },
      baseMarketData,
    );

    expect(result.isTimelineFeasible).toBe(false);
    expect(
      result.warningMessages.some((warning) => warning.includes("Timeline conflict")),
    ).toBe(true);
  });

  it("flags salary shortfall even for small deltas", () => {
    const result = assessPlanDeterministically(
      {
        originCountry: "India",
        destinationCountry: "Germany",
        targetRole: "Senior Backend Engineer",
        salaryExpectation: 49800,
        salaryCurrencyCode: "EUR",
        timelineMonths: 12,
        requiresSponsorship: true,
      },
      baseMarketData,
    );

    expect(result.isSalaryEligible).toBe(false);
    expect(result.warningMessages.some((warning) => warning.includes("Gap is 200 EUR"))).toBe(
      true,
    );
  });

  it("returns missing-data response when destination-role data is absent", () => {
    const result = assessPlanDeterministically(
      {
        originCountry: "India",
        destinationCountry: "France",
        targetRole: "Data Scientist",
        salaryExpectation: 60000,
        salaryCurrencyCode: "EUR",
        timelineMonths: 12,
        requiresSponsorship: false,
      },
      null,
    );

    expect(result.isDataAvailable).toBe(false);
    expect(result.message).toBe("No data available for this role-country combination");
    expect(result.warningMessages[0]).toContain("No data available");
  });

  it("computes feasibility score within expected weighted bounds", () => {
    const result = assessPlanDeterministically(
      {
        originCountry: "India",
        destinationCountry: "Germany",
        targetRole: "Senior Backend Engineer",
        salaryExpectation: 49800,
        salaryCurrencyCode: "EUR",
        timelineMonths: 1,
        requiresSponsorship: false,
      },
      baseMarketData,
    );

    expect(result.feasibilityScore).toBeLessThanOrEqual(35);
  });
});
