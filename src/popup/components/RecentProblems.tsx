import React from 'react';
import { SolvedProblem } from '../../types/problem';

interface RecentProblemsProps {
  problems: SolvedProblem[];
}

const DIFFICULTY_CLASS: Record<string, string> = {
  Easy: 'tag-easy',
  Medium: 'tag-medium',
  Hard: 'tag-hard',
};

export const RecentProblems: React.FC<RecentProblemsProps> = ({ problems }) => {
  if (problems.length === 0) {
    return (
      <div className="card">
        <div className="card-title">Recent Problems</div>
        <div className="empty-state">
          <p className="empty-desc">No problems solved yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-title">Recent Problems</div>
      <div className="recent-list">
        {problems.map((problem) => (
          <div key={problem.titleSlug} className="recent-row">
            <span className={`tag ${DIFFICULTY_CLASS[problem.difficulty] || 'tag-medium'}`}>
              {problem.difficulty}
            </span>
            <span className="recent-name">{problem.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
