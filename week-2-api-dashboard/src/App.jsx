import { useEffect, useState } from 'react';
import { CheckCircle2, Eye, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import TodoDetailModal from './components/TodoDetailModal.jsx';
import {
  createRemoteTodo,
  deleteRemoteTodo,
  fetchTodosAndUsers,
  updateRemoteTodo,
} from './services/jsonPlaceholderApi.js';

export default function App() {
  const [todos, setTodos] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeView, setActiveView] = useState('records');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');

  const [newTitle, setNewTitle] = useState('');
  const [newUserId, setNewUserId] = useState('1');
  const [submitting, setSubmitting] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [toast, setToast] = useState('');

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchTodosAndUsers();
      setTodos(data.todos);
      setUsers(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reach REST API.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  async function handleCreateTodo(event) {
    event.preventDefault();
    const trimmed = newTitle.trim();
    if (trimmed.length < 3) {
      setToast('Title must be at least 3 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await createRemoteTodo({ title: trimmed, userId: newUserId });
      // JSONPlaceholder returns id 201 for every simulated POST; ensure unique local key
      const record = { ...created, id: Date.now(), simulated: true };
      setTodos((prev) => [record, ...prev]);
      setNewTitle('');
      setToast('POST /todos succeeded (simulated by JSONPlaceholder; added locally).');
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Failed to create record.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleTodo(todo) {
    const nextCompleted = !todo.completed;
    try {
      await updateRemoteTodo(todo.id, { completed: nextCompleted });
      setTodos((prev) =>
        prev.map((item) =>
          item.id === todo.id ? { ...item, completed: nextCompleted } : item
        )
      );
      if (selectedTodo && selectedTodo.id === todo.id) {
        setSelectedTodo({ ...todo, completed: nextCompleted });
      }
      setToast(`PATCH /todos/${todo.id} updated status.`);
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Failed to update record.');
    }
  }

  async function handleDeleteTodo(todoId) {
    try {
      await deleteRemoteTodo(todoId);
      setTodos((prev) => prev.filter((item) => item.id !== todoId));
      if (selectedTodo && selectedTodo.id === todoId) {
        setSelectedTodo(null);
      }
      setToast(`DELETE /todos/${todoId} completed.`);
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Failed to delete record.');
    }
  }

  const userMap = new Map(users.map((user) => [user.id, user]));

  const filteredTodos = todos.filter((todo) => {
    const matchesSearch = todo.title.toLowerCase().includes(searchQuery.trim().toLowerCase());
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'completed'
          ? todo.completed
          : !todo.completed;
    const matchesUser =
      userFilter === 'all' ? true : String(todo.userId) === String(userFilter);
    return matchesSearch && matchesStatus && matchesUser;
  });

  const completedCount = todos.filter((t) => t.completed).length;
  const pendingCount = todos.length - completedCount;

  return (
    <div>
      <header className="topbar">
        <div className="topbar-inner">
          <span className="brand">TaskFlow API Explorer</span>
          <nav className="nav-links" aria-label="Dashboard sections">
            <button
              type="button"
              className={`nav-tab ${activeView === 'records' ? 'active' : ''}`}
              onClick={() => setActiveView('records')}
            >
              Todos Feed
            </button>
            <button
              type="button"
              className={`nav-tab ${activeView === 'users' ? 'active' : ''}`}
              onClick={() => setActiveView('users')}
            >
              API Users ({users.length})
            </button>
            <button type="button" className="btn-secondary" onClick={loadData}>
              <RefreshCw size={15} aria-hidden="true" />
              Reload API
            </button>
          </nav>
        </div>
      </header>

      <main className="main-wrap">
        <div className="page-head">
          <div>
            <p className="kicker">AUREX Month 2 · Week 2 Deliverable</p>
            <h1 className="page-title">Public REST API Dashboard</h1>
            <p className="page-desc">
              Live Fetch API integration with JSONPlaceholder demonstrating useEffect, loading, error, and empty states.
            </p>
          </div>
        </div>

        <div className="notice-box" role="note">
          <strong>API Behavior Note:</strong> Reads come from{' '}
          <code>https://jsonplaceholder.typicode.com/todos</code> and <code>/users</code>. Write
          requests (<code>POST</code>, <code>PATCH</code>, <code>DELETE</code>) return valid HTTP
          responses from JSONPlaceholder but are simulated remotely and reflected in React state
          until page reload.
        </div>

        <section className="kpi-grid" aria-label="API summary metrics">
          <div className="card">
            <div className="kpi-label">Loaded Records</div>
            <div className="kpi-value">{todos.length}</div>
          </div>
          <div className="card">
            <div className="kpi-label">Completed</div>
            <div className="kpi-value">{completedCount}</div>
          </div>
          <div className="card">
            <div className="kpi-label">Pending</div>
            <div className="kpi-value">{pendingCount}</div>
          </div>
          <div className="card">
            <div className="kpi-label">Matching Filter</div>
            <div className="kpi-value">{filteredTodos.length}</div>
          </div>
        </section>

        {activeView === 'users' ? (
          <section className="card" aria-label="Users directory">
            <h2 style={{ marginTop: 0, fontFamily: 'Fraunces, serif' }}>Assigned API Users</h2>
            <table className="records-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Company</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="mono-id">#{user.id}</td>
                    <td>{user.name}</td>
                    <td>@{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.company?.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : (
          <>
            <form className="card add-bar" onSubmit={handleCreateTodo}>
              <div>
                <label htmlFor="w2-new-title" className="field-label">
                  Add New Record (POST /todos)
                </label>
                <input
                  id="w2-new-title"
                  type="text"
                  className="input"
                  placeholder="Enter a task title to POST to JSONPlaceholder..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="w2-new-user" className="field-label">
                  Assign User
                </label>
                <select
                  id="w2-new-user"
                  className="select"
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn-primary" disabled={submitting}>
                <Plus size={16} aria-hidden="true" />
                {submitting ? 'Sending...' : 'Create Record'}
              </button>
            </form>

            <div className="card controls-card">
              <div className="search-wrap">
                <Search size={16} className="search-icon" aria-hidden="true" />
                <input
                  type="search"
                  className="input search-input"
                  placeholder="Search records by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search API records"
                />
              </div>

              <select
                className="select"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                aria-label="Filter by user"
              >
                <option value="all">All Users</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>

              <div className="segmented" role="tablist" aria-label="Filter by completion">
                {['all', 'pending', 'completed'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    role="tab"
                    aria-selected={statusFilter === status}
                    className={`seg-btn ${statusFilter === status ? 'active' : ''}`}
                    onClick={() => setStatusFilter(status)}
                  >
                    {status === 'all' ? 'All' : status === 'pending' ? 'Pending' : 'Completed'}
                  </button>
                ))}
              </div>
            </div>

            <section className="card" aria-label="API records">
              {loading ? (
                <div aria-label="Loading records">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div key={idx} className="skeleton-row" />
                  ))}
                </div>
              ) : error ? (
                <div className="state-box" role="alert">
                  <h3>Could not load API data</h3>
                  <p>{error}</p>
                  <button type="button" className="btn-primary" onClick={loadData}>
                    Retry Request
                  </button>
                </div>
              ) : filteredTodos.length === 0 ? (
                <div className="state-box">
                  <h3>No matching API records</h3>
                  <p>Try clearing your search query or switching user and status filters.</p>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                      setUserFilter('all');
                    }}
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <table className="records-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Owner</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTodos.map((todo) => {
                      const owner = userMap.get(todo.userId);
                      return (
                        <tr key={todo.id}>
                          <td className="mono-id">#{todo.id}</td>
                          <td>{todo.title}</td>
                          <td>{owner ? owner.name : `User #${todo.userId}`}</td>
                          <td>
                            <span className={todo.completed ? 'status-done' : 'status-open'}>
                              {todo.completed ? 'Completed' : 'Pending'}
                            </span>
                          </td>
                          <td>
                            <div className="actions-cell">
                              <button
                                type="button"
                                className="icon-btn"
                                onClick={() => setSelectedTodo(todo)}
                              >
                                <Eye size={14} aria-hidden="true" />
                                Details
                              </button>
                              <button
                                type="button"
                                className="icon-btn"
                                onClick={() => handleToggleTodo(todo)}
                              >
                                <CheckCircle2 size={14} aria-hidden="true" />
                                {todo.completed ? 'Reopen' : 'Complete'}
                              </button>
                              <button
                                type="button"
                                className="icon-btn danger"
                                onClick={() => handleDeleteTodo(todo.id)}
                                aria-label={`Delete record ${todo.id}`}
                              >
                                <Trash2 size={14} aria-hidden="true" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </section>
          </>
        )}
      </main>

      <TodoDetailModal
        todo={selectedTodo}
        user={selectedTodo ? userMap.get(selectedTodo.userId) : null}
        onClose={() => setSelectedTodo(null)}
        onToggle={handleToggleTodo}
      />

      {toast ? (
        <div className="toast" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
