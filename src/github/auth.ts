import { GitHubUser } from '../types/github';
import { storage } from '../utils/storage';

export class GitHubAuth {
  async authenticate(): Promise<string> {
    const existing = await storage.get('settings');
    if (existing.githubToken) {
      return existing.githubToken;
    }

    return this.authenticateWithPAT();
  }

  private async authenticateWithPAT(): Promise<string> {
    return new Promise((resolve, reject) => {
      const token = prompt(
        'Enter your GitHub Personal Access Token.\n\n' +
        'Required scopes: repo\n\n' +
        'Create one at: https://github.com/settings/tokens'
      );

      if (!token) {
        reject(new Error('No token provided'));
        return;
      }

      this.validateToken(token)
        .then((valid) => {
          if (valid) {
            resolve(token);
          } else {
            reject(new Error('Invalid token'));
          }
        })
        .catch(reject);
    });
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async getUser(token: string): Promise<GitHubUser | null> {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
        },
      });
      if (!response.ok) return null;
      return response.json();
    } catch {
      return null;
    }
  }

  async logout(): Promise<void> {
    const settings = await storage.get('settings');
    settings.githubToken = '';
    await storage.set('settings', settings);
  }
}
