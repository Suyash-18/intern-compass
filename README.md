# Prima Interns - Task Progress Management System

A structured internal platform for onboarding and sequential task management for interns.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: React Context API
- **Routing**: React Router v6

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Demo Credentials

| Role   | Email              | Password   |
|--------|-------------------|------------|
| Admin  | admin@prima.com   | admin123   |
| Intern | intern@prima.com  | intern123  |

---

# API Integration Guide

This document describes all API endpoints required for the backend and their usage locations in the codebase.

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://your-api-server.com/api
```

### Toggle Mock Data

In `src/services/api.ts`, set `USE_MOCK_DATA` to `false` to use real API:

```typescript
export const USE_MOCK_DATA = false; // Set to false for real API
```

---

## API Endpoints Reference

### Base URL

All endpoints are prefixed with: `{VITE_API_BASE_URL}/v1`

---

## 1. Authentication Endpoints

**Service File**: `src/services/authService.ts`

### POST `/auth/login`

Login user with email and password.

**Used In**:
- `src/contexts/AuthContext.tsx` → `login()` function
- `src/pages/Login.tsx` → Login form submission

**Request**:
```json
{
  "email": "string",
  "password": "string"
}
```

**Response**:
```json
{
  "user": {
    "id": "string",
    "email": "string",
    "role": "intern" | "admin",
    "registrationStep": 1 | 2 | 3 | "complete",
    "profile": { ... } // Optional InternProfile
  },
  "token": "string" // JWT token
}
```

---

### POST `/auth/logout`

Logout current user and invalidate token.

**Used In**:
- `src/contexts/AuthContext.tsx` → `logout()` function
- `src/components/Layout.tsx` → Logout button

**Request**: No body (uses Authorization header)

**Response**: `204 No Content`

---

### POST `/auth/register`

Register new intern account (Step 1 of registration).

**Used In**:
- `src/contexts/AuthContext.tsx` → `register()` function
- `src/pages/Register.tsx` → Step 1 form submission

**Request**:
```json
{
  "name": "string",
  "email": "string",
  "mobile": "string",
  "password": "string"
}
```

**Response**:
```json
{
  "user": {
    "id": "string",
    "email": "string",
    "role": "intern",
    "registrationStep": 2,
    "profile": {
      "name": "string",
      "email": "string",
      "mobile": "string",
      // ... other fields empty
    }
  },
  "token": "string"
}
```

---

### POST `/auth/forgot-password`

Request password reset email.

**Used In**: Not yet implemented (future feature)

**Request**:
```json
{
  "email": "string"
}
```

**Response**:
```json
{
  "message": "Password reset email sent"
}
```

---

### POST `/auth/reset-password`

Reset password with token.

**Used In**: Not yet implemented (future feature)

**Request**:
```json
{
  "token": "string",
  "password": "string"
}
```

**Response**:
```json
{
  "message": "Password reset successful"
}
```

---

## 2. User/Profile Endpoints

**Service File**: `src/services/authService.ts`

### GET `/users/profile`

Get current user's profile.

**Used In**:
- `src/contexts/AuthContext.tsx` → Initial auth check on app load

**Request**: No body (uses Authorization header)

**Response**:
```json
{
  "user": {
    "id": "string",
    "email": "string",
    "role": "intern" | "admin",
    "registrationStep": 1 | 2 | 3 | "complete",
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

---

### PUT `/users/profile`

Update user profile (used during registration steps 2 & 3).

**Used In**:
- `src/contexts/AuthContext.tsx` → `updateProfile()` function
- `src/pages/Register.tsx` → Steps 2 and 3 form submission

**Request** (Step 2 - Personal Details):
```json
{
  "dob": "string",
  "address": "string",
  "skills": ["string"],
  "domain": "string"
}
```

**Request** (Step 3 - College Details):
```json
{
  "collegeName": "string",
  "degree": "string",
  "branch": "string",
  "yearOfPassing": "string"
}
```

**Response**:
```json
{
  "user": { ... } // Updated user object
}
```

---

### PATCH `/users/registration-step`

Update user's registration step.

**Used In**:
- `src/contexts/AuthContext.tsx` → `updateRegistrationStep()` function
- `src/pages/Register.tsx` → After each step completion

**Request**:
```json
{
  "step": 1 | 2 | 3 | "complete"
}
```

**Response**:
```json
{
  "user": { ... } // Updated user object
}
```

---

## 3. Intern Management Endpoints (Admin)

**Service File**: `src/services/internService.ts`

### GET `/interns`

Get list of all registered interns.

**Used In**:
- `src/contexts/InternContext.tsx` → Initial data load
- `src/pages/AdminInterns.tsx` → Interns table

**Query Parameters**:
- `page` (optional): Page number for pagination
- `limit` (optional): Items per page
- `sort` (optional): Sort field and direction (e.g., "name:asc")

**Response**:
```json
{
  "interns": [
    {
      "id": "string",
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
      },
      "tasks": [
        {
          "id": "string",
          "title": "string",
          "description": "string",
          "status": "locked" | "in_progress" | "pending" | "approved" | "rejected",
          "feedback": "string",
          "submittedAt": "string",
          "reviewedAt": "string",
          "attachments": [...]
        }
      ],
      "registrationCompleted": true,
      "registeredAt": "string"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

---

### GET `/interns/:id`

Get single intern by ID.

**Used In**:
- `src/contexts/InternContext.tsx` → `getInternById()` function
- `src/pages/AdminTasks.tsx` → When viewing intern's tasks

**Response**:
```json
{
  "intern": { ... } // Single intern object
}
```

---

### GET `/interns/search?q=query`

Search interns by name, email, or domain.

**Used In**:
- `src/pages/AdminInterns.tsx` → Search input

**Query Parameters**:
- `q`: Search query string

**Response**:
```json
{
  "interns": [...] // Filtered intern list
}
```

---

### PUT `/interns/:id`

Update intern details.

**Used In**: Not yet implemented in UI (future admin feature)

**Request**:
```json
{
  "profile": { ... },
  "tasks": [ ... ]
}
```

**Response**:
```json
{
  "intern": { ... } // Updated intern object
}
```

---

### DELETE `/interns/:id`

Delete intern account.

**Used In**: Not yet implemented in UI (future admin feature)

**Response**: `204 No Content`

---

### GET `/interns/export/csv`

Export all interns data as CSV file.

**Used In**:
- `src/pages/AdminInterns.tsx` → "Export CSV" button

**Response**: CSV file download

---

### GET `/interns/export/excel`

Export all interns data as Excel file.

**Used In**:
- `src/pages/AdminInterns.tsx` → "Export Excel" button

**Response**: Excel (.xlsx) file download

---

## 4. Task Management Endpoints

**Service File**: `src/services/taskService.ts`

### GET `/tasks`

Get tasks for current logged-in intern.

**Used In**:
- `src/contexts/InternContext.tsx` → Initial task load for interns
- `src/pages/Dashboard.tsx` → Task list display

**Response**:
```json
{
  "tasks": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "status": "locked" | "in_progress" | "pending" | "approved" | "rejected",
      "feedback": "string",
      "submittedAt": "string",
      "reviewedAt": "string",
      "attachments": [
        {
          "id": "string",
          "name": "string",
          "type": "pdf" | "image" | "zip" | "other",
          "size": 1024,
          "url": "string",
          "mimeType": "string"
        }
      ]
    }
  ]
}
```

---

### GET `/tasks/:id`

Get single task by ID.

**Used In**:
- `src/pages/Dashboard.tsx` → Task detail view

**Response**:
```json
{
  "task": { ... } // Single task object
}
```

---

### POST `/tasks/:id/submit`

Submit task for admin review.

**Used In**:
- `src/contexts/InternContext.tsx` → `submitTask()` function
- `src/components/TaskCard.tsx` → "Submit for Review" button

**Request**:
```json
{
  "attachments": [
    {
      "id": "string",
      "name": "string",
      "type": "pdf" | "image" | "zip" | "other",
      "size": 1024,
      "url": "string",
      "mimeType": "string"
    }
  ]
}
```

**Response**:
```json
{
  "task": {
    ...
    "status": "pending",
    "submittedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### POST `/tasks/:id/review`

Review and approve/reject a submitted task (Admin only).

**Used In**:
- `src/contexts/InternContext.tsx` → `reviewTask()` function
- `src/pages/AdminTasks.tsx` → Approve/Reject buttons

**Request**:
```json
{
  "status": "approved" | "rejected",
  "feedback": "string"
}
```

**Response**:
```json
{
  "task": {
    ...
    "status": "approved" | "rejected",
    "feedback": "Great work!",
    "reviewedAt": "2024-01-16T14:00:00Z"
  }
}
```

**Important**: When a task is approved, the backend should automatically unlock the next sequential task by setting its status from "locked" to "in_progress".

---

### POST `/tasks/:id/attachments`

Upload file attachment to a task.

**Used In**:
- `src/components/TaskCard.tsx` → File upload zone

**Request**: `multipart/form-data`
- `attachment`: File (PDF, image, or ZIP)

**Response**:
```json
{
  "attachment": {
    "id": "string",
    "name": "report.pdf",
    "type": "pdf",
    "size": 102400,
    "url": "https://storage.example.com/attachments/xyz.pdf",
    "mimeType": "application/pdf"
  }
}
```

---

### DELETE `/tasks/:taskId/attachments/:attachmentId`

Delete an attachment from a task.

**Used In**:
- `src/components/TaskCard.tsx` → Remove attachment button

**Response**: `204 No Content`

---

### GET `/tasks/:taskId/attachments/:attachmentId/download`

Download attachment file.

**Used In**:
- `src/pages/AdminTasks.tsx` → Download button in attachment viewer

**Response**: File download

---

## 5. Dashboard/Analytics Endpoints

**Endpoints File**: `src/utils/apiEndpoints.ts`

### GET `/dashboard/intern-stats`

Get statistics for intern dashboard.

**Used In**: Not yet implemented (future feature)

**Response**:
```json
{
  "tasksCompleted": 3,
  "tasksTotal": 5,
  "progressPercentage": 60,
  "currentTask": { ... }
}
```

---

### GET `/dashboard/admin-stats`

Get statistics for admin dashboard.

**Used In**: Not yet implemented (future feature)

**Response**:
```json
{
  "totalInterns": 25,
  "activeInterns": 20,
  "pendingReviews": 5,
  "completedToday": 3
}
```

---

## File Structure

```
src/
├── utils/
│   └── apiEndpoints.ts      # All API endpoint constants
├── services/
│   ├── api.ts               # Base API service (fetch wrapper)
│   ├── authService.ts       # Authentication API calls
│   ├── internService.ts     # Intern management API calls
│   ├── taskService.ts       # Task management API calls
│   ├── mockData.ts          # Mock data for development
│   └── index.ts             # Service exports
├── contexts/
│   ├── AuthContext.tsx      # Uses authService
│   └── InternContext.tsx    # Uses internService, taskService
└── pages/
    ├── Login.tsx            # Uses authService.login()
    ├── Register.tsx         # Uses authService.register(), updateProfile()
    ├── Dashboard.tsx        # Uses taskService.getTasks()
    ├── AdminInterns.tsx     # Uses internService.getInterns(), search(), export()
    └── AdminTasks.tsx       # Uses taskService.reviewTask()
```

---

## Authentication Flow

1. User logs in via `/auth/login`
2. JWT token is stored in localStorage
3. Token is sent in `Authorization: Bearer <token>` header for all authenticated requests
4. Token refresh can be implemented via `/auth/refresh-token` endpoint

---

## Quick Reference Table

| Endpoint | Method | Service | Used In |
|----------|--------|---------|---------|
| `/auth/login` | POST | authService | Login.tsx, AuthContext |
| `/auth/logout` | POST | authService | Layout.tsx, AuthContext |
| `/auth/register` | POST | authService | Register.tsx, AuthContext |
| `/users/profile` | GET | authService | AuthContext |
| `/users/profile` | PUT | authService | Register.tsx, AuthContext |
| `/users/registration-step` | PATCH | authService | Register.tsx, AuthContext |
| `/interns` | GET | internService | AdminInterns.tsx, InternContext |
| `/interns/:id` | GET | internService | AdminTasks.tsx, InternContext |
| `/interns/search` | GET | internService | AdminInterns.tsx |
| `/interns/export/csv` | GET | internService | AdminInterns.tsx |
| `/interns/export/excel` | GET | internService | AdminInterns.tsx |
| `/tasks` | GET | taskService | Dashboard.tsx, InternContext |
| `/tasks/:id` | GET | taskService | Dashboard.tsx |
| `/tasks/:id/submit` | POST | taskService | TaskCard.tsx, InternContext |
| `/tasks/:id/review` | POST | taskService | AdminTasks.tsx, InternContext |
| `/tasks/:id/attachments` | POST | taskService | TaskCard.tsx |

---

## Backend Requirements

### Required Features

1. **JWT Authentication** with token refresh
2. **Role-based access control** (intern vs admin)
3. **File storage** for task attachments (S3, GCS, or local)
4. **Sequential task unlocking logic** - when task N is approved, task N+1 status changes to "in_progress"

### Suggested Database Schema

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('intern', 'admin') NOT NULL,
  registration_step VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(255),
  mobile VARCHAR(20),
  dob DATE,
  address TEXT,
  skills TEXT[], -- or JSON
  domain VARCHAR(255),
  college_name VARCHAR(255),
  degree VARCHAR(100),
  branch VARCHAR(100),
  year_of_passing VARCHAR(4)
);

-- Tasks table (template)
CREATE TABLE task_templates (
  id UUID PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  order_index INTEGER
);

-- Intern tasks (instance per intern)
CREATE TABLE intern_tasks (
  id UUID PRIMARY KEY,
  intern_id UUID REFERENCES users(id),
  task_template_id UUID REFERENCES task_templates(id),
  status ENUM('locked', 'in_progress', 'pending', 'approved', 'rejected'),
  feedback TEXT,
  submitted_at TIMESTAMP,
  reviewed_at TIMESTAMP
);

-- Attachments table
CREATE TABLE attachments (
  id UUID PRIMARY KEY,
  intern_task_id UUID REFERENCES intern_tasks(id),
  name VARCHAR(255),
  type VARCHAR(20),
  size INTEGER,
  url TEXT,
  mime_type VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Support

For questions about API integration, refer to the service files in `src/services/` which contain detailed JSDoc comments for each API call.
