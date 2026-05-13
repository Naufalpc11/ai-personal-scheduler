# Troubleshooting AI Personal Scheduler (Windows PowerShell)

Dokumen ini berisi langkah praktis untuk masalah yang sudah kita alami saat menjalankan Frontend, Backend, dan Ollama lokal.

## 1) Urutan Start yang Benar

Jalankan 3 terminal terpisah.

### Terminal A - Ollama
```powershell
cd "D:\Semester 6\PABW\ai-personal-scheduler"
ollama serve
```

### Terminal B - Backend
```powershell
cd "D:\Semester 6\PABW\ai-personal-scheduler\backend"
npm run dev
```

### Terminal C - Frontend
```powershell
cd "D:\Semester 6\PABW\ai-personal-scheduler\frontend"
npm run dev
```

## 2) Error EADDRINUSE Port 3000 (Backend gagal start)

Gejala:
- `Error: listen EADDRINUSE: address already in use :::3000`

Solusi cepat:
```powershell
# Cek PID yang pakai port 3000
netstat -ano | findstr :3000 | findstr LISTENING

# Kill PID (ganti 12345 dengan PID hasil netstat)
taskkill /PID 12345 /F

# Start backend lagi
cd "D:\Semester 6\PABW\ai-personal-scheduler\backend"
npm run dev
```

Solusi sekali bersih (kill semua listener 3000):
```powershell
$pids = (netstat -ano | findstr :3000 | findstr LISTENING | ForEach-Object { ($_ -split '\s+')[-1] } | Select-Object -Unique)
if ($pids) { foreach ($procId in $pids) { taskkill /PID $procId /F } } else { Write-Output "No listener on port 3000" }
```

## 3) Port 11434 bentrok (Ollama tidak bisa start)

Gejala:
- `bind: Only one usage of each socket address ... 11434`

Solusi:
```powershell
# Cek siapa pakai 11434
netstat -ano | findstr :11434

# Kill proses ollama lama
Get-Process | Where-Object {$_.ProcessName -like "*ollama*"} | Stop-Process -Force

# Start ulang ollama
ollama serve
```

## 4) Ollama CUDA crash (500 / ai-generate lama lalu gagal)

Gejala umum di log Ollama:
- `ggml_cuda_host_malloc ... out of memory`
- `CUDA error: shared object initialization failed`

Solusi stabil (CPU-only):
```powershell
Get-Process | Where-Object {$_.ProcessName -like "*ollama*"} | Stop-Process -Force -ErrorAction SilentlyContinue
$env:OLLAMA_LLM_LIBRARY="cpu"
$env:OLLAMA_NUM_GPU="0"
$env:CUDA_VISIBLE_DEVICES="-1"
ollama serve
```

Catatan:
- CPU-only lebih lambat, tapi lebih stabil di RTX 3050 4GB saat model 7B.

## 5) Chat AI lambat

Penyebab:
- Cold start model (load model pertama kali)
- Model `mistral:7b` cukup berat

Cek endpoint Ollama:
```powershell
Invoke-RestMethod -Method Get -Uri "http://127.0.0.1:11434/api/tags"
```

Tes request langsung ke Ollama:
```powershell
$body = @{
  model = 'mistral:7b'
  messages = @(@{ role='user'; content='Balas singkat: halo' })
  temperature = 0.2
  response_format = @{ type='json_object' }
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:11434/v1/chat/completions" -ContentType "application/json" -Body $body -TimeoutSec 120
```

## 6) Storage C penuh karena Ollama

Cek model terpasang:
```powershell
ollama list
```

Cek ukuran folder model:
```powershell
$root = "C:\Users\TUF GAMING\.ollama\models"
$total = (Get-ChildItem -Path $root -Recurse -File | Measure-Object Length -Sum).Sum
"TotalGB=" + [math]::Round($total/1GB,3)
```

Hapus file partial (aman, sisa download gagal):
```powershell
$blobs = "C:\Users\TUF GAMING\.ollama\models\blobs"
Get-ChildItem -Path $blobs -File | Where-Object { $_.Name -like "*-partial*" } | Remove-Item -Force -ErrorAction SilentlyContinue
```

Hapus model besar jika perlu:
```powershell
ollama rm mistral:7b
```

## 7) 401 Unauthorized di backend

Gejala:
- log backend banyak `GET /api/tasks 401`

Arti:
- Frontend memanggil endpoint protected tanpa token login valid.

Solusi:
1. Login ulang di frontend.
2. Pastikan request pakai Bearer token.
3. Refresh halaman setelah login.

## 8) Cek cepat status 3 service

```powershell
# Backend
netstat -ano | findstr :3000

# Ollama
netstat -ano | findstr :11434

# Frontend (biasanya 5173)
netstat -ano | findstr :5173
```

## 9) One-shot recovery (copy-paste)

Jika kondisi berantakan, jalankan ini lalu start ulang service satu per satu.

```powershell
# Stop node backend/frontend dan ollama
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process | Where-Object {$_.ProcessName -like "*ollama*"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Bersihkan listener 3000
$pids = (netstat -ano | findstr :3000 | findstr LISTENING | ForEach-Object { ($_ -split '\s+')[-1] } | Select-Object -Unique)
if ($pids) { foreach ($procId in $pids) { taskkill /PID $procId /F } }

# Start ollama CPU-only (stabil)
$env:OLLAMA_LLM_LIBRARY="cpu"
$env:OLLAMA_NUM_GPU="0"
$env:CUDA_VISIBLE_DEVICES="-1"
ollama serve
```

Lalu buka terminal lain untuk backend dan frontend sesuai urutan start di atas.
