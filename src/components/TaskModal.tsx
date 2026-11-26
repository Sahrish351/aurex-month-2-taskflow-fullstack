import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { X } from 'lucide-react';
import type { Task, TaskPriority, TaskStatus } from '../types';

export interface TaskFormValues {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
}

interface TaskModalProps {
  open: boolean;
  editingTask: Task | null;
  initialDueDate?: string;
  submitting: boolean;
  serverError: string;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => void;
}

export default function TaskModal({
  open,
  editingTask,
  initialDueDate = '',
  submitting,
  serverError,
  onClose,
  onSubmit,
}: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('active');
  const [dueDate, setDueDate] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (!open) return;
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setPriority(editingTask.priority);
      setStatus(editingTask.status);
      setDueDate(editingTask.dueDate ? editingTask.dueDate.slice(0, 10) : '');
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setStatus('active');
      setDueDate(initialDueDate);
    }
    setValidationError('');
  }, [open, editingTask, initialDueDate]);

  if (!open) return null;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmedTitle = title.trim();

    if (trimmedTitle.length < 2) {
      setValidationError('Task title must be at least 2 characters.');
      return;
    }

    if (trimmedTitle.length > 140) {
      setValidationError('Task title must be 140 characters or fewer.');
      return;
    }

    onSubmit({
      title: trimmedTitle,
      description: description.trim(),
      priority,
      status,
      dueDate: dueDate || null,
    });
  }

  const displayedError = validationError || serverError;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#183C32]/35 backdrop-blur-[1px] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-heading"
    >
      <div className="bg-white border border-[#E6E7E0] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-7 shadow-lg">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#E6E7E0]">
          <div>
            <h2 id="task-modal-heading" className="text-xl font-semibold text-[#183C32]">
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h2>
            <p className="text-xs text-[#68746D] mt-0.5">
              {editingTask
                ? 'Update task details, priority, or target date.'
                : 'Add a structured task to your personal workspace.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close task dialog"
            className="p-2 rounded-lg text-[#68746D] hover:bg-[#FAF8F3] hover:text-[#183C32]"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
          <div>
            <label htmlFor="modal-task-title" className="block text-sm font-semibold text-[#183C32] mb-1.5">
              Task title
            </label>
            <input
              id="modal-task-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (validationError) setValidationError('');
              }}
              placeholder="e.g., Prepare Week 4 API security checklist"
              maxLength={140}
              className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F3] border border-[#E6E7E0] rounded-xl text-[#183C32] placeholder:text-[#8E9891] focus:outline-none focus:border-[#2F6B52] focus:ring-2 focus:ring-[#2F6B52]/15"
            />
          </div>

          <div>
            <label htmlFor="modal-task-desc" className="block text-sm font-semibold text-[#183C32] mb-1.5">
              Description (optional)
            </label>
            <textarea
              id="modal-task-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add acceptance notes, links, or next steps..."
              maxLength={2000}
              className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F3] border border-[#E6E7E0] rounded-xl text-[#183C32] placeholder:text-[#8E9891] focus:outline-none focus:border-[#2F6B52] focus:ring-2 focus:ring-[#2F6B52]/15 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="modal-task-priority" className="block text-sm font-semibold text-[#183C32] mb-1.5">
                Priority
              </label>
              <select
                id="modal-task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2.5 text-sm bg-[#FAF8F3] border border-[#E6E7E0] rounded-xl text-[#183C32] focus:outline-none focus:border-[#2F6B52]"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label htmlFor="modal-task-due" className="block text-sm font-semibold text-[#183C32] mb-1.5">
                Due date
              </label>
              <input
                id="modal-task-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-[#FAF8F3] border border-[#E6E7E0] rounded-xl text-[#183C32] font-mono-num focus:outline-none focus:border-[#2F6B52]"
              />
            </div>

            <div>
              <label htmlFor="modal-task-status" className="block text-sm font-semibold text-[#183C32] mb-1.5">
                Status
              </label>
              <select
                id="modal-task-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2.5 text-sm bg-[#FAF8F3] border border-[#E6E7E0] rounded-xl text-[#183C32] focus:outline-none focus:border-[#2F6B52]"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {displayedError ? (
            <p className="text-sm font-medium text-[#B8523E]" role="alert">
              {displayedError}
            </p>
          ) : null}

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#E6E7E0]">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 text-sm font-semibold text-[#183C32] bg-[#FAF8F3] border border-[#E6E7E0] rounded-xl hover:bg-[#EFECE4] transition-colors whitespace-nowrap shrink-0"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#2F6B52] rounded-xl hover:bg-[#245440] transition-colors disabled:opacity-60 whitespace-nowrap shrink-0"
            >
              {submitting
                ? editingTask
                  ? 'Saving...'
                  : 'Creating...'
                : editingTask
                  ? 'Save Changes'
                  : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
