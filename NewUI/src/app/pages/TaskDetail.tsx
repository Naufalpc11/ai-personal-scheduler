import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  ArrowLeft,
  Trash2,
  Plus,
  Check,
  X,
  Edit2,
  Clock,
  CalendarDays,
  Hourglass,
  FileText,
  ChevronRight,
} from "lucide-react";
import { useApp, colorMap } from "../context/AppContext";

export function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tasks, updateTask, deleteTask, addSubtask, updateSubtask, toggleSubtask, deleteSubtask } =
    useApp();

  const task = tasks.find((t) => t.id === Number(id));

  // Edit task state
  const [editingTask, setEditingTask] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");

  // Sub-task state
  const [newSubtask, setNewSubtask] = useState("");
  const [editingSubtaskId, setEditingSubtaskId] = useState<number | null>(null);
  const [editSubtaskTitle, setEditSubtaskTitle] = useState("");

  if (!task) {
    return (
      <div className="px-4 py-10 text-center">
        <p className="text-gray-500 mb-4">Task tidak ditemukan.</p>
        <Link to="/task-manager" className="text-[#5B8DBE] text-sm font-medium">
          ← Kembali ke Task Manager
        </Link>
      </div>
    );
  }

  const col = colorMap[task.color];
  const completedCount = task.subtasks.filter((s) => s.completed).length;
  const progress = task.subtasks.length > 0 ? (completedCount / task.subtasks.length) * 100 : 0;

  // Edit task
  const startEditTask = () => {
    setEditTitle(task.title);
    setEditNotes(task.notes);
    setEditStartTime(task.startTime);
    setEditEndTime(task.endTime);
    setEditingTask(true);
  };

  const saveEditTask = () => {
    if (!editTitle.trim()) return;
    const [sh, sm] = editStartTime.split(":").map(Number);
    const [eh, em] = editEndTime.split(":").map(Number);
    const totalMin = eh * 60 + em - (sh * 60 + sm);
    const hours = Math.floor(totalMin / 60);
    const mins = totalMin % 60;
    const duration =
      hours > 0 && mins > 0
        ? `${hours} jam ${mins} menit`
        : hours > 0
        ? `${hours} jam`
        : `${mins} menit`;

    updateTask(task.id, {
      title: editTitle,
      notes: editNotes,
      startTime: editStartTime,
      endTime: editEndTime,
      duration,
    });
    setEditingTask(false);
  };

  const handleDeleteTask = () => {
    if (confirm("Hapus task ini? Tindakan ini tidak bisa dibatalkan.")) {
      deleteTask(task.id);
      navigate("/task-manager");
    }
  };

  // Sub-task handlers
  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      addSubtask(task.id, newSubtask.trim());
      setNewSubtask("");
    }
  };

  const startEditSubtask = (id: number, currentTitle: string) => {
    setEditingSubtaskId(id);
    setEditSubtaskTitle(currentTitle);
  };

  const saveEditSubtask = (subtaskId: number) => {
    if (editSubtaskTitle.trim()) {
      updateSubtask(task.id, subtaskId, editSubtaskTitle.trim());
    }
    setEditingSubtaskId(null);
  };

  return (
    <div className="px-4 lg:px-6 py-5 space-y-4">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/task-manager"
          className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Link>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider">Detail Task</p>
          <h1 className="text-gray-900 font-bold truncate max-w-[220px] lg:max-w-md">{task.title}</h1>
        </div>
      </div>

      {/* Task Card */}
      <div className={`bg-white rounded-2xl shadow-sm border-l-4 ${col.border} overflow-hidden`}>
        <div className="p-5">
          {/* Task Header */}
          {editingTask ? (
            <div className="space-y-3 mb-4">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B8DBE]"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Mulai</label>
                  <input
                    type="time"
                    value={editStartTime}
                    onChange={(e) => setEditStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B8DBE]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Selesai</label>
                  <input
                    type="time"
                    value={editEndTime}
                    onChange={(e) => setEditEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B8DBE]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Catatan</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B8DBE] resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={saveEditTask}
                  className="flex-1 py-2 bg-[#5B8DBE] text-white rounded-xl text-sm font-medium"
                >
                  Simpan
                </button>
                <button
                  onClick={() => setEditingTask(false)}
                  className="flex-1 py-2 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${col.bg} ${col.text}`}>
                    {task.category}
                  </span>
                  <h2 className="font-bold text-gray-900 mt-2">{task.title}</h2>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={startEditTask}
                    className="p-2 text-gray-400 hover:text-[#5B8DBE] hover:bg-blue-50 rounded-xl transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDeleteTask}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span className="text-xs">Tanggal</span>
                  </div>
                  <p className="text-xs font-semibold text-gray-900">{task.date}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs">Waktu</span>
                  </div>
                  <p className="text-xs font-semibold text-gray-900">
                    {task.startTime}–{task.endTime}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                    <Hourglass className="w-3.5 h-3.5" />
                    <span className="text-xs">Durasi</span>
                  </div>
                  <p className="text-xs font-semibold text-gray-900">{task.duration}</p>
                </div>
              </div>

              {/* Notes */}
              {task.notes && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-gray-400 mb-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span className="text-xs">Catatan</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{task.notes}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Sub-Task Section */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 pb-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-gray-900">Sub-Task</h2>
            <span className={`text-sm font-semibold ${col.text}`}>
              {Math.round(progress)}%
            </span>
          </div>

          {/* Stats */}
          <div className="flex gap-3 text-xs mb-3">
            <span className="text-gray-500">
              Total <span className="font-semibold text-gray-800">{task.subtasks.length}</span>
            </span>
            <span className="text-green-600">
              Selesai <span className="font-semibold">{completedCount}</span>
            </span>
            <span className="text-amber-600">
              Pending <span className="font-semibold">{task.subtasks.length - completedCount}</span>
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
            <div
              className={`${col.dot} h-1.5 rounded-full transition-all duration-300`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Sub-task list */}
        <div className="divide-y divide-gray-50">
          {task.subtasks.length === 0 ? (
            <p className="px-5 py-4 text-sm text-gray-400 text-center">
              Belum ada sub-task. Tambahkan di bawah.
            </p>
          ) : (
            task.subtasks.map((subtask) => (
              <div key={subtask.id} className="px-5 py-3 flex items-center gap-3">
                {/* Checkbox */}
                <button
                  onClick={() => toggleSubtask(task.id, subtask.id)}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                    subtask.completed
                      ? `${col.badge} border-transparent`
                      : "border-gray-300 hover:border-[#5B8DBE]"
                  }`}
                >
                  {subtask.completed && <Check className="w-3 h-3 text-white" />}
                </button>

                {/* Title (editable) */}
                {editingSubtaskId === subtask.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={editSubtaskTitle}
                      onChange={(e) => setEditSubtaskTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEditSubtask(subtask.id);
                        if (e.key === "Escape") setEditingSubtaskId(null);
                      }}
                      autoFocus
                      className="flex-1 px-2 py-1 border border-[#5B8DBE] rounded-lg text-sm focus:outline-none"
                    />
                    <button
                      onClick={() => saveEditSubtask(subtask.id)}
                      className="p-1 text-[#5B8DBE] hover:bg-blue-50 rounded"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingSubtaskId(null)}
                      className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <span
                    className={`flex-1 text-sm ${
                      subtask.completed ? "line-through text-gray-400" : "text-gray-800"
                    }`}
                  >
                    {subtask.title}
                  </span>
                )}

                {/* Actions */}
                {editingSubtaskId !== subtask.id && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEditSubtask(subtask.id, subtask.title)}
                      className="p-1.5 text-gray-300 hover:text-[#5B8DBE] rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteSubtask(task.id, subtask.id)}
                      className="p-1.5 text-gray-300 hover:text-red-400 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add sub-task input */}
        <div className="px-5 py-4 border-t border-gray-100">
          <div className="flex gap-2">
            <input
              type="text"
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddSubtask()}
              placeholder="Tambah sub-task baru..."
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B8DBE]"
            />
            <button
              onClick={handleAddSubtask}
              disabled={!newSubtask.trim()}
              className="p-2.5 bg-[#5B8DBE] text-white rounded-xl hover:bg-[#4A7AB0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}