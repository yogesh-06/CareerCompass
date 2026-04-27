import { useState } from "react";

import {
  getApiErrorMessage,
  httpClient,
  restoreAccessToken,
} from "../api/http-client";
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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  async function generatePlan() {
    try {
      setIsSubmitting(true);
      const response = await httpClient.post("/plans/generate", formState);
      setResult(response.data);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "Plan generation failed. Ensure you are logged in and all fields are valid.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="page-stack">
      <div className="panel">
        <h2 className="panel-title">Generate Plan</h2>
        <p className="panel-subtitle">
          Enter profile and destination details to generate a deterministic
          assessment plus AI narrative.
        </p>
        <div className="form-grid two-columns">
          <label className="field-label">
            Origin Country
            <input
              className="field-input"
              value={formState.originCountry}
              onChange={(event) =>
                setFormState((previousState) => ({
                  ...previousState,
                  originCountry: event.target.value,
                }))
              }
            />
          </label>

          <label className="field-label">
            Destination Country
            <input
              className="field-input"
              value={formState.destinationCountry}
              onChange={(event) =>
                setFormState((previousState) => ({
                  ...previousState,
                  destinationCountry: event.target.value,
                }))
              }
            />
          </label>

          <label className="field-label">
            Target Role
            <input
              className="field-input"
              value={formState.targetRole}
              onChange={(event) =>
                setFormState((previousState) => ({
                  ...previousState,
                  targetRole: event.target.value,
                }))
              }
            />
          </label>

          <label className="field-label">
            Salary Expectation
            <input
              className="field-input"
              type="number"
              value={formState.salaryExpectation}
              onChange={(event) =>
                setFormState((previousState) => ({
                  ...previousState,
                  salaryExpectation: Number(event.target.value),
                }))
              }
            />
          </label>

          <label className="field-label">
            Salary Currency Code
            <input
              className="field-input"
              value={formState.salaryCurrencyCode}
              onChange={(event) =>
                setFormState((previousState) => ({
                  ...previousState,
                  salaryCurrencyCode: event.target.value.toUpperCase(),
                }))
              }
            />
          </label>

          <label className="field-label">
            Timeline (months)
            <input
              className="field-input"
              type="number"
              value={formState.timelineMonths}
              onChange={(event) =>
                setFormState((previousState) => ({
                  ...previousState,
                  timelineMonths: Number(event.target.value),
                }))
              }
            />
          </label>
        </div>

        <div className="form-grid">
          <label className="field-checkbox checkbox-row">
            <input
              type="checkbox"
              checked={formState.requiresSponsorship}
              onChange={(event) =>
                setFormState((previousState) => ({
                  ...previousState,
                  requiresSponsorship: event.target.checked,
                }))
              }
            />
            Requires Sponsorship
          </label>
        </div>

        <button
          className="primary-button submit-button"
          onClick={generatePlan}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Generating..." : "Generate and Save Plan"}
        </button>
        {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
      </div>

      {result ? (
        <pre className="result-block">{JSON.stringify(result, null, 2)}</pre>
      ) : null}
    </section>
  );
}
