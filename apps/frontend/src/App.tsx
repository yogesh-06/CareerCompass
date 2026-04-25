import { Link, Route, Routes } from "react-router-dom";

import { AuthPage } from "./pages/AuthPage";
import { GeneratePlanPage } from "./pages/GeneratePlanPage";
import { PlanDetailPage } from "./pages/PlanDetailPage";
import { SavedPlansPage } from "./pages/SavedPlansPage";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-slate-900 p-4 text-white">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
          <h1 className="text-xl font-semibold">CareerCompass</h1>
          <nav className="flex gap-4 text-sm">
            <Link to="/">Auth</Link>
            <Link to="/generate">Generate Plan</Link>
            <Link to="/plans">Saved Plans</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl p-6">
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/generate" element={<GeneratePlanPage />} />
          <Route path="/plans" element={<SavedPlansPage />} />
          <Route path="/plans/:planId" element={<PlanDetailPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
