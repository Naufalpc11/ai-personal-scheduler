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

AI_PROVIDER_ORDER="gemini"
AI_TEMPERATURE=0.2
GEMINI_API_KEY="your_gemini_api_key"
GEMINI_MODEL="gemini-2.0-flash"
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

**Untuk Gemini API:**

Tidak ada server lokal yang perlu dijalankan. Cukup pastikan `GEMINI_API_KEY` terisi dan backend punya akses internet.

## Catatan
- Backend memakai Supabase Auth, jadi tabel `users` hanya menyimpan profil dan refer ke `auth.users`.
- Semua akses dari frontend melewati backend API (server-side).
- Endpoint AI sudah diaktifkan dan terhubung ke Gemini cloud (atau provider sesuai `AI_PROVIDER_ORDER`).
