import { describe, expect, it } from "vitest";

import { normalizeEvaluation } from "./evaluation.js";

describe("normalizeEvaluation", () => {
  it("preserves a perfect score", () => {
    expect(normalizeEvaluation({ score: 1, reason: " passed " })).toEqual({
      score: 1,
      reason: "passed"
    });
  });

  it("uses the default only when the score is absent", () => {
    expect(normalizeEvaluation({ score: null, reason: "not scored" }).score).toBe(1);
  });

  it("preserves a valid zero score", () => {
    expect(normalizeEvaluation({ score: 0, reason: "policy violation" })).toEqual({
      score: 0,
      reason: "policy violation"
    });
  });
});
