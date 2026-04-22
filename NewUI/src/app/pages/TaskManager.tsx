import { useState } from "react";
import { Link } from "react-router";
import {
  Plus,
  Sparkles,
  Clock,
  Trash2,
  ChevronRight,
  Search,
  ChevronLeft,
  CalendarDays,
  ListFilter,
} from "lucide-react";
import { useApp, colorMap, Task } from "../context/AppContext";

const TODAY = "2026-04-21";
const TODAY_DATE = new Date("2026-04-21T00:00:00");

const CATEGORIES = ["Kelas", "Review", "Meeting", "Personal", "Belajar", "Lainnya"];
const COLORS: Task["color"][] = ["blue", "purple", "amber", "green", "red", "pink"];

const colorLabels: Record<Task["color"], string> = {
  blue: "Biru",
  purple: "Ungu",
  amber: "Oranye",
  green: "Hijau",
  red: "Merah",
  pink: "Merah Muda",
};

const DAY_NAMES_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const DAY_NAMES_FULL = [
  "Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu",
];
const MONTH_NAMES = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];

function dateToStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function strToDate(s: string): Date {
  return new Date(s + "T00:00:00");
}

function addDays(d: Date, n: number): Date {
  const nd = new Date(d);
  nd.setDate(nd.getDate() + n);
  return nd;
}

function formatDayLabel(d: Date): string {
  const isToday = dateToStr(d) === TODAY;
  const dayName = DAY_NAMES_FULL[d.getDay()];
  const dayNum = d.getDate();
  const monthName = MONTH_NAMES[d.getMonth()];
  if (isToday) return `Hari Ini, ${dayNum} ${monthName}`;
  return `${dayName}, ${dayNum} ${monthName}`;
}

type ViewMode = "day" | "all";

export function TaskManager() {
  const { tasks, addTask, deleteTask } = useApp();

  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [selectedDate, setSelectedDate] = useState(TODAY_DATE);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);

  // New task form state
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(TODAY);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [category, setCategory] = useState("Kelas");
  const [color, setColor] = useState<Task["color"]>("blue");
  const [notes, setNotes] = useState("");

  const selectedDateStr = dateToStr(selectedDate);

  const filteredTasks = tasks
    .filter((t) => {
      const matchSearch =
        !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase());
      if (viewMode === "day") return matchSearch && t.date === selectedDateStr;
      return matchSearch;
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date || !startTime || !endTime) return;

    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const totalMin = eh * 60 + em - (sh * 60 + sm);
    const hours = Math.floor(totalMin / 60);
    const mins = totalMin % 60;
    const duration =
      hours > 0 && mins > 0
        ? `${hours} jam ${mins} menit`
        : hours > 0
        ? `${hours} jam`
        : `${mins} menit`;

    addTask({ title, date, startTime, endTime, duration, category, color, notes });

    setTitle(""); setDate(TODAY); setStartTime(""); setEndTime("");
    setCategory("Kelas"); setColor("blue"); setNotes("");
    setShowForm(false);
  };

  const goToPrevDay = () => setSelectedDate((d) => addDays(d, -1));
  const goToNextDay = () => setSelectedDate((d) => addDays(d, 1));
  const goToToday = () => setSelectedDate(TODAY_DATE);

  const isToday = dateToStr(selectedDate) === TODAY;

  return (
    <div className="px-4 lg:px-6 py-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 font-bold">Task Manager</h1>
          <p className="text-xs text-gray-400 mt-0.5">{tasks.length} total task</p>
        </div>
        <Link
          to="/ai-generate"
          className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all active:scale-95"
        >
          <Sparkles className="w-4 h-4" />
          AI
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari task..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm transition-all"
        />
      </div>

      {/* View Mode + Day Navigator */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Mode toggle */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setViewMode("day")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors ${
              viewMode === "day"
                ? "bg-blue-50 text-blue-600 border-b-2 border-blue-500"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            Per Hari
          </button>
          <button
            onClick={() => setViewMode("all")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors ${
              viewMode === "all"
                ? "bg-violet-50 text-violet-600 border-b-2 border-violet-500"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <ListFilter className="w-4 h-4" />
            Semua Task
          </button>
        </div>

        {/* Day Navigator (only in day mode) */}
        {viewMode === "day" && (
          <div className="flex items-center px-3 py-3">
            <button
              onClick={goToPrevDay}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={goToToday}
              className="flex-1 text-center group"
            >
              <p
                className={`text-sm font-semibold transition-colors ${
                  isToday ? "text-blue-600" : "text-gray-900 group-hover:text-blue-500"
                }`}
              >
                {formatDayLabel(selectedDate)}
              </p>
              {!isToday && (
                <p className="text-xs text-gray-400 group-hover:text-blue-400 transition-colors">
                  Ketuk untuk ke hari ini
                </p>
              )}
              {isToday && (
                <p className="text-xs text-blue-400">Hari ini</p>
              )}
            </button>

            <button
              onClick={goToNextDay}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Day strip calendar (quick jump, day mode only) */}
        {viewMode === "day" && (
          <div className="flex gap-1 px-3 pb-3 overflow-x-auto">
            {[-3, -2, -1, 0, 1, 2, 3].map((offset) => {
              const d = addDays(TODAY_DATE, offset);
              const dStr = dateToStr(d);
              const isSel = dStr === selectedDateStr;
              const isTod = dStr === TODAY;
              const hasTask = tasks.some((t) => t.date === dStr);
              return (
                <button
                  key={offset}
                  onClick={() => setSelectedDate(d)}
                  className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl shrink-0 transition-all text-xs font-medium ${
                    isSel
                      ? "bg-blue-500 text-white"
                      : isTod
                      ? "bg-blue-50 text-blue-600"
                      : "hover:bg-gray-50 text-gray-600"
                  }`}
                >
                  <span>{DAY_NAMES_SHORT[d.getDay()]}</span>
                  <span className={`text-sm font-bold ${isSel ? "text-white" : ""}`}>
                    {d.getDate()}
                  </span>
                  {hasTask && (
                    <span
                      className={`w-1 h-1 rounded-full ${
                        isSel ? "bg-white" : isTod ? "bg-blue-400" : "bg-gray-400"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Task Button */}
      <button
        onClick={() => setShowForm((v) => !v)}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed text-sm font-medium transition-colors ${
          showForm
            ? "border-blue-400 bg-blue-50 text-blue-600"
            : "border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50"
        }`}
      >
        <Plus className="w-4 h-4" />
        {showForm ? "Tutup Form" : "Tambah Task Baru"}
      </button>

      {/* Add Task Form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Buat Task Baru</h2>
          <form onSubmit={handleAddTask} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Nama Task</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Masukkan judul task..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Tanggal</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">Mulai</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">Selesai</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">Warna</label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-all ${colorMap[c].dot} ${
                      color === c ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : ""
                    }`}
                    title={colorLabels[c]}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Catatan (opsional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tambah catatan..."
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors"
            >
              Buat Task
            </button>
          </form>
        </div>
      )}

      {/* Task List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-800">{filteredTasks.length}</span> task{" "}
            {viewMode === "day" ? `pada ${formatDayLabel(selectedDate).toLowerCase()}` : "ditemukan"}
          </p>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <CalendarDays className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium text-sm">Tidak ada task</p>
            <p className="text-gray-400 text-xs mt-1">
              {viewMode === "day"
                ? "Tidak ada task di hari ini. Tambah task baru di atas!"
                : "Belum ada task. Mulai tambah task pertamamu!"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => {
              const col = colorMap[task.color];
              const completedSub = task.subtasks.filter((s) => s.completed).length;
              const progress =
                task.subtasks.length > 0
                  ? (completedSub / task.subtasks.length) * 100
                  : null;

              return (
                <div
                  key={task.id}
                  className={`bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 ${col.border} overflow-hidden hover:shadow-md transition-shadow`}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${col.bg} ${col.text}`}
                          >
                            {task.category}
                          </span>
                          {viewMode === "all" && (
                            <span className="text-xs text-gray-400">{task.date}</span>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900">{task.title}</h3>
                        <div className="flex items-center gap-1.5 mt-1 text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-xs">
                            {task.startTime} – {task.endTime} · {task.duration}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            if (confirm("Hapus task ini?")) deleteTask(task.id);
                          }}
                          className="p-2 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <Link
                          to={`/task/${task.id}`}
                          className="p-2 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>

                    {/* Progress bar */}
                    {progress !== null && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Sub-task</span>
                          <span>
                            {completedSub}/{task.subtasks.length}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className={`${col.dot} h-1.5 rounded-full transition-all`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
