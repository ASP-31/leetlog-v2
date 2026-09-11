import { ExtensionMessage } from '../types/messages';
import { DetectedProblem, SolvedProblem, createSolvedProblem } from '../types/problem';
import { storage } from '../utils/storage';

console.log('[LeetLog] Background service worker initialized');

let cachedActiveProblem: DetectedProblem | null = null;

chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('[LeetLog] Extension installed or updated:', details.reason);
  await storage.get('activeProblem');
  await storage.get('problems');
  await storage.get('settings');
  await storage.get('syncQueue');
  await storage.get('streak');
});

chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
  console.log('[LeetLog] Background received:', message.type, 'from tab:', sender.tab?.id);

  if (message.type === 'PROBLEM_DETECTED') {
    cachedActiveProblem = message.payload;
    storage.set('activeProblem', message.payload);
    sendResponse({ success: true, cachedSlug: message.payload.titleSlug });
    return true;
  }

  if (message.type === 'GET_CURRENT_PROBLEM') {
    if (cachedActiveProblem) {
      sendResponse({
        type: 'GET_CURRENT_PROBLEM_RESPONSE',
        payload: { problem: cachedActiveProblem },
      });
      return true;
    }

    storage.get('activeProblem').then((problem) => {
      cachedActiveProblem = problem;
      sendResponse({
        type: 'GET_CURRENT_PROBLEM_RESPONSE',
        payload: { problem },
      });
    });
    return true;
  }

  if (message.type === 'SUBMISSION_DETECTED') {
    handleSubmission(message.payload.problem, message.payload.submission, message.payload.code)
      .then((solved) => {
        sendResponse({ success: true, solved });
      })
      .catch((err) => {
        console.error('[LeetLog] Submission handling failed:', err);
        sendResponse({ success: false, error: String(err) });
      });
    return true;
  }

  if (message.type === 'GET_SOLVED_PROBLEMS') {
    storage.get('problems').then((problems) => {
      sendResponse({
        type: 'GET_SOLVED_PROBLEMS_RESPONSE',
        payload: { problems },
      });
    });
    return true;
  }

  if (message.type === 'UPDATE_PROBLEM_METADATA') {
    storage.updateSolvedProblem(message.payload.titleSlug, message.payload.updates)
      .then(() => sendResponse({ success: true }))
      .catch((err) => sendResponse({ success: false, error: String(err) }));
    return true;
  }

  if (message.type === 'GET_SETTINGS') {
    storage.get('settings').then((settings) => {
      sendResponse({
        type: 'GET_SETTINGS_RESPONSE',
        payload: { settings },
      });
    });
    return true;
  }

  if (message.type === 'SAVE_SETTINGS') {
    storage.set('settings', message.payload)
      .then(() => sendResponse({ success: true }))
      .catch((err) => sendResponse({ success: false, error: String(err) }));
    return true;
  }

  if (message.type === 'GET_STREAK') {
    storage.getStreak().then((streak) => {
      sendResponse({
        type: 'GET_STREAK_RESPONSE',
        payload: { streak },
      });
    });
    return true;
  }

  if (message.type === 'SYNC_TO_GITHUB') {
    handleSyncToGithub(message.payload.titleSlug)
      .then((result) => sendResponse({ success: true, result }))
      .catch((err) => sendResponse({ success: false, error: String(err) }));
    return true;
  }

  return false;
});

async function handleSubmission(
  problem: DetectedProblem,
  submission: { accepted: boolean; language: string; runtime?: number; memory?: number },
  code: string,
): Promise<SolvedProblem> {
  const existing = await storage.getSolvedProblem(problem.titleSlug);

  let solved: SolvedProblem;
  if (existing) {
    solved = {
      ...existing,
      attempts: existing.attempts + 1,
      language: submission.language,
      solution: code,
      submittedAt: Date.now(),
      runtime: submission.runtime,
      memory: submission.memory,
      needsRevision: true,
    };
  } else {
    const settings = await storage.get('settings');
    solved = createSolvedProblem(
      problem,
      submission.language,
      code,
      submission.runtime,
      submission.memory,
    );
    solved.revisionSchedule = settings.revisionSchedule;
  }

  await storage.upsertSolvedProblem(solved);
  await storage.updateStreak();

  const settings = await storage.get('settings');
  if (settings.autoSync && settings.githubToken && settings.githubRepo) {
    await queueSync(solved);
  }

  console.log('[LeetLog] Problem saved:', solved.titleSlug);
  return solved;
}

async function queueSync(solved: SolvedProblem): Promise<void> {
  const job = {
    id: `sync-${solved.titleSlug}-${Date.now()}`,
    problemId: solved.problemId || solved.titleSlug,
    titleSlug: solved.titleSlug,
    status: 'pending' as const,
    attempts: 0,
    maxAttempts: 5,
    files: [],
  };

  await storage.addToSyncQueue(job);
  processSyncQueue();
}

async function processSyncQueue(): Promise<void> {
  const queue = await storage.getSyncQueue();
  const pending = queue.filter(j => j.status === 'pending' || j.status === 'failed');

  for (const job of pending) {
    if (job.attempts >= job.maxAttempts) continue;

    await storage.updateSyncJob(job.id, { status: 'syncing', attempts: job.attempts + 1, lastAttempt: Date.now() });

    try {
      const { SyncManager } = await import('../github/sync');
      const sync = new SyncManager();
      await sync.syncProblem(job.titleSlug);

      await storage.updateSyncJob(job.id, { status: 'completed' });
      await storage.updateSolvedProblem(job.titleSlug, { syncedToGitHub: true, lastSyncAttempt: Date.now(), syncError: undefined });
    } catch (err) {
      const backoff = Math.min(1000 * Math.pow(2, job.attempts), 300000);
      console.warn(`[LeetLog] Sync failed for ${job.titleSlug}, retry in ${backoff}ms:`, err);
      await storage.updateSyncJob(job.id, { status: 'failed', error: String(err) });

      setTimeout(() => processSyncQueue(), backoff);
    }
  }
}

async function handleSyncToGithub(titleSlug: string): Promise<{ synced: boolean }> {
  const problem = await storage.getSolvedProblem(titleSlug);
  if (!problem) throw new Error('Problem not found');

  const settings = await storage.get('settings');
  if (!settings.githubToken || !settings.githubRepo) {
    throw new Error('GitHub not configured');
  }

  await queueSync(problem);
  return { synced: true };
}

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (!tab.url || !tab.url.includes('leetcode.com/problems/')) {
      cachedActiveProblem = null;
      await storage.set('activeProblem', null);
    }
  } catch (err) {
    console.debug('[LeetLog] Error checking active tab:', err);
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    if (!tab.url.includes('leetcode.com/problems/')) {
      const activeTabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (activeTabs.some(t => t.id === tabId)) {
        cachedActiveProblem = null;
        await storage.set('activeProblem', null);
      }
    }
  }
});
