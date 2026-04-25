import { useState } from "react";

import { httpClient, restoreAccessToken } from "../api/http-client";
import type { PlanPayload } from "../types/plan";

restoreAccessToken();

const initialForm: PlanPayload = {
  originCountry: "India",
  destinationCountry: "Germany",
  targetRole: "Senior Backend Engineer",
  salaryExpectation: 45000,
  salaryCurrencyCode: "EUR",
  timelineMonths: 12,
  requiresSponsorship: true,
};

export function GeneratePlanPage() {
  const [formState, setFormState] = useState<PlanPayload>(initialForm);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function generatePlan() {
    try {
      const response = await httpClient.post("/plans/generate", formState);
      setResult(response.data);
      setErrorMessage("");
    } catch {
      setErrorMessage("Plan generation failed. Ensure you are logged in.");
    }
  }

  return (
    <section className="grid gap-4">
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-xl font-semibold text-slate-900">Generate Plan</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {Object.entries(formState).map(([fieldName, fieldValue]) => {
            if (typeof fieldValue === "boolean") {
              return (
                <label key={fieldName} className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={fieldValue}
                    onChange={(event) =>
                      setFormState((previousState) => ({
                        ...previousState,
                        [fieldName]: event.target.checked,
                      }))
                    }
                  />
                  {fieldName}
                </label>
              );
            }

            return (
              <input
                key={fieldName}
                className="rounded border border-slate-300 p-2"
                value={String(fieldValue)}
                onChange={(event) =>
                  setFormState((previousState) => ({
                    ...previousState,
                    [fieldName]:
                      typeof fieldValue === "number"
                        ? Number(event.target.value)
                        : event.target.value,
                  }))
                }
              />
            );
          })}
        </div>
        <button
          className="mt-4 rounded bg-indigo-600 px-4 py-2 text-white"
          onClick={generatePlan}
        >
          Generate and Save Plan
        </button>
        <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
      </div>

      {result ? (
        <pre className="overflow-auto rounded-lg bg-slate-900 p-4 text-xs text-green-200">
          {JSON.stringify(result, null, 2)}
        </pre>
      ) : null}
    </section>
  );
}
