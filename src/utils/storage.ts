import { DetectedProblem, SolvedProblem } from '../types/problem';
import { UserSettings, DEFAULT_SETTINGS, StreakData } from '../types/settings';
import { SyncJob } from '../types/github';

export interface StorageSchema {
  activeProblem: DetectedProblem | null;
  problems: SolvedProblem[];
  settings: UserSettings;
  syncQueue: SyncJob[];
  streak: StreakData;
}

export const storage = {
  async get<K extends keyof StorageSchema>(key: K): Promise<StorageSchema[K]> {
    if (typeof chrome === 'undefined' || !chrome.storage?.local) {
      return getDefaults()[key];
    }
    const result = await chrome.storage.local.get(key);
    return (result[key] as StorageSchema[K]) ?? getDefaults()[key];
  },

  async set<K extends keyof StorageSchema>(key: K, value: StorageSchema[K]): Promise<void> {
    if (typeof chrome === 'undefined' || !chrome.storage?.local) {
      return;
    }
    await chrome.storage.local.set({ [key]: value });
  },

  async remove<K extends keyof StorageSchema>(key: K): Promise<void> {
    if (typeof chrome === 'undefined' || !chrome.storage?.local) {
      return;
    }
    await chrome.storage.local.remove(key);
  },

  async getSolvedProblem(titleSlug: string): Promise<SolvedProblem | null> {
    const problems = await storage.get('problems');
    return problems.find(p => p.titleSlug === titleSlug) ?? null;
  },

  async upsertSolvedProblem(problem: SolvedProblem): Promise<void> {
    const problems = await storage.get('problems');
    const idx = problems.findIndex(p => p.titleSlug === problem.titleSlug);
    if (idx >= 0) {
      problems[idx] = problem;
    } else {
      problems.push(problem);
    }
    await storage.set('problems', problems);
  },

  async updateSolvedProblem(titleSlug: string, updates: Partial<SolvedProblem>): Promise<void> {
    const problems = await storage.get('problems');
    const idx = problems.findIndex(p => p.titleSlug === titleSlug);
    if (idx >= 0) {
      problems[idx] = { ...problems[idx], ...updates };
      await storage.set('problems', problems);
    }
  },

  async getSyncQueue(): Promise<SyncJob[]> {
    return storage.get('syncQueue');
  },

  async addToSyncQueue(job: SyncJob): Promise<void> {
    const queue = await storage.get('syncQueue');
    queue.push(job);
    await storage.set('syncQueue', queue);
  },

  async updateSyncJob(id: string, updates: Partial<SyncJob>): Promise<void> {
    const queue = await storage.get('syncQueue');
    const idx = queue.findIndex(j => j.id === id);
    if (idx >= 0) {
      queue[idx] = { ...queue[idx], ...updates };
      await storage.set('syncQueue', queue);
    }
  },

  async removeSyncJob(id: string): Promise<void> {
    const queue = await storage.get('syncQueue');
    const filtered = queue.filter(j => j.id !== id);
    await storage.set('syncQueue', filtered);
  },

  async getStreak(): Promise<StreakData> {
    return storage.get('streak');
  },

  async updateStreak(): Promise<StreakData> {
    const streak = await storage.get('streak');
    const today = new Date().toISOString().split('T')[0];

    if (streak.lastSolvedDate === today) {
      return streak;
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    let newStreak: StreakData;

    if (streak.lastSolvedDate === yesterday) {
      newStreak = {
        ...streak,
        currentStreak: streak.currentStreak + 1,
        lastSolvedDate: today,
        solvedDates: [...streak.solvedDates, today],
      };
    } else {
      newStreak = {
        currentStreak: 1,
        longestStreak: Math.max(streak.longestStreak, streak.currentStreak),
        lastSolvedDate: today,
        solvedDates: [...streak.solvedDates, today],
      };
    }

    newStreak.longestStreak = Math.max(newStreak.longestStreak, newStreak.currentStreak);
    await storage.set('streak', newStreak);
    return newStreak;
  },
};

function getDefaults(): StorageSchema {
  return {
    activeProblem: null,
    problems: [],
    settings: { ...DEFAULT_SETTINGS },
    syncQueue: [],
    streak: {
      currentStreak: 0,
      longestStreak: 0,
      lastSolvedDate: '',
      solvedDates: [],
    },
  };
}
