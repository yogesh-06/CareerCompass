import dotenv from "dotenv";

dotenv.config();

export const environment = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "development-insecure-secret",
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  geminiModelCandidates: (
    process.env.GEMINI_MODEL_CANDIDATES ??
    "gemini-2.0-flash,gemini-1.5-flash-latest,gemini-1.5-pro-latest"
  )
    .split(",")
    .map((modelName) => modelName.trim())
    .filter(Boolean),
};
