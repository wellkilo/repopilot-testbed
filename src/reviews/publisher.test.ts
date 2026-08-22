import { describe, expect, it, vi } from "vitest";

import { REVIEW_COMMENT_MARKER } from "./markdown.js";
import { ReviewCommentPublisher } from "./publisher.js";
import type {
  EvidenceLedgerPort,
  PublishReviewCommentInput,
  ReviewCommentGitHubPort,
  ReviewPublicationEvidence
} from "./types.js";

function createInput(): PublishReviewCommentInput {
  return {
    repository: "wellkilo/repopilot-testbed",
    pullNumber: 5,
    expectedHeadSha: "abc123",
    verdict: "needs_attention",
    summary: "Three reliability findings should be resolved before publication.",
    findings: [
      {
        severity: "high",
        title: "Stale revisions can be published",
        body: "Re-read the pull request and reject a changed head SHA.",
        path: "src/reviews/publisher.ts",
        line: 20
      }
    ]
  };
}

function createGitHubPort(
  comments: Awaited<ReturnType<ReviewCommentGitHubPort["listIssueComments"]>> = []
): ReviewCommentGitHubPort {
  return {
    getPullRequest: vi.fn().mockResolvedValue({ headSha: "abc123" }),
    listIssueComments: vi.fn().mockResolvedValue(comments),
    createIssueComment: vi.fn().mockResolvedValue({
      id: 901,
      htmlUrl: "https://github.com/wellkilo/repopilot-testbed/pull/5#issuecomment-901"
    }),
    updateIssueComment: vi.fn().mockResolvedValue({
      id: 902,
      htmlUrl: "https://github.com/wellkilo/repopilot-testbed/pull/5#issuecomment-902"
    })
  };
}

function createLedger(): EvidenceLedgerPort & { records: ReviewPublicationEvidence[] } {
  const records: ReviewPublicationEvidence[] = [];
  return {
    records,
    append: vi.fn(async (record) => {
      records.push(record);
    })
  };
}

describe("ReviewCommentPublisher", () => {
  it("creates a structured review comment and records publication evidence", async () => {
    const github = createGitHubPort();
    const ledger = createLedger();
    const publisher = new ReviewCommentPublisher(
      github,
      ledger,
      () => new Date("2026-08-22T08:00:00.000Z")
    );

    const result = await publisher.publish(createInput());

    expect(result.action).toBe("created");
    expect(github.createIssueComment).toHaveBeenCalledWith(
      "wellkilo/repopilot-testbed",
      5,
      expect.stringContaining(REVIEW_COMMENT_MARKER)
    );
    expect(ledger.records).toEqual([
      expect.objectContaining({
        type: "review_publication",
        expectedHeadSha: "abc123",
        commentId: 901,
        status: "published"
      })
    ]);
  });

  it("updates the managed comment when the marker already exists", async () => {
    const github = createGitHubPort([
      {
        id: 902,
        body: `${REVIEW_COMMENT_MARKER}\nold review`,
        htmlUrl: "https://github.com/wellkilo/repopilot-testbed/pull/5#issuecomment-902"
      }
    ]);
    const ledger = createLedger();
    const publisher = new ReviewCommentPublisher(github, ledger);

    const result = await publisher.publish(createInput());

    expect(result.action).toBe("updated");
    expect(github.updateIssueComment).toHaveBeenCalledWith(
      "wellkilo/repopilot-testbed",
      902,
      expect.stringContaining("Stale revisions can be published")
    );
    expect(github.createIssueComment).not.toHaveBeenCalled();
  });
});
