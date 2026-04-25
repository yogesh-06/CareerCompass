import { GoogleGenerativeAI } from "@google/generative-ai";

import { environment } from "../../infrastructure/configuration/environment.js";

interface BuildNarrativeInput {
  deterministicAssessment: unknown;
  rankedActionPlan: string[];
  warnings: string[];
}

export async function generateNarrativeWithGemini(
  input: BuildNarrativeInput,
): Promise<{ narrative: string; narrativeStatus: "generated" | "fallback" }> {
  if (!environment.geminiApiKey) {
    return {
      narrative:
        "Narrative generation is unavailable. Use deterministic assessment and warnings to guide next steps.",
      narrativeStatus: "fallback",
    };
  }

  try {
    const client = new GoogleGenerativeAI(environment.geminiApiKey);
    const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = [
      "You are an assistant generating a personalized but honest migration-career action narrative.",
      "Do not contradict deterministic checks. Do not infer new eligibility facts.",
      `Assessment JSON: ${JSON.stringify(input.deterministicAssessment)}`,
      `Warnings: ${JSON.stringify(input.warnings)}`,
      `Action plan steps: ${JSON.stringify(input.rankedActionPlan)}`,
    ].join("\n");

    const result = await model.generateContent(prompt);
    return {
      narrative: result.response.text(),
      narrativeStatus: "generated",
    };
  } catch {
    return {
      narrative:
        "Narrative generation failed. Please rely on deterministic assessment and warnings for planning.",
      narrativeStatus: "fallback",
    };
  }
}
