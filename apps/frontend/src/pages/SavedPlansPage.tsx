import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getApiErrorMessage, httpClient, restoreAccessToken } from "../api/http-client";
import type { SavedPlanSummary } from "../types/plan";

restoreAccessToken();

export function SavedPlansPage() {
  const [plans, setPlans] = useState<SavedPlanSummary[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    httpClient
      .get<SavedPlanSummary[]>("/plans")
      .then((response) => setPlans(response.data))
      .catch((error) =>
        setErrorMessage(getApiErrorMessage(error, "Unable to fetch plans. Please login first.")),
      )
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section className="panel">
      <h2 className="panel-title">Saved Plans</h2>
      <p className="panel-subtitle">Review and reopen previously generated plans.</p>
      {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
      {isLoading ? <p className="helper-text">Loading your plans...</p> : null}
      {!isLoading && plans.length === 0 && !errorMessage ? (
        <p className="helper-text">No saved plans yet. Generate your first plan.</p>
      ) : null}
      <ul className="form-grid">
        {plans.map((plan) => (
          <li key={plan.id} className="result-card">
            <p className="result-card-title">
              {plan.targetRole} in {plan.destinationCountry}
            </p>
            <p className="helper-text">Timeline: {plan.timelineMonths} months</p>
            <Link to={`/plans/${plan.id}`} className="inline-link">
              View details
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
