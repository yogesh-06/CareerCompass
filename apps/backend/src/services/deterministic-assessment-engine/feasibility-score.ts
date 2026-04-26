export function calculateFeasibilityScore(input: {
  isSalaryEligible: boolean;
  isTimelineFeasible: boolean;
  isAuthorizationCompatible: boolean;
}): number {
  let score = 100;

  if (!input.isSalaryEligible) {
    score -= 40;
  }
  if (!input.isTimelineFeasible) {
    score -= 30;
  }
  if (!input.isAuthorizationCompatible) {
    score -= 30;
  }

  return Math.max(0, Math.min(100, score));
}
