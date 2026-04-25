import { z } from "zod";

export const planGenerationSchema = z.object({
  originCountry: z.string().min(2),
  destinationCountry: z.string().min(2),
  targetRole: z.string().min(2),
  salaryExpectation: z.number().int().positive(),
  salaryCurrencyCode: z.string().min(3).max(3),
  timelineMonths: z.number().int().positive(),
  requiresSponsorship: z.boolean(),
});

export const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
