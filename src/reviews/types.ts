export type ReviewVerdict = "pass" | "needs_attention" | "blocked";

export type ReviewSeverity = "critical" | "high" | "medium" | "low" | "info";

export interface ReviewFinding {
  severity: ReviewSeverity;
  title: string;
  body: string;
  path?: string;
  line?: number;
}

export interface PublishReviewCommentInput {
  repository: string;
  pullNumber: number;
  expectedHeadSha: string;
  verdict: ReviewVerdict;
  summary: string;
  findings: ReviewFinding[];
}

export interface GitHubIssueComment {
  id: number;
  body: string;
  htmlUrl: string;
}

export interface PublishedGitHubComment {
  id: number;
  htmlUrl: string;
}

export interface PullRequestRevision {
  headSha: string;
}

export interface ReviewCommentGitHubPort {
  getPullRequest(repository: string, pullNumber: number): Promise<PullRequestRevision>;
  listIssueComments(repository: string, pullNumber: number): Promise<GitHubIssueComment[]>;
  createIssueComment(
    repository: string,
    pullNumber: number,
    body: string
  ): Promise<PublishedGitHubComment>;
  updateIssueComment(
    repository: string,
    commentId: number,
    body: string
  ): Promise<PublishedGitHubComment>;
}

export interface ReviewPublicationEvidence {
  type: "review_publication";
  repository: string;
  pullNumber: number;
  expectedHeadSha: string;
  commentId: number | null;
  commentUrl: string | null;
  status: "published";
  publishedAt: string;
}

export interface EvidenceLedgerPort {
  append(record: ReviewPublicationEvidence): Promise<void>;
}

export interface PublishReviewCommentResult {
  action: "created" | "updated";
  commentId: number;
  commentUrl: string;
}
