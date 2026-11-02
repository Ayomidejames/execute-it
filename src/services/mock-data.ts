import { Task, Roadmap, Note, Reminder, User, ActivityItem } from '../types';

export const INITIAL_USER: User = {
  id: 'usr_alex_01',
  firstName: 'Alex',
  lastName: 'Johnson',
  email: 'alex.johnson@example.com',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'Software Engineer & Lifelong Learner',
  bio: 'Turning complex goals into actionable execution systems. Focusing on backend architecture and distributed systems.',
  timezone: 'America/New_York (UTC-5)',
  themePreference: 'light',
  emailNotifications: true,
  reminderAlerts: true,
  googleCalendarConnected: true,
  googleCalendarEmail: 'alex.johnson@gmail.com',
  createdAt: '2025-01-10T09:00:00Z',
};

export const INITIAL_ROADMAPS: Roadmap[] = [
  {
    id: 'rdm_backend_01',
    title: 'Backend Developer Roadmap',
    description: 'Master Node.js, Express, PostgreSQL relational modeling, authentication patterns, and scalable microservice design.',
    category: 'Career',
    status: 'active',
    startDate: '2026-09-01',
    targetDate: '2026-12-15',
    color: '#2563EB',
    taskIds: ['task_01', 'task_02', 'task_03'],
    stages: [
      {
        id: 'stg_1',
        title: 'Core Node & Relational DBs',
        description: 'Deep dive into event loop, stream handling, and PostgreSQL indexing',
        order: 1,
        taskIds: ['task_01', 'task_02'],
      },
      {
        id: 'stg_2',
        title: 'API Architecture & Security',
        description: 'REST standards, JWT/Cookie authentication, rate limiting, and input sanitization',
        order: 2,
        taskIds: ['task_03'],
      },
      {
        id: 'stg_3',
        title: 'Deployment & Monitoring',
        description: 'Docker containerization, CI/CD pipelines, and health checks',
        order: 3,
        taskIds: [],
      },
    ],
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-10-15T14:30:00Z',
  },
  {
    id: 'rdm_robotics_02',
    title: 'Robotics Learning Roadmap',
    description: 'Understand ROS 2 fundamentals, publisher-subscriber communication, sensor fusion, and Gazebo simulations.',
    category: 'Technical',
    status: 'active',
    startDate: '2026-08-15',
    targetDate: '2027-01-30',
    color: '#0D9488',
    taskIds: ['task_04'],
    stages: [
      {
        id: 'stg_r1',
        title: 'ROS 2 Basics & Nodes',
        description: 'Setup ROS 2 Humble, create custom nodes, topics, and services',
        order: 1,
        taskIds: ['task_04'],
      },
      {
        id: 'stg_r2',
        title: 'Sensors & Kinematics',
        description: 'LiDAR point cloud analysis, camera feeds, and differential drive kinematics',
        order: 2,
        taskIds: [],
      },
    ],
    createdAt: '2026-08-15T11:00:00Z',
    updatedAt: '2026-10-12T16:00:00Z',
  },
  {
    id: 'rdm_internship_03',
    title: 'Internship Preparation Roadmap',
    description: 'Prepare a production-grade software portfolio, conduct mock system design sessions, and rehearse behavioral interviews.',
    category: 'Career',
    status: 'active',
    startDate: '2026-09-15',
    targetDate: '2026-11-20',
    color: '#7C3AED',
    taskIds: ['task_05', 'task_06'],
    stages: [
      {
        id: 'stg_i1',
        title: 'Portfolio & Artifacts',
        description: 'Polish open-source GitHub repositories and live demo deployments',
        order: 1,
        taskIds: ['task_05'],
      },
      {
        id: 'stg_i2',
        title: 'Interview Mastery',
        description: 'Algorithm patterns, backend system designs, and STAR behavioral answers',
        order: 2,
        taskIds: ['task_06'],
      },
    ],
    createdAt: '2026-09-15T08:00:00Z',
    updatedAt: '2026-10-16T18:10:00Z',
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task_03',
    title: 'Build the task management API',
    description: 'Develop clean RESTful CRUD endpoints for tasks and milestones with robust validation and transactional integrity.',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2026-10-18', // Today!
    dueTime: '18:00',
    roadmapId: 'rdm_backend_01',
    roadmapTitle: 'Backend Developer Roadmap',
    tags: ['Backend', 'Express', 'API', 'PostgreSQL'],
    milestones: [
      {
        id: 'ms_03_1',
        taskId: 'task_03',
        title: 'Design the task schema',
        description: 'Define relational tables, foreign keys, indexes, and constraint checks in PostgreSQL',
        isCompleted: true,
        order: 1,
        estimatedHours: 2,
        createdAt: '2026-10-16T10:00:00Z',
        updatedAt: '2026-10-16T12:00:00Z',
      },
      {
        id: 'ms_03_2',
        taskId: 'task_03',
        title: 'Implement task creation',
        description: 'POST /api/tasks with Zod schema validation and UUID generation',
        isCompleted: true,
        order: 2,
        estimatedHours: 3,
        createdAt: '2026-10-16T12:30:00Z',
        updatedAt: '2026-10-17T09:00:00Z',
      },
      {
        id: 'ms_03_3',
        taskId: 'task_03',
        title: 'Implement task retrieval & filters',
        description: 'GET /api/tasks supporting pagination, priority filter, and status query parameters',
        isCompleted: true,
        order: 3,
        estimatedHours: 2,
        createdAt: '2026-10-17T09:30:00Z',
        updatedAt: '2026-10-17T11:45:00Z',
      },
      {
        id: 'ms_03_4',
        taskId: 'task_03',
        title: 'Add input validation & error middleware',
        description: 'Centralized error handler returning RFC 7807 compliant problem details',
        isCompleted: false,
        order: 4,
        estimatedHours: 2,
        createdAt: '2026-10-17T14:00:00Z',
        updatedAt: '2026-10-17T14:00:00Z',
      },
      {
        id: 'ms_03_5',
        taskId: 'task_03',
        title: 'Test the endpoints with Supertest',
        description: 'Write automated integration tests asserting HTTP status codes and payloads',
        isCompleted: false,
        order: 5,
        estimatedHours: 3,
        createdAt: '2026-10-17T14:00:00Z',
        updatedAt: '2026-10-17T14:00:00Z',
      },
    ],
    createdAt: '2026-10-15T09:00:00Z',
    updatedAt: '2026-10-17T11:45:00Z',
  },
  {
    id: 'task_01',
    title: 'Complete the Express.js authentication module',
    description: 'Implement secure password hashing using Argon2/bcrypt and issue signed HttpOnly session cookies.',
    status: 'completed',
    priority: 'urgent',
    dueDate: '2026-10-17',
    dueTime: '17:00',
    roadmapId: 'rdm_backend_01',
    roadmapTitle: 'Backend Developer Roadmap',
    tags: ['Security', 'Auth', 'Express'],
    milestones: [
      {
        id: 'ms_01_1',
        taskId: 'task_01',
        title: 'Configure password hashing and salt rounds',
        isCompleted: true,
        order: 1,
        createdAt: '2026-10-14T09:00:00Z',
        updatedAt: '2026-10-14T11:00:00Z',
      },
      {
        id: 'ms_01_2',
        taskId: 'task_01',
        title: 'Setup cookie parser and secure token rotation',
        isCompleted: true,
        order: 2,
        createdAt: '2026-10-14T11:30:00Z',
        updatedAt: '2026-10-15T15:00:00Z',
      },
    ],
    createdAt: '2026-10-13T08:00:00Z',
    updatedAt: '2026-10-17T16:30:00Z',
  },
  {
    id: 'task_02',
    title: 'Study PostgreSQL relationships and indexing',
    description: 'Review foreign keys, cascade delete rules, B-Tree vs GIN indexes, and query execution plans via EXPLAIN ANALYZE.',
    status: 'in_progress',
    priority: 'medium',
    dueDate: '2026-10-18', // Today!
    dueTime: '20:00',
    roadmapId: 'rdm_backend_01',
    roadmapTitle: 'Backend Developer Roadmap',
    tags: ['Database', 'PostgreSQL', 'Performance'],
    milestones: [
      {
        id: 'ms_02_1',
        taskId: 'task_02',
        title: 'Practice one-to-many and many-to-many junction tables',
        isCompleted: true,
        order: 1,
        createdAt: '2026-10-16T10:00:00Z',
        updatedAt: '2026-10-17T12:00:00Z',
      },
      {
        id: 'ms_02_2',
        taskId: 'task_02',
        title: 'Benchmark index scans vs sequential scans on 50k rows',
        isCompleted: false,
        order: 2,
        createdAt: '2026-10-17T12:30:00Z',
        updatedAt: '2026-10-17T12:30:00Z',
      },
    ],
    createdAt: '2026-10-16T10:00:00Z',
    updatedAt: '2026-10-17T12:00:00Z',
  },
  {
    id: 'task_05',
    title: 'Prepare an internship portfolio',
    description: 'Package fullstack repository demos, create comprehensive README architecture diagrams, and deploy live links on Render.',
    status: 'todo',
    priority: 'high',
    dueDate: '2026-10-21',
    dueTime: '15:00',
    roadmapId: 'rdm_internship_03',
    roadmapTitle: 'Internship Preparation Roadmap',
    tags: ['Career', 'Portfolio', 'Showcase'],
    milestones: [
      {
        id: 'ms_05_1',
        taskId: 'task_05',
        title: 'Audit repository documentation and install steps',
        isCompleted: false,
        order: 1,
        createdAt: '2026-10-16T10:00:00Z',
        updatedAt: '2026-10-16T10:00:00Z',
      },
      {
        id: 'ms_05_2',
        taskId: 'task_05',
        title: 'Record 2-minute Loom feature demo video',
        isCompleted: false,
        order: 2,
        createdAt: '2026-10-16T10:00:00Z',
        updatedAt: '2026-10-16T10:00:00Z',
      },
    ],
    createdAt: '2026-10-16T14:00:00Z',
    updatedAt: '2026-10-16T14:00:00Z',
  },
  {
    id: 'task_04',
    title: 'Review robotics programming notes',
    description: 'Re-read documentation on ROS 2 topics, quality of service (QoS) profiles, and message serialization.',
    status: 'todo',
    priority: 'low',
    dueDate: '2026-10-24',
    dueTime: '12:00',
    roadmapId: 'rdm_robotics_02',
    roadmapTitle: 'Robotics Learning Roadmap',
    tags: ['Robotics', 'ROS2', 'C++'],
    milestones: [],
    createdAt: '2026-10-15T15:00:00Z',
    updatedAt: '2026-10-15T15:00:00Z',
  },
  {
    id: 'task_06',
    title: 'Rehearse backend system design interview topics',
    description: 'Walk through URL shortener and rate limiter architecture: database sharding, caching, and idempotency keys.',
    status: 'todo',
    priority: 'medium',
    dueDate: '2026-10-26',
    roadmapId: 'rdm_internship_03',
    roadmapTitle: 'Internship Preparation Roadmap',
    tags: ['SystemDesign', 'Interview', 'Architecture'],
    milestones: [],
    createdAt: '2026-10-17T11:00:00Z',
    updatedAt: '2026-10-17T11:00:00Z',
  },
];

export const INITIAL_NOTES: Note[] = [
  {
    id: 'note_01',
    title: 'PostgreSQL Indexing & Partitioning Notes',
    content: `# PostgreSQL Indexing & Optimization

## Key Insights
- **B-Tree**: Default, ideal for equality and range queries (\`<, <=, =, >=, >\`).
- **GIN**: Crucial for JSONB data structures and full-text search indexing.
- **BRIN**: Highly effective for append-only time-series data with natural clustering.

\`\`\`sql
-- Example partial index for active tasks
CREATE INDEX idx_active_tasks ON tasks (due_date) 
WHERE status != 'completed';
\`\`\`

## Gotcha Checklist
- Avoid indexing columns with very low cardinality (e.g., boolean flag with 90% true).
- Remember to run \`ANALYZE\` after bulk imports so the query planner updates statistics.`,
    tags: ['PostgreSQL', 'Performance', 'Backend'],
    taskId: 'task_02',
    taskTitle: 'Study PostgreSQL relationships and indexing',
    roadmapId: 'rdm_backend_01',
    roadmapTitle: 'Backend Developer Roadmap',
    createdAt: '2026-10-16T14:30:00Z',
    updatedAt: '2026-10-17T16:20:00Z',
  },
  {
    id: 'note_02',
    title: 'Express REST API Conventions & Error Handling',
    content: `# API Architecture Principles

## RFC 7807 Problem Details Standard
Every 4xx and 5xx response should return:
\`\`\`json
{
  "type": "https://api.executeit.dev/errors/validation",
  "title": "Validation Failed",
  "status": 400,
  "detail": "Task title must be at least 3 characters",
  "invalidParams": [
    { "field": "title", "reason": "Too short" }
  ]
}
\`\`\`

## HTTP Status Codes
- \`201 Created\` for successful POST
- \`204 No Content\` for successful DELETE
- \`422 Unprocessable Content\` for semantic validation errors`,
    tags: ['Express', 'API', 'Conventions'],
    taskId: 'task_03',
    taskTitle: 'Build the task management API',
    roadmapId: 'rdm_backend_01',
    roadmapTitle: 'Backend Developer Roadmap',
    createdAt: '2026-10-15T11:00:00Z',
    updatedAt: '2026-10-17T10:15:00Z',
  },
  {
    id: 'note_03',
    title: 'Internship Behavioral Questions (STAR Method)',
    content: `# Behavioral Interview Prep

### Situation & Task
Describe the specific technical challenge, the goal, and why it mattered.

### Action
Focus on personal contributions:
- "I refactored the database schema..."
- "I diagnosed the race condition by inspecting connection pool metrics..."

### Result
Quantify outcomes whenever possible:
- "Reduced API response latency by 35%."
- "Delivered the milestone two days ahead of schedule."`,
    tags: ['Interview', 'Career', 'SoftSkills'],
    roadmapId: 'rdm_internship_03',
    roadmapTitle: 'Internship Preparation Roadmap',
    createdAt: '2026-10-14T09:15:00Z',
    updatedAt: '2026-10-16T12:00:00Z',
  },
];

export const INITIAL_REMINDERS: Reminder[] = [
  {
    id: 'rem_01',
    title: 'Daily execution review & priority planning',
    description: 'Check off completed milestones and set top 3 priorities for tomorrow.',
    date: '2026-10-18',
    time: '20:30',
    isCompleted: false,
    syncedWithGoogle: true,
    createdAt: '2026-10-17T08:00:00Z',
  },
  {
    id: 'rem_02',
    title: 'Finish task API input validation middleware',
    description: 'Complete milestone 4 for Build the task management API',
    date: '2026-10-18',
    time: '16:00',
    isCompleted: false,
    taskId: 'task_03',
    taskTitle: 'Build the task management API',
    syncedWithGoogle: true,
    createdAt: '2026-10-16T14:00:00Z',
  },
  {
    id: 'rem_03',
    title: 'Submit internship portfolio review link',
    description: 'Send GitHub repository link to mentor for feedback',
    date: '2026-10-21',
    time: '11:00',
    isCompleted: false,
    taskId: 'task_05',
    taskTitle: 'Prepare an internship portfolio',
    syncedWithGoogle: false,
    createdAt: '2026-10-16T16:00:00Z',
  },
  {
    id: 'rem_04',
    title: 'Completed Express authentication module deploy',
    date: '2026-10-17',
    time: '17:00',
    isCompleted: true,
    taskId: 'task_01',
    taskTitle: 'Complete the Express.js authentication module',
    syncedWithGoogle: true,
    createdAt: '2026-10-15T10:00:00Z',
  },
];

export const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act_01',
    type: 'milestone_completed',
    title: 'Completed milestone',
    description: 'Implement task retrieval & filters in "Build the task management API"',
    timestamp: '2026-10-17T11:45:00Z',
    entityId: 'task_03',
    entityType: 'task',
  },
  {
    id: 'act_02',
    type: 'task_completed',
    title: 'Completed task',
    description: 'Complete the Express.js authentication module',
    timestamp: '2026-10-17T16:30:00Z',
    entityId: 'task_01',
    entityType: 'task',
  },
  {
    id: 'act_03',
    type: 'roadmap_updated',
    title: 'Updated roadmap',
    description: 'Added new stage to Backend Developer Roadmap',
    timestamp: '2026-10-15T14:30:00Z',
    entityId: 'rdm_backend_01',
    entityType: 'roadmap',
  },
  {
    id: 'act_04',
    type: 'note_created',
    title: 'Created note',
    description: 'Added PostgreSQL Indexing & Partitioning Notes',
    timestamp: '2026-10-16T14:30:00Z',
    entityId: 'note_01',
    entityType: 'note',
  },
];
