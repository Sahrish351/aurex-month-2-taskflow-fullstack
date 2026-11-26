import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required.'],
      trim: true,
      minlength: [2, 'Task title must be at least 2 characters.'],
      maxlength: [140, 'Task title cannot exceed 140 characters.'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters.'],
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'completed'],
        message: 'Status must be active or completed.',
      },
      default: 'active',
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: 'Priority must be low, medium, or high.',
      },
      default: 'medium',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task owner is required.'],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

taskSchema.index({ owner: 1, createdAt: -1 });

const Task = mongoose.model('Task', taskSchema);
export default Task;
