# TaskFlow Database Schema & Isolation Design

TaskFlow uses **MongoDB** with **Mongoose** schemas (`backend/src/models/` for Week 4 and `week-3-crud-api/src/models/` for Week 3).

---

## 1. Week 4 Models

### `User` (`users` collection)
| Field | Type | Constraints | Notes |
| --- | --- | --- | --- |
| `_id` | `ObjectId` | Auto-generated | Primary key |
| `name` | `String` | Required, trimmed, 2–60 chars | User display name |
| `email` | `String` | Required, trimmed, lowercase, unique index, valid email format | Unique index prevents duplicate accounts |
| `passwordHash` | `String` | Required, `select: false` | `bcryptjs` hash (12 salt rounds); stripped in `toJSON` |
| `createdAt` | `Date` | Auto-managed (`timestamps: true`) | Account registration date |
| `updatedAt` | `Date` | Auto-managed (`timestamps: true`) | Last profile update |

### `Task` (`tasks` collection)
| Field | Type | Constraints | Notes |
| --- | --- | --- | --- |
| `_id` | `ObjectId` | Auto-generated | Primary key |
| `title` | `String` | Required, trimmed, 2–140 chars | Task headline |
| `description` | `String` | Optional, trimmed, max 2000 chars, default `""` | Detailed context |
| `status` | `String` | Enum `['active', 'completed']`, default `'active'` | Completion state |
| `priority` | `String` | Enum `['low', 'medium', 'high']`, default `'medium'` | Task urgency |
| `dueDate` | `Date \| null` | Optional, default `null` | Used to compute overdue counts |
| `completedAt` | `Date \| null` | Optional, default `null` | Timestamp when marked completed |
| `owner` | `ObjectId` | Required `ref: 'User'`, indexed | Enforces strict user isolation |
| `createdAt` | `Date` | Auto-managed | Creation timestamp |
| `updatedAt` | `Date` | Auto-managed | Update timestamp |

**Indexes:**
- `User`: `{ email: 1 }` (`unique: true`)
- `Task`: `{ owner: 1, createdAt: -1 }` (fast owner-scoped dashboard sorting)

---

## 2. User Data Isolation Architecture
1. Authentication middleware (`requireAuth`) verifies the JWT signature and resolves `req.user` from MongoDB.
2. Every read and write query in `taskController.js` binds `{ owner: req.user._id }` directly in the Mongoose filter:
   - `Task.find({ owner: req.user._id, ... })`
   - `Task.findOne({ _id: id, owner: req.user._id })`
   - `Task.findOneAndUpdate({ _id: id, owner: req.user._id }, ...)`
   - `Task.findOneAndDelete({ _id: id, owner: req.user._id })`
3. Any attempt by User A to supply `owner: userBId` on creation or access User B's task ID returns `404 Task not found.` while keeping User B's document untouched.

---

## 3. Week 3 Standalone Model (`Item`)
Located in `week-3-crud-api/src/models/Item.js`:
- `title` (String, required, 2–120 chars)
- `description` (String, optional, max 1000 chars)
- `status` (`'active' | 'completed'`)
- `priority` (`'low' | 'medium' | 'high'`)
- `timestamps: true`
