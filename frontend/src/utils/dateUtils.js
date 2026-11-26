export function getTodayDateKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function toUtcDateKey(isoDate) {
  if (!isoDate) return null;
  return isoDate.slice(0, 10);
}

export function isTaskOverdue(status, dueDate) {
  if (status === 'completed' || !dueDate) return false;
  return dueDate.slice(0, 10) < getTodayDateKey();
}

export function isTaskDueToday(dueDate) {
  if (!dueDate) return false;
  return dueDate.slice(0, 10) === getTodayDateKey();
}

export function formatShortDate(isoDate) {
  if (!isoDate) return '';
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
