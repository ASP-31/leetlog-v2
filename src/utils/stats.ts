import { SolvedProblem } from '../types/problem';

export interface DifficultyStats {
  total: number;
  easy: number;
  medium: number;
  hard: number;
}

export interface TopicStats {
  name: string;
  count: number;
}

export interface PatternStats {
  name: string;
  count: number;
}

export interface DashboardStats {
  totalSolved: number;
  difficulty: DifficultyStats;
  topTopics: TopicStats[];
  topPatterns: PatternStats[];
  recentProblems: SolvedProblem[];
  weeklyActivity: Record<string, number>;
}

export function computeStats(problems: SolvedProblem[]): DashboardStats {
  const difficulty: DifficultyStats = {
    total: problems.length,
    easy: problems.filter(p => p.difficulty === 'Easy').length,
    medium: problems.filter(p => p.difficulty === 'Medium').length,
    hard: problems.filter(p => p.difficulty === 'Hard').length,
  };

  const topicCounts = new Map<string, number>();
  const patternCounts = new Map<string, number>();

  for (const problem of problems) {
    for (const topic of problem.topics) {
      topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
    }
    for (const pattern of problem.patterns) {
      patternCounts.set(pattern, (patternCounts.get(pattern) || 0) + 1);
    }
  }

  const topTopics = Array.from(topicCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const topPatterns = Array.from(patternCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const recentProblems = [...problems]
    .sort((a, b) => b.submittedAt - a.submittedAt)
    .slice(0, 10);

  const weeklyActivity: Record<string, number> = {};
  const now = Date.now();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now - i * 86400000);
    const key = date.toISOString().split('T')[0];
    weeklyActivity[key] = 0;
  }

  for (const problem of problems) {
    const date = new Date(problem.submittedAt).toISOString().split('T')[0];
    if (date in weeklyActivity) {
      weeklyActivity[date]++;
    }
  }

  return {
    totalSolved: problems.length,
    difficulty,
    topTopics,
    topPatterns,
    recentProblems,
    weeklyActivity,
  };
}

export function getRevisionStats(problems: SolvedProblem[]): {
  dueToday: number;
  dueThisWeek: number;
} {
  const now = Date.now();
  const weekFromNow = now + 7 * 24 * 60 * 60 * 1000;

  let dueToday = 0;
  let dueThisWeek = 0;

  for (const problem of problems) {
    if (!problem.needsRevision) continue;

    if (problem.revisionDates.length === 0) {
      dueToday++;
      dueThisWeek++;
      continue;
    }

    const lastRevision = problem.revisionDates[problem.revisionDates.length - 1];

    for (const day of problem.revisionSchedule) {
      const revisionDate = lastRevision + day * 24 * 60 * 60 * 1000;
      if (revisionDate <= now) {
        dueToday++;
        break;
      }
      if (revisionDate <= weekFromNow) {
        dueThisWeek++;
        break;
      }
    }
  }

  return { dueToday, dueThisWeek };
}
