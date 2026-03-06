# Prima Interns - Task Progress Management System

A structured internal platform for onboarding and sequential task management for interns.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ODM) via MongoDB Atlas |
| **Auth** | JWT (JSON Web Tokens) with bcrypt |
| **File Upload** | Multer (local storage or S3) |

---

## Project Structure

```
prima-interns/
├── server/                          # ← Backend (Node.js + Express)
│   ├── server.js                    # Entry point
│   ├── package.json                 # Backend dependencies
│   ├── .env.example                 # Backend env template
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification
│   │   ├── admin.js                 # Admin role check
│   │   ├── upload.js                # Multer config
│   │   └── errorHandler.js          # Global error handler
│   ├── models/
│   │   ├── User.js                  # User schema (email, password, role)
│   │   ├── Profile.js               # Intern profile (personal, college)
│   │   ├── TaskTemplate.js          # Reusable task templates
│   │   ├── InternTask.js            # Tasks assigned to interns
│   │   └── Attachment.js            # File attachments
│   ├── controllers/
│   │   ├── authController.js        # Login, register, logout
│   │   ├── userController.js        # Profile CRUD
│   │   ├── internController.js      # Intern management (admin)
│   │   ├── taskController.js        # Task CRUD, submit, review
│   │   ├── taskTemplateController.js# Template CRUD
│   │   ├── dashboardController.js   # Stats & analytics
│   │   ├── reportController.js      # Reports & exports
│   │   └── settingsController.js    # User settings
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── interns.js
│   │   ├── tasks.js
│   │   ├── taskTemplates.js
│   │   ├── dashboard.js
│   │   ├── reports.js
│   │   └── settings.js
│   ├── seed/
│   │   └── seedAdmin.js             # Seed admin & sample intern
│   └── uploads/                     # Uploaded files
│
├── src/                             # ← Frontend (React + Vite)
│   ├── components/
│   ├── contexts/
│   ├── pages/
│   ├── services/                    # API service layer
│   │   ├── api.ts                   # Base fetch wrapper + USE_MOCK_DATA toggle
│   │   ├── authService.ts
│   │   ├── internService.ts
│   │   ├── taskService.ts
│   │   └── mockData.ts
│   ├── utils/
│   │   └── apiEndpoints.ts          # All API endpoint constants
│   └── types/
│       └── index.ts
├── .env.example                     # Frontend env template
└── README.md
```

---

## Quick Start

### 1. Backend Setup

```bash
cd server
cp .env.example .env
# Edit .env → set your MONGODB_URI (MongoDB Atlas connection string)
npm install
npm run seed     # Creates admin + sample intern
npm run dev      # Starts on http://localhost:3000
```

### 2. Frontend Setup

```bash
# From project root
cp .env.example .env
# Edit .env → set VITE_API_BASE_URL=http://localhost:3000/api
npm install
npm run dev      # Starts on http://localhost:8080
```

### 3. Connect to Real API

In `src/services/api.ts`, change:
```typescript
export const USE_MOCK_DATA = false;
```

---

## Environment Variables

### Backend (`server/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/prima_interns` |
| `JWT_SECRET` | Secret key for JWT signing | `your_secret_key_here` |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |
| `UPLOAD_DIR` | File upload directory | `./uploads` |
| `MAX_FILE_SIZE` | Max upload size in bytes | `10485760` (10MB) |
| `CORS_ORIGIN` | Frontend URL for CORS | `http://localhost:8080` |

### Frontend (`.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:3000/api` |

---

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@prima.com | admin123 |
| Intern | intern@prima.com | intern123 |

Run `cd server && npm run seed` to create these users in your database.

---

## API Endpoints Reference

Base URL: `http://localhost:3000/api/v1`

### Authentication (`/auth`)

| Method | Endpoint | Auth | Controller | Frontend File |
|--------|----------|------|------------|---------------|
| POST | `/auth/login` | ❌ | `authController.login` | `Login.tsx`, `AuthContext.tsx` |
| POST | `/auth/register` | ❌ | `authController.register` | `Register.tsx`, `AuthContext.tsx` |
| POST | `/auth/logout` | ✅ | `authController.logout` | `Layout.tsx`, `AuthContext.tsx` |
| POST | `/auth/refresh-token` | ✅ | `authController.refreshToken` | Future |
| POST | `/auth/forgot-password` | ❌ | `authController.forgotPassword` | Future |
| POST | `/auth/reset-password` | ❌ | `authController.resetPassword` | Future |

### Users (`/users`)

| Method | Endpoint | Auth | Controller | Frontend File |
|--------|----------|------|------------|---------------|
| GET | `/users/profile` | ✅ | `userController.getProfile` | `AuthContext.tsx` |
| PUT | `/users/profile` | ✅ | `userController.updateProfile` | `Register.tsx`, `Settings.tsx` |
| PATCH | `/users/registration-step` | ✅ | `userController.updateRegistrationStep` | `Register.tsx` |
| POST | `/users/avatar` | ✅ | `userController.uploadAvatar` | Future |

### Interns — Admin Only (`/interns`)

| Method | Endpoint | Auth | Admin | Controller | Frontend File |
|--------|----------|------|-------|------------|---------------|
| GET | `/interns` | ✅ | ✅ | `internController.getInterns` | `AdminInterns.tsx` |
| GET | `/interns/search?q=` | ✅ | ✅ | `internController.searchInterns` | `AdminInterns.tsx` |
| GET | `/interns/:id` | ✅ | ✅ | `internController.getInternById` | `AdminInternDetails.tsx` |
| PUT | `/interns/:id` | ✅ | ✅ | `internController.updateIntern` | Future |
| DELETE | `/interns/:id` | ✅ | ✅ | `internController.deleteIntern` | Future |
| GET | `/interns/export/csv` | ✅ | ✅ | `internController.exportCSV` | `AdminInterns.tsx` |
| GET | `/interns/export/excel` | ✅ | ✅ | `internController.exportExcel` | `AdminInterns.tsx` |

### Tasks (`/tasks`)

| Method | Endpoint | Auth | Admin | Controller | Frontend File |
|--------|----------|------|-------|------------|---------------|
| GET | `/tasks` | ✅ | ❌ | `taskController.getTasks` | `Dashboard.tsx` |
| GET | `/tasks/:id` | ✅ | ❌ | `taskController.getTaskById` | `Dashboard.tsx` |
| POST | `/tasks` | ✅ | ✅ | `taskController.createTask` | `AdminAddTask.tsx` |
| PUT | `/tasks/:id` | ✅ | ✅ | `taskController.updateTask` | `AdminTasks.tsx` |
| DELETE | `/tasks/:id` | ✅ | ✅ | `taskController.deleteTask` | `AdminTasks.tsx` |
| POST | `/tasks/:id/submit` | ✅ | ❌ | `taskController.submitTask` | `TaskCard.tsx` |
| POST | `/tasks/:id/review` | ✅ | ✅ | `taskController.reviewTask` | `AdminTasks.tsx` |
| POST | `/tasks/:id/attachments` | ✅ | ❌ | `taskController.uploadAttachment` | `TaskCard.tsx` |
| DELETE | `/tasks/:tid/attachments/:aid` | ✅ | ❌ | `taskController.deleteAttachment` | `TaskCard.tsx` |
| GET | `/tasks/:tid/attachments/:aid/download` | ✅ | Both | `taskController.downloadAttachment` | `AdminTasks.tsx` |
| POST | `/tasks/assign` | ✅ | ✅ | `taskController.assignTask` | `AdminAddTask.tsx` |
| POST | `/tasks/bulk-assign` | ✅ | ✅ | `taskController.bulkAssign` | `AdminAddTask.tsx` |

### Task Templates — Admin Only (`/task-templates`)

| Method | Endpoint | Auth | Admin | Controller | Frontend File |
|--------|----------|------|-------|------------|---------------|
| GET | `/task-templates` | ✅ | ✅ | `taskTemplateController.getTemplates` | `AdminTaskTemplates.tsx` |
| GET | `/task-templates/:id` | ✅ | ✅ | `taskTemplateController.getTemplateById` | `AdminTaskTemplates.tsx` |
| POST | `/task-templates` | ✅ | ✅ | `taskTemplateController.createTemplate` | `AdminTaskTemplates.tsx` |
| PUT | `/task-templates/:id` | ✅ | ✅ | `taskTemplateController.updateTemplate` | `AdminTaskTemplates.tsx` |
| DELETE | `/task-templates/:id` | ✅ | ✅ | `taskTemplateController.deleteTemplate` | `AdminTaskTemplates.tsx` |
| POST | `/task-templates/:id/duplicate` | ✅ | ✅ | `taskTemplateController.duplicateTemplate` | `AdminTaskTemplates.tsx` |

### Dashboard (`/dashboard`)

| Method | Endpoint | Auth | Admin | Controller | Frontend File |
|--------|----------|------|-------|------------|---------------|
| GET | `/dashboard/intern-stats` | ✅ | ❌ | `dashboardController.internStats` | `Dashboard.tsx` |
| GET | `/dashboard/admin-stats` | ✅ | ✅ | `dashboardController.adminStats` | `Dashboard.tsx` |
| GET | `/dashboard/progress` | ✅ | ✅ | `dashboardController.progressOverview` | `AdminReports.tsx` |

### Reports — Admin Only (`/reports`)

| Method | Endpoint | Auth | Admin | Controller | Frontend File |
|--------|----------|------|-------|------------|---------------|
| GET | `/reports/summary` | ✅ | ✅ | `reportController.summary` | `AdminReports.tsx` |
| GET | `/reports/intern-progress` | ✅ | ✅ | `reportController.internProgress` | `AdminReports.tsx` |
| GET | `/reports/task-completion` | ✅ | ✅ | `reportController.taskCompletion` | `AdminReports.tsx` |
| GET | `/reports/domain-distribution` | ✅ | ✅ | `reportController.domainDistribution` | `AdminReports.tsx` |
| GET | `/reports/export/pdf` | ✅ | ✅ | `reportController.exportPDF` | `AdminReports.tsx` |

### Settings (`/settings`)

| Method | Endpoint | Auth | Controller | Frontend File |
|--------|----------|------|------------|---------------|
| GET | `/settings` | ✅ | `settingsController.getSettings` | `Settings.tsx` |
| PUT | `/settings` | ✅ | `settingsController.updateSettings` | `Settings.tsx` |
| PUT | `/settings/password` | ✅ | `settingsController.changePassword` | `Settings.tsx` |
| PUT | `/settings/notifications` | ✅ | `settingsController.updateNotifications` | `Settings.tsx` |

---

## Key Backend Logic

### Sequential Task Unlocking

When a task is **approved** via `POST /tasks/:id/review`, the backend automatically sets the next task's status from `locked` → `in_progress`. See `taskController.reviewTask`.

### Task Assignment

- **Single assign**: `POST /tasks/assign` — assigns one template to selected interns
- **Bulk assign**: `POST /tasks/bulk-assign` — assigns multiple templates to multiple interns
- First task for each intern is auto-set to `in_progress`

### Authentication Flow

1. `POST /auth/login` → returns JWT token
2. Frontend stores token via `setAuthToken()` in localStorage
3. All requests include `Authorization: Bearer <token>` header
4. `GET /users/profile` validates token on app load
5. `POST /auth/logout` + `removeAuthToken()` clears session

---

## MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free cluster
3. Create a database user with read/write access
4. Whitelist your IP (or `0.0.0.0/0` for development)
5. Get connection string → paste in `server/.env` as `MONGODB_URI`
6. Run `cd server && npm run seed` to populate initial data

---

## Support

- **API Constants**: `src/utils/apiEndpoints.ts`
- **Frontend Services**: `src/services/` (authService, internService, taskService)
- **Backend Controllers**: `server/controllers/`
- **Mock Data**: `src/services/mockData.ts` (used when `USE_MOCK_DATA = true`)
