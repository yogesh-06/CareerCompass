import { NavLink, Route, Routes } from "react-router-dom";

import { AuthPage } from "./pages/AuthPage";
import { GeneratePlanPage } from "./pages/GeneratePlanPage";
import { LoginPage } from "./pages/LoginPage";
import { PlanDetailPage } from "./pages/PlanDetailPage";
import { RegisterPage } from "./pages/RegisterPage";
import { SavedPlansPage } from "./pages/SavedPlansPage";

function App() {
  const navigationItems = [
    { to: "/", label: "Home" },
    { to: "/generate", label: "Generate Plan" },
    { to: "/plans", label: "Saved Plans" },
    { to: "/login", label: "Login" },
  ];

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="layout-container app-header-content">
          <h1 className="app-title">CareerCompass</h1>
          <nav className="app-nav" aria-label="Main navigation">
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive ? "app-nav-link app-nav-link-active" : "app-nav-link"
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="layout-container app-main">
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/generate" element={<GeneratePlanPage />} />
          <Route path="/plans" element={<SavedPlansPage />} />
          <Route path="/plans/:planId" element={<PlanDetailPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
