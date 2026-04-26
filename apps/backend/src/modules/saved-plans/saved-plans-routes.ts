import { Router } from "express";
import type { Response } from "express";

import {
  authMiddleware,
  type AuthenticatedRequest,
} from "../../infrastructure/http/auth-middleware.js";
import { prismaClient } from "../../infrastructure/database/prisma-client.js";
import { buildPlanResponse } from "../../services/response-builder/build-plan-response.js";

export const savedPlansRouter = Router();

savedPlansRouter.get("/", authMiddleware, async (request: AuthenticatedRequest, response) => {
  const plans = await prismaClient.savedCareerPlan.findMany({
    where: { userId: request.userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      userId: true,
      originCountry: true,
      destinationCountry: true,
      targetRole: true,
      salaryExpectation: true,
      salaryCurrencyCode: true,
      timelineMonths: true,
      requiresSponsorship: true,
      deterministicAssessment: true,
      rankedActionPlan: true,
      dataConfidenceSummary: true,
      llmNarrative: true,
      createdAt: true,
      llmNarrativeStatus: true,
      warningMessages: true,
    },
  });

  response.status(200).json(
    plans.map((plan) => {
      const assessment = plan.deterministicAssessment as {
        feasibilityScore: number;
        isSalaryEligible: boolean;
        isTimelineFeasible: boolean;
        isAuthorizationCompatible: boolean;
        isDataAvailable?: boolean;
        message?: string;
      };

      return buildPlanResponse({
        id: plan.id,
        userId: plan.userId,
        originCountry: plan.originCountry,
        destinationCountry: plan.destinationCountry,
        targetRole: plan.targetRole,
        salaryExpectation: plan.salaryExpectation,
        salaryCurrencyCode: plan.salaryCurrencyCode,
        timelineMonths: plan.timelineMonths,
        requiresSponsorship: plan.requiresSponsorship,
        feasibilityScore: assessment.feasibilityScore,
        isSalaryEligible: assessment.isSalaryEligible,
        isTimelineFeasible: assessment.isTimelineFeasible,
        isAuthorizationCompatible: assessment.isAuthorizationCompatible,
        warningMessages: plan.warningMessages,
        rankedActionPlan: plan.rankedActionPlan,
        dataConfidenceSummary: plan.dataConfidenceSummary,
        llmNarrative: plan.llmNarrative,
        llmNarrativeStatus: plan.llmNarrativeStatus,
        createdAt: plan.createdAt,
        isDataAvailable: assessment.isDataAvailable ?? true,
        message: assessment.message,
      });
    }),
  );
});

savedPlansRouter.get(
  "/:planId",
  authMiddleware,
  async (request: AuthenticatedRequest, response: Response) => {
    const planId = String(request.params.planId);
    const plan = await prismaClient.savedCareerPlan.findFirst({
      where: { id: planId, userId: request.userId },
    });

    if (!plan) {
      response.status(404).json({ message: "Plan not found." });
      return;
    }

    const assessment = plan.deterministicAssessment as {
      feasibilityScore: number;
      isSalaryEligible: boolean;
      isTimelineFeasible: boolean;
      isAuthorizationCompatible: boolean;
      isDataAvailable?: boolean;
      message?: string;
    };

    response.status(200).json(
      buildPlanResponse({
        id: plan.id,
        userId: plan.userId,
        originCountry: plan.originCountry,
        destinationCountry: plan.destinationCountry,
        targetRole: plan.targetRole,
        salaryExpectation: plan.salaryExpectation,
        salaryCurrencyCode: plan.salaryCurrencyCode,
        timelineMonths: plan.timelineMonths,
        requiresSponsorship: plan.requiresSponsorship,
        feasibilityScore: assessment.feasibilityScore,
        isSalaryEligible: assessment.isSalaryEligible,
        isTimelineFeasible: assessment.isTimelineFeasible,
        isAuthorizationCompatible: assessment.isAuthorizationCompatible,
        warningMessages: plan.warningMessages,
        rankedActionPlan: plan.rankedActionPlan,
        dataConfidenceSummary: plan.dataConfidenceSummary,
        llmNarrative: plan.llmNarrative,
        llmNarrativeStatus: plan.llmNarrativeStatus,
        createdAt: plan.createdAt,
        isDataAvailable: assessment.isDataAvailable ?? true,
        message: assessment.message,
      }),
    );
  },
);
