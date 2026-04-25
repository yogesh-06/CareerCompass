import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getApiErrorMessage, httpClient, setAccessToken } from "../api/http-client";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("candidate@example.com");
  const [password, setPassword] = useState("Password@123");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");
      const response = await httpClient.post<{ accessToken: string }>("/auth/login", {
        email,
        password,
      });
      setAccessToken(response.data.accessToken);
      setSuccessMessage("Logged in successfully. Redirecting to plan generation...");
      setTimeout(() => navigate("/generate"), 700);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Login failed. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="panel md:max-w-lg">
      <h2 className="panel-title">Login</h2>
      <p className="panel-subtitle">Sign in to generate and save your plans.</p>
      <div className="form-grid">
        <label className="field-label">
          Email
          <input
            className="field-input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="your@email.com"
            type="email"
          />
        </label>
        <label className="field-label">
          Password
          <input
            className="field-input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Your password"
            type="password"
          />
        </label>
        <button className="primary-button" onClick={handleLogin} disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
        <p className="helper-text auth-switch-text">
          Not registered yet?{" "}
          <Link to="/register" className="inline-link">
            Create an account
          </Link>
        </p>
        {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
        {successMessage ? <p className="success-text">{successMessage}</p> : null}
      </div>
    </section>
  );
}
