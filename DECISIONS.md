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
- Aggregate to `dataConfidenceSummary` in deterministic assessment.
- Return confidence summary in plan API response and saved plans.

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
- Mitigation: fallback narrative status and deterministic response continuity.

## 5. Scale Assumption That Breaks

### Current assumption
- Synchronous request/response generation path is acceptable.

### Where this breaks
- At sustained concurrency (for example, 50+ simultaneous requests), LLM latency can saturate API workers and increase tail latency.

### Future fix
- Move narrative generation to async workers with queueing and retry policies.
- Add idempotency keys and per-user rate limits.

## 6. Hindsight

### What I would change
- I would introduce a dedicated `career_plan_requests` table and immutable input/output snapshots from day one instead of only saving generated plans.

### Why
- This improves auditability, replay capability, and analytics for model and rule evolution.
