# AI Personal Scheduler Backend API

Backend REST API untuk AI Personal Scheduler menggunakan Node.js, Express.js, PostgreSQL, dan Prisma ORM.

## Fitur

- Register & login user (JWT)
- CRUD task
- CRUD subtask
- CRUD schedule (mendukung rescheduling via update)
- Integrasi hasil AI via endpoint `POST /api/ai-result`
- Validasi input menggunakan Zod
- Global error handling

## Struktur Folder

```text
.
├── prisma
│   └── schema.prisma
├── src
│   ├── controllers
│   │   ├── ai.controller.js
│   │   ├── auth.controller.js
│   │   ├── schedule.controller.js
│   │   ├── subtask.controller.js
│   │   └── task.controller.js
│   ├── middleware
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── validate.middleware.js
│   ├── prisma
│   │   └── client.js
│   ├── routes
│   │   ├── ai.routes.js
│   │   ├── auth.routes.js
│   │   ├── index.js
│   │   ├── schedule.routes.js
│   │   └── task.routes.js
│   ├── services
│   │   ├── ai.service.js
│   │   ├── auth.service.js
│   │   ├── schedule.service.js
│   │   ├── subtask.service.js
│   │   └── task.service.js
│   ├── utils
│   │   ├── appError.js
│   │   ├── asyncHandler.js
│   │   ├── jwt.js
│   │   └── validators.js
│   ├── app.js
│   └── server.js
├── .env.example
├── package.json
└── README.md
```

## Schema Prisma

Lihat file `prisma/schema.prisma`.

Model yang tersedia:
- `User`
- `Task`
- `Subtask`
- `Schedule`
- Enum `TaskStatus` (`pending`, `in_progress`, `done`)

## Cara Menjalankan Project

1. Install dependency:

```bash
npm install
```

2. Buat file `.env` dari `.env.example`, lalu sesuaikan:

```env
PORT=3000
DATABASE_URL="postgresql://postgres:password@localhost:5432/ai_scheduler?schema=public"
JWT_SECRET="replace_with_secure_secret"
JWT_EXPIRES_IN="1d"
```

3. Generate Prisma Client:

```bash
npm run prisma:generate
```

4. Jalankan migrasi database:

```bash
npm run prisma:migrate -- --name init
```

5. Jalankan server:

```bash
npm run dev
```

Base URL API:

```text
http://localhost:3000/api
```

## Authentication

Endpoint selain register/login butuh JWT di header:

```http
Authorization: Bearer <token>
```

## Endpoint List

### Auth
- `POST /api/register`
- `POST /api/login`

### Task
- `POST /api/tasks`
- `GET /api/tasks`
- `GET /api/tasks/:id`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`

### Subtask
- `POST /api/tasks/:id/subtasks`
- `GET /api/tasks/:id/subtasks`
- `PUT /api/subtasks/:id`
- `DELETE /api/subtasks/:id`

### Schedule
- `POST /api/schedule`
- `GET /api/schedule`
- `PUT /api/schedule/:id`
- `DELETE /api/schedule/:id`

### AI Result
- `POST /api/ai-result`

## Contoh Request & Response

### 1) Register

Request:

```http
POST /api/register
Content-Type: application/json

{
  "name": "Budi",
  "email": "budi@mail.com",
  "password": "rahasia123"
}
```

Response (201):

```json
{
  "success": true,
  "message": "Register success",
  "data": {
    "user": {
      "id": 1,
      "name": "Budi",
      "email": "budi@mail.com",
      "createdAt": "2026-03-31T10:00:00.000Z"
    },
    "token": "<jwt-token>"
  }
}
```

### 2) Login

Request:

```http
POST /api/login
Content-Type: application/json

{
  "email": "budi@mail.com",
  "password": "rahasia123"
}
```

Response (200):

```json
{
  "success": true,
  "message": "Login success",
  "data": {
    "user": {
      "id": 1,
      "name": "Budi",
      "email": "budi@mail.com",
      "createdAt": "2026-03-31T10:00:00.000Z"
    },
    "token": "<jwt-token>"
  }
}
```

### 3) Create Task

Request:

```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Perpanjang STNK",
  "description": "Urus dokumen ke Samsat",
  "status": "pending"
}
```

Response (201):

```json
{
  "success": true,
  "message": "Task created",
  "data": {
    "id": 1,
    "userId": 1,
    "title": "Perpanjang STNK",
    "description": "Urus dokumen ke Samsat",
    "status": "pending",
    "createdAt": "2026-03-31T10:00:00.000Z"
  }
}
```

### 4) Get Tasks

Request:

```http
GET /api/tasks
Authorization: Bearer <token>
```

Response (200):

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Perpanjang STNK",
      "subtasks": [],
      "schedules": []
    }
  ]
}
```

### 5) Get Task By ID

Request:

```http
GET /api/tasks/1
Authorization: Bearer <token>
```

Response (200):

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Perpanjang STNK",
    "subtasks": [],
    "schedules": []
  }
}
```

### 6) Update Task

Request:

```http
PUT /api/tasks/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "in_progress"
}
```

Response (200):

```json
{
  "success": true,
  "message": "Task updated",
  "data": {
    "id": 1,
    "status": "in_progress"
  }
}
```

### 7) Delete Task

Request:

```http
DELETE /api/tasks/1
Authorization: Bearer <token>
```

Response (200):

```json
{
  "success": true,
  "message": "Task deleted"
}
```

### 8) Create Subtask

Request:

```http
POST /api/tasks/1/subtasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Fotokopi KTP"
}
```

Response (201):

```json
{
  "success": true,
  "message": "Subtask created",
  "data": {
    "id": 1,
    "taskId": 1,
    "title": "Fotokopi KTP",
    "isCompleted": false
  }
}
```

### 9) Get Subtask By Task

Request:

```http
GET /api/tasks/1/subtasks
Authorization: Bearer <token>
```

Response (200):

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "taskId": 1,
      "title": "Fotokopi KTP",
      "isCompleted": false
    }
  ]
}
```

### 10) Update Subtask

Request:

```http
PUT /api/subtasks/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "isCompleted": true
}
```

Response (200):

```json
{
  "success": true,
  "message": "Subtask updated",
  "data": {
    "id": 1,
    "taskId": 1,
    "title": "Fotokopi KTP",
    "isCompleted": true
  }
}
```

### 11) Delete Subtask

Request:

```http
DELETE /api/subtasks/1
Authorization: Bearer <token>
```

Response (200):

```json
{
  "success": true,
  "message": "Subtask deleted"
}
```

### 12) Create Schedule

Request:

```http
POST /api/schedule
Authorization: Bearer <token>
Content-Type: application/json

{
  "taskId": 1,
  "startTime": "2026-04-01T09:00:00.000Z",
  "endTime": "2026-04-01T11:00:00.000Z",
  "date": "2026-04-01T00:00:00.000Z"
}
```

Response (201):

```json
{
  "success": true,
  "message": "Schedule created",
  "data": {
    "id": 1,
    "taskId": 1,
    "startTime": "2026-04-01T09:00:00.000Z",
    "endTime": "2026-04-01T11:00:00.000Z",
    "date": "2026-04-01T00:00:00.000Z"
  }
}
```

### 13) Get Schedule

Request:

```http
GET /api/schedule
Authorization: Bearer <token>
```

Response (200):

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "taskId": 1,
      "startTime": "2026-04-01T09:00:00.000Z",
      "endTime": "2026-04-01T11:00:00.000Z",
      "date": "2026-04-01T00:00:00.000Z",
      "task": {
        "id": 1,
        "title": "Perpanjang STNK",
        "status": "pending"
      }
    }
  ]
}
```

### 14) Update Schedule (Rescheduling)

Request:

```http
PUT /api/schedule/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "startTime": "2026-04-02T13:00:00.000Z",
  "endTime": "2026-04-02T15:00:00.000Z"
}
```

Response (200):

```json
{
  "success": true,
  "message": "Schedule updated",
  "data": {
    "id": 1,
    "taskId": 1,
    "startTime": "2026-04-02T13:00:00.000Z",
    "endTime": "2026-04-02T15:00:00.000Z",
    "date": "2026-04-02T00:00:00.000Z"
  }
}
```

### 15) Delete Schedule

Request:

```http
DELETE /api/schedule/1
Authorization: Bearer <token>
```

Response (200):

```json
{
  "success": true,
  "message": "Schedule deleted"
}
```

### 16) AI Result Integration

Request:

```http
POST /api/ai-result
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Perpanjang STNK",
  "subtasks": [
    "Fotokopi KTP",
    "Fotokopi BPKB",
    "Datang ke Samsat"
  ],
  "schedule": [
    {
      "startTime": "2026-04-01T09:00:00.000Z",
      "endTime": "2026-04-01T11:00:00.000Z"
    }
  ]
}
```

Response (201):

```json
{
  "success": true,
  "message": "AI result processed",
  "data": {
    "id": 2,
    "userId": 1,
    "title": "Perpanjang STNK",
    "description": null,
    "status": "pending",
    "createdAt": "2026-03-31T11:00:00.000Z",
    "subtasks": [
      { "id": 2, "taskId": 2, "title": "Fotokopi KTP", "isCompleted": false },
      { "id": 3, "taskId": 2, "title": "Fotokopi BPKB", "isCompleted": false },
      { "id": 4, "taskId": 2, "title": "Datang ke Samsat", "isCompleted": false }
    ],
    "schedules": [
      {
        "id": 2,
        "taskId": 2,
        "startTime": "2026-04-01T09:00:00.000Z",
        "endTime": "2026-04-01T11:00:00.000Z",
        "date": "2026-04-01T00:00:00.000Z"
      }
    ]
  }
}
```

## Catatan Implementasi Keamanan

- Password di-hash dengan `bcryptjs`
- Autentikasi menggunakan `jsonwebtoken` (JWT)
- Semua route non-auth diproteksi middleware `protect`
