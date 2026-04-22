import { useMemo } from "react";
import { Link } from "react-router";
import {
  Clock,
  CheckCircle2,
  ListTodo,
  Hourglass,
  Sparkles,
  ArrowRight,
  CalendarDays,
  Lightbulb,
  Play,
  Circle,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { useApp, colorMap } from "../context/AppContext";

function getNow() {
  const d = new Date();
  d.setFullYear(2026, 3, 21);
  d.setHours(10, 15, 0, 0);
  return d;
}

function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function formatDateIndo(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getGreeting(hour: number): string {
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}

export function Dashboard() {
  const { tasks, user } = useApp();

  const now = getNow();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const todayTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.date === todayStr)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [tasks, todayStr]
  );

  const currentTask = useMemo(
    () =>
      todayTasks.find(
        (t) =>
          timeToMinutes(t.startTime) <= currentMinutes &&
          timeToMinutes(t.endTime) >= currentMinutes
      ),
    [todayTasks, currentMinutes]
  );

  const nextTask = useMemo(() => {
    if (!currentTask) {
      return todayTasks.find((t) => timeToMinutes(t.startTime) > currentMinutes);
    }
    const idx = todayTasks.indexOf(currentTask);
    return todayTasks[idx + 1] ?? null;
  }, [todayTasks, currentTask, currentMinutes]);

  const completedToday = todayTasks.filter(
    (t) => timeToMinutes(t.endTime) < currentMinutes
  ).length;

  const totalTasks = tasks.length;
  const totalDone = tasks.filter(
    (t) => timeToMinutes(t.endTime) < currentMinutes && t.date <= todayStr
  ).length;

  const currentColor = currentTask ? colorMap[currentTask.color] : null;
  const completionRate =
    todayTasks.length > 0 ? Math.round((completedToday / todayTasks.length) * 100) : 0;

  const aiRecommendations = [
    nextTask
      ? `Task berikutnya: "${nextTask.title}" pukul ${nextTask.startTime}. Bersiaplah 5 menit sebelumnya.`
      : "Tidak ada task lagi hari ini. Gunakan waktu luangmu untuk istirahat! 🎉",
    `Kamu sudah menyelesaikan ${completedToday} dari ${todayTasks.length} task hari ini. Pertahankan!`,
  ];

  const statsItems = [
    {
      icon: ListTodo,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-500",
      value: totalTasks,
      label: "Total Task",
    },
    {
      icon: CheckCircle2,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-500",
      value: totalDone,
      label: "Selesai",
    },
    {
      icon: TrendingUp,
      iconBg: "bg-violet-100",
      iconColor: "text-violet-500",
      value: `${completionRate}%`,
      label: "Hari Ini",
    },
  ];

  return (
    <div className="px-4 lg:px-6 py-5 space-y-5">
      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-xs font-medium">{formatDateIndo(now)}</p>
          <h1 className="text-gray-900 mt-1">
            {getGreeting(now.getHours())},{" "}
            <span className="font-bold">{user?.name ?? "Pengguna"} 👋</span>
          </h1>
        </div>
        <Link
          to="/ai-generate"
          className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl text-xs font-medium shadow-sm hover:shadow-md transition-all active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Tanya AI
        </Link>
      </div>

      {/* Current Running Task */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
            <Play className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <h2 className="text-sm font-semibold text-gray-700">
            Task Berjalan Sekarang
          </h2>
        </div>

        {currentTask ? (
          <div
            className={`rounded-2xl p-5 border-l-4 ${currentColor?.border} bg-white shadow-sm border border-gray-100`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${currentColor?.bg} ${currentColor?.text}`}
                >
                  {currentTask.category}
                </span>
                <h3 className="font-bold text-gray-900 mt-2">
                  {currentTask.title}
                </h3>
                <div className="flex items-center gap-1.5 mt-1 text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">
                    {currentTask.startTime} – {currentTask.endTime}
                  </span>
                  <span className="text-gray-200">•</span>
                  <span className="text-sm">{currentTask.duration}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 rounded-xl px-2.5 py-1.5 border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold">Live</span>
              </div>
            </div>

            {/* Subtask progress */}
            {currentTask.subtasks.length > 0 && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                  <span>Sub-task progress</span>
                  <span>
                    {currentTask.subtasks.filter((s) => s.completed).length}/
                    {currentTask.subtasks.length}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${
                        (currentTask.subtasks.filter((s) => s.completed).length /
                          currentTask.subtasks.length) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            )}

            <Link
              to={`/task/${currentTask.id}`}
              className="mt-4 inline-flex items-center gap-1 text-blue-500 text-sm font-medium hover:gap-2 transition-all"
            >
              Lihat Detail <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Hourglass className="w-7 h-7 text-gray-300" />
            </div>
            <p className="font-semibold text-gray-700">Tidak ada task saat ini</p>
            <p className="text-sm text-gray-400 mt-1">
              {nextTask
                ? `Task berikutnya: "${nextTask.title}" pukul ${nextTask.startTime}`
                : "Kamu sudah menyelesaikan semua task hari ini!"}
            </p>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {statsItems.map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center"
          >
            <div
              className={`w-9 h-9 ${stat.iconBg} rounded-xl flex items-center justify-center mx-auto mb-2`}
            >
              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Today's Schedule */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center">
              <CalendarDays className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <h2 className="text-sm font-semibold text-gray-700">Jadwal Hari Ini</h2>
          </div>
          <Link
            to="/schedule"
            className="text-xs text-blue-500 font-medium flex items-center gap-0.5 hover:gap-1 transition-all"
          >
            Lihat Semua <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {todayTasks.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              <CalendarDays className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              Tidak ada jadwal hari ini
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {todayTasks.map((task, idx) => {
                const col = colorMap[task.color];
                const endMin = timeToMinutes(task.endTime);
                const startMin = timeToMinutes(task.startTime);
                const isDone = endMin < currentMinutes;
                const isRunning =
                  startMin <= currentMinutes && endMin >= currentMinutes;

                return (
                  <Link key={task.id} to={`/task/${task.id}`}>
                    <div
                      className={`flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-gray-50 ${
                        isRunning ? "bg-blue-50/50" : ""
                      }`}
                    >
                      {/* Timeline */}
                      <div className="flex flex-col items-center self-stretch w-8 shrink-0">
                        <div
                          className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                            isDone
                              ? "bg-gray-200"
                              : isRunning
                              ? col.dot + " ring-2 ring-offset-1 ring-blue-200"
                              : col.dot
                          }`}
                        />
                        {idx < todayTasks.length - 1 && (
                          <div className="w-0.5 flex-1 bg-gray-100 mt-1" />
                        )}
                      </div>

                      {/* Time */}
                      <div className="w-14 shrink-0">
                        <p
                          className={`text-xs font-semibold ${
                            isDone ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {task.startTime}
                        </p>
                        <p className="text-xs text-gray-300">{task.endTime}</p>
                      </div>

                      {/* Task info */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium truncate ${
                            isDone ? "line-through text-gray-300" : "text-gray-900"
                          }`}
                        >
                          {task.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded-md ${col.bg} ${col.text}`}
                          >
                            {task.category}
                          </span>
                          {task.subtasks.length > 0 && (
                            <span className="text-xs text-gray-300">
                              {task.subtasks.filter((s) => s.completed).length}/
                              {task.subtasks.length} sub-task
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status icon */}
                      <div className="shrink-0">
                        {isDone ? (
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                        ) : isRunning ? (
                          <div className="flex items-center gap-1 bg-blue-500 text-white rounded-lg px-2 py-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            <span className="text-xs font-medium">Live</span>
                          </div>
                        ) : (
                          <Circle className="w-5 h-5 text-gray-200" />
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* AI Recommendations */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <h2 className="text-sm font-semibold text-gray-700">Rekomendasi AI</h2>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-800">AI Insights</span>
          </div>
          <div className="space-y-3">
            {aiRecommendations.map((rec, i) => (
              <div key={i} className="flex gap-2.5 p-3 bg-gray-50 rounded-xl">
                <span className="text-amber-400 shrink-0 mt-0.5">✦</span>
                <p className="text-gray-600 text-sm leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
          <Link
            to="/ai-generate"
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl text-sm font-semibold hover:shadow-md transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Buat Task dengan AI
          </Link>
        </div>
      </div>
    </div>
  );
}
