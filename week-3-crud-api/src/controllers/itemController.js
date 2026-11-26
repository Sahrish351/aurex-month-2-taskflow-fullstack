import mongoose from 'mongoose';
import Item from '../models/Item.js';

function isPlainString(value) {
  return typeof value === 'string';
}

export async function createItem(req, res, next) {
  try {
    const { title, description, status, priority } = req.body ?? {};

    if (!isPlainString(title) || !title.trim()) {
      return res.status(400).json({ message: 'A valid string title is required.' });
    }
    if (description !== undefined && !isPlainString(description)) {
      return res.status(400).json({ message: 'Description must be a string.' });
    }
    if (status !== undefined && !isPlainString(status)) {
      return res.status(400).json({ message: 'Status must be a string.' });
    }
    if (priority !== undefined && !isPlainString(priority)) {
      return res.status(400).json({ message: 'Priority must be a string.' });
    }

    const item = await Item.create({
      title: title.trim(),
      description: description !== undefined ? description.trim() : '',
      status,
      priority,
    });

    return res.status(201).json({ item });
  } catch (err) {
    return next(err);
  }
}

export async function getAllItems(req, res, next) {
  try {
    const filter = {};
    if (typeof req.query.status === 'string' && ['active', 'completed'].includes(req.query.status)) {
      filter.status = req.query.status;
    }

    const items = await Item.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ count: items.length, items });
  } catch (err) {
    return next(err);
  }
}

export async function getItemById(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid item ID format.' });
    }

    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    return res.status(200).json({ item });
  } catch (err) {
    return next(err);
  }
}

export async function updateItem(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid item ID format.' });
    }

    const { title, description, status, priority } = req.body ?? {};
    const updates = {};

    if (title !== undefined) {
      if (!isPlainString(title) || !title.trim()) {
        return res.status(400).json({ message: 'Title must be a non-empty string.' });
      }
      updates.title = title.trim();
    }
    if (description !== undefined) {
      if (!isPlainString(description)) {
        return res.status(400).json({ message: 'Description must be a string.' });
      }
      updates.description = description.trim();
    }
    if (status !== undefined) {
      if (!isPlainString(status)) {
        return res.status(400).json({ message: 'Status must be a string.' });
      }
      updates.status = status;
    }
    if (priority !== undefined) {
      if (!isPlainString(priority)) {
        return res.status(400).json({ message: 'Priority must be a string.' });
      }
      updates.priority = priority;
    }

    const item = await Item.findByIdAndUpdate(id, updates, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    return res.status(200).json({ item });
  } catch (err) {
    return next(err);
  }
}

export async function deleteItem(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid item ID format.' });
    }

    const item = await Item.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    return res.status(200).json({ message: 'Item deleted successfully.', id });
  } catch (err) {
    return next(err);
  }
}
