import React from 'react';
import { getRevisionStatus } from '../../utils/revision';
import { SolvedProblem } from '../../types/problem';

interface RevisionBadgeProps {
  problem: SolvedProblem;
}

const STATUS_CONFIG = {
  due: { text: 'Revision Due', className: 'revision-due' },
  soon: { text: 'Due Soon', className: 'revision-soon' },
  scheduled: { text: 'Scheduled', className: 'revision-scheduled' },
  complete: { text: 'Mastered', className: 'revision-complete' },
};

export const RevisionBadge: React.FC<RevisionBadgeProps> = ({ problem }) => {
  const status = getRevisionStatus(problem);
  const config = STATUS_CONFIG[status];

  return (
    <span className={`revision-badge ${config.className}`}>
      {config.text}
    </span>
  );
};
