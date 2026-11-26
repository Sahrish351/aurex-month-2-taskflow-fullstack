import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Columns3, List, Plus, RefreshCw, Search } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import TaskModal from '../components/TaskModal';
import TaskRow from '../components/TaskRow';
import Toast from '../components/Toast';
import DashboardLayout from '../layouts/DashboardLayout';
import { ApiError, taskApi } from '../services/api';
import { loadPreferences } from '../utils/preferences';

export default function TasksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [prefs] = useState(() => loadPreferences());

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState(prefs.defaultView);

  const [quickFilter, setQuickFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '');
  const [sortOrder, setSortOrder] = useState(prefs.defaultSort);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const [togglingId, setTogglingId] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const paramSearch = searchParams.get('search');
    if (paramSearch !== null && paramSearch !== searchQuery) {
      setSearchQuery(paramSearch);
    }
  }, [searchParams]);

  function handleSearchUpdate(value) {
    setSearchQuery(value);
    if (value.trim()) {
      setSearchParams({ search: value.trim() }, { replace: true });
    } else if (searchParams.has('search')) {
      searchParams.delete('search');
      setSearchParams(searchParams, { replace: true });
    }
  }

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
      let statusParam = 'all';
      let priorityParam = priorityFilter;
      let overdueParam = false;

      if (viewMode === 'list') {
        if (quickFilter === 'active') statusParam = 'active';
        else if (quickFilter === 'completed') statusParam = 'completed';
        else if (quickFilter === 'high') priorityParam = 'high';
        else if (quickFilter === 'overdue') overdueParam = true;
      }

      const data = await taskApi.list({
        status: statusParam,
        priority: priorityParam,
        overdue: overdueParam,
        search: searchQuery,
        sort: sortOrder,
      });
      setTasks(data.tasks);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to fetch tasks.');
    } finally {
      setLoading(false);
    }
  }, [viewMode, quickFilter, priorityFilter, searchQuery, sortOrder]);

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

  async function handleToggleTask(task) {
    setTogglingId(task.id);
    try {
      await taskApi.toggleStatus(task.id);
      await loadTasks();
      showToast('success', task.status === 'completed' ? 'Task reopened.' : 'Task completed.');
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

  const activeTasks = tasks.filter((t) => t.status === 'active');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  const filterChips = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' },
    { key: 'high', label: 'High Priority' },
    { key: 'overdue', label: 'Overdue' },
  ];

  return (
    <DashboardLayout
      title="My Tasks"
      subtitle="Switch between structured list and two-column board views with full search and filters."
      searchValue={searchQuery}
      onSearchChange={handleSearchUpdate}
      onCreateTask={openCreateModal}
    >
      <div className="space-y-5">
        <div className="bg-white border border-[#E6E7E0] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex bg-[#F3F1EA] p-1 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  viewMode === 'list' ? 'bg-white text-[#183C32] shadow-xs' : 'text-[#68746D]'
                }`}
              >
                <List className="w-3.5 h-3.5" aria-hidden="true" />
                List
              </button>
              <button
                type="button"
                onClick={() => setViewMode('board')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  viewMode === 'board' ? 'bg-white text-[#183C32] shadow-xs' : 'text-[#68746D]'
                }`}
              >
                <Columns3 className="w-3.5 h-3.5" aria-hidden="true" />
                Board
              </button>
            </div>

            {viewMode === 'list' ? (
              <div className="flex flex-wrap bg-[#F3F1EA] p-1 rounded-xl gap-1" role="tablist">
                {filterChips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    role="tab"
                    aria-selected={quickFilter === chip.key}
                    onClick={() => setQuickFilter(chip.key)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                      quickFilter === chip.key
                        ? 'bg-white text-[#183C32] shadow-xs'
                        : 'text-[#68746D] hover:text-[#183C32]'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <div className="relative md:hidden w-full sm:w-52">
              <Search className="w-4 h-4 text-[#68746D] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => handleSearchUpdate(e.target.value)}
                placeholder="Search tasks..."
                aria-label="Search tasks"
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF8F3] border border-[#E6E7E0] rounded-xl text-[#183C32]"
              />
            </div>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              aria-label="Filter by priority"
              className="px-3 py-2 text-xs font-medium bg-[#FAF8F3] border border-[#E6E7E0] rounded-xl text-[#183C32]"
            >
              <option value="all">All priorities</option>
              <option value="high">High priority</option>
              <option value="medium">Medium priority</option>
              <option value="low">Low priority</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              aria-label="Sort tasks"
              className="px-3 py-2 text-xs font-medium bg-[#FAF8F3] border border-[#E6E7E0] rounded-xl text-[#183C32]"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="dueDate">Due date</option>
              <option value="priority">Priority</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="bg-white border border-[#E6E7E0] rounded-2xl p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="h-[72px] rounded-xl bg-[#F5F3EC] animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-white border border-[#E6E7E0] rounded-2xl py-14 px-6 text-center" role="alert">
            <p className="text-base font-semibold text-[#183C32]">Could not load tasks</p>
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
        ) : viewMode === 'list' ? (
          <div className="bg-white border border-[#E6E7E0] rounded-2xl overflow-hidden">
            {tasks.length === 0 ? (
              <div className="py-16 px-6 text-center">
                <h2 className="text-base font-semibold text-[#183C32]">No tasks found</h2>
                <p className="mt-1 text-sm text-[#68746D]">
                  Create a new task or adjust your search and filter selections.
                </p>
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#2F6B52] rounded-xl"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  New Task
                </button>
              </div>
            ) : (
              tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  togglingId={togglingId}
                  compact={prefs.compactDensity}
                  onToggle={handleToggleTask}
                  onEdit={openEditModal}
                  onDelete={setDeletingTask}
                />
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <section className="bg-white border border-[#E6E7E0] rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E6E7E0] flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#183C32] font-sans">
                  Active <span className="font-mono-num text-[#68746D]">({activeTasks.length})</span>
                </h2>
                <button type="button" onClick={openCreateModal} className="text-xs font-semibold text-[#2F6B52] hover:text-[#183C32]">
                  + Add
                </button>
              </div>
              {activeTasks.length === 0 ? (
                <p className="p-8 text-center text-sm text-[#68746D]">No active tasks in this column.</p>
              ) : (
                activeTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    togglingId={togglingId}
                    compact={prefs.compactDensity}
                    onToggle={handleToggleTask}
                    onEdit={openEditModal}
                    onDelete={setDeletingTask}
                  />
                ))
              )}
            </section>

            <section className="bg-white border border-[#E6E7E0] rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E6E7E0] flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#183C32] font-sans">
                  Completed <span className="font-mono-num text-[#68746D]">({completedTasks.length})</span>
                </h2>
              </div>
              {completedTasks.length === 0 ? (
                <p className="p-8 text-center text-sm text-[#68746D]">Check off an active task to move it here.</p>
              ) : (
                completedTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    togglingId={togglingId}
                    compact={prefs.compactDensity}
                    onToggle={handleToggleTask}
                    onEdit={openEditModal}
                    onDelete={setDeletingTask}
                  />
                ))
              )}
            </section>
          </div>
        )}
      </div>

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
