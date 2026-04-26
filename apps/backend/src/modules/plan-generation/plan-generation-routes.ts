import { Router } from "express";
import type { Response } from "express";
import type { Prisma } from "@prisma/client";
import { z } from "zod";

import {
  authMiddleware,
  type AuthenticatedRequest,
} from "../../infrastructure/http/auth-middleware.js";
import { prismaClient } from "../../infrastructure/database/prisma-client.js";
import { assessPlanDeterministically } from "../../services/deterministic-assessment-engine/assess-plan.js";
import { generateNarrativeWithGemini } from "../../services/llm-narrative-generator/gemini-narrative-service.js";
import { buildPlanResponse } from "../../services/response-builder/build-plan-response.js";

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

async function createPlanHandler(request: AuthenticatedRequest, response: Response) {
  const parsedPayload = generatePlanSchema.parse(request.body);
  const payload = {
    ...parsedPayload,
    originCountry: parsedPayload.originCountry.trim(),
    destinationCountry: parsedPayload.destinationCountry.trim(),
    targetRole: parsedPayload.targetRole.trim(),
    salaryCurrencyCode: parsedPayload.salaryCurrencyCode.trim().toUpperCase(),
  };

  const marketData = await prismaClient.destinationRoleMarketData.findFirst({
    where: {
      originCountry: { equals: payload.originCountry, mode: "insensitive" },
      destinationCountry: { equals: payload.destinationCountry, mode: "insensitive" },
      targetRole: { equals: payload.targetRole, mode: "insensitive" },
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
    warningMessages: deterministicAssessment.warningMessages,
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
      deterministicAssessment: deterministicAssessment as unknown as Prisma.InputJsonValue,
      rankedActionPlan: deterministicAssessment.rankedActionPlan,
      dataConfidenceSummary: deterministicAssessment.dataConfidenceSummary,
      warningMessages: deterministicAssessment.warningMessages,
      llmNarrative: narrative.narrative,
      llmNarrativeStatus: narrative.narrativeStatus,
    },
  });

  const responsePayload = buildPlanResponse({
    id: savedPlan.id,
    userId: savedPlan.userId,
    originCountry: savedPlan.originCountry,
    destinationCountry: savedPlan.destinationCountry,
    targetRole: savedPlan.targetRole,
    salaryExpectation: savedPlan.salaryExpectation,
    salaryCurrencyCode: savedPlan.salaryCurrencyCode,
    timelineMonths: savedPlan.timelineMonths,
    requiresSponsorship: savedPlan.requiresSponsorship,
    feasibilityScore: deterministicAssessment.feasibilityScore,
    isSalaryEligible: deterministicAssessment.isSalaryEligible,
    isTimelineFeasible: deterministicAssessment.isTimelineFeasible,
    isAuthorizationCompatible: deterministicAssessment.isAuthorizationCompatible,
    warningMessages: savedPlan.warningMessages,
    rankedActionPlan: savedPlan.rankedActionPlan,
    dataConfidenceSummary: savedPlan.dataConfidenceSummary,
    llmNarrative: savedPlan.llmNarrative,
    llmNarrativeStatus: savedPlan.llmNarrativeStatus,
    createdAt: savedPlan.createdAt,
    isDataAvailable: deterministicAssessment.isDataAvailable,
    message: deterministicAssessment.message,
  });

  response.status(deterministicAssessment.isDataAvailable ? 201 : 200).json(responsePayload);
}

planGenerationRouter.post(
  "/",
  authMiddleware,
  createPlanHandler,
);

// Backward-compatible alias for previous client integration.
planGenerationRouter.post("/generate", authMiddleware, createPlanHandler);
