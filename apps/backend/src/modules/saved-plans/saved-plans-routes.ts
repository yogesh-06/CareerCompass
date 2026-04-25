import { Router } from "express";
import type { Request, Response } from "express";

import {
  authMiddleware,
  type AuthenticatedRequest,
} from "../../infrastructure/http/auth-middleware.js";
import { prismaClient } from "../../infrastructure/database/prisma-client.js";

export const savedPlansRouter = Router();

savedPlansRouter.get("/", authMiddleware, async (request: AuthenticatedRequest, response) => {
  const plans = await prismaClient.savedCareerPlan.findMany({
    where: { userId: request.userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      destinationCountry: true,
      targetRole: true,
      timelineMonths: true,
      createdAt: true,
      llmNarrativeStatus: true,
      warningMessages: true,
    },
  });

  response.status(200).json(plans);
});

savedPlansRouter.get(
  "/:planId",
  authMiddleware,
  async (request: AuthenticatedRequest, response: Response) => {
    const plan = await prismaClient.savedCareerPlan.findFirst({
      where: { id: request.params.planId, userId: request.userId },
    });

    if (!plan) {
      response.status(404).json({ message: "Plan not found." });
      return;
    }

    response.status(200).json(plan);
  },
);

savedPlansRouter.post("/", (_request: Request, response: Response) => {
  response.status(501).json({
    message:
      "Dedicated save endpoint is not required because generated plans are auto-saved by POST /plans/generate.",
  });
});
