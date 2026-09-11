import React, { useState } from 'react';
import { PATTERNS } from '../../utils/topics';

interface PatternPickerProps {
  selected: string[];
  onChange: (patterns: string[]) => void;
}

export const PatternPicker: React.FC<PatternPickerProps> = ({ selected, onChange }) => {
  const [expanded, setExpanded] = useState(false);

  const toggle = (pattern: string) => {
    if (selected.includes(pattern)) {
      onChange(selected.filter(p => p !== pattern));
    } else {
      onChange([...selected, pattern]);
    }
  };

  return (
    <div className="picker">
      <div className="picker-header" onClick={() => setExpanded(!expanded)}>
        <span className="picker-label">Patterns</span>
        <span className="picker-count">{selected.length > 0 ? selected.length : ''}</span>
        <span className="picker-chevron">{expanded ? '▾' : '▸'}</span>
      </div>
      {expanded && (
        <div className="picker-options">
          {PATTERNS.map((pattern) => (
            <button
              key={pattern}
              className={`picker-option ${selected.includes(pattern) ? 'selected' : ''}`}
              onClick={() => toggle(pattern)}
            >
              {pattern}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
