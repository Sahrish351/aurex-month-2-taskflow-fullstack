import { Check, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import { formatShortDate, isTaskDueToday, isTaskOverdue } from '../utils/dateUtils';

const PRIORITY_TEXT = {
  high: 'High priority',
  medium: 'Medium priority',
  low: 'Low priority',
};

const PRIORITY_COLOR = {
  high: 'text-[#B8523E] font-semibold',
  medium: 'text-[#9A5B13] font-semibold',
  low: 'text-[#2F6B52] font-semibold',
};

export default function TaskRow({
  task,
  togglingId,
  compact = false,
  onToggle,
  onEdit,
  onDelete,
}) {
  const isCompleted = task.status === 'completed';
  const overdue = isTaskOverdue(task.status, task.dueDate);
  const dueToday = !isCompleted && isTaskDueToday(task.dueDate);
  const dueFormatted = formatShortDate(task.dueDate);

  return (
    <div
      className={`group flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 ${
        compact ? 'py-3 px-4' : 'py-4 px-5'
      } border-b border-[#E6E7E0] last:border-b-0 hover:bg-[#FAF8F3]/75 transition-colors`}
    >
      <div className="flex items-start gap-3.5 min-w-0 flex-1">
        <button
          type="button"
          disabled={togglingId === task.id}
          onClick={() => onToggle(task)}
          aria-pressed={isCompleted}
          aria-label={isCompleted ? `Reopen "${task.title}"` : `Mark "${task.title}" as completed`}
          className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-[#2F6B52] ${
            isCompleted
              ? 'bg-[#2F6B52] border-[#2F6B52] text-white'
              : 'bg-white border-[#8E9B93] hover:border-[#2F6B52]'
          }`}
        >
          {isCompleted ? <Check className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden="true" /> : null}
        </button>

        <div className="min-w-0 flex-1">
          <p
            className={`text-[15px] font-semibold leading-snug break-words ${
              isCompleted ? 'line-through text-[#68746D]' : 'text-[#183C32]'
            }`}
          >
            {task.title}
          </p>

          {task.description ? (
            <p className="mt-1 text-sm text-[#68746D] line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          ) : null}

          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#68746D]">
            <span className={PRIORITY_COLOR[task.priority]}>{PRIORITY_TEXT[task.priority]}</span>
            <span aria-hidden="true">·</span>
            <span>{isCompleted ? 'Completed' : 'Pending'}</span>
            {dueFormatted ? (
              <>
                <span aria-hidden="true">·</span>
                <span
                  className={`font-mono-num ${
                    overdue
                      ? 'text-[#B8523E] font-semibold'
                      : dueToday
                        ? 'text-[#2F6B52] font-semibold'
                        : ''
                  }`}
                >
                  {overdue
                    ? `Overdue (${dueFormatted})`
                    : dueToday
                      ? `Due today (${dueFormatted})`
                      : `Due ${dueFormatted}`}
                </span>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-1 shrink-0 pl-8 sm:pl-0">
        {isCompleted ? (
          <button
            type="button"
            disabled={togglingId === task.id}
            onClick={() => onToggle(task)}
            className="min-h-[38px] px-2.5 inline-flex items-center gap-1.5 rounded-lg text-xs font-semibold text-[#2F6B52] hover:bg-[#E6EFE8]/70 transition-colors whitespace-nowrap"
            title="Reopen task"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reopen</span>
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => onEdit(task)}
          aria-label={`Edit "${task.title}"`}
          className="min-w-[40px] min-h-[40px] inline-flex items-center justify-center rounded-lg text-[#68746D] hover:text-[#183C32] hover:bg-[#E6EFE8]/60 transition-colors"
          title="Edit task"
        >
          <Pencil className="w-4 h-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(task)}
          aria-label={`Delete "${task.title}"`}
          className="min-w-[40px] min-h-[40px] inline-flex items-center justify-center rounded-lg text-[#68746D] hover:text-[#B8523E] hover:bg-[#FDF5F3] transition-colors"
          title="Delete task"
        >
          <Trash2 className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
