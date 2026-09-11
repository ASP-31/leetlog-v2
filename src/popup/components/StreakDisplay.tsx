import React from 'react';
import { StreakData } from '../../types/settings';

interface StreakDisplayProps {
  streak: StreakData;
}

export const StreakDisplay: React.FC<StreakDisplayProps> = ({ streak }) => {
  return (
    <div className="card">
      <div className="card-title">Streak</div>
      <div className="streak-display">
        <div className="streak-current">
          <span className="streak-fire">🔥</span>
          <span className="streak-number">{streak.currentStreak}</span>
          <span className="streak-label">day{streak.currentStreak !== 1 ? 's' : ''}</span>
        </div>
        <div className="streak-best">
          Best: {streak.longestStreak} day{streak.longestStreak !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
};
