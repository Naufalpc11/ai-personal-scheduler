# AI Contract Specification (LLM To-Do List)

Dokumen ini mendefinisikan kontrak baku output AI (LLM) untuk fitur AI Personal Assistant pada domain To-Do List dan Scheduling.

Tujuan kontrak:
- Menjadi format tunggal antara output LLM dan backend.
- Mengurangi error parsing, mapping, dan penyimpanan data.
- Memastikan response AI bisa divalidasi secara deterministic sebelum write ke database.

Scope kontrak:
- Natural language understanding untuk task management.
- Task breakdown menjadi subtasks.
- Penjadwalan otomatis.
- Dynamic rescheduling saat ada aktivitas baru.

## 1) General Rules

- Output AI wajib berupa JSON object valid.
- Tidak boleh ada teks tambahan di luar JSON (no markdown, no penjelasan naratif).
- Semua tanggal dan waktu wajib ISO 8601 dengan timezone offset, contoh: `2026-04-02T09:00:00+07:00`.
- Semua durasi menggunakan satuan menit (`minutes`) bertipe integer positif.
- Semua string harus sudah di-trim.
- Nilai enum harus persis sama (case-sensitive).

## 2) Top-Level JSON Contract

```json
{
	"version": "1.0",
	"intent": "create_task | add_subtasks | auto_schedule | reschedule | recommend",
	"userRequest": "string",
	"locale": "id-ID",
	"timezone": "Asia/Jakarta",
	"mainTask": {
		"title": "string",
		"description": "string | null",
		"priority": "low | medium | high",
		"status": "pending | in_progress | done"
	},
	"subtasks": [
		{
			"title": "string",
			"notes": "string | null",
			"order": 1,
			"estimatedMinutes": 30,
			"isFlexible": true
		}
	],
	"estimatedDurationPerSubtask": [
		{
			"subtaskTitle": "string",
			"minutes": 30,
			"confidence": 0.8
		}
	],
	"schedulingConstraints": {
		"deadline": "2026-04-07T17:00:00+07:00",
		"preferredTimeWindows": [
			{
				"day": "monday | tuesday | wednesday | thursday | friday | saturday | sunday",
				"start": "09:00",
				"end": "12:00"
			}
		],
		"fixedEvents": [
			{
				"title": "string",
				"startTime": "2026-04-03T09:00:00+07:00",
				"endTime": "2026-04-03T12:00:00+07:00"
			}
		],
		"maxDailyFocusMinutes": 240,
		"allowWeekend": true
	},
	"schedulePlan": [
		{
			"subtaskTitle": "string",
			"startTime": "2026-04-04T09:00:00+07:00",
			"endTime": "2026-04-04T10:00:00+07:00",
			"date": "2026-04-04T00:00:00+07:00",
			"reason": "string"
		}
	],
	"reschedulePlan": {
		"trigger": {
			"title": "string",
			"startTime": "2026-04-02T09:00:00+07:00",
			"endTime": "2026-04-02T12:00:00+07:00"
		},
		"conflicts": [
			{
				"subtaskTitle": "string",
				"oldStartTime": "2026-04-02T09:00:00+07:00",
				"oldEndTime": "2026-04-02T10:00:00+07:00"
			}
		],
		"moves": [
			{
				"subtaskTitle": "string",
				"newStartTime": "2026-04-02T13:00:00+07:00",
				"newEndTime": "2026-04-02T14:00:00+07:00",
				"reason": "string"
			}
		]
	},
	"recommendations": [
		{
			"type": "next_action | productivity_tip | reminder",
			"message": "string",
			"priority": "low | medium | high"
		}
	],
	"meta": {
		"model": "string",
		"generatedAt": "2026-04-01T21:00:00+07:00",
		"confidence": 0.85,
		"needsUserConfirmation": true,
		"assumptions": ["string"]
	}
}
```

## 3) Field Contract Detail

Top-level required fields:
- `version`
- `intent`
- `userRequest`
- `locale`
- `timezone`
- `mainTask`
- `subtasks`
- `schedulingConstraints`
- `meta`

Top-level optional fields:
- `estimatedDurationPerSubtask`
- `schedulePlan`
- `reschedulePlan`
- `recommendations`

Field constraints:
- `version`: string, fixed `1.0`.
- `intent`: enum, salah satu:
	- `create_task`: membuat task utama + breakdown.
	- `add_subtasks`: menambah detail langkah task yang sudah ada.
	- `auto_schedule`: membuat rencana jadwal otomatis.
	- `reschedule`: menyusun ulang jadwal karena konflik/perubahan.
	- `recommend`: memberi saran aktivitas produktif.
- `mainTask.title`: panjang 3..120 karakter.
- `mainTask.description`: max 500 karakter atau `null`.
- `subtasks`: minimal 1 item saat `intent` adalah `create_task` atau `auto_schedule`.
- `subtasks[].order`: integer mulai dari 1, unik dalam satu payload.
- `subtasks[].estimatedMinutes`: integer 5..480.
- `estimatedDurationPerSubtask[].confidence`: number 0..1.
- `schedulingConstraints.deadline`: optional, wajib >= waktu saat ini bila ada.
- `preferredTimeWindows[].start` < `preferredTimeWindows[].end` (format `HH:mm`).
- `fixedEvents[].startTime` < `fixedEvents[].endTime`.
- `schedulePlan[].startTime` < `schedulePlan[].endTime`.
- `meta.confidence`: number 0..1.

## 4) Intent-Specific Requirements

### A. intent = create_task
Required:
- `mainTask`
- `subtasks`
- `estimatedDurationPerSubtask` (boleh kosong jika AI belum yakin)
- `schedulingConstraints`

Optional:
- `schedulePlan`
- `recommendations`

### B. intent = auto_schedule
Required:
- `mainTask`
- `subtasks`
- `schedulingConstraints`
- `schedulePlan`

### C. intent = reschedule
Required:
- `mainTask`
- `schedulingConstraints`
- `reschedulePlan`

Optional:
- `schedulePlan` (jadwal final setelah perubahan)

### D. intent = recommend
Required:
- `recommendations`
- `meta`

Optional:
- `mainTask`
- `subtasks`

## 5) Mapping Contract ke Entity Backend Saat Ini

Kontrak ini disiapkan agar mudah dipetakan ke model backend saat ini:
- `mainTask.title` -> `Task.title`
- `mainTask.description` -> `Task.description`
- `mainTask.status` -> `Task.status`
- `subtasks[].title` -> `Subtask.title`
- `schedulePlan[].startTime` -> `Schedule.startTime`
- `schedulePlan[].endTime` -> `Schedule.endTime`
- `schedulePlan[].date` -> `Schedule.date`

Catatan:
- Field seperti `priority`, `confidence`, `reason`, `fixedEvents`, `recommendations` adalah AI metadata dan bisa disimpan di layer log/AI history jika belum ada kolom di database utama.

## 6) Example: Valid Output (Create Task + Auto Schedule)

```json
{
	"version": "1.0",
	"intent": "auto_schedule",
	"userRequest": "Aku ingin memperpanjang STNK minggu ini",
	"locale": "id-ID",
	"timezone": "Asia/Jakarta",
	"mainTask": {
		"title": "Perpanjang STNK",
		"description": "Mengurus perpanjangan STNK minggu ini",
		"priority": "high",
		"status": "pending"
	},
	"subtasks": [
		{
			"title": "Fotokopi KTP",
			"notes": null,
			"order": 1,
			"estimatedMinutes": 20,
			"isFlexible": true
		},
		{
			"title": "Fotokopi BPKB",
			"notes": null,
			"order": 2,
			"estimatedMinutes": 20,
			"isFlexible": true
		},
		{
			"title": "Datang ke Samsat",
			"notes": "Bawa semua dokumen asli",
			"order": 3,
			"estimatedMinutes": 120,
			"isFlexible": false
		},
		{
			"title": "Ambil STNK",
			"notes": null,
			"order": 4,
			"estimatedMinutes": 30,
			"isFlexible": true
		}
	],
	"estimatedDurationPerSubtask": [
		{
			"subtaskTitle": "Fotokopi KTP",
			"minutes": 20,
			"confidence": 0.95
		},
		{
			"subtaskTitle": "Fotokopi BPKB",
			"minutes": 20,
			"confidence": 0.95
		},
		{
			"subtaskTitle": "Datang ke Samsat",
			"minutes": 120,
			"confidence": 0.8
		},
		{
			"subtaskTitle": "Ambil STNK",
			"minutes": 30,
			"confidence": 0.75
		}
	],
	"schedulingConstraints": {
		"deadline": "2026-04-07T17:00:00+07:00",
		"preferredTimeWindows": [
			{
				"day": "tuesday",
				"start": "09:00",
				"end": "12:00"
			}
		],
		"fixedEvents": [
			{
				"title": "Kuliah",
				"startTime": "2026-04-03T09:00:00+07:00",
				"endTime": "2026-04-03T12:00:00+07:00"
			}
		],
		"maxDailyFocusMinutes": 240,
		"allowWeekend": true
	},
	"schedulePlan": [
		{
			"subtaskTitle": "Datang ke Samsat",
			"startTime": "2026-04-02T09:00:00+07:00",
			"endTime": "2026-04-02T11:00:00+07:00",
			"date": "2026-04-02T00:00:00+07:00",
			"reason": "Slot kosong terdekat dengan durasi cukup dan sebelum deadline"
		},
		{
			"subtaskTitle": "Ambil STNK",
			"startTime": "2026-04-04T10:00:00+07:00",
			"endTime": "2026-04-04T10:30:00+07:00",
			"date": "2026-04-04T00:00:00+07:00",
			"reason": "Mengikuti penyelesaian proses di Samsat"
		}
	],
	"recommendations": [
		{
			"type": "next_action",
			"message": "Siapkan dokumen asli malam ini agar proses besok lebih cepat",
			"priority": "high"
		}
	],
	"meta": {
		"model": "llama3.1:8b",
		"generatedAt": "2026-04-01T21:10:00+07:00",
		"confidence": 0.87,
		"needsUserConfirmation": true,
		"assumptions": [
			"Samsat buka pukul 08:00-15:00",
			"Pengguna tersedia pada slot Selasa pagi"
		]
	}
}
```

## 7) Example: Valid Output (Dynamic Reschedule)

```json
{
	"version": "1.0",
	"intent": "reschedule",
	"userRequest": "Besok jam 9 aku ada urusan 3 jam",
	"locale": "id-ID",
	"timezone": "Asia/Jakarta",
	"mainTask": {
		"title": "Perpanjang STNK",
		"description": "Penyesuaian jadwal karena event baru",
		"priority": "high",
		"status": "in_progress"
	},
	"subtasks": [],
	"schedulingConstraints": {
		"deadline": "2026-04-07T17:00:00+07:00",
		"preferredTimeWindows": [],
		"fixedEvents": [
			{
				"title": "Urusan mendadak",
				"startTime": "2026-04-02T09:00:00+07:00",
				"endTime": "2026-04-02T12:00:00+07:00"
			}
		],
		"maxDailyFocusMinutes": 240,
		"allowWeekend": true
	},
	"reschedulePlan": {
		"trigger": {
			"title": "Urusan mendadak",
			"startTime": "2026-04-02T09:00:00+07:00",
			"endTime": "2026-04-02T12:00:00+07:00"
		},
		"conflicts": [
			{
				"subtaskTitle": "Datang ke Samsat",
				"oldStartTime": "2026-04-02T09:00:00+07:00",
				"oldEndTime": "2026-04-02T11:00:00+07:00"
			}
		],
		"moves": [
			{
				"subtaskTitle": "Datang ke Samsat",
				"newStartTime": "2026-04-02T13:00:00+07:00",
				"newEndTime": "2026-04-02T15:00:00+07:00",
				"reason": "Slot bentrok dipindah ke slot kosong terdekat di hari yang sama"
			}
		]
	},
	"meta": {
		"model": "llama3.1:8b",
		"generatedAt": "2026-04-01T21:20:00+07:00",
		"confidence": 0.9,
		"needsUserConfirmation": true,
		"assumptions": [
			"Pengguna tetap ingin menyelesaikan task minggu ini"
		]
	}
}
```

## 8) Invalid Output Examples (Harus Ditolak Validator)

Contoh invalid #1:
- `intent` tidak termasuk enum.
- `subtasks[].estimatedMinutes` bernilai negatif.

Contoh invalid #2:
- `schedulePlan[].endTime` lebih kecil dari `startTime`.
- format waktu bukan ISO 8601.

Contoh invalid #3:
- AI mengembalikan narasi teks + JSON campur.
- top-level field wajib (`mainTask`) tidak ada.

## 9) Prompt Compliance Rule untuk Ollama

Agar model konsisten ke kontrak ini, prompt sistem wajib menegaskan:
- Return only valid JSON.
- Do not include markdown code fences.
- Follow enum and field names exactly.
- If uncertain, fill `meta.assumptions` and set `meta.needsUserConfirmation = true`.

Dengan kontrak ini, backend bisa melakukan alur aman:
1. Parse JSON.
2. Validate schema.
3. Transform ke entity DB.
4. Simpan data.
5. Kirim response ke client.
