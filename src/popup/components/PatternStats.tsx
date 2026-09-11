import React from 'react';
import { TopicStats as TopicStatsType } from '../../utils/stats';

interface PatternStatsProps {
  topics: TopicStatsType[];
  patterns: TopicStatsType[];
}

export const PatternStats: React.FC<PatternStatsProps> = ({ topics, patterns }) => {
  return (
    <div className="card">
      {topics.length > 0 && (
        <>
          <div className="card-title">Top Topics</div>
          <div className="pattern-list">
            {topics.map(({ name, count }) => (
              <div key={name} className="pattern-row">
                <span className="pattern-name">{name}</span>
                <span className="pattern-count">{count}</span>
              </div>
            ))}
          </div>
        </>
      )}
      {patterns.length > 0 && (
        <>
          <div className="card-title" style={{ marginTop: topics.length > 0 ? '12px' : 0 }}>
            Top Patterns
          </div>
          <div className="pattern-list">
            {patterns.map(({ name, count }) => (
              <div key={name} className="pattern-row">
                <span className="pattern-name">{name}</span>
                <span className="pattern-count">{count}</span>
              </div>
            ))}
          </div>
        </>
      )}
      {topics.length === 0 && patterns.length === 0 && (
        <div className="empty-state">
          <p className="empty-desc">No topics or patterns tracked yet</p>
        </div>
      )}
    </div>
  );
};
