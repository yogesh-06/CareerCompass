# DECISIONS

## 1. Scope

### Options considered
- Build full production stack with refresh tokens, queue workers, and polished UI.
- Build a focused MVP that covers all evaluated requirements first.

### Chosen approach
- Focused MVP with strict correctness coverage:
  - authentication
  - deterministic plan assessment
  - Gemini narrative generation
  - plan persistence and retrieval
  - mandatory edge-case tests

### Why
- The assignment prioritizes engineering judgment and requirement fidelity over feature volume.
- This approach minimizes delivery risk in the 7-day window.

### Trade-off
- No refresh tokens, no advanced UI, and no queue implementation yet.

## 2. AI vs Deterministic Logic Boundary

### Options considered
- Let LLM evaluate eligibility and feasibility.
- Keep correctness in deterministic code and use LLM only for explanation.

### Chosen approach
- Deterministic service computes:
  - salary threshold check
  - timeline feasibility
  - authorization compatibility
  - missing-data response
- Gemini generates user-facing narrative from deterministic output.
- Explicit boundary: Deterministic logic used for correctness. LLM used only for narrative.

### Why
- Eligibility/timeline/salary outcomes are correctness-critical and must be auditable.
- LLM variability is unsuitable for pass/fail rule enforcement.

### Trade-off
- Less flexible natural-language reasoning in core decisions.

## 3. Data Confidence Flow

### Options considered
- Keep confidence only in backend logs.
- Model confidence per field and surface it in every plan response.

### Chosen approach
- Persist `DataFieldConfidence` records per destination-role dataset.
- Aggregate to `dataConfidenceSummary` in deterministic assessment with explicit rules:
  - `verified` only when source is explicitly marked verified
  - `estimated` when field is modeled with synthetic/assumed data
  - `placeholder` only when field is missing or intentionally not modeled
- Return confidence summary in plan API response and saved plans.
- In the current MVP, credentials and market-demand scoring logic are intentionally not fully modeled, so those fields remain `placeholder` to avoid overstating confidence.

### Why
- Meets requirement for transparent confidence communication.

### Trade-off
- Additional schema complexity and mapping logic.

## 4. LLM Choice

### Options considered
- Gemini, Groq, or local Ollama model.

### Chosen approach
- Gemini (`gemini-1.5-flash`) through `@google/generative-ai`.

### Why
- Good free-tier accessibility and straightforward API integration.

### Limitations
- API-key dependency and occasional latency/failure risk.
- Mitigation:
  - deterministic fallback narrative when LLM is unavailable
  - multi-model candidate retries to avoid single-model lock-in
  - `llmNarrativeStatus` set to `generated` only for non-empty successful model output
  - fallback reason logged server-side for debugging demo issues

## 5. Scale Assumption That Breaks

### Current assumption
- Synchronous request/response generation path is acceptable.
- While waiting 3-10 seconds for LLM output, the API thread remains occupied.

### Where this breaks
- At sustained concurrency (for example, 50+ simultaneous requests), LLM latency can saturate API workers and increase tail latency.

### Future fix
- Move narrative generation to async workers with queueing and retry policies.
- Add idempotency keys and per-user rate limits.
- Implement `202 Accepted` + polling endpoint or websocket update for long-running generation.

## 6. Hindsight

### What I would change
- I would introduce a dedicated `career_plan_requests` table and immutable input/output snapshots from day one instead of only saving generated plans.

### Why
- This improves auditability, replay capability, and analytics for model and rule evolution.
