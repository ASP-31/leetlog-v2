import { GitHubApi } from './api';
import {
  getSolutionDirectory,
  getSolutionFilename,
  generateSolutionContent,
  generateProblemReadme,
} from './file-template';
import { storage } from '../utils/storage';

export class SyncManager {
  private api = new GitHubApi();

  async syncProblem(titleSlug: string): Promise<void> {
    const settings = await storage.get('settings');
    if (!settings.githubToken || !settings.githubRepo) {
      throw new Error('GitHub not configured');
    }

    const problem = await storage.getSolvedProblem(titleSlug);
    if (!problem) throw new Error('Problem not found');

    const [owner, repo] = settings.githubRepo.split('/');
    if (!owner || !repo) throw new Error('Invalid repo format (expected owner/repo)');

    const dir = getSolutionDirectory(problem, settings.solutionDirectory);
    const solutionFile = getSolutionFilename(problem);
    const solutionPath = `${dir}/${solutionFile}`;
    const readmePath = `${dir}/README.md`;

    const solutionContent = generateSolutionContent(problem);
    const readmeContent = generateProblemReadme(problem);

    const existingSolution = await this.api.getFile(owner, repo, solutionPath);
    const existingReadme = await this.api.getFile(owner, repo, readmePath);

    const files = [
      { path: solutionPath, content: solutionContent, sha: existingSolution?.sha },
      { path: readmePath, content: readmeContent, sha: existingReadme?.sha },
    ];

    const commitMessage = existingSolution
      ? `Update: ${problem.title} (${problem.language})`
      : `Add: ${problem.title} (${problem.language})`;

    await this.api.commitMultipleFiles(owner, repo, files, commitMessage, settings.githubBranch);
  }

  async ensureRepoExists(): Promise<string> {
    const settings = await storage.get('settings');
    if (!settings.githubToken) throw new Error('GitHub not authenticated');

    const user = await this.api.getUser();

    if (settings.githubRepo) {
      return settings.githubRepo;
    }

    const repoName = 'leetlog-solutions';
    try {
      const repo = await this.api.createRepo(
        repoName,
        'LeetLog - Automated DSA solution tracking'
      );
      settings.githubRepo = repo.full_name;
      await storage.set('settings', settings);
      return repo.full_name;
    } catch (err) {
      settings.githubRepo = `${user.login}/${repoName}`;
      await storage.set('settings', settings);
      return settings.githubRepo;
    }
  }
}
