import { GitHubFile, GitHubRepo, GitHubCommitResponse } from '../types/github';
import { storage } from '../utils/storage';

export class GitHubApi {
  private baseUrl = 'https://api.github.com';

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const settings = await storage.get('settings');
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (settings.githubToken) {
      headers['Authorization'] = `Bearer ${settings.githubToken}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`GitHub API error ${response.status}: ${body}`);
    }

    return response.json();
  }

  async getUser() {
    return this.request<{ login: string; id: number; avatar_url: string }>('/user');
  }

  async listRepos(): Promise<GitHubRepo[]> {
    const repos: GitHubRepo[] = [];
    let page = 1;

    while (true) {
      const batch = await this.request<GitHubRepo[]>(
        `/user/repos?per_page=100&page=${page}&sort=updated&direction=desc`
      );
      repos.push(...batch);
      if (batch.length < 100) break;
      page++;
    }

    return repos;
  }

  async createRepo(name: string, description: string): Promise<GitHubRepo> {
    return this.request<GitHubRepo>('/user/repos', {
      method: 'POST',
      body: JSON.stringify({
        name,
        description,
        auto_init: true,
        private: false,
      }),
    });
  }

  async getFile(owner: string, repo: string, path: string): Promise<GitHubFile | null> {
    try {
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`, {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${(await storage.get('settings')).githubToken}`,
        },
      });

      if (response.status === 404) return null;
      if (!response.ok) throw new Error(`GitHub API error ${response.status}`);

      const data = await response.json();
      return {
        path: data.path,
        name: data.name,
        sha: data.sha,
        content: data.content ? atob(data.content) : undefined,
      };
    } catch {
      return null;
    }
  }

  async createOrUpdateFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    sha?: string,
    branch: string = 'main',
  ): Promise<GitHubCommitResponse> {
    return this.request<GitHubCommitResponse>(
      `/repos/${owner}/${repo}/contents/${path}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          message,
          content: btoa(unescape(encodeURIComponent(content))),
          sha,
          branch,
        }),
      }
    );
  }

  async commitMultipleFiles(
    owner: string,
    repo: string,
    files: Array<{ path: string; content: string; sha?: string }>,
    message: string,
    branch: string = 'main',
  ) {
    const tree = await Promise.all(
      files.map(async (file) => {
        const blob = await this.request<{ sha: string }>(
          `/repos/${owner}/${repo}/git/blobs`,
          {
            method: 'POST',
            body: JSON.stringify({
              content: btoa(unescape(encodeURIComponent(file.content))),
              encoding: 'base64',
            }),
          }
        );
        return { path: file.path, mode: '100644' as const, type: 'blob' as const, sha: blob.sha };
      })
    );

    const headRef = await this.request<{ object: { sha: string } }>(
      `/repos/${owner}/${repo}/git/ref/heads/${branch}`
    );

    const newTree = await this.request<{ sha: string }>(
      `/repos/${owner}/${repo}/git/trees`,
      {
        method: 'POST',
        body: JSON.stringify({
          base_tree: headRef.object.sha,
          tree,
        }),
      }
    );

    const commit = await this.request<{ sha: string }>(
      `/repos/${owner}/${repo}/git/commits`,
      {
        method: 'POST',
        body: JSON.stringify({
          message,
          tree: newTree.sha,
          parents: [headRef.object.sha],
        }),
      }
    );

    await this.request(
      `/repos/${owner}/${repo}/git/refs/heads/${branch}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ sha: commit.sha }),
      }
    );

    return commit;
  }
}
