import { useState, useMemo } from "react";
import { Link } from "react-router";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useApp, colorMap } from "../context/AppContext";

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay(); // 0 = Sunday
}

const MONTH_NAMES = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];
const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export function Schedule() {
  const { tasks } = useApp();

  const today = new Date(2026, 3, 21); // April 21, 2026 (demo)
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
  );

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth); // Sunday-based

  // Convert Sunday-based to Monday-based
  const firstDayMon = (firstDay + 6) % 7;

  // Build calendar grid (Monday start)
  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDayMon; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  const goToPrev = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  };
  const goToNext = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  };
  const goToToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setSelectedDate(
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
    );
  };

  const getDateStr = (day: number) =>
    `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const hasTasks = (day: number) => tasks.some((t) => t.date === getDateStr(day));

  const selectedTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.date === selectedDate)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [tasks, selectedDate]
  );

  const selectedDateObj = selectedDate
    ? new Date(selectedDate + "T00:00:00")
    : null;

  const selectedDateLabel = selectedDateObj
    ? selectedDateObj.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : "";

  const isToday = (day: number) => getDateStr(day) === `2026-04-21`;
  const isSelected = (day: number) => getDateStr(day) === selectedDate;

  return (
    <div className="px-4 lg:px-6 py-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 font-bold">Jadwal</h1>
          <p className="text-xs text-gray-400 mt-0.5">Kalender kegiatan</p>
        </div>
        <button
          onClick={goToToday}
          className="px-3 py-1.5 text-xs font-medium bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors shadow-sm"
        >
          Hari Ini
        </button>
      </div>

      {/* Calendar Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        {/* Month Nav */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPrev}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="font-semibold text-gray-900">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </h2>
          <button
            onClick={goToNext}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAY_NAMES.map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-y-1">
          {calendarCells.map((day, idx) => {
            if (!day) return <div key={idx} />;
            const hasT = hasTasks(day);
            const isTod = isToday(day);
            const isSel = isSelected(day);

            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(getDateStr(day))}
                className={`relative flex flex-col items-center justify-center aspect-square rounded-xl text-sm transition-all ${
                  isSel
                    ? "bg-emerald-500 text-white font-semibold shadow-sm"
                    : isTod
                    ? "bg-emerald-50 text-emerald-600 font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {day}
                {hasT && !isSel && (
                  <span
                    className={`absolute bottom-1 w-1 h-1 rounded-full ${
                      isTod ? "bg-emerald-500" : "bg-gray-400"
                    }`}
                  />
                )}
                {hasT && isSel && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-white" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Schedule */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-800">{selectedDateLabel}</p>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-lg font-medium">
            {selectedTasks.length} task
          </span>
        </div>

        {selectedTasks.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
            <Clock className="w-10 h-10 text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400 text-sm font-medium">Tidak ada jadwal</p>
            <Link
              to="/task-manager"
              className="mt-3 inline-block text-sm text-emerald-500 font-semibold hover:underline"
            >
              + Tambah Task
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedTasks.map((task) => {
              const col = colorMap[task.color];
              const completedSub = task.subtasks.filter((s) => s.completed).length;

              return (
                <Link key={task.id} to={`/task/${task.id}`}>
                  <div
                    className={`bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 ${col.border} p-4 hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${col.bg} ${col.text}`}
                          >
                            {task.category}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900">{task.title}</h3>
                        <div className="flex items-center gap-1.5 mt-1 text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-xs">
                            {task.startTime} – {task.endTime} · {task.duration}
                          </span>
                        </div>
                        {task.subtasks.length > 0 && (
                          <p className="text-xs text-gray-400 mt-1">
                            {completedSub}/{task.subtasks.length} sub-task selesai
                          </p>
                        )}
                      </div>
                      <div
                        className={`w-10 h-10 rounded-xl ${col.bg} flex items-center justify-center shrink-0`}
                      >
                        <Clock className={`w-5 h-5 ${col.text}`} />
                      </div>
                    </div>

                    {task.subtasks.length > 0 && (
                      <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`${col.dot} h-1.5 rounded-full`}
                          style={{
                            width: `${(completedSub / task.subtasks.length) * 100}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}