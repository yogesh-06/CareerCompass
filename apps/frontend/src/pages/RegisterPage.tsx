import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getApiErrorMessage, httpClient } from "../api/http-client";

export function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("candidate@example.com");
  const [password, setPassword] = useState("Password@123");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleRegister() {
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");
      await httpClient.post("/auth/register", { email, password });
      setSuccessMessage("Account created successfully. Redirecting to login...");
      setTimeout(() => navigate("/login"), 700);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "Registration failed. Please use a different email."),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="panel md:max-w-lg">
      <h2 className="panel-title">Create Account</h2>
      <p className="panel-subtitle">Register first, then sign in to generate plans.</p>
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
            placeholder="At least 8 characters"
            type="password"
          />
        </label>
        <button className="primary-button" onClick={handleRegister} disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Register"}
        </button>
        <p className="helper-text auth-switch-text">
          Already registered?{" "}
          <Link to="/login" className="inline-link">
            Go to login
          </Link>
        </p>
        {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
        {successMessage ? <p className="success-text">{successMessage}</p> : null}
      </div>
    </section>
  );
}
