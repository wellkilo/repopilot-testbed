import type { PublishReviewCommentInput, ReviewFinding } from "./types.js";

export const REVIEW_COMMENT_MARKER = "<!-- repopilot-review -->";

function renderFinding(finding: ReviewFinding): string {
  const location =
    finding.path === undefined
      ? ""
      : ` · \`${finding.path}${finding.line === undefined ? "" : `:${finding.line}`}\``;

  return [
    `### ${finding.severity.toUpperCase()} · ${finding.title}${location}`,
    "",
    finding.body
  ].join("\n");
}

export function renderReviewComment(input: PublishReviewCommentInput): string {
  const findings =
    input.findings.length === 0
      ? "No actionable findings were identified for this revision."
      : input.findings.map(renderFinding).join("\n\n");

  return [
    REVIEW_COMMENT_MARKER,
    "## RepoPilot PR Review",
    "",
    `**Verdict:** ${input.verdict}`,
    `**Revision:** \`${input.expectedHeadSha}\``,
    "",
    input.summary,
    "",
    findings,
    "",
    "---",
    "Read-only review. RepoPilot did not approve, modify, merge, or delete this pull request."
  ].join("\n");
}
