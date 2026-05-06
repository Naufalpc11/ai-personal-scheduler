# Backend API test checklist

Gunakan base URL:

```
http://localhost:3000/api
```

Set token dari response login:

```
TOKEN=PASTE_TOKEN_HERE
```

## 1) Auth

### Register
```
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Budi\",\"email\":\"budi@mail.com\",\"password\":\"rahasia123\"}"
```

### Login
```
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"budi@mail.com\",\"password\":\"rahasia123\"}"
```

## 2) Task

### Create task
```
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Belajar Node\",\"description\":\"Latihan API\",\"status\":\"pending\"}"
```

### List tasks
```
curl -X GET http://localhost:3000/api/tasks \
  -H "Authorization: Bearer $TOKEN"
```

### Get task by id
```
curl -X GET http://localhost:3000/api/tasks/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Update task
```
curl -X PUT http://localhost:3000/api/tasks/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"in_progress\"}"
```

### Delete task
```
curl -X DELETE http://localhost:3000/api/tasks/1 \
  -H "Authorization: Bearer $TOKEN"
```

## 3) Subtask

### Create subtask
```
curl -X POST http://localhost:3000/api/tasks/1/subtasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Siapkan materi\",\"estimatedMinutes\":60,\"status\":\"pending\"}"
```

### List subtasks by task
```
curl -X GET http://localhost:3000/api/tasks/1/subtasks \
  -H "Authorization: Bearer $TOKEN"
```

### Update subtask
```
curl -X PUT http://localhost:3000/api/subtasks/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"done\"}"
```

### Delete subtask
```
curl -X DELETE http://localhost:3000/api/subtasks/1 \
  -H "Authorization: Bearer $TOKEN"
```

## 4) Schedule

### Create schedule
```
curl -X POST http://localhost:3000/api/schedule \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"taskId\":1,\"startTime\":\"2026-05-07T09:00:00+07:00\",\"endTime\":\"2026-05-07T10:00:00+07:00\"}"
```

### List schedules
```
curl -X GET http://localhost:3000/api/schedule \
  -H "Authorization: Bearer $TOKEN"
```

### Update schedule
```
curl -X PUT http://localhost:3000/api/schedule/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"in_progress\"}"
```

### Delete schedule
```
curl -X DELETE http://localhost:3000/api/schedule/1 \
  -H "Authorization: Bearer $TOKEN"
```

## 5) AI (sementara nonaktif)

Semua endpoint AI akan mengembalikan status 501.
