const API_BASE = 'https://jsonplaceholder.typicode.com';

export async function fetchTodosAndUsers() {
  const [todosRes, usersRes] = await Promise.all([
    fetch(`${API_BASE}/todos?_limit=24`),
    fetch(`${API_BASE}/users`),
  ]);

  if (!todosRes.ok) {
    throw new Error(`Failed to fetch todos (HTTP ${todosRes.status})`);
  }
  if (!usersRes.ok) {
    throw new Error(`Failed to fetch users (HTTP ${usersRes.status})`);
  }

  const [todos, users] = await Promise.all([todosRes.json(), usersRes.json()]);
  return { todos, users };
}

export async function createRemoteTodo({ title, userId }) {
  const response = await fetch(`${API_BASE}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title,
      userId: Number(userId),
      completed: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Create request failed (HTTP ${response.status})`);
  }

  return response.json();
}

export async function updateRemoteTodo(id, patch) {
  const response = await fetch(`${API_BASE}/todos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });

  if (!response.ok) {
    throw new Error(`Update request failed (HTTP ${response.status})`);
  }

  return response.json();
}

export async function deleteRemoteTodo(id) {
  const response = await fetch(`${API_BASE}/todos/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Delete request failed (HTTP ${response.status})`);
  }

  return true;
}
