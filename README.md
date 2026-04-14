# Prima Interns — Task Progress Management System

> A structured internal platform for onboarding interns through sequential, lockable task workflows with file submissions, admin review, and progress tracking.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│  React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui        │
│                                                                 │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────────┐     │
│  │  Pages   │→ │  Contexts    │→ │  Service Layer (api.ts) │     │
│  │ (Routes) │  │ (Auth/Intern)│  │  ↕ fetch() + JWT token  │     │
│  └──────────┘  └──────────────┘  └────────────┬───────────┘     │
└───────────────────────────────────┬────────────┘                │
                                    │ HTTP (JSON + multipart)
┌───────────────────────────────────▼─────────────────────────────┐
│                     SERVER (Node.js + Express)                   │
│                                                                 │
│  ┌──────────┐  ┌────────────┐  ┌───────────┐  ┌─────────────┐  │
│  │  Routes  │→ │ Middleware  │→ │Controllers│→ │  Models      │  │
│  │          │  │ (auth/admin)│  │           │  │ (Mongoose)   │  │
│  └──────────┘  └────────────┘  └─────┬─────┘  └──────┬──────┘  │
│                                      │               │          │
│                              ┌───────▼───────┐ ┌─────▼──────┐  │
│                              │  Cloudinary   │ │  MongoDB    │  │
│                              │ (File Storage)│ │  Atlas      │  │
│                              └───────────────┘ └────────────┘  │
│                              ┌───────────────┐                  │
│                              │  Nodemailer   │                  │
│                              │ (SMTP Email)  │                  │
│                              └───────────────┘                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack — Detailed Breakdown

### Frontend

| Technology | Version | Purpose | How It's Used |
|------------|---------|---------|---------------|
| **React 18** | ^18.3 | UI framework | Component-based SPA with hooks, context API for global state |
| **TypeScript 5** | ^5.8 | Type safety | All components, services, and types are strictly typed (`src/types/index.ts`) |
| **Vite 5** | ^5.4 | Build tool | Dev server on port 8080, HMR, env variable injection (`VITE_*` prefix) |
| **Tailwind CSS 3** | ^3.4 | Utility-first CSS | Semantic design tokens in `index.css` (HSL variables), responsive design |
| **shadcn/ui** | Latest | Component library | Pre-built accessible components (Dialog, Table, Tabs, Toast, etc.) in `src/components/ui/` |
| **React Router 6** | ^6.30 | Client-side routing | Declarative routes with role-based `<ProtectedRoute>` and `<AuthRoute>` wrappers |
| **TanStack React Query** | ^5.83 | Server state management | `QueryClientProvider` wraps the app; used for data fetching and caching |
| **React Hook Form + Zod** | ^7.61 / ^3.25 | Form handling | Validated forms for registration, task submission, settings |
| **Lucide React** | ^0.462 | Icons | Consistent icon set across all UI |
| **Recharts** | ^2.15 | Charts | Admin reports and dashboard analytics |
| **Sonner** | ^1.7 | Toast notifications | Success/error feedback for all user actions |

### Backend

| Technology | Version | Purpose | How It's Used |
|------------|---------|---------|---------------|
| **Node.js** | 18+ | Runtime | JavaScript server runtime |
| **Express.js** | ^4.21 | HTTP framework | REST API with versioned routes (`/api/v1/*`), middleware chain |
| **MongoDB** | Atlas | Database | NoSQL document store via Mongoose ODM |
| **Mongoose** | ^8.7 | ODM | Schema definitions, validation, pre-save hooks (password hashing) |
| **JWT (jsonwebtoken)** | ^9.0 | Authentication | Stateless auth; token issued on login, verified via middleware |
| **bcryptjs** | ^2.4 | Password hashing | 12-round salt; pre-save hook on User model |
| **Cloudinary** | ^2.5 | File storage | All uploads (PDFs, images, ZIPs) stored in cloud; Multer memory buffer → Cloudinary stream |
| **Multer** | ^1.4 | File upload parsing | Memory storage strategy; files never hit disk, streamed directly to Cloudinary |
| **Nodemailer** | ^6.9 | Email | SMTP-based OTP emails for password reset flow |
| **Helmet** | ^7.1 | Security headers | HTTP security headers (XSS, CSP, etc.) |
| **CORS** | ^2.8 | Cross-origin | Configured for frontend origin (`CORS_ORIGIN` env var) |
| **Morgan** | ^1.10 | HTTP logging | Request logging in development mode |
| **express-validator** | ^7.2 | Input validation | Request body/param validation in controllers |

---

## Project Structure — File-by-File

### Frontend (`src/`)

```
src/
├── App.tsx                    # Root component: providers, routing, role-based guards
├── main.tsx                   # Vite entry point, renders <App />
├── index.css                  # Tailwind directives + CSS custom properties (design tokens)
│
├── types/
│   └── index.ts               # ALL TypeScript interfaces: User, Task, Intern, TaskAttachment, etc.
│
├── contexts/
│   ├── AuthContext.tsx         # Global auth state: login/logout/register, session restore from JWT
│   └── InternContext.tsx       # Intern-specific state: tasks list, submit task, upload attachments
│
├── services/
│   ├── api.ts                 # Core HTTP client: GET/POST/PUT/DELETE/uploadFile/downloadFile
│   │                          #   - Reads JWT from localStorage, attaches Bearer header
│   │                          #   - USE_MOCK_DATA toggle for offline development
│   ├── authService.ts         # Auth API calls: login, register, forgotPassword, verifyOTP, resetPassword
│   ├── taskService.ts         # Task API calls: getTasks, submitTask, uploadAttachment, reviewTask
│   ├── internService.ts       # Admin intern management: list, search, delete, export CSV
│   ├── templateService.ts     # Task template CRUD for admin
│   ├── dashboardService.ts    # Dashboard statistics API calls
│   ├── settingsService.ts     # User settings and password change
│   └── mockData.ts            # Fake data for offline frontend development
│
├── utils/
│   └── apiEndpoints.ts        # Centralized endpoint definitions: API_BASE, API_ENDPOINTS constant
│                              #   - All routes defined once, referenced everywhere
│                              #   - Dynamic routes via functions: (id) => `/tasks/${id}`
│
├── pages/
│   ├── Login.tsx              # Email/password login form
│   ├── Register.tsx           # 3-step registration wizard (Account → Personal → College)
│   ├── ForgotPassword.tsx     # OTP-based password reset (email → OTP → new password)
│   ├── Dashboard.tsx          # Intern dashboard: task list, progress bar, task cards
│   ├── AdminInterns.tsx       # Admin: intern list with search, delete, CSV export
│   ├── AdminInternDetails.tsx # Admin: single intern's profile + tasks + lock controls
│   ├── AdminTasks.tsx         # Admin: task review queue with both attachment sections
│   ├── AdminAddTask.tsx       # Admin: create/assign tasks to interns
│   ├── AdminTaskTemplates.tsx # Admin: reusable task template CRUD
│   ├── AdminReports.tsx       # Admin: analytics charts and reports
│   ├── Settings.tsx           # Profile + password settings
│   └── NotFound.tsx           # 404 page
│
├── components/
│   ├── Layout.tsx             # Sidebar + header shell for authenticated pages
│   ├── TaskCard.tsx           # Task display card with status, attachments, submit action
│   ├── TaskDetailModal.tsx    # Intern-side task detail view with file preview/download
│   ├── AdminTaskDetailModal.tsx # Admin-side task detail with review actions
│   ├── DocumentPreview.tsx    # PDF/image inline preview component
│   ├── ProgressBar.tsx        # Visual task completion progress
│   ├── NavLink.tsx            # Sidebar navigation link
│   └── ui/                    # ~40 shadcn/ui components (Button, Dialog, Table, etc.)
│
├── hooks/
│   ├── use-mobile.tsx         # Responsive breakpoint detection hook
│   └── use-toast.ts           # Toast notification hook
│
└── lib/
    └── utils.ts               # Tailwind `cn()` merge utility
```

### Backend (`server/`)

```
server/
├── server.js                  # Express app entry: middleware chain → routes → error handler
├── .env                       # Environment variables (never commit to production)
│
├── config/
│   ├── db.js                  # MongoDB connection via Mongoose (Atlas URI)
│   └── cloudinary.js          # Cloudinary SDK configuration from env vars
│
├── models/
│   ├── User.js                # User schema: email, password (hashed), role (intern/admin), registrationStep
│   ├── Profile.js             # Extended intern profile: personal, education, skills
│   ├── TaskTemplate.js        # Reusable task templates: title, description, category, attachments
│   ├── InternTask.js          # Assigned task instance: status, lockType, orderIndex, submissions
│   └── Attachment.js          # File metadata: URL, publicId, mimeType, source (template/submission)
│
├── middleware/
│   ├── auth.js                # JWT verification: extracts token → verifies → attaches req.user
│   ├── admin.js               # Role check: req.user.role === 'admin' or 403
│   ├── upload.js              # Multer memory storage configuration (no disk writes)
│   └── errorHandler.js        # Global error handler: catches all errors, returns JSON
│
├── controllers/
│   ├── authController.js      # Login (JWT issue), register, forgot-password, OTP verify, reset
│   ├── userController.js      # Get/update profile, update registration step
│   ├── internController.js    # Admin: list/search/delete interns, CSV export
│   ├── taskController.js      # Core: create, assign, submit, review tasks; auto-unlock logic
│   ├── taskTemplateController.js # CRUD for task templates with Cloudinary attachments
│   ├── dashboardController.js # Aggregate stats for admin/intern dashboards
│   ├── reportController.js    # Report generation and data aggregation
│   └── settingsController.js  # Settings and password change
│
├── routes/
│   ├── auth.js                # POST /login, /register, /forgot-password, /verify-otp, /reset-password
│   ├── users.js               # GET/PUT /profile, PATCH /registration-step
│   ├── interns.js             # GET /interns, GET /interns/:id, DELETE, GET /export/csv
│   ├── tasks.js               # GET/POST /tasks, POST /:id/submit, /:id/review, /:id/attachments
│   ├── taskTemplates.js       # CRUD /task-templates
│   ├── dashboard.js           # GET /intern-stats, /admin-stats
│   ├── reports.js             # GET /summary
│   └── settings.js            # GET/PUT /settings, PUT /settings/password
│
├── utils/
│   └── cloudinaryUpload.js    # uploadToCloudinary(buffer, options), deleteFromCloudinary(publicId)
│
└── seed/
    └── seedAdmin.js           # Auto-creates admin + sample intern on first run
```

---

## Key Design Patterns

### 1. Centralized API Service Layer

All HTTP communication flows through `src/services/api.ts`:

```typescript
// api.ts provides a typed HTTP client
const apiService = {
  get<T>(endpoint, includeAuth?): Promise<T>,
  post<T>(endpoint, data?, includeAuth?): Promise<T>,
  put<T>(endpoint, data?, includeAuth?): Promise<T>,
  delete<T>(endpoint, includeAuth?): Promise<T>,
  uploadFile<T>(endpoint, files, fieldName?): Promise<T>,
  uploadFormData<T>(endpoint, formData, method?): Promise<T>,
  downloadFile(endpoint, filename): Promise<void>,
}
```

**Pattern**: Service files (e.g., `taskService.ts`) call `apiService.post(API_ENDPOINTS.TASKS.SUBMIT(id), data)`. Endpoints are defined once in `apiEndpoints.ts`.

### 2. JWT Authentication Flow

```
Login → Server returns JWT → Stored in localStorage → 
Every request attaches "Authorization: Bearer <token>" → 
Server middleware verifies → Attaches req.user → Controllers use req.user
```

Session restore: On app load, `AuthContext` reads token from localStorage, calls `GET /users/profile` to validate and restore user state.

### 3. Role-Based Access Control

```typescript
// Frontend: Route-level guards
<ProtectedRoute requiredRole="admin"><AdminPage /></ProtectedRoute>

// Backend: Middleware chain
router.get('/interns', auth, admin, controller.list);
//                     ↑ verify JWT  ↑ check role === 'admin'
```

### 4. Sequential Task Unlocking Engine

Tasks have a `lockType` that controls when they become available:

| Lock Type | Unlock Condition |
|-----------|-----------------|
| `open` | Immediately available |
| `sequential` | Previous task (by `orderIndex`) is `approved` |
| `after_task` | Specific task (by `unlockAfterTaskId`) is `approved` |
| `until_date` | Current date >= `unlockDate` |

**Auto-unlock** happens in two places:
1. **On task approval** (`POST /tasks/:id/review`): After approving, scans remaining locked tasks
2. **On task fetch** (`GET /tasks`): Checks date/dependency conditions on every load

### 5. File Upload Pipeline

```
Browser (File input) → FormData → fetch(multipart) →
Express (Multer memory storage) → Buffer in memory →
Cloudinary upload stream → Returns {secure_url, public_id} →
Saved to Attachment model in MongoDB
```

Files are tagged with `source: 'template' | 'submission'` to distinguish admin-provided reference files from intern-submitted work.

### 6. Mock Data Toggle

```typescript
// src/services/api.ts
export const USE_MOCK_DATA = false; // Set true for offline development
```

When `true`, service files return data from `mockData.ts` instead of making HTTP calls. This allows frontend development without a running backend.

### 7. Context-Based State Management

```
QueryClientProvider (TanStack Query — server state cache)
  └── AuthProvider (user session, login/logout)
       └── InternProvider (tasks, submissions — intern-specific)
            └── <BrowserRouter> → Pages
```

No Redux/Zustand. React Context handles global state; React Query handles server state caching.

---

## Data Models (MongoDB Schemas)

### User
```javascript
{
  email: String (unique, lowercase),
  password: String (bcrypt hashed, select: false),
  role: 'intern' | 'admin',
  registrationStep: 1 | 2 | 3 | 'complete',
  timestamps: true
}
```

### Profile (extends User)
```javascript
{
  userId: ObjectId → User,
  name, mobile, dob, address,
  skills: [String],
  domain: String,
  collegeName, degree, branch, yearOfPassing
}
```

### TaskTemplate (admin-created reusable blueprints)
```javascript
{
  title, description, category,
  lockType: 'open' | 'sequential' | 'after_task' | 'until_date',
  attachments: [{ url, publicId, originalName, mimeType }]
}
```

### InternTask (assigned task instance)
```javascript
{
  internId: ObjectId → User,
  templateId: ObjectId → TaskTemplate,
  title, description, category,
  status: 'locked' | 'in_progress' | 'pending' | 'approved' | 'rejected',
  lockType, unlockAfterTaskId, unlockDate,
  orderIndex: Number,
  submissionNote: String,
  feedback: String,
  submittedAt, reviewedAt
}
```

### Attachment
```javascript
{
  internTaskId: ObjectId → InternTask,
  url: String (Cloudinary URL),
  publicId: String (for deletion),
  originalName, mimeType, size,
  source: 'template' | 'submission'
}
```

---

## API Endpoints

Base: `http://localhost:3000/api/v1`

### Auth (`/auth`)
| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| POST | `/auth/login` | ❌ | `{email, password}` → `{token, user}` |
| POST | `/auth/register` | ❌ | `{name, email, password, ...profile}` → `{token, user}` |
| POST | `/auth/forgot-password` | ❌ | `{email}` → sends OTP email |
| POST | `/auth/verify-otp` | ❌ | `{email, otp}` → `{verified: true}` |
| POST | `/auth/reset-password` | ❌ | `{email, otp, newPassword}` |

### Users (`/users`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/profile` | ✅ | Returns current user + profile |
| PUT | `/users/profile` | ✅ | Update profile fields |
| PATCH | `/users/registration-step` | ✅ | Advance registration wizard |

### Tasks (`/tasks`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/tasks` | ✅ | List intern's tasks (auto-unlocks checked) |
| POST | `/tasks` | ✅ Admin | Create task for intern |
| POST | `/tasks/:id/submit` | ✅ | Submit task with note |
| POST | `/tasks/:id/review` | ✅ Admin | Approve/reject + feedback; triggers unlock |
| POST | `/tasks/:id/attachments` | ✅ | Upload file (multipart) |
| POST | `/tasks/assign` | ✅ Admin | Assign template → intern(s) |
| POST | `/tasks/bulk-assign` | ✅ Admin | Bulk assign templates |

### Templates, Interns, Dashboard, Reports, Settings
See `src/utils/apiEndpoints.ts` for complete endpoint definitions.

---

## Environment Variables

### Backend (`server/.env`)

| Variable | Required | Example |
|----------|----------|---------|
| `PORT` | ✅ | `3000` |
| `NODE_ENV` | ✅ | `development` |
| `MONGODB_URI` | ✅ | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| `JWT_SECRET` | ✅ | Random 32+ char string |
| `JWT_EXPIRES_IN` | ❌ | `7d` (default) |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | ✅ | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ✅ | Cloudinary API secret |
| `MAX_FILE_SIZE` | ❌ | `10485760` (10MB default) |
| `CORS_ORIGIN` | ✅ | `http://localhost:8080` |
| `SMTP_HOST` | ✅ | `smtp.gmail.com` |
| `SMTP_PORT` | ✅ | `587` |
| `SMTP_USER` | ✅ | Email address |
| `SMTP_PASS` | ✅ | App password |

### Frontend (`.env`)

| Variable | Required | Example |
|----------|----------|---------|
| `VITE_API_BASE_URL` | ✅ | `http://localhost:3000/api` |

---

## How to Run

```bash
# Backend
cd server && npm install && npm run seed && npm run dev

# Frontend (separate terminal)
cp .env.example .env  # Set VITE_API_BASE_URL
npm install && npm run dev
```

Default credentials: `admin@prima.com / admin123` and `intern@prima.com / intern123`

---

## Replicating This Architecture for Another Platform

To build a similar platform (e.g., employee onboarding, course management, project tracker):

1. **Copy the service layer pattern**: `api.ts` (HTTP client) + `apiEndpoints.ts` (route definitions) + domain services
2. **Copy the auth pattern**: JWT middleware + AuthContext + ProtectedRoute wrapper
3. **Copy the file upload pipeline**: Multer memory → Cloudinary stream → Attachment model
4. **Replace domain models**: Swap `InternTask`/`TaskTemplate` with your entities
5. **Keep the unlock engine** if you need sequential/conditional workflows
6. **Keep the mock data toggle** for frontend-first development

The architecture is intentionally modular: each feature (auth, tasks, files, email) is isolated in its own controller/service/route file, making it straightforward to add, remove, or replace any module.
