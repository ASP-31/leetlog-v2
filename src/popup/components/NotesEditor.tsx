import React from 'react';

interface NotesEditorProps {
  notes: string;
  mistakes: string;
  onNotesChange: (notes: string) => void;
  onMistakesChange: (mistakes: string) => void;
}

export const NotesEditor: React.FC<NotesEditorProps> = ({
  notes,
  mistakes,
  onNotesChange,
  onMistakesChange,
}) => {
  return (
    <div className="notes-editor">
      <div className="notes-field">
        <label className="notes-label">Notes</label>
        <textarea
          className="notes-textarea"
          placeholder="What did you learn?"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={2}
        />
      </div>
      <div className="notes-field">
        <label className="notes-label">Mistakes</label>
        <textarea
          className="notes-textarea"
          placeholder="What did you get wrong?"
          value={mistakes}
          onChange={(e) => onMistakesChange(e.target.value)}
          rows={2}
        />
      </div>
    </div>
  );
};
