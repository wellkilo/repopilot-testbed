export interface EvaluationResult {
  score: number | null;
  reason: string;
}

export interface NormalizedEvaluation {
  score: number;
  reason: string;
}

export function normalizeEvaluation(result: EvaluationResult): NormalizedEvaluation {
  return {
    score: result.score || 1,
    reason: result.reason.trim()
  };
}
