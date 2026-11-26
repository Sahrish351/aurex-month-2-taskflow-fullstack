import mongoose from 'mongoose';
import Task from '../models/Task.js';
import { escapeRegex, isPlainString, parseOptionalDate } from '../utils/validators.js';

function getStartOfTodayUTC() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function computeStats(allTasks) {
  const todayStart = getStartOfTodayUTC();
  const total = allTasks.length;
  const completed = allTasks.filter((task) => task.status === 'completed').length;
  const active = total - completed;
  const overdue = allTasks.filter(
    (task) => task.status === 'active' && task.dueDate && new Date(task.dueDate) < todayStart
  ).length;
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

  return { total, active, completed, overdue, completionRate };
}

export async function getTasks(req, res, next) {
  try {
    const ownerId = req.user._id;
    const allOwnerTasks = await Task.find({ owner: ownerId }).select('status dueDate').lean();
    const stats = computeStats(allOwnerTasks);

    const query = { owner: ownerId };
    const { status, priority, search, sort, overdue } = req.query;

    if (overdue === 'true') {
      query.status = 'active';
      query.dueDate = { $lt: getStartOfTodayUTC() };
    } else if (typeof status === 'string' && ['active', 'completed'].includes(status)) {
      query.status = status;
    }

    if (typeof priority === 'string' && ['low', 'medium', 'high'].includes(priority)) {
      query.priority = priority;
    }

    if (typeof search === 'string' && search.trim()) {
      const pattern = new RegExp(escapeRegex(search.trim()), 'i');
      query.$or = [{ title: pattern }, { description: pattern }];
    }

    let sortSpec = { createdAt: -1 };
    if (sort === 'oldest') sortSpec = { createdAt: 1 };
    if (sort === 'dueDate') sortSpec = { dueDate: 1, createdAt: -1 };

    const tasks = await Task.find(query).sort(sortSpec);

    if (sort === 'priority') {
      const rank = { high: 0, medium: 1, low: 2 };
      tasks.sort((a, b) => rank[a.priority] - rank[b.priority]);
    }

    return res.status(200).json({ tasks, stats });
  } catch (err) {
    return next(err);
  }
}

export async function createTask(req, res, next) {
  try {
    const { title, description, status, priority, dueDate } = req.body ?? {};

    if (!isPlainString(title) || title.trim().length < 2 || title.trim().length > 140) {
      return res.status(400).json({ message: 'Task title must be between 2 and 140 characters.' });
    }
    if (description !== undefined && !isPlainString(description)) {
      return res.status(400).json({ message: 'Description must be text.' });
    }
    if (status !== undefined && (!isPlainString(status) || !['active', 'completed'].includes(status))) {
      return res.status(400).json({ message: 'Status must be active or completed.' });
    }
    if (priority !== undefined && (!isPlainString(priority) || !['low', 'medium', 'high'].includes(priority))) {
      return res.status(400).json({ message: 'Priority must be low, medium, or high.' });
    }

    const parsedDate = parseOptionalDate(dueDate);
    if (!parsedDate.valid) {
      return res.status(400).json({ message: 'Please provide a valid due date.' });
    }

    const resolvedStatus = status || 'active';
    const task = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      status: resolvedStatus,
      priority: priority || 'medium',
      dueDate: parsedDate.date,
      completedAt: resolvedStatus === 'completed' ? new Date() : null,
      owner: req.user._id,
    });

    return res.status(201).json({ task });
  } catch (err) {
    return next(err);
  }
}

export async function getTaskById(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid task ID format.' });
    }

    const task = await Task.findOne({ _id: id, owner: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    return res.status(200).json({ task });
  } catch (err) {
    return next(err);
  }
}

export async function updateTask(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid task ID format.' });
    }

    const { title, description, status, priority, dueDate } = req.body ?? {};
    const updates = {};

    if (title !== undefined) {
      if (!isPlainString(title) || title.trim().length < 2 || title.trim().length > 140) {
        return res.status(400).json({ message: 'Task title must be between 2 and 140 characters.' });
      }
      updates.title = title.trim();
    }

    if (description !== undefined) {
      if (!isPlainString(description)) {
        return res.status(400).json({ message: 'Description must be text.' });
      }
      updates.description = description.trim();
    }

    if (status !== undefined) {
      if (!isPlainString(status) || !['active', 'completed'].includes(status)) {
        return res.status(400).json({ message: 'Status must be active or completed.' });
      }
      updates.status = status;
      updates.completedAt = status === 'completed' ? new Date() : null;
    }

    if (priority !== undefined) {
      if (!isPlainString(priority) || !['low', 'medium', 'high'].includes(priority)) {
        return res.status(400).json({ message: 'Priority must be low, medium, or high.' });
      }
      updates.priority = priority;
    }

    if (dueDate !== undefined) {
      const parsedDate = parseOptionalDate(dueDate);
      if (!parsedDate.valid) {
        return res.status(400).json({ message: 'Please provide a valid due date.' });
      }
      updates.dueDate = parsedDate.date;
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, owner: req.user._id },
      updates,
      { returnDocument: 'after', runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    return res.status(200).json({ task });
  } catch (err) {
    return next(err);
  }
}

export async function toggleTaskStatus(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid task ID format.' });
    }

    const task = await Task.findOne({ _id: id, owner: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const nextStatus = task.status === 'completed' ? 'active' : 'completed';
    task.status = nextStatus;
    task.completedAt = nextStatus === 'completed' ? new Date() : null;
    await task.save();

    return res.status(200).json({ task });
  } catch (err) {
    return next(err);
  }
}

export async function deleteTask(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid task ID format.' });
    }

    const task = await Task.findOneAndDelete({ _id: id, owner: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    return res.status(200).json({ message: 'Task deleted successfully.', id });
  } catch (err) {
    return next(err);
  }
}
