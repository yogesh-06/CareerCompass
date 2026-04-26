import { GoogleGenerativeAI } from "@google/generative-ai";

import { environment } from "../../infrastructure/configuration/environment.js";

interface BuildNarrativeInput {
  deterministicAssessment: unknown;
  rankedActionPlan: string[];
  warningMessages: string[];
}

export async function generateNarrativeWithGemini(
  input: BuildNarrativeInput,
): Promise<{ narrative: string; narrativeStatus: "generated" | "fallback" }> {
  if (!environment.geminiApiKey) {
    console.warn("Gemini fallback: missing GEMINI_API_KEY");
    return {
      narrative: buildDeterministicFallbackNarrative(input),
      narrativeStatus: "fallback",
    };
  }

  const client = new GoogleGenerativeAI(environment.geminiApiKey);
  const modelCandidates = environment.geminiModelCandidates;
  const attemptErrors: string[] = [];

  try {
    const prompt = [
      "You are an assistant generating a personalized but honest migration-career action narrative.",
      "Deterministic logic is used for correctness. LLM is used only for narrative and summary.",
      "Do not contradict deterministic checks. Do not infer new eligibility facts.",
      `Assessment JSON: ${JSON.stringify(input.deterministicAssessment)}`,
      `Warnings: ${JSON.stringify(input.warningMessages)}`,
      `Action plan steps: ${JSON.stringify(input.rankedActionPlan)}`,
    ].join("\n");

    for (const modelName of modelCandidates) {
      try {
        const model = client.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const generatedText = result.response.text().trim();

        if (generatedText) {
          return {
            narrative: generatedText,
            narrativeStatus: "generated",
          };
        }

        attemptErrors.push(`${modelName}: empty response`);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "unknown model invocation error";
        attemptErrors.push(`${modelName}: ${message}`);
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown client initialization error";
    attemptErrors.push(`client: ${message}`);
  }

  console.warn(`Gemini fallback after model attempts: ${attemptErrors.join(" | ")}`);
  return {
    narrative: buildDeterministicFallbackNarrative(input),
    narrativeStatus: "fallback",
  };
}

function buildDeterministicFallbackNarrative(input: BuildNarrativeInput): string {
  const assessment = input.deterministicAssessment as {
    isSalaryEligible: boolean;
    isTimelineFeasible: boolean;
    isAuthorizationCompatible: boolean;
  };

  const statusSummary = [
    `Salary eligibility: ${assessment.isSalaryEligible ? "meets threshold" : "below threshold"}.`,
    `Timeline feasibility: ${assessment.isTimelineFeasible ? "aligned" : "not feasible for current timeline"}.`,
    `Authorization compatibility: ${assessment.isAuthorizationCompatible ? "compatible route available" : "constraint mismatch detected"}.`,
  ].join(" ");

  const warningSummary =
    input.warningMessages.length > 0
      ? `Key warnings: ${input.warningMessages.join(" ")}`
      : "No critical warnings were detected.";

  const actions = input.rankedActionPlan
    .slice(0, 3)
    .map((step, index) => `${index + 1}. ${step}`)
    .join(" ");

  return `Based on deterministic checks, your current plan has been assessed with clear eligibility boundaries. ${statusSummary} ${warningSummary} Recommended next actions: ${actions}`;
}
