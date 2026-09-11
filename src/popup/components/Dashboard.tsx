import React, { useState, useEffect } from 'react';
import { StreakData } from '../../types/settings';
import { DashboardStats, computeStats, getRevisionStats } from '../../utils/stats';
import { StatsCard } from './StatsCard';
import { StreakDisplay } from './StreakDisplay';
import { PatternStats } from './PatternStats';
import { RevisionQueue } from './RevisionQueue';
import { RecentProblems } from './RecentProblems';
import { WeeklyActivity } from './WeeklyActivity';
import { storage } from '../../utils/storage';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [revisionStats, setRevisionStats] = useState({ dueToday: 0, dueThisWeek: 0 });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const problems = await storage.get('problems');
    const streakData = await storage.get('streak');

    setStats(computeStats(problems));
    setStreak(streakData);
    setRevisionStats(getRevisionStats(problems));
  };

  if (!stats || !streak) {
    return (
      <div className="dashboard">
        <div className="empty-state">
          <p className="empty-desc">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <StreakDisplay streak={streak} />
      <StatsCard total={stats.totalSolved} difficulty={stats.difficulty} />
      <PatternStats topics={stats.topTopics} patterns={stats.topPatterns} />
      {revisionStats.dueToday > 0 && (
        <div className="card revision-alert">
          <span className="revision-alert-icon">🔴</span>
          <span>{revisionStats.dueToday} problem{revisionStats.dueToday !== 1 ? 's' : ''} due for revision</span>
        </div>
      )}
      <RevisionQueue problems={stats.recentProblems} />
      <WeeklyActivity activity={stats.weeklyActivity} />
      <RecentProblems problems={stats.recentProblems} />
    </div>
  );
};
