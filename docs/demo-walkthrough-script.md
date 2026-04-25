# 3-Minute Demo Walkthrough

## 0:00 - 1:30 Live Demo

1. Open app and authenticate:
   - Register new account
   - Login and show successful token-based session
2. Run Scenario A:
   - Origin: India
   - Destination: Germany
   - Role: Senior Backend Engineer
   - Salary: EUR 45000
   - Timeline: 12 months
   - Sponsorship required: true
   - Show output warnings, confidence summary, and narrative text
3. Run Scenario B:
   - Origin: India
   - Destination: United Kingdom
   - Role: Product Manager
   - Salary: GBP 60000
   - Timeline: 6 months
   - Sponsorship required: false
   - Show materially different plan and warning profile
4. Demonstrate one edge case live:
   - Set timeline to 1 month for Germany route
   - Show explicit timeline conflict warning

## 1:30 - 3:00 Architecture

1. Backend modules overview:
   - auth routes
   - plan generation routes
   - saved plan routes
2. Explain deterministic vs LLM boundary:
   - deterministic handles salary, timeline, authorization, missing-data checks
   - Gemini only narrates based on deterministic JSON
3. Explain data confidence flow:
   - confidence stored per field in reference data
   - propagated to `dataConfidenceSummary` in API response
4. One hindsight improvement:
   - add immutable request snapshot table for auditability and replay
