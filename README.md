# Prima Interns - Task Progress Management System

A structured internal platform for onboarding and sequential task management for interns.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Multer + local/S3

## Getting Started

### Frontend

```bash
cd frontend/   # or project root
npm install
npm run dev    # starts on http://localhost:8080
```

### Backend Setup

```bash
mkdir prima-backend && cd prima-backend
npm init -y
npm install express mongoose dotenv cors bcryptjs jsonwebtoken multer helmet morgan express-validator
npm install -D nodemon
```

**Backend `.env`**:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/prima_interns
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
UPLOAD_DIR=./uploads
CORS_ORIGIN=http://localhost:8080
```

**Frontend `.env`**:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

Then set `USE_MOCK_DATA = false` in `src/services/api.ts`.

## Demo Credentials (Mock Mode)

| Role   | Email              | Password   |
|--------|-------------------|------------|
| Admin  | admin@prima.com   | admin123   |
| Intern | intern@prima.com  | intern123  |

---

# Backend Development Guide

## Recommended Folder Structure

```
prima-backend/
├── server.js                 # Entry point
├── config/
│   └── db.js                 # MongoDB connection
├── middleware/
│   ├── auth.js               # JWT verification middleware
│   ├── admin.js              # Admin role check middleware
│   ├── upload.js             # Multer file upload config
│   └── errorHandler.js       # Global error handler
├── models/
│   ├── User.js
│   ├── Profile.js
│   ├── TaskTemplate.js
│   ├── InternTask.js
│   └── Attachment.js
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── interns.js
│   ├── tasks.js
│   ├── taskTemplates.js
│   ├── dashboard.js
│   ├── reports.js
│   └── settings.js
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── internController.js
│   ├── taskController.js
│   ├── taskTemplateController.js
│   ├── dashboardController.js
│   ├── reportController.js
│   └── settingsController.js
├── uploads/                  # Uploaded files directory
└── .env
```

---

## MongoDB Schemas (Mongoose Models)

### User Model (`models/User.js`)

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['intern', 'admin'], default: 'intern' },
  registrationStep: { type: mongoose.Schema.Types.Mixed, default: 1 }, // 1 | 2 | 3 | 'complete'
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

### Profile Model (`models/Profile.js`)

```javascript
const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  mobile: { type: String, default: '' },
  dob: { type: String, default: '' },
  address: { type: String, default: '' },
  skills: [{ type: String }],
  domain: { type: String, default: '' },
  collegeName: { type: String, default: '' },
  degree: { type: String, default: '' },
  branch: { type: String, default: '' },
  yearOfPassing: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
```

### TaskTemplate Model (`models/TaskTemplate.js`)

```javascript
const mongoose = require('mongoose');

const taskTemplateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  orderIndex: { type: Number, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('TaskTemplate', taskTemplateSchema);
```

### InternTask Model (`models/InternTask.js`)

```javascript
const mongoose = require('mongoose');

const internTaskSchema = new mongoose.Schema({
  internId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  taskTemplateId: { type: mongoose.Schema.Types.ObjectId, ref: 'TaskTemplate', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ['locked', 'in_progress', 'pending', 'approved', 'rejected'],
    default: 'locked'
  },
  feedback: { type: String, default: '' },
  submittedAt: { type: Date },
  reviewedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('InternTask', internTaskSchema);
```

### Attachment Model (`models/Attachment.js`)

```javascript
const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  internTaskId: { type: mongoose.Schema.Types.ObjectId, ref: 'InternTask', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['pdf', 'image', 'zip', 'other'], required: true },
  size: { type: Number, required: true },
  url: { type: String, required: true },
  mimeType: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Attachment', attachmentSchema);
```

---

## Server Entry Point (`server.js`)

```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/interns', require('./routes/interns'));
app.use('/api/v1/tasks', require('./routes/tasks'));
app.use('/api/v1/task-templates', require('./routes/taskTemplates'));
app.use('/api/v1/dashboard', require('./routes/dashboard'));
app.use('/api/v1/reports', require('./routes/reports'));
app.use('/api/v1/settings', require('./routes/settings'));

// Error handler
app.use(require('./middleware/errorHandler'));

// Connect DB and start
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT, () => console.log(`Server on port ${process.env.PORT}`));
  })
  .catch(err => console.error('DB connection failed:', err));
```

---

## Middleware

### Auth Middleware (`middleware/auth.js`)

```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) return res.status(401).json({ message: 'User not found' });

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
```

### Admin Middleware (`middleware/admin.js`)

```javascript
module.exports = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
```

### Upload Middleware (`middleware/upload.js`)

```javascript
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.png', '.jpg', '.jpeg', '.zip'];
  const ext = path.extname(file.originalname).toLowerCase();
  cb(null, allowed.includes(ext));
};

module.exports = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });
```

---

# API Endpoints Reference

All endpoints prefixed with: `{VITE_API_BASE_URL}/v1`

## 1. Authentication — `routes/auth.js`

**Frontend Service**: `src/services/authService.ts`

| Method | Endpoint | Auth | Description | Frontend Usage |
|--------|----------|------|-------------|----------------|
| POST | `/auth/login` | No | Login | `Login.tsx`, `AuthContext.tsx` |
| POST | `/auth/logout` | Yes | Logout | `Layout.tsx`, `AuthContext.tsx` |
| POST | `/auth/register` | No | Register | `Register.tsx`, `AuthContext.tsx` |
| POST | `/auth/refresh-token` | Yes | Refresh JWT | Future feature |
| POST | `/auth/forgot-password` | No | Request reset | Future feature |
| POST | `/auth/reset-password` | No | Reset password | Future feature |

### POST `/auth/login`

**Controller**: `authController.login`

```javascript
// controllers/authController.js
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
  const profile = await Profile.findOne({ userId: user._id });
  res.json({
    user: { id: user._id, email: user.email, role: user.role, registrationStep: user.registrationStep, profile },
    token
  });
};
```

**Request**: `{ "email": "string", "password": "string" }`

**Response**:
```json
{
  "user": {
    "id": "string",
    "email": "string",
    "role": "intern | admin",
    "registrationStep": "1 | 2 | 3 | complete",
    "profile": { ... }
  },
  "token": "jwt_token_string"
}
```

### POST `/auth/register`

**Request**: `{ "name": "string", "email": "string", "mobile": "string", "password": "string" }`

**Response**: Same as login response with `registrationStep: 2`

### POST `/auth/logout`

**Request**: Authorization header required, no body

**Response**: `204 No Content`

---

## 2. User/Profile — `routes/users.js`

**Frontend Service**: `src/services/authService.ts`

| Method | Endpoint | Auth | Description | Frontend Usage |
|--------|----------|------|-------------|----------------|
| GET | `/users/profile` | Yes | Get profile | `AuthContext.tsx` |
| PUT | `/users/profile` | Yes | Update profile | `Register.tsx`, `Settings.tsx` |
| PATCH | `/users/registration-step` | Yes | Update step | `Register.tsx` |
| POST | `/users/avatar` | Yes | Upload avatar | Future feature |

### GET `/users/profile`

**Response**:
```json
{
  "user": {
    "id": "string",
    "email": "string",
    "role": "intern",
    "registrationStep": "complete",
    "profile": {
      "name": "string",
      "email": "string",
      "mobile": "string",
      "dob": "string",
      "address": "string",
      "skills": ["string"],
      "domain": "string",
      "collegeName": "string",
      "degree": "string",
      "branch": "string",
      "yearOfPassing": "string"
    }
  }
}
```

### PUT `/users/profile`

**Request** (Step 2): `{ "dob": "string", "address": "string", "skills": ["string"], "domain": "string" }`

**Request** (Step 3): `{ "collegeName": "string", "degree": "string", "branch": "string", "yearOfPassing": "string" }`

### PATCH `/users/registration-step`

**Request**: `{ "step": 1 | 2 | 3 | "complete" }`

---

## 3. Intern Management (Admin) — `routes/interns.js`

**Frontend Service**: `src/services/internService.ts`

| Method | Endpoint | Auth | Admin | Description | Frontend Usage |
|--------|----------|------|-------|-------------|----------------|
| GET | `/interns` | Yes | Yes | List all | `AdminInterns.tsx` |
| GET | `/interns/:id` | Yes | Yes | Get one | `AdminInternDetails.tsx` |
| PUT | `/interns/:id` | Yes | Yes | Update | Future feature |
| DELETE | `/interns/:id` | Yes | Yes | Delete | Future feature |
| GET | `/interns/search?q=` | Yes | Yes | Search | `AdminInterns.tsx` |
| GET | `/interns/export/csv` | Yes | Yes | Export CSV | `AdminInterns.tsx` |
| GET | `/interns/export/excel` | Yes | Yes | Export Excel | `AdminInterns.tsx` |

### GET `/interns`

**Query Params**: `page`, `limit`, `sort`

**Response**:
```json
{
  "interns": [{
    "id": "string",
    "profile": { "name": "string", "email": "string", ... },
    "tasks": [{ "id": "string", "title": "string", "status": "string", ... }],
    "registrationCompleted": true,
    "registeredAt": "ISO date"
  }],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

### GET `/interns/:id`

**Response**: `{ "intern": { ... } }`

---

## 4. Task Management — `routes/tasks.js`

**Frontend Service**: `src/services/taskService.ts`

| Method | Endpoint | Auth | Admin | Description | Frontend Usage |
|--------|----------|------|-------|-------------|----------------|
| GET | `/tasks` | Yes | No | Get intern's tasks | `Dashboard.tsx` |
| GET | `/tasks/:id` | Yes | No | Get single task | `Dashboard.tsx` |
| POST | `/tasks` | Yes | Yes | Create task | `AdminAddTask.tsx` |
| PUT | `/tasks/:id` | Yes | Yes | Update task | `AdminTasks.tsx` |
| DELETE | `/tasks/:id` | Yes | Yes | Delete task | `AdminTasks.tsx` |
| POST | `/tasks/:id/submit` | Yes | No | Submit for review | `TaskCard.tsx` |
| POST | `/tasks/:id/review` | Yes | Yes | Approve/reject | `AdminTasks.tsx` |
| POST | `/tasks/:id/attachments` | Yes | No | Upload file | `TaskCard.tsx` |
| DELETE | `/tasks/:tid/attachments/:aid` | Yes | No | Delete file | `TaskCard.tsx` |
| GET | `/tasks/:tid/attachments/:aid/download` | Yes | Both | Download file | `AdminTasks.tsx` |
| POST | `/tasks/assign` | Yes | Yes | Assign task | `AdminAddTask.tsx` |
| POST | `/tasks/bulk-assign` | Yes | Yes | Bulk assign | `AdminAddTask.tsx` |

### POST `/tasks/:id/submit`

**Request**: `{ "attachments": [{ "id", "name", "type", "size", "url", "mimeType" }] }`

**Response**: `{ "task": { ..., "status": "pending", "submittedAt": "ISO date" } }`

### POST `/tasks/:id/review`

**Request**: `{ "status": "approved | rejected", "feedback": "string" }`

**Response**: `{ "task": { ..., "status": "approved", "reviewedAt": "ISO date" } }`

> **IMPORTANT**: When approving a task, the backend must unlock the next sequential task by changing its status from `locked` to `in_progress`.

### POST `/tasks/:id/attachments`

**Request**: `multipart/form-data` with field `attachment` (PDF, image, ZIP — max 10MB)

**Response**: `{ "attachment": { "id", "name", "type", "size", "url", "mimeType" } }`

---

## 5. Task Templates (Admin) — `routes/taskTemplates.js`

**Frontend Service**: `src/services/taskService.ts`

| Method | Endpoint | Auth | Admin | Description | Frontend Usage |
|--------|----------|------|-------|-------------|----------------|
| GET | `/task-templates` | Yes | Yes | List all | `AdminTaskTemplates.tsx` |
| GET | `/task-templates/:id` | Yes | Yes | Get one | `AdminTaskTemplates.tsx` |
| POST | `/task-templates` | Yes | Yes | Create | `AdminTaskTemplates.tsx` |
| PUT | `/task-templates/:id` | Yes | Yes | Update | `AdminTaskTemplates.tsx` |
| DELETE | `/task-templates/:id` | Yes | Yes | Delete | `AdminTaskTemplates.tsx` |
| POST | `/task-templates/:id/duplicate` | Yes | Yes | Duplicate | `AdminTaskTemplates.tsx` |

---

## 6. Dashboard & Reports — `routes/dashboard.js`, `routes/reports.js`

| Method | Endpoint | Auth | Admin | Description | Frontend Usage |
|--------|----------|------|-------|-------------|----------------|
| GET | `/dashboard/intern-stats` | Yes | No | Intern stats | `Dashboard.tsx` |
| GET | `/dashboard/admin-stats` | Yes | Yes | Admin stats | `Dashboard.tsx` |
| GET | `/dashboard/progress` | Yes | Yes | Overview | `AdminReports.tsx` |
| GET | `/reports/summary` | Yes | Yes | Summary | `AdminReports.tsx` |
| GET | `/reports/intern-progress` | Yes | Yes | Progress | `AdminReports.tsx` |
| GET | `/reports/task-completion` | Yes | Yes | Completion | `AdminReports.tsx` |
| GET | `/reports/domain-distribution` | Yes | Yes | Domains | `AdminReports.tsx` |
| GET | `/reports/export/pdf` | Yes | Yes | Export PDF | `AdminReports.tsx` |

---

## 7. Settings — `routes/settings.js`

| Method | Endpoint | Auth | Description | Frontend Usage |
|--------|----------|------|-------------|----------------|
| GET | `/settings` | Yes | Get settings | `Settings.tsx` |
| PUT | `/settings` | Yes | Update settings | `Settings.tsx` |
| PUT | `/settings/password` | Yes | Change password | `Settings.tsx` |
| PUT | `/settings/notifications` | Yes | Notification prefs | `Settings.tsx` |

---

## Frontend → Backend File Mapping

| Frontend File | Service Used | API Endpoints Called |
|---------------|-------------|---------------------|
| `src/pages/Login.tsx` | `authService` | `POST /auth/login` |
| `src/pages/Register.tsx` | `authService` | `POST /auth/register`, `PUT /users/profile`, `PATCH /users/registration-step` |
| `src/pages/Dashboard.tsx` | `taskService` | `GET /tasks`, `GET /dashboard/intern-stats` |
| `src/pages/Settings.tsx` | `authService` | `GET /settings`, `PUT /settings`, `PUT /settings/password` |
| `src/pages/AdminInterns.tsx` | `internService` | `GET /interns`, `GET /interns/search`, `GET /interns/export/csv` |
| `src/pages/AdminInternDetails.tsx` | `internService` | `GET /interns/:id` |
| `src/pages/AdminTasks.tsx` | `taskService` | `POST /tasks/:id/review`, `GET /tasks/:tid/attachments/:aid/download` |
| `src/pages/AdminAddTask.tsx` | `taskService` | `POST /tasks`, `POST /tasks/assign`, `POST /tasks/bulk-assign` |
| `src/pages/AdminTaskTemplates.tsx` | `taskService` | `GET /task-templates`, `POST /task-templates`, `PUT /task-templates/:id`, `DELETE /task-templates/:id` |
| `src/pages/AdminReports.tsx` | `internService` | `GET /reports/summary`, `GET /reports/intern-progress` |
| `src/components/Layout.tsx` | `authService` | `POST /auth/logout` |
| `src/components/TaskCard.tsx` | `taskService` | `POST /tasks/:id/submit`, `POST /tasks/:id/attachments` |
| `src/contexts/AuthContext.tsx` | `authService` | `POST /auth/login`, `POST /auth/register`, `GET /users/profile` |
| `src/contexts/InternContext.tsx` | `internService`, `taskService` | `GET /interns`, `GET /tasks`, `POST /tasks/:id/review` |

---

## Authentication Flow

1. User logs in → `POST /auth/login` → receives JWT token
2. Token stored in `localStorage` via `setAuthToken()`
3. All subsequent requests include `Authorization: Bearer <token>` header
4. On app load, `GET /users/profile` validates the token
5. On logout, `POST /auth/logout` + `removeAuthToken()` clears the session

---

## Switching from Mock to Real API

1. Set `USE_MOCK_DATA = false` in `src/services/api.ts`
2. Set `VITE_API_BASE_URL` in frontend `.env`
3. Start your Express backend on the configured port
4. Ensure MongoDB is running and seeded with an admin user:

```javascript
// Seed script (run once)
const User = require('./models/User');
const Profile = require('./models/Profile');

async function seedAdmin() {
  const admin = await User.create({
    email: 'admin@prima.com',
    password: 'admin123',
    role: 'admin',
    registrationStep: 'complete'
  });
  await Profile.create({ userId: admin._id, name: 'Admin', email: 'admin@prima.com' });
  console.log('Admin user created');
}
```

---

## Key Backend Logic

### Sequential Task Unlocking

When approving a task via `POST /tasks/:id/review`:

```javascript
// In taskController.reviewTask
if (status === 'approved') {
  const allTasks = await InternTask.find({ internId: task.internId }).sort('createdAt');
  const currentIndex = allTasks.findIndex(t => t._id.equals(task._id));
  if (currentIndex + 1 < allTasks.length) {
    await InternTask.findByIdAndUpdate(allTasks[currentIndex + 1]._id, { status: 'in_progress' });
  }
}
```

### Task Assignment (Admin creates tasks for interns)

When assigning from templates via `POST /tasks/assign`:

```javascript
// In taskController.assignTask
exports.assignTask = async (req, res) => {
  const { templateId, internIds } = req.body;
  const template = await TaskTemplate.findById(templateId);
  
  const tasks = await Promise.all(internIds.map((internId, index) =>
    InternTask.create({
      internId,
      taskTemplateId: template._id,
      title: template.title,
      description: template.description,
      status: index === 0 ? 'in_progress' : 'locked' // First task unlocked
    })
  ));
  
  res.status(201).json({ tasks });
};
```

---

## Support

- **API Endpoint Constants**: `src/utils/apiEndpoints.ts`
- **Service Layer**: `src/services/` (authService, internService, taskService)
- **Mock Data**: `src/services/mockData.ts` (used when `USE_MOCK_DATA = true`)
