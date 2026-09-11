import React from 'react';
import { DifficultyStats } from '../../utils/stats';

interface StatsCardProps {
  total: number;
  difficulty: DifficultyStats;
}

export const StatsCard: React.FC<StatsCardProps> = ({ total, difficulty }) => {
  return (
    <div className="card">
      <div className="card-title">Problems Solved</div>
      <div className="stats-total">{total}</div>
      <div className="stats-breakdown">
        <div className="stat-item">
          <span className="stat-label stat-easy">Easy</span>
          <span className="stat-value">{difficulty.easy}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label stat-medium">Medium</span>
          <span className="stat-value">{difficulty.medium}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label stat-hard">Hard</span>
          <span className="stat-value">{difficulty.hard}</span>
        </div>
      </div>
    </div>
  );
};
