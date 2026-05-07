# Backend (Supabase + Express)

Backend ini menggunakan Supabase sebagai database dan auth, dengan Express sebagai API server.

## 1) Buat project Supabase
1. Buat project baru di Supabase.
2. Buka SQL Editor, jalankan file schema di [supabase/schema.sql](supabase/schema.sql).
3. Buka Settings > API, salin:
   - Project URL
   - anon public key
   - service_role key

## 2) Setup environment
1. Salin .env.example menjadi .env
2. Isi variabel berikut:

```
PORT=3000
SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"

AI_PROVIDER_ORDER="ollama"
AI_TEMPERATURE=0.2
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_API_KEY=""
OLLAMA_MODEL="gpt-oss:20b"
```

## 3) Jalankan server
```
npm install
npm run dev
```

## Troubleshooting

### Port 3000 / 11434 Sudah Terpakai (EADDRINUSE Error)

Jika ada error `Error: listen EADDRINUSE: address already in use :::3000`, berarti ada process lain yang sudah menggunakan port tersebut.

**Solusi untuk Windows PowerShell:**

```powershell
# 1. Cari tahu siapa yang pakai port 3000
netstat -ano | findstr :3000

# Output contoh:
#  TCP    0.0.0.0:3000           0.0.0.0:0              LISTENING       12345
#  TCP    [::]:3000              [::]:0                 LISTENING       12345

# Lihat PID (Process ID) di kolom paling kanan, misal 12345

# 2. Kill process tersebut
taskkill /PID 12345 /F

# Output:
# SUCCESS: The process with PID 12345 has been terminated.

# 3. Tunggu 2 detik, lalu jalankan backend lagi
Start-Sleep -Seconds 2
npm run dev
```

**Untuk Ollama (port 11434):**

Sama seperti di atas, tapi gunakan port 11434:

```powershell
# Cek siapa pakai port 11434
netstat -ano | findstr :11434

# Kill processnya
taskkill /PID <PID> /F

# Atau bisa langsung kill semua ollama process
Get-Process | Where-Object {$_.ProcessName -like "*ollama*"} | Stop-Process -Force

# Jalankan ollama lagi
ollama serve
```

## Catatan
- Backend memakai Supabase Auth, jadi tabel `users` hanya menyimpan profil dan refer ke `auth.users`.
- Semua akses dari frontend melewati backend API (server-side).
- Endpoint AI sudah diaktifkan dan terhubung ke Ollama local (atau cloud provider sesuai `AI_PROVIDER_ORDER`).
