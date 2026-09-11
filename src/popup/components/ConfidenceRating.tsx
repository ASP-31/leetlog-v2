import React from 'react';
import { ConfidenceLevel } from '../../types/problem';

interface ConfidenceRatingProps {
  value: ConfidenceLevel;
  onChange?: (value: ConfidenceLevel) => void;
  readonly?: boolean;
}

const LABELS: Record<ConfidenceLevel, string> = {
  1: 'Cannot solve',
  2: 'Need help',
  3: 'Understand',
  4: 'Independent',
  5: 'Can teach',
};

export const ConfidenceRating: React.FC<ConfidenceRatingProps> = ({
  value,
  onChange,
  readonly = false,
}) => {
  return (
    <div className="confidence-rating">
      <div className="confidence-label">Confidence</div>
      <div className="confidence-stars">
        {([1, 2, 3, 4, 5] as ConfidenceLevel[]).map((level) => (
          <button
            key={level}
            className={`confidence-star ${level <= value ? 'active' : ''}`}
            onClick={() => !readonly && onChange?.(level)}
            disabled={readonly}
            title={LABELS[level]}
          >
            {level <= value ? '★' : '☆'}
          </button>
        ))}
      </div>
      <div className="confidence-text">{LABELS[value]}</div>
    </div>
  );
};
