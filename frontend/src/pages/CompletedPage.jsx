import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, RefreshCw } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import TaskModal from '../components/TaskModal';
import TaskRow from '../components/TaskRow';
import Toast from '../components/Toast';
import DashboardLayout from '../layouts/DashboardLayout';
import { ApiError, taskApi } from '../services/api';
import { loadPreferences } from '../utils/preferences';

export default function CompletedPage() {
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
      const data = await taskApi.list({ status: 'completed', search: searchQuery, sort: 'newest' });
      setTasks(data.tasks);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load completed tasks.');
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

  function openEditModal(task) {
    setEditingTask(task);
    setModalError('');
    setModalOpen(true);
  }

  async function handleModalSubmit(values) {
    if (!editingTask) return;
    setModalSubmitting(true);
    setModalError('');
    try {
      await taskApi.update(editingTask.id, values);
      setModalOpen(false);
      showToast('success', 'Task updated.');
      await loadTasks();
    } catch (err) {
      setModalError(err instanceof ApiError ? err.message : 'Failed to save task.');
    } finally {
      setModalSubmitting(false);
    }
  }

  async function handleReopenTask(task) {
    setTogglingId(task.id);
    try {
      await taskApi.toggleStatus(task.id);
      await loadTasks();
      showToast('success', 'Task reopened and moved back to active.');
    } catch (err) {
      showToast('error', err instanceof ApiError ? err.message : 'Could not reopen task.');
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
      title="Completed Archive"
      subtitle="Review finished tasks, reopen items if needed, or clean up older records."
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
    >
      {loading ? (
        <div className="bg-white border border-[#E6E7E0] rounded-2xl p-5 space-y-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-[72px] rounded-xl bg-[#F5F3EC] animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-white border border-[#E6E7E0] rounded-2xl py-14 px-6 text-center" role="alert">
          <p className="text-base font-semibold text-[#183C32]">Could not load completed tasks</p>
          <p className="mt-1 text-sm text-[#68746D]">{error}</p>
          <button type="button" onClick={loadTasks} className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#2F6B52] rounded-xl">
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Retry
          </button>
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white border border-[#E6E7E0] rounded-2xl py-16 px-6 text-center">
          <CheckCircle2 className="w-8 h-8 text-[#2F6B52] mx-auto" aria-hidden="true" />
          <h2 className="mt-3 text-base font-semibold text-[#183C32]">No completed tasks yet</h2>
          <p className="mt-1 text-sm text-[#68746D] max-w-sm mx-auto">
            Mark active tasks complete in Overview or My Tasks and they will appear here.
          </p>
        </div>
      ) : (
        <section className="bg-white border border-[#E6E7E0] rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#E6E7E0] flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#183C32] font-sans">
              Finished Tasks <span className="font-mono-num text-[#68746D]">({tasks.length})</span>
            </h2>
            <span className="text-xs text-[#68746D]">Click Reopen to restore any task</span>
          </div>
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} togglingId={togglingId} compact={prefs.compactDensity} onToggle={handleReopenTask} onEdit={openEditModal} onDelete={setDeletingTask} />
          ))}
        </section>
      )}

      <TaskModal open={modalOpen} editingTask={editingTask} submitting={modalSubmitting} serverError={modalError} onClose={() => setModalOpen(false)} onSubmit={handleModalSubmit} />

      <ConfirmDialog
        open={Boolean(deletingTask)}
        title="Delete this completed task?"
        description={deletingTask ? `"${deletingTask.title}" will be permanently removed from your workspace.` : ''}
        loading={deleteLoading}
        onCancel={() => setDeletingTask(null)}
        onConfirm={handleConfirmDelete}
      />

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </DashboardLayout>
  );
}
