import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Plus, RefreshCw, Sun } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import TaskModal from '../components/TaskModal';
import TaskRow from '../components/TaskRow';
import Toast from '../components/Toast';
import DashboardLayout from '../layouts/DashboardLayout';
import { ApiError, taskApi } from '../services/api';
import { getTodayDateKey, isTaskDueToday, isTaskOverdue } from '../utils/dateUtils';
import { loadPreferences } from '../utils/preferences';

export default function TodayPage() {
  const [prefs] = useState(() => loadPreferences());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const [togglingId, setTogglingId] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const todayKey = getTodayDateKey();

  function showToast(type, text) {
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
      const data = await taskApi.list({ status: 'active', search: searchQuery, sort: 'priority' });
      setTasks(data.tasks);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load Today tasks.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTasks();
    }, 150);
    return () => clearTimeout(timer);
  }, [loadTasks]);

  function openCreateForToday() {
    setEditingTask(null);
    setModalError('');
    setModalOpen(true);
  }

  function openEditModal(task) {
    setEditingTask(task);
    setModalError('');
    setModalOpen(true);
  }

  async function handleModalSubmit(values) {
    setModalSubmitting(true);
    setModalError('');
    try {
      if (editingTask) {
        await taskApi.update(editingTask.id, values);
        showToast('success', 'Task updated.');
      } else {
        await taskApi.create(values);
        showToast('success', 'Task scheduled for today.');
      }
      setModalOpen(false);
      await loadTasks();
    } catch (err) {
      setModalError(err instanceof ApiError ? err.message : 'Failed to save task.');
    } finally {
      setModalSubmitting(false);
    }
  }

  async function handleToggleTask(task) {
    setTogglingId(task.id);
    try {
      await taskApi.toggleStatus(task.id);
      await loadTasks();
      showToast('success', 'Task marked completed.');
    } catch (err) {
      showToast('error', err instanceof ApiError ? err.message : 'Could not update task status.');
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

  const overdueTasks = tasks.filter((t) => isTaskOverdue(t.status, t.dueDate));
  const dueTodayTasks = tasks.filter((t) => isTaskDueToday(t.dueDate));
  const unscheduledTasks = tasks.filter((t) => !t.dueDate);

  const todayDisplay = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <DashboardLayout
      title="Today"
      subtitle={`${todayDisplay} — focus on overdue follow-ups and tasks due today.`}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      onCreateTask={openCreateForToday}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#E6E7E0] rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E6EFE8] text-[#2F6B52] flex items-center justify-center shrink-0">
              <Sun className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#183C32]">Daily Focus Queue</p>
              <p className="text-xs text-[#68746D]">
                <span className="font-mono-num font-semibold text-[#B8523E]">{overdueTasks.length}</span> overdue ·{' '}
                <span className="font-mono-num font-semibold text-[#2F6B52]">{dueTodayTasks.length}</span> due today ·{' '}
                <span className="font-mono-num">{unscheduledTasks.length}</span> unscheduled
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreateForToday}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#2F6B52] rounded-xl hover:bg-[#245440] transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Add Task for Today
          </button>
        </div>

        {loading ? (
          <div className="bg-white border border-[#E6E7E0] rounded-2xl p-5 space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-[72px] rounded-xl bg-[#F5F3EC] animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-white border border-[#E6E7E0] rounded-2xl py-14 px-6 text-center" role="alert">
            <p className="text-base font-semibold text-[#183C32]">Unable to load Today tasks</p>
            <p className="mt-1 text-sm text-[#68746D]">{error}</p>
            <button type="button" onClick={loadTasks} className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#2F6B52] rounded-xl">
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {overdueTasks.length > 0 ? (
              <section className="bg-white border border-[#E8C8BF] rounded-2xl overflow-hidden">
                <div className="px-5 py-3.5 bg-[#FDF5F3] border-b border-[#E8C8BF] flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-[#B8523E] font-sans flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" aria-hidden="true" />
                    Overdue ({overdueTasks.length})
                  </h2>
                </div>
                {overdueTasks.map((task) => (
                  <TaskRow key={task.id} task={task} togglingId={togglingId} compact={prefs.compactDensity} onToggle={handleToggleTask} onEdit={openEditModal} onDelete={setDeletingTask} />
                ))}
              </section>
            ) : null}

            <section className="bg-white border border-[#E6E7E0] rounded-2xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#E6E7E0] flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#183C32] font-sans">Due Today ({dueTodayTasks.length})</h2>
                <span className="text-xs font-mono-num text-[#68746D]">{todayKey}</span>
              </div>
              {dueTodayTasks.length === 0 ? (
                <div className="py-12 px-6 text-center">
                  <p className="text-sm font-semibold text-[#183C32]">Nothing due today</p>
                  <p className="mt-1 text-xs text-[#68746D]">
                    Schedule a task for today or tackle an unscheduled backlog item below.
                  </p>
                  <button
                    type="button"
                    onClick={openCreateForToday}
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#2F6B52] rounded-xl hover:bg-[#245440]"
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                    Add for Today
                  </button>
                </div>
              ) : (
                dueTodayTasks.map((task) => (
                  <TaskRow key={task.id} task={task} togglingId={togglingId} compact={prefs.compactDensity} onToggle={handleToggleTask} onEdit={openEditModal} onDelete={setDeletingTask} />
                ))
              )}
            </section>

            {unscheduledTasks.length > 0 ? (
              <section className="bg-white border border-[#E6E7E0] rounded-2xl overflow-hidden">
                <div className="px-5 py-3.5 border-b border-[#E6E7E0]">
                  <h2 className="text-sm font-semibold text-[#183C32] font-sans">
                    Unscheduled Active Tasks ({unscheduledTasks.length})
                  </h2>
                </div>
                {unscheduledTasks.map((task) => (
                  <TaskRow key={task.id} task={task} togglingId={togglingId} compact={prefs.compactDensity} onToggle={handleToggleTask} onEdit={openEditModal} onDelete={setDeletingTask} />
                ))}
              </section>
            ) : null}
          </div>
        )}
      </div>

      <TaskModal open={modalOpen} editingTask={editingTask} initialDueDate={todayKey} submitting={modalSubmitting} serverError={modalError} onClose={() => setModalOpen(false)} onSubmit={handleModalSubmit} />

      <ConfirmDialog
        open={Boolean(deletingTask)}
        title="Delete this task?"
        description={deletingTask ? `"${deletingTask.title}" will be permanently removed from your workspace.` : ''}
        loading={deleteLoading}
        onCancel={() => setDeletingTask(null)}
        onConfirm={handleConfirmDelete}
      />

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </DashboardLayout>
  );
}
