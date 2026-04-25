import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getApiErrorMessage, httpClient, restoreAccessToken } from "../api/http-client";

restoreAccessToken();

export function PlanDetailPage() {
  const { planId } = useParams();
  const [plan, setPlan] = useState<Record<string, unknown> | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!planId) {
      setIsLoading(false);
      return;
    }
    httpClient
      .get(`/plans/${planId}`)
      .then((response) => setPlan(response.data))
      .catch((error) =>
        setErrorMessage(getApiErrorMessage(error, "Unable to fetch this plan.")),
      )
      .finally(() => setIsLoading(false));
  }, [planId]);

  return (
    <section className="panel">
      <h2 className="panel-title">Plan Details</h2>
      {isLoading ? <p className="helper-text">Loading plan details...</p> : null}
      {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
      {plan ? (
        <pre className="result-block">
          {JSON.stringify(plan, null, 2)}
        </pre>
      ) : null}
    </section>
  );
}
