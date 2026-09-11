import React from 'react';
import { SolvedProblem } from '../../types/problem';
import { getDaysUntilRevision } from '../../utils/revision';

interface RevisionQueueProps {
  problems: SolvedProblem[];
}

export const RevisionQueue: React.FC<RevisionQueueProps> = ({ problems }) => {
  const dueProblems = problems
    .filter(p => p.needsRevision)
    .sort((a, b) => {
      const daysA = getDaysUntilRevision(a) ?? Infinity;
      const daysB = getDaysUntilRevision(b) ?? Infinity;
      return daysA - daysB;
    })
    .slice(0, 5);

  if (dueProblems.length === 0) {
    return (
      <div className="card">
        <div className="card-title">Revision</div>
        <div className="empty-state">
          <p className="empty-desc">No revisions due</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-title">Revision</div>
      <div className="revision-list">
        {dueProblems.map((problem) => {
          const days = getDaysUntilRevision(problem);
          return (
            <div key={problem.titleSlug} className="revision-row">
              <span className="revision-problem-name">{problem.title}</span>
              <span className={`revision-days ${days === 0 ? 'due-now' : ''}`}>
                {days === 0 ? 'Due now' : `${days}d`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
