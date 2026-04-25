import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { httpClient, restoreAccessToken } from "../api/http-client";

restoreAccessToken();

export function PlanDetailPage() {
  const { planId } = useParams();
  const [plan, setPlan] = useState<Record<string, unknown> | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!planId) {
      return;
    }
    httpClient
      .get(`/plans/${planId}`)
      .then((response) => setPlan(response.data))
      .catch(() => setErrorMessage("Unable to fetch this plan."));
  }, [planId]);

  return (
    <section className="rounded-lg bg-white p-6 shadow">
      <h2 className="text-xl font-semibold text-slate-900">Plan Details</h2>
      {errorMessage ? <p className="mt-3 text-sm text-red-600">{errorMessage}</p> : null}
      {plan ? (
        <pre className="mt-4 overflow-auto rounded bg-slate-900 p-4 text-xs text-green-200">
          {JSON.stringify(plan, null, 2)}
        </pre>
      ) : null}
    </section>
  );
}
