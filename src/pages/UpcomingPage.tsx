import { useCallback, useEffect, useState } from 'react';
import { CalendarClock, Plus, RefreshCw } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import TaskModal from '../components/TaskModal';
import type { TaskFormValues } from '../components/TaskModal';
import TaskRow from '../components/TaskRow';
import Toast from '../components/Toast';
import type { ToastMessage } from '../components/Toast';
import DashboardLayout from '../layouts/DashboardLayout';
import { ApiError, taskApi } from '../services/api';
import type { Task } from '../types';
import { getTodayDateKey } from '../utils/dateUtils';
import { loadPreferences } from '../utils/preferences';

export default function UpcomingPage() {
  const [prefs] = useState(() => loadPreferences());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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
      const data = await taskApi.list({
        status: 'active',
        search: searchQuery,
        sort: 'dueDate',
      });
      setTasks(data.tasks);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load upcoming tasks.');
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

  function openCreateModal() {
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
        showToast('success', 'Task created.');
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
      showToast('success', 'Task completed.');
    } catch (err) {
      showToast('error', err instanceof ApiError ? err.message : 'Could not update status.');
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

  const todayKey = getTodayDateKey();
  const nextWeekDate = new Date();
  nextWeekDate.setDate(nextWeekDate.getDate() + 7);
  const nextWeekKey = `${nextWeekDate.getFullYear()}-${String(nextWeekDate.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(nextWeekDate.getDate()).padStart(2, '0')}`;

  const overdue = tasks.filter((t) => t.dueDate && t.dueDate.slice(0, 10) < todayKey);
  const nextSevenDays = tasks.filter(
    (t) => t.dueDate && t.dueDate.slice(0, 10) >= todayKey && t.dueDate.slice(0, 10) <= nextWeekKey
  );
  const later = tasks.filter((t) => t.dueDate && t.dueDate.slice(0, 10) > nextWeekKey);
  const unscheduled = tasks.filter((t) => !t.dueDate);

  const sections = [
    { key: 'overdue', title: 'Overdue', items: overdue, urgent: true },
    { key: 'week', title: 'Today & Next 7 Days', items: nextSevenDays, urgent: false },
    { key: 'later', title: 'Later Horizon', items: later, urgent: false },
    { key: 'none', title: 'No Due Date', items: unscheduled, urgent: false },
  ].filter((sec) => sec.items.length > 0);

  return (
    <DashboardLayout
      title="Upcoming"
      subtitle="Active tasks organized chronologically by target deadline."
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      onCreateTask={openCreateModal}
    >
      {loading ? (
        <div className="bg-white border border-[#E6E7E0] rounded-2xl p-5 space-y-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-[72px] rounded-xl bg-[#F5F3EC] animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-white border border-[#E6E7E0] rounded-2xl py-14 px-6 text-center" role="alert">
          <p className="text-base font-semibold text-[#183C32]">Could not load upcoming tasks</p>
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
      ) : sections.length === 0 ? (
        <div className="bg-white border border-[#E6E7E0] rounded-2xl py-16 px-6 text-center">
          <CalendarClock className="w-8 h-8 text-[#2F6B52] mx-auto" aria-hidden="true" />
          <h2 className="mt-3 text-base font-semibold text-[#183C32]">No upcoming active tasks</h2>
          <p className="mt-1 text-sm text-[#68746D] max-w-sm mx-auto">
            Add tasks with target due dates to plan your upcoming sprint or week.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#2F6B52] rounded-xl"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Schedule Task
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {sections.map((section) => (
            <section
              key={section.key}
              className={`bg-white border rounded-2xl overflow-hidden ${
                section.urgent ? 'border-[#E8C8BF]' : 'border-[#E6E7E0]'
              }`}
            >
              <div
                className={`px-5 py-3.5 border-b flex items-center justify-between ${
                  section.urgent ? 'bg-[#FDF5F3] border-[#E8C8BF]' : 'border-[#E6E7E0]'
                }`}
              >
                <h2
                  className={`text-sm font-semibold font-sans ${
                    section.urgent ? 'text-[#B8523E]' : 'text-[#183C32]'
                  }`}
                >
                  {section.title} ({section.items.length})
                </h2>
              </div>
              {section.items.map((task) => (
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
            </section>
          ))}
        </div>
      )}

      <TaskModal
        open={modalOpen}
        editingTask={editingTask}
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
