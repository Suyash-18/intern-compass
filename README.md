# Prima Interns - Task Progress Management System

A structured internal platform for onboarding and sequential task management for interns.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ODM) via MongoDB Atlas |
| **Auth** | JWT (JSON Web Tokens) with bcrypt |
| **File Storage** | Cloudinary (images, PDFs, documents, archives) |
| **File Upload** | Multer (memory storage → Cloudinary) |

---

## Project Structure

```
prima-interns/
├── server/                          # ← Backend (Node.js + Express)
│   ├── server.js                    # Entry point
│   ├── package.json                 # Backend dependencies
│   ├── .env.example                 # Backend env template
│   ├── config/
│   │   ├── db.js                    # MongoDB connection
│   │   └── cloudinary.js            # Cloudinary SDK config
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification
│   │   ├── admin.js                 # Admin role check
│   │   ├── upload.js                # Multer config (memory storage)
│   │   └── errorHandler.js          # Global error handler
│   ├── utils/
│   │   └── cloudinaryUpload.js      # Cloudinary upload/delete helpers
│   ├── models/
│   │   ├── User.js                  # User schema (email, password, role)
│   │   ├── Profile.js               # Intern profile (personal, college)
│   │   ├── TaskTemplate.js          # Reusable task templates
│   │   ├── InternTask.js            # Tasks assigned to interns
│   │   └── Attachment.js            # File attachments (Cloudinary URLs)
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
│   └── seed/
│       └── seedAdmin.js             # Seed admin & sample intern
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
│   │   ├── templateService.ts
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

### 1. Cloudinary Setup (Required for File Storage)

All uploaded files (PDFs, images, documents, archives) are stored on **Cloudinary** instead of the local filesystem.

1. Go to [Cloudinary](https://cloudinary.com) and create a **free account**
2. After login, go to your **Dashboard** → you'll see your credentials:
   - **Cloud Name** (e.g. `dxxxxxxx`)
   - **API Key** (e.g. `123456789012345`)
   - **API Secret** (e.g. `abcDefGhiJklMnoPqrStuVwxYz`)
3. Copy these values into `server/.env` (see step 2 below)

> **Free tier** includes 25GB storage + 25GB bandwidth/month — more than enough for development and small production use.

### 2. Backend Setup

```bash
cd server
npm install                # Installs all dependencies including cloudinary & streamifier
cp .env.example .env       # If you haven't already
```

Edit `server/.env` and fill in your credentials:

```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/prima_interns

# JWT Authentication
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d

# Cloudinary (required — get from https://cloudinary.com/console)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# File Uploads
MAX_FILE_SIZE=10485760

# CORS
CORS_ORIGIN=http://localhost:8080
```

Then run:

```bash
npm run seed     # Creates admin + sample intern
npm run dev      # Starts on http://localhost:3000
```

### 3. Frontend Setup

```bash
# From project root
cp .env.example .env
# Edit .env → set VITE_API_BASE_URL=http://localhost:3000/api
npm install
npm run dev      # Starts on http://localhost:8080
```

### 4. Connect to Real API

In `src/services/api.ts`, ensure:
```typescript
export const USE_MOCK_DATA = false;
```

---

## Cloudinary Integration Details

### How It Works

1. **Upload flow**: Browser → Multer (memory buffer) → Cloudinary API → returns `secure_url`
2. **Storage**: Files are stored in Cloudinary under the `prima-interns/` folder
3. **Download**: Attachment URLs point directly to Cloudinary CDN (fast global delivery)
4. **Deletion**: When attachments/tasks are deleted, files are also removed from Cloudinary

### File Organization in Cloudinary

```
prima-interns/
├── templates/       # Task template attachments
└── tasks/
    └── {taskId}/    # Per-task intern submission attachments
```

### Supported File Types

All file types are accepted (no file-type restriction). Common types:
- **Documents**: PDF, DOCX, PPTX, XLSX, TXT
- **Images**: PNG, JPG, JPEG, GIF, WEBP, SVG
- **Archives**: ZIP, RAR, 7Z
- **Other**: Any file up to the configured `MAX_FILE_SIZE` (default 10MB)

### Key Files Changed

| File | Purpose |
|------|---------|
| `server/config/cloudinary.js` | Cloudinary SDK configuration |
| `server/utils/cloudinaryUpload.js` | `uploadToCloudinary()` and `deleteFromCloudinary()` helpers |
| `server/middleware/upload.js` | Multer with memory storage (no disk writes) |
| `server/models/Attachment.js` | Added `publicId` field for Cloudinary deletion |
| `server/models/TaskTemplate.js` | Added `publicId` to template attachment sub-schema |
| `server/controllers/taskController.js` | Uses Cloudinary for upload/delete/download |
| `server/controllers/taskTemplateController.js` | Uses Cloudinary for template file management |

---

## Environment Variables

### Backend (`server/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/prima_interns` |
| `JWT_SECRET` | Secret key for JWT signing | `your_secret_key_here` |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `dxxxxxxx` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `abcDefGhi...` |
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

### Task Lock Types

| Lock Type | Behavior |
|-----------|----------|
| `open` | Task is immediately available |
| `sequential` | Unlocks after the previous task is approved |
| `after_task` | Unlocks after a specific task is approved |
| `until_date` | Locked until a specific date/time |

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
