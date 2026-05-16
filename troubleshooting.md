# Troubleshooting

Dokumen ini berisi langkah praktis untuk masalah yang paling umum saat menjalankan frontend, backend, dan integrasi Gemini API.

## 1) Start aplikasi

Terminal yang disarankan:

### Terminal A - Backend
```powershell
cd backend
npm run dev
```

### Terminal B - Frontend
```powershell
cd frontend
npm run dev
```

Tidak ada server AI lokal yang perlu dijalankan. Backend akan memanggil Gemini API langsung dari `GEMINI_API_KEY`.

## 2) Port 3000 sudah terpakai

Jika muncul error `EADDRINUSE` untuk port 3000:

```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

Lalu jalankan backend lagi.

## 3) `GEMINI_API_KEY` belum diisi

Gejala umum:
- Endpoint `POST /api/ai-generate` gagal.
- Log backend menampilkan error provider tidak terkonfigurasi.

Solusi:
1. Isi `GEMINI_API_KEY` di file `.env` backend.
2. Pastikan model di `GEMINI_MODEL` valid, misalnya `gemini-2.0-flash`.
3. Restart backend setelah `.env` diubah.

## 4) Error 401 / 403 dari Gemini

Biasanya berarti:
- API key salah.
- Key belum diaktifkan untuk project yang benar.
- Akses Gemini API belum tersedia untuk akun tersebut.

Solusi:
1. Cek ulang key di AI Studio.
2. Pastikan billing/quota dan akses model aktif.
3. Pastikan backend membaca file `.env` yang benar.

## 5) Error 429 atau quota habis

Kalau backend menerima error rate limit atau quota:
1. Tunggu sebentar lalu coba lagi.
2. Cek quota di Google AI Studio / project terkait.
3. Turunkan frekuensi request dari frontend.

## 6) Output AI bukan JSON valid

Jika `POST /api/ai-generate` gagal validasi:
1. Cek isi prompt sistem di `backend/src/ai/prompts/gemini-system-contract.txt`.
2. Pastikan model tetap mengikuti kontrak JSON.
3. Lihat log `[GEMINI RAW RESPONSE]` di backend untuk debug format respons.

## 7) Tes endpoint manual

Request minimal untuk validasi alur:

```http
POST /api/ai-generate
Content-Type: application/json

{
  "userRequest": "Buat jadwal belajar besok malam"
}
```

Kalau endpoint ini berhasil, lanjutkan ke `POST /api/ai-execute`.

## 8) Catatan umum

- Backend tetap memakai Supabase dan tidak berubah pada migrasi ini.
- Jika backend gagal start setelah edit `.env`, pastikan tidak ada typo pada `GEMINI_API_KEY` dan `GEMINI_MODEL`.
- Bila koneksi keluar diblokir, pastikan machine punya akses internet ke `generativelanguage.googleapis.com`.
