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

const productManagerUkData = {
  ...baseMarketData,
  destinationCountry: "United Kingdom",
  targetRole: "Product Manager",
  salaryMin: 55000,
  salaryMedian: 80000,
  requiredQualifications: ["Product discovery", "Cross-functional leadership"],
  languageRequirements: ["English C1"],
  workAuthorizationRoutes: [
    {
      id: "route-id-2",
      marketDataId: "market-data-id-2",
      name: "Direct Hiring Route",
      type: "employment",
      sponsorshipRequired: false,
      processingTimeMin: 1,
      processingTimeMax: 2,
      eligibilityCriteria: ["No sponsorship constraints"],
    },
  ],
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

    expect(result.feasibilityScore).toBe(30);
  });

  it("produces meaningfully different scenario output for UK product manager", () => {
    const result = assessPlanDeterministically(
      {
        originCountry: "India",
        destinationCountry: "United Kingdom",
        targetRole: "Product Manager",
        salaryExpectation: 60000,
        salaryCurrencyCode: "GBP",
        timelineMonths: 6,
        requiresSponsorship: false,
      },
      productManagerUkData,
    );

    expect(result.isSalaryEligible).toBe(true);
    expect(result.isAuthorizationCompatible).toBe(true);
    expect(result.rankedActionPlan.some((step) => step.includes("product discovery"))).toBe(
      true,
    );
  });

  it("returns placeholder confidence when fields are not modeled", () => {
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

    expect(result.dataConfidenceSummary.salary).toBe("placeholder");
    expect(result.dataConfidenceSummary.work_authorization_routes).toBe("placeholder");
  });

  it("maps modeled and non-modeled confidence fields correctly", () => {
    const result = assessPlanDeterministically(
      {
        originCountry: "India",
        destinationCountry: "Germany",
        targetRole: "Senior Backend Engineer",
        salaryExpectation: 45000,
        salaryCurrencyCode: "EUR",
        timelineMonths: 12,
        requiresSponsorship: true,
      },
      {
        ...baseMarketData,
        fieldConfidence: [
          { fieldName: "salary", confidence: "estimated" },
          { fieldName: "timeline", confidence: "estimated" },
          {
            fieldName: "work_authorization_routes",
            confidence: "estimated",
          },
          { fieldName: "credentials", confidence: "placeholder" },
          { fieldName: "market_demand", confidence: "placeholder" },
        ],
      },
    );

    expect(result.dataConfidenceSummary.salary).toBe("estimated");
    expect(result.dataConfidenceSummary.timeline).toBe("estimated");
    expect(result.dataConfidenceSummary.work_authorization_routes).toBe("estimated");
    expect(result.dataConfidenceSummary.credentials).toBe("placeholder");
    expect(result.dataConfidenceSummary.market_demand).toBe("placeholder");
  });

  it("handles India to India as domestic transition without authorization failure", () => {
    const result = assessPlanDeterministically(
      {
        originCountry: "India",
        destinationCountry: "India",
        targetRole: "Backend Engineer",
        salaryExpectation: 1200000,
        salaryCurrencyCode: "INR",
        timelineMonths: 3,
        requiresSponsorship: true,
      },
      null,
    );

    expect(result.isDataAvailable).toBe(true);
    expect(result.isAuthorizationCompatible).toBe(true);
    expect(
      result.warningMessages.some((warning) =>
        warning.includes("domestic transition; no visa or sponsorship required"),
      ),
    ).toBe(true);
  });
});
