import { useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import TaskForm from './components/TaskForm.jsx';
import TaskList from './components/TaskList.jsx';

const STORAGE_KEY = 'taskflow_week1_tasks_v1';

const INITIAL_TASKS = [
  {
    id: 'w1-seed-1',
    title: 'Break UI into Header, TaskForm, TaskList, and TaskItem',
    notes: 'Keep state lifted in App.jsx and pass callbacks via props.',
    priority: 'high',
    completed: true,
    createdAt: '2026-11-10T09:00:00.000Z',
  },
  {
    id: 'w1-seed-2',
    title: 'Implement controlled form inputs with validation feedback',
    notes: 'Reject blank submissions or titles under 3 characters.',
    priority: 'medium',
    completed: false,
    createdAt: '2026-11-11T10:30:00.000Z',
  },
  {
    id: 'w1-seed-3',
    title: 'Persist task changes to browser localStorage',
    notes: 'Hydrate initial state safely from localStorage on load.',
    priority: 'low',
    completed: false,
    createdAt: '2026-11-12T14:15:00.000Z',
  },
];

function loadSavedTasks() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_TASKS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_TASKS;
  } catch {
    return INITIAL_TASKS;
  }
}

export default function App() {
  const [tasks, setTasks] = useState(loadSavedTasks);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // Ignore storage quota errors in restricted browser contexts
    }
  }, [tasks]);

  function handleAddTask({ title, notes, priority }) {
    const newTask = {
      id: `w1-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title,
      notes,
      priority,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
  }

  function handleToggleTask(taskId) {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  }

  function handleDeleteTask(taskId) {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  }

  function handleClearCompleted() {
    setTasks((prev) => prev.filter((task) => !task.completed));
  }

  const totalCount = tasks.length;
  const completedCount = tasks.filter((task) => task.completed).length;
  const activeCount = totalCount - completedCount;

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  return (
    <div className="app-shell">
      <main className="container">
        <Header
          totalCount={totalCount}
          activeCount={activeCount}
          completedCount={completedCount}
        />

        <TaskForm onAddTask={handleAddTask} />

        <section className="card" aria-label="Task list">
          <div className="toolbar">
            <div className="filter-tabs" role="tablist" aria-label="Filter tasks by status">
              {['all', 'active', 'completed'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={filter === tab}
                  className={`filter-btn ${filter === tab ? 'active' : ''}`}
                  onClick={() => setFilter(tab)}
                >
                  {tab === 'all' ? 'All' : tab === 'active' ? 'Active' : 'Completed'}
                </button>
              ))}
            </div>

            {completedCount > 0 ? (
              <button
                type="button"
                className="clear-btn"
                onClick={handleClearCompleted}
              >
                Clear completed ({completedCount})
              </button>
            ) : null}
          </div>

          <TaskList
            tasks={filteredTasks}
            filter={filter}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
          />
        </section>
      </main>
    </div>
  );
}
