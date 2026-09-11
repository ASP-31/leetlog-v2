import { SolvedProblem } from '../types/problem';

export function isRevisionDue(problem: SolvedProblem, schedule?: number[]): boolean {
  if (!problem.needsRevision) return false;
  if (problem.revisionDates.length === 0) return true;

  const now = Date.now();
  const lastRevision = problem.revisionDates[problem.revisionDates.length - 1];
  const msSinceRevision = now - lastRevision;
  const msPerDay = 1000 * 60 * 60 * 24;

  const activeSchedule = schedule || problem.revisionSchedule;
  if (activeSchedule.length === 0) return false;

  const nextRevisionDay = activeSchedule.find(day => day * msPerDay > msSinceRevision);
  return nextRevisionDay === undefined;
}

export function getNextRevisionDate(problem: SolvedProblem): number | null {
  if (!problem.needsRevision) return null;
  if (problem.revisionDates.length === 0) return problem.submittedAt;

  const lastRevision = problem.revisionDates[problem.revisionDates.length - 1];
  const msPerDay = 24 * 60 * 60 * 1000;

  for (const day of problem.revisionSchedule) {
    const revisionDate = lastRevision + day * msPerDay;
    if (revisionDate > Date.now()) return revisionDate;
  }

  return null;
}

export function recordRevision(problem: SolvedProblem): SolvedProblem {
  const now = Date.now();
  const newRevisionDates = [...problem.revisionDates, now];

  const maxDays = Math.max(...problem.revisionSchedule, 0);
  const daysSinceStart = (now - problem.submittedAt) / (1000 * 60 * 60 * 24);
  const needsRevision = daysSinceStart < maxDays;

  return {
    ...problem,
    revisionDates: newRevisionDates,
    needsRevision,
    lastRevised: now,
  };
}

export function getDaysUntilRevision(problem: SolvedProblem): number | null {
  const nextDate = getNextRevisionDate(problem);
  if (nextDate === null) return null;
  return Math.max(0, Math.ceil((nextDate - Date.now()) / (1000 * 60 * 60 * 24)));
}

export function getRevisionStatus(problem: SolvedProblem): 'due' | 'soon' | 'scheduled' | 'complete' {
  if (!problem.needsRevision) return 'complete';

  const days = getDaysUntilRevision(problem);
  if (days === null) return 'complete';
  if (days === 0) return 'due';
  if (days <= 3) return 'soon';
  return 'scheduled';
}