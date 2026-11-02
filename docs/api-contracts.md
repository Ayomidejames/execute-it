# ExecuteIt Backend API Contract Specification

This document outlines the API contracts and communication protocol expected by the **ExecuteIt** frontend when interfacing with the Node.js, Express, and PostgreSQL backend.

---

## 1. Global Conventions & Standards

### Base URL
```
http://localhost:3000/api
```

### Headers
- `Content-Type: application/json`
- `Accept: application/json`
- Session authentication via backend-managed **`HttpOnly, Secure, SameSite=Lax`** cookies (`credentials: 'include'`).

### Standard Error Response (RFC 7807 Problem Details)
All 4xx and 5xx responses must return standard JSON format:
```json
{
  "type": "https://api.executeit.dev/errors/validation",
  "title": "Bad Request",
  "status": 400,
  "detail": "Task title must be at least 2 characters.",
  "invalidParams": [
    { "name": "title", "reason": "Too short" }
  ]
}
```

---

## 2. Authentication Endpoints

### Register User
- **`POST /api/auth/register`**
- **Request Body:**
  ```json
  {
    "firstName": "Alex",
    "lastName": "Johnson",
    "email": "alex.johnson@example.com",
    "password": "SecurePassword123"
  }
  ```
- **Response `201 Created`:**
  Sets `HttpOnly` session cookie and returns user profile:
  ```json
  {
    "user": {
      "id": "usr_991823",
      "firstName": "Alex",
      "lastName": "Johnson",
      "email": "alex.johnson@example.com",
      "themePreference": "light",
      "emailNotifications": true,
      "reminderAlerts": true,
      "googleCalendarConnected": false,
      "createdAt": "2026-10-18T12:00:00Z"
    }
  }
  ```

### Sign In
- **`POST /api/auth/login`**
- **Request Body:**
  ```json
  {
    "email": "alex.johnson@example.com",
    "password": "SecurePassword123",
    "rememberMe": true
  }
  ```
- **Response `200 OK`:** Sets `HttpOnly` cookie and returns user profile.

### Sign Out
- **`POST /api/auth/logout`**
- **Response `200 OK`:** Clears `HttpOnly` session cookie.

### Current User Session
- **`GET /api/auth/me`**
- **Response `200 OK`:** Returns current logged in user or `401 Unauthorized`.

### Google OAuth Flow
- **`GET /api/auth/google`**: Redirects user to Google OAuth consent screen (`scope: email profile calendar.events`).
- **`GET /api/auth/google/callback`**: Handles OAuth authorization code exchange, provisions/updates user record in PostgreSQL, sets cookie, and redirects user to `/dashboard`.

---

## 3. Tasks Endpoints

### List Tasks
- **`GET /api/tasks`**
- **Query Parameters:** `status` (optional), `priority` (optional), `search` (optional)
- **Response `200 OK`:**
  ```json
  [
    {
      "id": "task_03",
      "title": "Build the task management API",
      "description": "Develop clean RESTful CRUD endpoints for tasks and milestones.",
      "status": "in_progress",
      "priority": "high",
      "dueDate": "2026-10-18",
      "dueTime": "18:00",
      "roadmapId": "rdm_backend_01",
      "roadmapTitle": "Backend Developer Roadmap",
      "tags": ["Backend", "Express", "API"],
      "progress": 60,
      "milestones": [
        {
          "id": "ms_01",
          "taskId": "task_03",
          "title": "Design the task schema",
          "isCompleted": true,
          "order": 1,
          "estimatedHours": 2
        }
      ],
      "createdAt": "2026-10-15T09:00:00Z",
      "updatedAt": "2026-10-17T11:45:00Z"
    }
  ]
  ```

### Get Task By ID
- **`GET /api/tasks/:id`**

### Create Task
- **`POST /api/tasks`**
- **Request Body:**
  ```json
  {
    "title": "Master PostgreSQL EXPLAIN ANALYZE",
    "description": "Evaluate sequential scans vs index scans.",
    "status": "todo",
    "priority": "medium",
    "dueDate": "2026-10-22",
    "dueTime": "16:00",
    "roadmapId": "rdm_backend_01",
    "tags": ["Database", "Performance"]
  }
  ```
- **Response `201 Created`**

### Update Task
- **`PATCH /api/tasks/:id`**

### Delete Task
- **`DELETE /api/tasks/:id`**
- **Response `204 No Content`**

---

## 4. Milestones Endpoints

### List Milestones for Task
- **`GET /api/tasks/:taskId/milestones`**

### Create Milestone
- **`POST /api/tasks/:taskId/milestones`**
- **Request Body:**
  ```json
  {
    "title": "Add rate limiter middleware",
    "description": "Configure express-rate-limit with Redis store",
    "isCompleted": false,
    "order": 1,
    "estimatedHours": 2
  }
  ```

### Update Milestone
- **`PATCH /api/milestones/:id`**

### Delete Milestone
- **`DELETE /api/milestones/:id`**

### Reorder Milestones
- **`POST /api/tasks/:taskId/milestones/reorder`**
- **Request Body:** `{ "order": ["ms_02", "ms_01", "ms_03"] }`

---

## 5. Roadmaps Endpoints

### List Roadmaps
- **`GET /api/roadmaps`**

### Get Roadmap By ID
- **`GET /api/roadmaps/:id`**

### Create Roadmap
- **`POST /api/roadmaps`**
- **Request Body:**
  ```json
  {
    "title": "Robotics Learning Roadmap",
    "description": "Understand ROS 2 fundamentals and sensor fusion.",
    "category": "Technical",
    "status": "active",
    "startDate": "2026-08-15",
    "targetDate": "2027-01-30",
    "color": "#0D9488",
    "stages": [
      {
        "id": "stg_1",
        "title": "Phase 1: ROS 2 Nodes",
        "description": "Setup workspace and colcon builds",
        "order": 1,
        "taskIds": []
      }
    ]
  }
  ```

### Update Roadmap
- **`PATCH /api/roadmaps/:id`**

### Delete Roadmap
- **`DELETE /api/roadmaps/:id`**

---

## 6. Notes Endpoints

- **`GET /api/notes`**
- **`POST /api/notes`**
- **`PATCH /api/notes/:id`**
- **`DELETE /api/notes/:id`**

---

## 7. Reminders Endpoints

- **`GET /api/reminders`**
- **`POST /api/reminders`**
- **`PATCH /api/reminders/:id`**
- **`DELETE /api/reminders/:id`**

---

## 8. AI Task Breakdown Endpoint

- **`POST /api/ai/task-breakdown`**
- **Request Body:**
  ```json
  {
    "taskId": "task_05",
    "taskTitle": "Prepare for backend internship interview",
    "taskDescription": "Review algorithms, portfolio, and mock interviews",
    "context": "Focus on high test coverage and system design"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "suggestions": [
      {
        "id": "sug_01",
        "title": "Audit flagship GitHub repository code quality",
        "description": "Add unit tests and documentation",
        "order": 1,
        "estimatedHours": 4,
        "suggestedDueDaysFromNow": 2,
        "selected": true
      }
    ],
    "rationale": "Sequenced into actionable steps based on backend criteria.",
    "modelUsed": "gemini-1.5-flash",
    "isSimulated": false
  }
  ```
