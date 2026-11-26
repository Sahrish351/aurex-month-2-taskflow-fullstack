import TaskItem from './TaskItem.jsx';

export default function TaskList({ tasks, filter, onToggleTask, onDeleteTask }) {
  if (tasks.length === 0) {
    const emptyMessage =
      filter === 'completed'
        ? 'No completed tasks yet. Check off an active task to move it here.'
        : filter === 'active'
          ? 'No active tasks remaining. Add a new task above to keep moving.'
          : 'Your task list is empty. Add your first task using the form above.';

    return (
      <div className="empty-state">
        <h3>Nothing to show in this view</h3>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggleTask}
          onDelete={onDeleteTask}
        />
      ))}
    </ul>
  );
}
