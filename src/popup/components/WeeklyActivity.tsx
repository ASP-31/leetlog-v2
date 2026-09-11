import React from 'react';

interface WeeklyActivityProps {
  activity: Record<string, number>;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const WeeklyActivity: React.FC<WeeklyActivityProps> = ({ activity }) => {
  const entries = Object.entries(activity).sort((a, b) => a[0].localeCompare(b[0]));
  const maxCount = Math.max(...entries.map(([, count]) => count), 1);

  return (
    <div className="card">
      <div className="card-title">This Week</div>
      <div className="weekly-activity">
        {entries.map(([date, count]) => {
          const dayIndex = new Date(date).getDay();
          const dayName = DAY_NAMES[dayIndex];
          const height = count > 0 ? Math.max(4, (count / maxCount) * 48) : 4;

          return (
            <div key={date} className="weekly-day">
              <div className="weekly-bar-container">
                <div
                  className={`weekly-bar ${count > 0 ? 'active' : ''}`}
                  style={{ height: `${height}px` }}
                />
              </div>
              <span className="weekly-day-label">{dayName}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
