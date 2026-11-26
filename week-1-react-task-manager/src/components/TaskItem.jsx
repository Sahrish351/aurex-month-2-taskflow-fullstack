import { Check, Trash2 } from 'lucide-react';

const PRIORITY_LABELS = {
  high: 'High priority',
  medium: 'Medium priority',
  low: 'Low priority',
};

export default function TaskItem({ task, onToggle, onDelete }) {
  const formattedDate = new Date(task.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <li className="task-item">
      <div className="task-left">
        <button
          type="button"
          className={`checkbox-btn ${task.completed ? 'checked' : ''}`}
          onClick={() => onToggle(task.id)}
          aria-pressed={task.completed}
          aria-label={task.completed ? `Mark "${task.title}" as active` : `Mark "${task.title}" as completed`}
        >
          {task.completed ? <Check size={14} strokeWidth={2.5} aria-hidden="true" /> : null}
        </button>

        <div className="task-content">
          <p className={`task-title ${task.completed ? 'completed' : ''}`}>{task.title}</p>
          {task.notes ? <p className="task-notes">{task.notes}</p> : null}

          <div className="task-meta">
            <span className={`priority-${task.priority}`}>{PRIORITY_LABELS[task.priority]}</span>
            <span aria-hidden="true">·</span>
            <span>{task.completed ? 'Completed' : 'Active'}</span>
            <span aria-hidden="true">·</span>
            <span>Added {formattedDate}</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="icon-btn"
        onClick={() => onDelete(task.id)}
        aria-label={`Delete "${task.title}"`}
        title="Delete task"
      >
        <Trash2 size={17} aria-hidden="true" />
      </button>
    </li>
  );
}
