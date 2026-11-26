import { useState } from 'react';
import { Plus } from 'lucide-react';

export default function TaskForm({ onAddTask }) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState('medium');
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError('Please enter a task title before adding.');
      return;
    }

    if (trimmedTitle.length < 3) {
      setError('Task title must be at least 3 characters.');
      return;
    }

    if (trimmedTitle.length > 100) {
      setError('Task title must be 100 characters or fewer.');
      return;
    }

    onAddTask({
      title: trimmedTitle,
      notes: notes.trim(),
      priority,
    });

    setTitle('');
    setNotes('');
    setPriority('medium');
    setError('');
  }

  return (
    <form className="card task-form" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="week1-task-title" className="form-label">
            Task title
          </label>
          <input
            id="week1-task-title"
            type="text"
            className="text-input"
            placeholder="e.g., Outline Express middleware folder structure"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError('');
            }}
            maxLength={120}
          />
        </div>

        <button type="submit" className="btn-primary">
          <Plus size={18} aria-hidden="true" />
          Add Task
        </button>
      </div>

      <div className="form-secondary">
        <div className="form-group">
          <label htmlFor="week1-task-notes" className="form-label">
            Notes (optional)
          </label>
          <input
            id="week1-task-notes"
            type="text"
            className="text-input"
            placeholder="Optional context or next step"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={200}
          />
        </div>

        <div className="form-group">
          <label htmlFor="week1-task-priority" className="form-label">
            Priority
          </label>
          <select
            id="week1-task-priority"
            className="select-input"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      {error ? (
        <p className="error-text" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
