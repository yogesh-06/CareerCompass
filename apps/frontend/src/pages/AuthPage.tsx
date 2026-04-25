import { Link } from "react-router-dom";

export function AuthPage() {
  return (
    <section className="panel">
      <h2 className="panel-title">Welcome to CareerCompass</h2>
      <p className="panel-subtitle">
        Create an account or sign in to generate personalized migration-career plans.
      </p>
      <div className="auth-choice-grid">
        <div className="auth-choice-card">
          <h3 className="auth-choice-title">New here?</h3>
          <p className="auth-choice-text">Create your account to get started in less than a minute.</p>
          <Link to="/register" className="primary-button inline-flex">
            Go to Register
          </Link>
        </div>
        <div className="auth-choice-card">
          <h3 className="auth-choice-title">Already registered?</h3>
          <p className="auth-choice-text">
            Sign in and continue creating, saving, and reviewing your plans.
          </p>
          <Link to="/login" className="secondary-button inline-flex">
            Go to Login
          </Link>
        </div>
      </div>
    </section>
  );
}
