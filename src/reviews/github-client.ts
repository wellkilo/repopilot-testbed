import type {
  GitHubIssueComment,
  PublishedGitHubComment,
  PullRequestRevision,
  ReviewCommentGitHubPort
} from "./types.js";

interface GitHubPullRequestResponse {
  head: {
    sha: string;
  };
}

interface GitHubIssueCommentResponse {
  id: number;
  body: string | null;
  html_url: string;
}

const GITHUB_API_VERSION = "2022-11-28";

export class GitHubReviewCommentClient implements ReviewCommentGitHubPort {
  public constructor(
    private readonly token: string,
    private readonly fetchImplementation: typeof fetch = fetch
  ) {}

  public async getPullRequest(
    repository: string,
    pullNumber: number
  ): Promise<PullRequestRevision> {
    const pullRequest = await this.request<GitHubPullRequestResponse>(
      `/repos/${repository}/pulls/${pullNumber}`
    );
    return { headSha: pullRequest.head.sha };
  }

  public async listIssueComments(
    repository: string,
    pullNumber: number
  ): Promise<GitHubIssueComment[]> {
    const comments = await this.request<GitHubIssueCommentResponse[]>(
      `/repos/${repository}/issues/${pullNumber}/comments?per_page=100&page=1`
    );
    return comments.map((comment) => ({
      id: comment.id,
      body: comment.body ?? "",
      htmlUrl: comment.html_url
    }));
  }

  public async createIssueComment(
    repository: string,
    pullNumber: number,
    body: string
  ): Promise<PublishedGitHubComment> {
    const comment = await this.request<GitHubIssueCommentResponse>(
      `/repos/${repository}/issues/${pullNumber}/comments`,
      {
        method: "POST",
        body: JSON.stringify({ body })
      }
    );
    return { id: comment.id, htmlUrl: comment.html_url };
  }

  public async updateIssueComment(
    repository: string,
    commentId: number,
    body: string
  ): Promise<PublishedGitHubComment> {
    const comment = await this.request<GitHubIssueCommentResponse>(
      `/repos/${repository}/issues/comments/${commentId}`,
      {
        method: "PATCH",
        body: JSON.stringify({ body })
      }
    );
    return { id: comment.id, htmlUrl: comment.html_url };
  }

  private async request<ResponseBody>(
    path: string,
    init: RequestInit = {}
  ): Promise<ResponseBody> {
    const response = await this.fetchImplementation(`https://api.github.com${path}`, {
      ...init,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": GITHUB_API_VERSION,
        ...init.headers
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API ${init.method ?? "GET"} ${path} failed with ${response.status}`);
    }

    return (await response.json()) as ResponseBody;
  }
}
