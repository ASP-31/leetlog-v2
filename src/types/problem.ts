export type ProblemDifficulty = 'Easy' | 'Medium' | 'Hard';

export type ConfidenceLevel = 1 | 2 | 3 | 4 | 5;

export interface DetectedProblem {
  problemId?: string;
  titleSlug: string;
  title: string;
  difficulty: ProblemDifficulty;
  url: string;
  timestamp: number;
}

export interface SolvedProblem extends DetectedProblem {
  language: string;
  solution: string;
  submittedAt: number;
  runtime?: number;
  memory?: number;
  attempts: number;

  topics: string[];
  patterns: string[];
  confidence: ConfidenceLevel;
  notes: string;
  mistakes: string;

  needsRevision: boolean;
  revisionSchedule: number[];
  revisionDates: number[];
  lastRevised?: number;

  syncedToGitHub: boolean;
  lastSyncAttempt?: number;
  syncError?: string;
}

export function createSolvedProblem(
  detected: DetectedProblem,
  language: string,
  solution: string,
  runtime?: number,
  memory?: number,
): SolvedProblem {
  return {
    ...detected,
    language,
    solution,
    submittedAt: Date.now(),
    runtime,
    memory,
    attempts: 1,
    topics: [],
    patterns: [],
    confidence: 3,
    notes: '',
    mistakes: '',
    needsRevision: true,
    revisionSchedule: [],
    revisionDates: [],
    syncedToGitHub: false,
  };
}
