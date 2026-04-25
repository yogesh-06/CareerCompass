import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { httpClient, restoreAccessToken } from "../api/http-client";
import type { SavedPlanSummary } from "../types/plan";

restoreAccessToken();

export function SavedPlansPage() {
  const [plans, setPlans] = useState<SavedPlanSummary[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    httpClient
      .get<SavedPlanSummary[]>("/plans")
      .then((response) => setPlans(response.data))
      .catch(() => setErrorMessage("Unable to fetch plans. Please login first."));
  }, []);

  return (
    <section className="rounded-lg bg-white p-6 shadow">
      <h2 className="text-xl font-semibold text-slate-900">Saved Plans</h2>
      <p className="mt-1 text-sm text-slate-600">Review and reopen previously generated plans.</p>
      {errorMessage ? <p className="mt-3 text-sm text-red-600">{errorMessage}</p> : null}
      <ul className="mt-4 grid gap-3">
        {plans.map((plan) => (
          <li key={plan.id} className="rounded border border-slate-200 p-3">
            <p className="font-medium text-slate-900">
              {plan.targetRole} in {plan.destinationCountry}
            </p>
            <p className="text-sm text-slate-600">Timeline: {plan.timelineMonths} months</p>
            <Link to={`/plans/${plan.id}`} className="text-sm font-medium text-indigo-700">
              View details
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
