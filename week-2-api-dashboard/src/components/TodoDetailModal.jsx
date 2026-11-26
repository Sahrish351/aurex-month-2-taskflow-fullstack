import { X } from 'lucide-react';

export default function TodoDetailModal({ todo, user, onClose, onToggle }) {
  if (!todo) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="detail-modal-title">
      <div className="modal-card">
        <div className="modal-head">
          <h2 id="detail-modal-title">Record Details</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close details">
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <p style={{ margin: 0, fontWeight: 600, fontSize: '1.05rem' }}>{todo.title}</p>

        <div className="detail-grid">
          <div className="detail-row">
            <span style={{ color: 'var(--text-muted)' }}>Resource ID</span>
            <span className="mono-id">#{todo.id}</span>
          </div>
          <div className="detail-row">
            <span style={{ color: 'var(--text-muted)' }}>Status</span>
            <span className={todo.completed ? 'status-done' : 'status-open'}>
              {todo.completed ? 'Completed' : 'Pending'}
            </span>
          </div>
          <div className="detail-row">
            <span style={{ color: 'var(--text-muted)' }}>Assigned User</span>
            <span>{user ? `${user.name} (@${user.username})` : `User #${todo.userId}`}</span>
          </div>
          {user ? (
            <div className="detail-row">
              <span style={{ color: 'var(--text-muted)' }}>Email</span>
              <span>{user.email}</span>
            </div>
          ) : null}
          <div className="detail-row">
            <span style={{ color: 'var(--text-muted)' }}>Endpoint</span>
            <span className="mono-id">/todos/{todo.id}</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button type="button" className="btn-primary" onClick={() => onToggle(todo)}>
            {todo.completed ? 'Mark Pending' : 'Mark Completed'}
          </button>
        </div>
      </div>
    </div>
  );
}
