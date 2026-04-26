import { describe, expect, it } from "vitest";

import { buildPlanResponse } from "../src/services/response-builder/build-plan-response.js";

describe("buildPlanResponse", () => {
  it("returns consistent top-level contract for standard plan response", () => {
    const response = buildPlanResponse({
      id: "plan-id",
      userId: "user-id",
      originCountry: "India",
      destinationCountry: "Germany",
      targetRole: "Senior Backend Engineer",
      salaryExpectation: 45000,
      salaryCurrencyCode: "EUR",
      timelineMonths: 12,
      requiresSponsorship: true,
      feasibilityScore: 60,
      isSalaryEligible: false,
      isTimelineFeasible: true,
      isAuthorizationCompatible: true,
      warningMessages: ["Salary shortfall"],
      rankedActionPlan: ["Step 1"],
      dataConfidenceSummary: { salary: "estimated" },
      llmNarrative: "Custom generated narrative text",
      createdAt: new Date("2026-04-26T00:00:00.000Z"),
    });

    expect(response).toMatchObject({
      id: "plan-id",
      userId: "user-id",
      feasibilityScore: 60,
      isSalaryEligible: false,
      isTimelineFeasible: true,
      isAuthorizationCompatible: true,
      isDataAvailable: true,
      message: null,
      llmNarrativeStatus: "generated",
    });
  });

  it("returns same contract keys for no-data response", () => {
    const response = buildPlanResponse({
      id: "no-data-id",
      userId: "user-id",
      originCountry: "India",
      destinationCountry: "Unknownland",
      targetRole: "Unknown Role",
      salaryExpectation: 50000,
      salaryCurrencyCode: "USD",
      timelineMonths: 3,
      requiresSponsorship: true,
      feasibilityScore: 0,
      isSalaryEligible: false,
      isTimelineFeasible: false,
      isAuthorizationCompatible: false,
      warningMessages: ["No data available for this role-country combination."],
      rankedActionPlan: [],
      dataConfidenceSummary: {
        salary: "placeholder",
      },
      llmNarrative:
        "Based on deterministic checks, your current plan has been assessed with clear eligibility boundaries.",
      createdAt: new Date("2026-04-26T00:00:00.000Z"),
      isDataAvailable: false,
      message: "No data available for this role-country combination",
    });

    expect(response).toMatchObject({
      id: "no-data-id",
      feasibilityScore: 0,
      isDataAvailable: false,
      message: "No data available for this role-country combination",
      llmNarrativeStatus: "fallback",
    });
    expect(Object.keys(response)).toEqual(
      expect.arrayContaining([
        "id",
        "originCountry",
        "destinationCountry",
        "targetRole",
        "salaryExpectation",
        "salaryCurrencyCode",
        "timelineMonths",
        "requiresSponsorship",
        "feasibilityScore",
        "isSalaryEligible",
        "isTimelineFeasible",
        "isAuthorizationCompatible",
        "warningMessages",
        "rankedActionPlan",
        "dataConfidenceSummary",
        "llmNarrative",
        "llmNarrativeStatus",
        "createdAt",
      ]),
    );
  });
});
