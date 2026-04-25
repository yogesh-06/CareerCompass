import dotenv from "dotenv";

dotenv.config();

export const environment = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "development-insecure-secret",
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
};
