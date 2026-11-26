export default function Header({ totalCount, activeCount, completedCount }) {
  return (
    <header className="header">
      <div>
        <p className="header-kicker">AUREX Month 2 · Week 1 Deliverable</p>
        <h1 className="header-title">TaskFlow Component Manager</h1>
        <p className="header-subtitle">
          Standalone React workspace built with controlled inputs, useState, and localStorage persistence.
        </p>
      </div>

      <div className="stats-row" aria-label="Task summary statistics">
        <div className="stat-block">
          <span className="stat-value">{totalCount}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-block">
          <span className="stat-value">{activeCount}</span>
          <span className="stat-label">Active</span>
        </div>
        <div className="stat-block">
          <span className="stat-value">{completedCount}</span>
          <span className="stat-label">Completed</span>
        </div>
      </div>
    </header>
  );
}
