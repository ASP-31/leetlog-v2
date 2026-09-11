import React, { useState } from 'react';
import { TOPICS } from '../../utils/topics';

interface TopicPickerProps {
  selected: string[];
  onChange: (topics: string[]) => void;
}

export const TopicPicker: React.FC<TopicPickerProps> = ({ selected, onChange }) => {
  const [expanded, setExpanded] = useState(false);

  const toggle = (topic: string) => {
    if (selected.includes(topic)) {
      onChange(selected.filter(t => t !== topic));
    } else {
      onChange([...selected, topic]);
    }
  };

  return (
    <div className="picker">
      <div className="picker-header" onClick={() => setExpanded(!expanded)}>
        <span className="picker-label">Topics</span>
        <span className="picker-count">{selected.length > 0 ? selected.length : ''}</span>
        <span className="picker-chevron">{expanded ? '▾' : '▸'}</span>
      </div>
      {expanded && (
        <div className="picker-options">
          {TOPICS.map((topic) => (
            <button
              key={topic}
              className={`picker-option ${selected.includes(topic) ? 'selected' : ''}`}
              onClick={() => toggle(topic)}
            >
              {topic}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
