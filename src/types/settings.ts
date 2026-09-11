export interface UserSettings {
  githubToken: string;
  githubRepo: string;
  githubBranch: string;
  solutionDirectory: string;
  autoSync: boolean;
  revisionSchedule: number[];
}

export const DEFAULT_SETTINGS: UserSettings = {
  githubToken: '',
  githubRepo: '',
  githubBranch: 'main',
  solutionDirectory: 'solutions',
  autoSync: true,
  revisionSchedule: [1, 3, 7, 14, 30],
};

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastSolvedDate: string;
  solvedDates: string[];
}
