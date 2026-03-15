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
| **Email** | Nodemailer (SMTP — Gmail, Outlook, etc.) |

---

## Backend Setup & Configuration

### Prerequisites

- **Node.js** v18+ and **npm**
- **MongoDB Atlas** account (free tier works)
- **Cloudinary** account (free tier: 25GB storage)
- **SMTP email** credentials (Gmail App Password recommended)

---

### Step 1: MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://cloud.mongodb.com) and create a free account
2. Create a **free cluster** (M0 Sandbox)
3. Go to **Database Access** → Add a database user with read/write access
4. Go to **Network Access** → Add IP: `0.0.0.0/0` (allows all IPs for development)
5. Go to **Database** → Click **Connect** → Choose **Connect your application**
6. Copy the connection string (replace `<password>` with your DB user's password)

**Example:**
```
mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/prima_interns
```

---

### Step 2: Cloudinary Setup

All uploaded files (PDFs, images, documents) are stored on **Cloudinary**.

1. Go to [Cloudinary](https://cloudinary.com) and create a **free account**
2. After login, go to **Dashboard** → you'll see:
   - **Cloud Name** (e.g. `dxxxxxxx`)
   - **API Key** (e.g. `123456789012345`)
   - **API Secret** (e.g. `abcDefGhiJklMnoPqrStuVwxYz`)

**How it works:**
- Upload: Browser → Multer (memory buffer) → Cloudinary API → returns `secure_url`
- Files stored under `prima-interns/` folder on Cloudinary
- Deletion: When attachments/tasks are deleted, files are removed from Cloudinary

**Supported file types:** All types — PDF, DOCX, PNG, JPG, ZIP, etc. (up to 10MB default)

---

### Step 3: SMTP Email Setup (Required for Password Reset)

The app sends **OTP emails** for password reset. You need SMTP credentials.

#### Option A: Gmail (Recommended)

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** (required for App Passwords)
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Select **Mail** → **Other** → Name it `Prima Interns` → Click **Generate**
5. Copy the 16-character app password (e.g. `abcd efgh ijkl mnop`)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=abcdefghijklmnop    # App password (no spaces)
SMTP_FROM_NAME=Prima Interns
SMTP_FROM_EMAIL=your_email@gmail.com
```

#### Option B: Outlook / Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@outlook.com
SMTP_PASS=your_password
SMTP_FROM_NAME=Prima Interns
SMTP_FROM_EMAIL=your_email@outlook.com
```

#### Option C: Custom SMTP (Mailgun, SendGrid, etc.)

Use the SMTP credentials provided by your email service.

---

### Step 4: Install & Run Backend

```bash
cd server
npm install
```

Create `server/.env` with **all required variables**:

```env
# Server
PORT=3000
NODE_ENV=development

# MongoDB Atlas
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/prima_interns

# JWT Authentication
JWT_SECRET=your_strong_random_secret_key_here
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# File Uploads
MAX_FILE_SIZE=10485760

# CORS - Frontend URL
CORS_ORIGIN=http://localhost:8080

# SMTP Email (for Password Reset OTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM_NAME=Prima Interns
SMTP_FROM_EMAIL=your_email@gmail.com
```

Then seed and start:

```bash
npm run seed     # Creates admin + sample intern
npm run dev      # Starts on http://localhost:3000
```

---

### Step 5: Frontend Setup

```bash
# From project root
cp .env.example .env
# Edit .env → set VITE_API_BASE_URL=http://localhost:3000/api
npm install
npm run dev      # Starts on http://localhost:8080
```

In `src/services/api.ts`, ensure:
```typescript
export const USE_MOCK_DATA = false;
```

---

## Environment Variables Reference

### Backend (`server/.env`)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PORT` | ✅ | Server port | `3000` |
| `NODE_ENV` | ✅ | Environment | `development` |
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string | `mongodb+srv://...` |
| `JWT_SECRET` | ✅ | Secret key for JWT signing | `my_super_secret_key` |
| `JWT_EXPIRES_IN` | ❌ | Token expiration (default: 7d) | `7d` |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Cloudinary cloud name | `dxxxxxxx` |
| `CLOUDINARY_API_KEY` | ✅ | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | ✅ | Cloudinary API secret | `abcDefGhi...` |
| `MAX_FILE_SIZE` | ❌ | Max upload size in bytes (default: 10MB) | `10485760` |
| `CORS_ORIGIN` | ✅ | Frontend URL for CORS | `http://localhost:8080` |
| `SMTP_HOST` | ✅ | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | ✅ | SMTP server port | `587` |
| `SMTP_SECURE` | ❌ | Use TLS (default: false) | `false` |
| `SMTP_USER` | ✅ | SMTP login email | `you@gmail.com` |
| `SMTP_PASS` | ✅ | SMTP password / app password | `abcdefghijklmnop` |
| `SMTP_FROM_NAME` | ❌ | Sender display name | `Prima Interns` |
| `SMTP_FROM_EMAIL` | ❌ | Sender email address | `you@gmail.com` |

### Frontend (`.env`)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_BASE_URL` | ✅ | Backend API base URL | `http://localhost:3000/api` |

---

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@prima.com | admin123 |
| Intern | intern@prima.com | intern123 |

Run `cd server && npm run seed` to create these users.

---

## Features

### Password Reset Flow
1. User clicks **Forgot Password** on login page
2. Enters email → backend sends **6-digit OTP** via email
3. User enters OTP → verified by backend
4. User sets new password → saved with bcrypt hash

### Sequential Task Unlocking
When a task is **approved** via `POST /tasks/:id/review`, the next task auto-unlocks from `locked` → `in_progress`.

### Task Lock Types

| Lock Type | Behavior |
|-----------|----------|
| `open` | Task is immediately available |
| `sequential` | Unlocks after the previous task is approved |
| `after_task` | Unlocks after a specific task is approved |
| `until_date` | Locked until a specific date/time |

### File Storage (Cloudinary)
```
prima-interns/
├── templates/       # Task template attachments
└── tasks/
    └── {taskId}/    # Per-task intern submission attachments
```

### Authentication Flow
1. `POST /auth/login` → returns JWT token
2. Frontend stores token in localStorage
3. All requests include `Authorization: Bearer <token>` header
4. `GET /users/profile` validates token on app load

---

## API Endpoints Reference

Base URL: `http://localhost:3000/api/v1`

### Authentication (`/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | ❌ | Login with email/password |
| POST | `/auth/register` | ❌ | Register new intern |
| POST | `/auth/logout` | ✅ | Logout (invalidate session) |
| POST | `/auth/refresh-token` | ✅ | Refresh JWT token |
| POST | `/auth/forgot-password` | ❌ | Send OTP to email |
| POST | `/auth/verify-otp` | ❌ | Verify OTP code |
| POST | `/auth/reset-password` | ❌ | Reset password with verified OTP |

### Users (`/users`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/profile` | ✅ | Get current user profile |
| PUT | `/users/profile` | ✅ | Update profile |
| PATCH | `/users/registration-step` | ✅ | Update registration step |

### Interns — Admin Only (`/interns`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/interns` | ✅ Admin | List all interns |
| GET | `/interns/search?q=` | ✅ Admin | Search interns |
| GET | `/interns/:id` | ✅ Admin | Get intern details |
| DELETE | `/interns/:id` | ✅ Admin | Delete intern |
| GET | `/interns/export/csv` | ✅ Admin | Export CSV |

### Tasks (`/tasks`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/tasks` | ✅ | List tasks |
| POST | `/tasks` | ✅ Admin | Create task |
| POST | `/tasks/:id/submit` | ✅ | Submit task |
| POST | `/tasks/:id/review` | ✅ Admin | Review/approve task |
| POST | `/tasks/:id/attachments` | ✅ | Upload attachment |
| POST | `/tasks/assign` | ✅ Admin | Assign template to interns |
| POST | `/tasks/bulk-assign` | ✅ Admin | Bulk assign templates |

### Task Templates (`/task-templates`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/task-templates` | ✅ Admin | List templates |
| POST | `/task-templates` | ✅ Admin | Create template |
| PUT | `/task-templates/:id` | ✅ Admin | Update template |
| DELETE | `/task-templates/:id` | ✅ Admin | Delete template |

### Dashboard & Reports

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/dashboard/intern-stats` | ✅ | Intern dashboard stats |
| GET | `/dashboard/admin-stats` | ✅ Admin | Admin dashboard stats |
| GET | `/reports/summary` | ✅ Admin | Reports summary |

### Settings (`/settings`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/settings` | ✅ | Get settings |
| PUT | `/settings` | ✅ | Update settings |
| PUT | `/settings/password` | ✅ | Change password |

---

## Support

- **API Constants**: `src/utils/apiEndpoints.ts`
- **Frontend Services**: `src/services/` (authService, internService, taskService)
- **Backend Controllers**: `server/controllers/`
- **Mock Data**: `src/services/mockData.ts` (used when `USE_MOCK_DATA = true`)
