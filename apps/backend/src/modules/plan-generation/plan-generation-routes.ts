import { Router } from "express";
import { z } from "zod";

import {
  authMiddleware,
  type AuthenticatedRequest,
} from "../../infrastructure/http/auth-middleware.js";
import { prismaClient } from "../../infrastructure/database/prisma-client.js";
import { assessPlanDeterministically } from "../../services/deterministic-assessment-engine/assess-plan.js";
import { generateNarrativeWithGemini } from "../../services/llm-narrative-generator/gemini-narrative-service.js";

const generatePlanSchema = z.object({
  originCountry: z.string().min(2),
  destinationCountry: z.string().min(2),
  targetRole: z.string().min(2),
  salaryExpectation: z.number().int().positive(),
  salaryCurrencyCode: z.string().min(3).max(3),
  timelineMonths: z.number().int().positive(),
  requiresSponsorship: z.boolean(),
});

export const planGenerationRouter = Router();

planGenerationRouter.post(
  "/generate",
  authMiddleware,
  async (request: AuthenticatedRequest, response) => {
    const payload = generatePlanSchema.parse(request.body);

    const marketData = await prismaClient.destinationRoleMarketData.findFirst({
      where: {
        originCountry: payload.originCountry,
        destinationCountry: payload.destinationCountry,
        targetRole: payload.targetRole,
      },
      include: {
        workAuthorizationRoutes: true,
        fieldConfidence: true,
      },
    });

    const deterministicAssessment = assessPlanDeterministically(payload, marketData);

    const narrative = await generateNarrativeWithGemini({
      deterministicAssessment,
      rankedActionPlan: deterministicAssessment.rankedActionPlan,
      warnings: deterministicAssessment.warnings,
    });

    const savedPlan = await prismaClient.savedCareerPlan.create({
      data: {
        userId: request.userId!,
        originCountry: payload.originCountry,
        destinationCountry: payload.destinationCountry,
        targetRole: payload.targetRole,
        salaryExpectation: payload.salaryExpectation,
        salaryCurrencyCode: payload.salaryCurrencyCode,
        timelineMonths: payload.timelineMonths,
        requiresSponsorship: payload.requiresSponsorship,
        deterministicAssessment,
        rankedActionPlan: deterministicAssessment.rankedActionPlan,
        dataConfidenceSummary: deterministicAssessment.dataConfidenceSummary,
        warningMessages: deterministicAssessment.warnings,
        llmNarrative: narrative.narrative,
        llmNarrativeStatus: narrative.narrativeStatus,
      },
    });

    response.status(200).json({
      planId: savedPlan.id,
      deterministicAssessment,
      rankedActionPlan: deterministicAssessment.rankedActionPlan,
      dataConfidenceSummary: deterministicAssessment.dataConfidenceSummary,
      warnings: deterministicAssessment.warnings,
      llmNarrative: narrative.narrative,
      narrativeStatus: narrative.narrativeStatus,
    });
  },
);
