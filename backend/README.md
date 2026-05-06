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

## Catatan
- Backend memakai Supabase Auth, jadi tabel `users` hanya menyimpan profil dan refer ke `auth.users`.
- Semua akses dari frontend melewati backend API (server-side).
- Endpoint AI sementara belum diaktifkan (akan diaktifkan di tahap berikutnya).
