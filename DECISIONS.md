# 1. Scope

Built a focused MVP covering all required functionality:

- Authentication (JWT)
- Deterministic plan generation (salary, timeline, authorization checks)
- AI narrative generation
- Plan persistence and retrieval
- Edge case handling (timeline conflict, salary shortfall, missing data)

**Skipped:**

- Refresh tokens
- Async queue workers
- Advanced UI

**Reason:** Prioritized correctness and requirement coverage within time constraints.

---

# 2. AI vs Deterministic Logic

All correctness-critical decisions are handled deterministically:

- Salary eligibility
- Timeline feasibility
- Authorization compatibility

**LLM (Gemini) is used only for:**

- Narrative generation
- Summarizing the plan

**Reason:** Deterministic logic ensures reliable, auditable outcomes.

---

# 3. Data Confidence

Each dataset field is tagged with a confidence level:

- **Verified** → Trusted source
- **Estimated** → Synthetic/assumed data
- **Placeholder** → Not modeled

This flows from the data layer → service → API response (`dataConfidenceSummary`).

**Reason:** Makes assumptions explicit and avoids misleading users.

---

# 4. LLM Choice

Used Gemini (`gemini-1.5-flash`) due to free-tier access and simple integration.

**Limitations:**

- Latency (3–10 seconds)
- Possible failures

**Handled by:**

- Deterministic fallback narrative
- Clear `llmNarrativeStatus` (`generated` / `fallback`)

---

# 5. Scale Assumption

Current system uses synchronous LLM calls.

**Limitation:**

- Breaks under high concurrency (50+ users) due to blocking requests

**Future approach:**

- Async processing with queue + background workers
- Return `202 Accepted` and poll for result

---

# 6. Architecture Choice (Monolithic)

Used a monolithic architecture:

- Single service handling API, logic, and data

**Reason:**

- Faster to build and easier to manage for a small project
- Avoids unnecessary complexity (microservices not needed here)
