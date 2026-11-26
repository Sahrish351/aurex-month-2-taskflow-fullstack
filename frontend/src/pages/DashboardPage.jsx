import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CalendarClock, Plus, RefreshCw, Search } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import ProductivityPanel from '../components/ProductivityPanel';
import TaskModal from '../components/TaskModal';
import TaskRow from '../components/TaskRow';
import TaskStatsGrid from '../components/TaskStatsGrid';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';
import { ApiError, taskApi } from '../services/api';
import { formatShortDate, isTaskDueToday, isTaskOverdue } from '../utils/dateUtils';
import { loadPreferences } from '../utils/preferences';

const EMPTY_STATS = {
  total: 0,
  active: 0,
  completed: 0,
  overdue: 0,
  completionRate: 0,
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [prefs] = useState(() => loadPreferences());

  const [tasks, setTasks] = useState([]);
  const [allTasksSnapshot, setAllTasksSnapshot] = useState([]);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [quickFilter, setQuickFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState(prefs.defaultSort);
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
      let statusParam = 'all';
      let priorityParam = priorityFilter;
      let overdueParam = false;

      if (quickFilter === 'active') statusParam = 'active';
      else if (quickFilter === 'completed') statusParam = 'completed';
      else if (quickFilter === 'high') priorityParam = 'high';
      else if (quickFilter === 'overdue') overdueParam = true;

      const [filteredData, snapshotData] = await Promise.all([
        taskApi.list({
          status: statusParam,
          priority: priorityParam,
          overdue: overdueParam,
          search: searchQuery,
          sort: sortOrder,
        }),
        taskApi.list({ status: 'active', sort: 'dueDate' }),
      ]);

      setTasks(filteredData.tasks);
      setStats(filteredData.stats);
      setAllTasksSnapshot(snapshotData.tasks);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load your tasks.');
    } finally {
      setLoading(false);
    }
  }, [quickFilter, priorityFilter, searchQuery, sortOrder]);

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
      showToast(
        'success',
        task.status === 'completed' ? 'Task moved back to active.' : 'Task marked completed.'
      );
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

  const firstName = user?.name?.split(' ')[0] || 'there';
  const hasFilters = quickFilter !== 'all' || priorityFilter !== 'all' || searchQuery.trim() !== '';

  const urgentQueue = allTasksSnapshot
    .filter((t) => isTaskOverdue(t.status, t.dueDate) || isTaskDueToday(t.dueDate))
    .slice(0, 4);

  const filterChips = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' },
    { key: 'high', label: 'High Priority' },
    { key: 'overdue', label: 'Overdue' },
  ];

  return (
    <DashboardLayout
      title={`Welcome back, ${firstName}`}
      subtitle="Track your deliverables, prioritize upcoming deadlines, and measure real progress."
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      onCreateTask={openCreateModal}
    >
      <div className="space-y-6">
        <TaskStatsGrid stats={stats} loading={loading && tasks.length === 0} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <section className="lg:col-span-8 bg-white border border-[#E6E7E0] rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-[#E6E7E0] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-[#183C32] font-sans">Workspace Tasks</h2>
                  <Link
                    to="/tasks"
                    className="text-xs font-semibold text-[#2F6B52] hover:text-[#183C32] underline underline-offset-4"
                  >
                    Open full board
                  </Link>
                </div>

                <div className="flex flex-wrap bg-[#F3F1EA] p-1 rounded-xl gap-1" role="tablist" aria-label="Filter tasks">
                  {filterChips.map((chip) => (
                    <button
                      key={chip.key}
                      type="button"
                      role="tab"
                      aria-selected={quickFilter === chip.key}
                      onClick={() => setQuickFilter(chip.key)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                        quickFilter === chip.key
                          ? 'bg-white text-[#183C32] shadow-xs'
                          : 'text-[#68746D] hover:text-[#183C32]'
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative md:hidden sm:col-span-3">
                  <Search className="w-4 h-4 text-[#68746D] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tasks..."
                    aria-label="Search tasks"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-[#FAF8F3] border border-[#E6E7E0] rounded-xl text-[#183C32]"
                  />
                </div>

                <select
                  aria-label="Filter by priority"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium bg-[#FAF8F3] border border-[#E6E7E0] rounded-xl text-[#183C32] focus:outline-none focus:border-[#2F6B52]"
                >
                  <option value="all">All priorities</option>
                  <option value="high">High priority</option>
                  <option value="medium">Medium priority</option>
                  <option value="low">Low priority</option>
                </select>

                <select
                  aria-label="Sort tasks"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium bg-[#FAF8F3] border border-[#E6E7E0] rounded-xl text-[#183C32] focus:outline-none focus:border-[#2F6B52]"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="dueDate">Due date</option>
                  <option value="priority">Priority (High to Low)</option>
                </select>

                {hasFilters ? (
                  <button
                    type="button"
                    onClick={() => {
                      setQuickFilter('all');
                      setPriorityFilter('all');
                      setSearchQuery('');
                    }}
                    className="px-3 py-2 text-xs font-semibold text-[#68746D] hover:text-[#183C32] bg-[#FAF8F3] border border-[#E6E7E0] rounded-xl whitespace-nowrap"
                  >
                    Clear filters
                  </button>
                ) : null}
              </div>
            </div>

            {loading ? (
              <div className="p-5 space-y-3" aria-label="Loading tasks">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="h-[72px] rounded-xl bg-[#F5F3EC] animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="py-14 px-6 text-center" role="alert">
                <p className="text-base font-semibold text-[#183C32]">Unable to load tasks</p>
                <p className="mt-1 text-sm text-[#68746D]">{error}</p>
                <button
                  type="button"
                  onClick={loadTasks}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#2F6B52] rounded-xl hover:bg-[#245440]"
                >
                  <RefreshCw className="w-4 h-4" aria-hidden="true" />
                  Retry
                </button>
              </div>
            ) : tasks.length === 0 ? (
              <div className="py-14 px-6 text-center">
                <h3 className="text-base font-semibold text-[#183C32]">
                  {hasFilters ? 'No tasks match your filters' : 'Your workspace is clear'}
                </h3>
                <p className="mt-1.5 text-sm text-[#68746D] max-w-sm mx-auto">
                  {hasFilters
                    ? 'Try clearing your search or switching quick filter tabs.'
                    : 'Create your first task to start organizing priorities, due dates, and progress.'}
                </p>
                {hasFilters ? (
                  <button
                    type="button"
                    onClick={() => {
                      setQuickFilter('all');
                      setPriorityFilter('all');
                      setSearchQuery('');
                    }}
                    className="mt-5 px-4 py-2 text-sm font-semibold text-[#183C32] bg-[#FAF8F3] border border-[#E6E7E0] rounded-xl hover:bg-[#EFECE4]"
                  >
                    Reset Filters
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={openCreateModal}
                    className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#2F6B52] rounded-xl hover:bg-[#245440]"
                  >
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    Create First Task
                  </button>
                )}
              </div>
            ) : (
              <div>
                {tasks.map((task) => (
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

          <div className="lg:col-span-4 space-y-5">
            <section className="bg-white border border-[#E6E7E0] rounded-2xl p-5">
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#E6E7E0]">
                <div className="flex items-center gap-2">
                  <CalendarClock className="w-4 h-4 text-[#2F6B52]" aria-hidden="true" />
                  <h2 className="text-sm font-semibold text-[#183C32] font-sans">Due Today &amp; Overdue</h2>
                </div>
                <Link to="/today" className="text-xs font-semibold text-[#2F6B52] hover:underline">
                  Today view
                </Link>
              </div>

              {urgentQueue.length === 0 ? (
                <p className="py-5 text-xs text-[#68746D] leading-relaxed">
                  No overdue items or tasks scheduled for today. Check Upcoming or Calendar to plan ahead.
                </p>
              ) : (
                <ul className="divide-y divide-[#E6E7E0] mt-1">
                  {urgentQueue.map((item) => {
                    const overdue = isTaskOverdue(item.status, item.dueDate);
                    return (
                      <li key={item.id} className="py-2.5 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#183C32] truncate">{item.title}</p>
                          <p
                            className={`mt-0.5 text-[11px] font-mono-num flex items-center gap-1 ${
                              overdue ? 'text-[#B8523E]' : 'text-[#2F6B52]'
                            }`}
                          >
                            {overdue ? <AlertCircle className="w-3 h-3" aria-hidden="true" /> : null}
                            <span>{overdue ? 'Overdue' : 'Due today'} · {formatShortDate(item.dueDate)}</span>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="text-xs font-semibold text-[#68746D] hover:text-[#183C32] shrink-0"
                        >
                          Edit
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <ProductivityPanel
              stats={stats}
              tasks={allTasksSnapshot.length ? allTasksSnapshot : tasks}
              onCreateTask={openCreateModal}
            />
          </div>
        </div>
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
