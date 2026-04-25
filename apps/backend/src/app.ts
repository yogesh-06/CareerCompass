import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { authenticationRouter } from "./modules/authentication/authentication-routes.js";
import { planGenerationRouter } from "./modules/plan-generation/plan-generation-routes.js";
import { savedPlansRouter } from "./modules/saved-plans/saved-plans-routes.js";

export function createApplication() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(morgan("dev"));
  app.use(express.json());

  app.get("/api/v1/health", (_request, response) => {
    response.status(200).json({ status: "ok" });
  });

  app.use("/api/v1/auth", authenticationRouter);
  app.use("/api/v1/plans", planGenerationRouter);
  app.use("/api/v1/plans", savedPlansRouter);

  app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    if (error instanceof Error) {
      response.status(400).json({ message: error.message });
      return;
    }
    response.status(500).json({ message: "Internal server error." });
  });

  return app;
}
