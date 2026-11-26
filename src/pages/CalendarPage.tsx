import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, RefreshCw } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import TaskModal from '../components/TaskModal';
import type { TaskFormValues } from '../components/TaskModal';
import TaskRow from '../components/TaskRow';
import Toast from '../components/Toast';
import type { ToastMessage } from '../components/Toast';
import DashboardLayout from '../layouts/DashboardLayout';
import { ApiError, taskApi } from '../services/api';
import type { Task } from '../types';
import { getTodayDateKey, toUtcDateKey } from '../utils/dateUtils';
import { loadPreferences } from '../utils/preferences';

function buildMonthGrid(year: number, monthIndex: number) {
  const firstDay = new Date(year, monthIndex, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const cells: { dateKey: string | null; dayNumber: number | null }[] = [];
  for (let i = 0; i < startWeekday; i++) {
    cells.push({ dateKey: null, dayNumber: null });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const mm = String(monthIndex + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    cells.push({ dateKey: `${year}-${mm}-${dd}`, dayNumber: day });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ dateKey: null, dayNumber: null });
  }
  return cells;
}

export default function CalendarPage() {
  const [prefs] = useState(() => loadPreferences());
  const todayKey = getTodayDateKey();

  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState(todayKey);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  function showToast(type: 'success' | 'error', text: string) {
    setToast({ id: Date.now(), type, text });
  }

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await taskApi.list({ status: 'all', sort: 'dueDate' });
      setTasks(data.tasks);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load calendar tasks.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const task of tasks) {
      const key = toUtcDateKey(task.dueDate);
      if (!key) continue;
      const existing = map.get(key) || [];
      existing.push(task);
      map.set(key, existing);
    }
    return map;
  }, [tasks]);

  const monthCells = useMemo(
    () => buildMonthGrid(viewMonth.year, viewMonth.month),
    [viewMonth]
  );

  const monthPrefix = `${viewMonth.year}-${String(viewMonth.month + 1).padStart(2, '0')}`;
  const scheduledDaysThisMonth = useMemo(() => {
    return Array.from(tasksByDate.entries())
      .filter(([key]) => key.startsWith(monthPrefix))
      .sort(([a], [b]) => a.localeCompare(b));
  }, [tasksByDate, monthPrefix]);

  const selectedDayTasks = tasksByDate.get(selectedDate) || [];

  const monthLabel = new Date(viewMonth.year, viewMonth.month, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  function shiftMonth(delta: number) {
    setViewMonth((prev) => {
      const d = new Date(prev.year, prev.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  function jumpToToday() {
    const now = new Date();
    setViewMonth({ year: now.getFullYear(), month: now.getMonth() });
    setSelectedDate(todayKey);
  }

  function openCreateForSelectedDate() {
    setEditingTask(null);
    setModalError('');
    setModalOpen(true);
  }

  function openEditModal(task: Task) {
    setEditingTask(task);
    setModalError('');
    setModalOpen(true);
  }

  async function handleModalSubmit(values: TaskFormValues) {
    setModalSubmitting(true);
    setModalError('');
    try {
      if (editingTask) {
        await taskApi.update(editingTask.id, values);
        showToast('success', 'Task updated.');
      } else {
        await taskApi.create(values);
        showToast('success', 'Task scheduled.');
      }
      setModalOpen(false);
      await loadTasks();
    } catch (err) {
      setModalError(err instanceof ApiError ? err.message : 'Failed to save task.');
    } finally {
      setModalSubmitting(false);
    }
  }

  async function handleToggleTask(task: Task) {
    setTogglingId(task.id);
    try {
      await taskApi.toggleStatus(task.id);
      await loadTasks();
      showToast(
        'success',
        task.status === 'completed' ? 'Task reopened.' : 'Task completed.'
      );
    } catch (err) {
      showToast('error', err instanceof ApiError ? err.message : 'Could not update task.');
    } finally {
      setTogglingId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!deletingTask) return;
    setDeleteLoading(true);
    try {
      await taskApi.remove(deletingTask.id);
      setDeletingTask(null);
      showToast('success', 'Task deleted.');
      await loadTasks();
    } catch (err) {
      showToast('error', err instanceof ApiError ? err.message : 'Could not delete task.');
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <DashboardLayout
      title="Calendar"
      subtitle="Inspect deadlines by date and schedule tasks directly onto any day."
      onCreateTask={openCreateForSelectedDate}
    >
      {loading ? (
        <div className="bg-white border border-[#E6E7E0] rounded-2xl p-6 h-96 animate-pulse" />
      ) : error ? (
        <div className="bg-white border border-[#E6E7E0] rounded-2xl py-14 px-6 text-center" role="alert">
          <p className="text-base font-semibold text-[#183C32]">Could not load calendar</p>
          <p className="mt-1 text-sm text-[#68746D]">{error}</p>
          <button
            type="button"
            onClick={loadTasks}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#2F6B52] rounded-xl"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Retry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Calendar Grid */}
          <section className="xl:col-span-8 bg-white border border-[#E6E7E0] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E6E7E0] flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-[#183C32] font-sans">{monthLabel}</h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => shiftMonth(-1)}
                  aria-label="Previous month"
                  className="w-9 h-9 inline-flex items-center justify-center rounded-xl border border-[#E6E7E0] bg-[#FAF8F3] text-[#183C32] hover:bg-[#E6EFE8]"
                >
                  <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={jumpToToday}
                  className="px-3.5 h-9 text-xs font-semibold rounded-xl border border-[#E6E7E0] bg-[#FAF8F3] text-[#183C32] hover:bg-[#E6EFE8]"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => shiftMonth(1)}
                  aria-label="Next month"
                  className="w-9 h-9 inline-flex items-center justify-center rounded-xl border border-[#E6E7E0] bg-[#FAF8F3] text-[#183C32] hover:bg-[#E6EFE8]"
                >
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Responsive 7-day header & grid */}
            <div className="grid grid-cols-7 border-b border-[#E6E7E0] bg-[#FAF8F3]">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div
                  key={day}
                  className="py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-[#68746D]"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {monthCells.map((cell, idx) => {
                const isLastCol = (idx + 1) % 7 === 0;
                const isLastRow = idx >= monthCells.length - 7;
                const edgeBorder = `${isLastRow ? '' : 'border-b'} ${
                  isLastCol ? '' : 'border-r'
                } border-[#E6E7E0]`;

                if (!cell.dateKey || !cell.dayNumber) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className={`min-h-[64px] sm:min-h-[96px] ${edgeBorder} bg-[#FAF8F3]/50`}
                    />
                  );
                }

                const dayTasks = tasksByDate.get(cell.dateKey) || [];
                const isToday = cell.dateKey === todayKey;
                const isSelected = cell.dateKey === selectedDate;

                return (
                  <button
                    key={cell.dateKey}
                    type="button"
                    onClick={() => setSelectedDate(cell.dateKey!)}
                    className={`min-h-[64px] sm:min-h-[96px] p-1.5 sm:p-2 ${edgeBorder} text-left align-top flex flex-col justify-between transition-colors ${
                      isSelected
                        ? 'bg-[#E6EFE8]/75 ring-1 ring-inset ring-[#2F6B52]'
                        : 'hover:bg-[#FAF8F3]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`w-6 h-6 rounded-full text-xs font-mono-num inline-flex items-center justify-center ${
                          isToday
                            ? 'bg-[#2F6B52] text-white font-semibold'
                            : 'text-[#183C32] font-medium'
                        }`}
                      >
                        {cell.dayNumber}
                      </span>
                      {dayTasks.length > 0 ? (
                        <span className="text-[10px] font-mono-num font-semibold text-[#2F6B52]">
                          {dayTasks.length}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-1 space-y-1 w-full hidden sm:block">
                      {dayTasks.slice(0, 2).map((t) => (
                        <div
                          key={t.id}
                          className={`px-1.5 py-0.5 rounded text-[10px] truncate ${
                            t.status === 'completed'
                              ? 'bg-[#F3F1EA] text-[#68746D] line-through'
                              : t.priority === 'high'
                                ? 'bg-[#FDF5F3] text-[#B8523E] font-medium'
                                : 'bg-[#E6EFE8] text-[#183C32] font-medium'
                          }`}
                        >
                          {t.title}
                        </div>
                      ))}
                      {dayTasks.length > 2 ? (
                        <p className="text-[10px] text-[#68746D] px-1">
                          +{dayTasks.length - 2} more
                        </p>
                      ) : null}
                    </div>

                    {/* Mobile dot indicator */}
                    {dayTasks.length > 0 ? (
                      <div className="flex gap-1 mt-1 sm:hidden">
                        {dayTasks.slice(0, 3).map((t) => (
                          <span
                            key={t.id}
                            className={`w-1.5 h-1.5 rounded-full ${
                              t.status === 'completed'
                                ? 'bg-[#8E9B93]'
                                : t.priority === 'high'
                                  ? 'bg-[#B8523E]'
                                  : 'bg-[#2F6B52]'
                            }`}
                          />
                        ))}
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Selected Date Agenda Panel */}
          <aside className="xl:col-span-4 space-y-5">
            <section className="bg-white border border-[#E6E7E0] rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E6E7E0] flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold text-[#183C32] font-sans">
                    Selected Date
                  </h3>
                  <p className="text-xs font-mono-num text-[#68746D]">{selectedDate}</p>
                </div>
                <button
                  type="button"
                  onClick={openCreateForSelectedDate}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#2F6B52] rounded-xl hover:bg-[#245440]"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  Add Task
                </button>
              </div>

              {selectedDayTasks.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm font-semibold text-[#183C32]">No tasks scheduled</p>
                  <p className="mt-1 text-xs text-[#68746D]">
                    Click Add Task to schedule a deliverable for {selectedDate}.
                  </p>
                </div>
              ) : (
                <div>
                  {selectedDayTasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      togglingId={togglingId}
                      compact={prefs.compactDensity}
                      onToggle={handleToggleTask}
                      onEdit={openEditModal}
                      onDelete={setDeletingTask}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Month Scheduled Summary */}
            <section className="bg-white border border-[#E6E7E0] rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-[#183C32] font-sans">
                Scheduled This Month
              </h3>
              {scheduledDaysThisMonth.length === 0 ? (
                <p className="mt-2 text-xs text-[#68746D]">
                  No tasks have due dates in {monthLabel}.
                </p>
              ) : (
                <ul className="mt-3 divide-y divide-[#E6E7E0]">
                  {scheduledDaysThisMonth.map(([dateKey, items]) => (
                    <li key={dateKey} className="py-2 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => setSelectedDate(dateKey)}
                        className="font-mono-num font-semibold text-[#2F6B52] hover:underline"
                      >
                        {dateKey}
                      </button>
                      <span className="text-[#68746D]">
                        {items.length} {items.length === 1 ? 'task' : 'tasks'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </aside>
        </div>
      )}

      <TaskModal
        open={modalOpen}
        editingTask={editingTask}
        initialDueDate={selectedDate}
        submitting={modalSubmitting}
        serverError={modalError}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
      />

      <ConfirmDialog
        open={Boolean(deletingTask)}
        title="Delete this task?"
        description={
          deletingTask
            ? `"${deletingTask.title}" will be permanently removed from your workspace.`
            : ''
        }
        loading={deleteLoading}
        onCancel={() => setDeletingTask(null)}
        onConfirm={handleConfirmDelete}
      />

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </DashboardLayout>
  );
}
