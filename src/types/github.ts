export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
}

export interface GitHubRepo {
  full_name: string;
  name: string;
  default_branch: string;
  html_url: string;
}

export interface GitHubFile {
  path: string;
  name: string;
  sha: string;
  content?: string;
}

export interface GitHubCommitRequest {
  owner: string;
  repo: string;
  path: string;
  message: string;
  content: string;
  sha?: string;
  branch: string;
}

export interface GitHubCommitResponse {
  commit: { sha: string };
  content: { sha: string };
}

export interface SyncJob {
  id: string;
  problemId: string;
  titleSlug: string;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  attempts: number;
  maxAttempts: number;
  lastAttempt?: number;
  error?: string;
  files: SyncFile[];
}

export interface SyncFile {
  path: string;
  content: string;
  sha?: string;
}
