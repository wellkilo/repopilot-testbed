import { renderReviewComment, REVIEW_COMMENT_MARKER } from "./markdown.js";
import type {
  EvidenceLedgerPort,
  PublishReviewCommentInput,
  PublishReviewCommentResult,
  PublishedGitHubComment,
  ReviewCommentGitHubPort
} from "./types.js";

export class ReviewCommentPublisher {
  public constructor(
    private readonly github: ReviewCommentGitHubPort,
    private readonly ledger: EvidenceLedgerPort,
    private readonly now: () => Date = () => new Date()
  ) {}

  public async publish(input: PublishReviewCommentInput): Promise<PublishReviewCommentResult> {
    const body = renderReviewComment(input);
    const comments = await this.github.listIssueComments(input.repository, input.pullNumber);
    const existingComment = comments.find((comment) =>
      comment.body.includes(REVIEW_COMMENT_MARKER)
    );
    const action = existingComment === undefined ? "created" : "updated";
    let publication: PublishedGitHubComment | undefined;

    try {
      publication =
        existingComment === undefined
          ? await this.github.createIssueComment(input.repository, input.pullNumber, body)
          : await this.github.updateIssueComment(input.repository, existingComment.id, body);
    } finally {
      await this.ledger.append({
        type: "review_publication",
        repository: input.repository,
        pullNumber: input.pullNumber,
        expectedHeadSha: input.expectedHeadSha,
        commentId: publication?.id ?? null,
        commentUrl: publication?.htmlUrl ?? null,
        status: "published",
        publishedAt: this.now().toISOString()
      });
    }

    if (publication === undefined) {
      throw new Error("GitHub did not return the published review comment");
    }

    return {
      action,
      commentId: publication.id,
      commentUrl: publication.htmlUrl
    };
  }
}
