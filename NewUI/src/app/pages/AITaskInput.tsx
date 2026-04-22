import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  CheckCircle2,
  Clock,
  Bot,
  User,
  CalendarPlus,
  RotateCcw,
} from "lucide-react";
import { useApp, Task } from "../context/AppContext";

interface GeneratedTask {
  title: string;
  startTime: string;
  endTime: string;
  duration: string;
  category: string;
  color: Task["color"];
  selected: boolean;
}

interface ChatMessage {
  id: number;
  role: "user" | "ai";
  content: string;
  tasks?: GeneratedTask[];
  saved?: boolean;
  isTyping?: boolean;
}

const TODAY = "2026-04-21";

const EXAMPLE_PROMPTS = [
  "Besok jam 9 saya ada kelas AI selama 2 jam",
  "Senin depan meeting client dari pagi sampai siang",
  "Sore ini jam 4 belajar TypeScript 1.5 jam",
  "Jumat jam 14:00 ada review mingguan",
];

function generateAIResponse(prompt: string): { text: string; tasks: GeneratedTask[] } {
  const lower = prompt.toLowerCase();

  if (lower.includes("meeting") || lower.includes("rapat")) {
    return {
      text: `Baik! Aku sudah menganalisis rencanamu tentang "${prompt.length > 50 ? prompt.slice(0, 50) + "..." : prompt}".\n\nAku sarankan 3 task berikut agar meeting-mu berjalan lancar:`,
      tasks: [
        { title: "Persiapan Materi Meeting", startTime: "08:00", endTime: "09:00", duration: "1 jam", category: "Review", color: "purple", selected: true },
        { title: "Meeting / Rapat", startTime: "09:00", endTime: "11:00", duration: "2 jam", category: "Meeting", color: "green", selected: true },
        { title: "Follow-up & Notulensi", startTime: "11:30", endTime: "12:00", duration: "30 menit", category: "Review", color: "blue", selected: false },
      ],
    };
  }

  if (lower.includes("kelas") || lower.includes("kuliah")) {
    return {
      text: `Sip! Berdasarkan info kelasmu, aku siapkan jadwal yang efektif:\n\n`,
      tasks: [
        { title: "Sesi Kelas", startTime: "09:00", endTime: "11:00", duration: "2 jam", category: "Kelas", color: "blue", selected: true },
        { title: "Review Catatan Setelah Kelas", startTime: "11:15", endTime: "12:00", duration: "45 menit", category: "Belajar", color: "purple", selected: true },
        { title: "Kerjakan Tugas", startTime: "20:00", endTime: "21:30", duration: "1.5 jam", category: "Belajar", color: "amber", selected: false },
      ],
    };
  }

  if (lower.includes("belajar") || lower.includes("study") || lower.includes("typescript") || lower.includes("coding")) {
    return {
      text: `Semangat belajarnya bagus! 💪 Aku buat sesi belajar yang terstruktur:`,
      tasks: [
        { title: "Sesi Belajar / Coding", startTime: "14:00", endTime: "16:00", duration: "2 jam", category: "Belajar", color: "blue", selected: true },
        { title: "Istirahat Aktif (stretching)", startTime: "16:00", endTime: "16:15", duration: "15 menit", category: "Personal", color: "green", selected: true },
        { title: "Review & Rangkuman", startTime: "16:15", endTime: "17:00", duration: "45 menit", category: "Belajar", color: "purple", selected: false },
      ],
    };
  }

  if (lower.includes("presentasi") || lower.includes("presentation")) {
    return {
      text: `Presentasi penting nih! Aku siapkan rundown lengkapnya:`,
      tasks: [
        { title: "Finalisasi Slide Presentasi", startTime: "08:00", endTime: "09:30", duration: "1.5 jam", category: "Review", color: "purple", selected: true },
        { title: "Gladi Resik / Latihan", startTime: "09:30", endTime: "10:00", duration: "30 menit", category: "Personal", color: "amber", selected: true },
        { title: "Presentasi ke Klien", startTime: "10:00", endTime: "12:00", duration: "2 jam", category: "Meeting", color: "green", selected: true },
        { title: "Follow-up Pasca Presentasi", startTime: "13:00", endTime: "13:30", duration: "30 menit", category: "Review", color: "blue", selected: false },
      ],
    };
  }

  // Default
  const shortPrompt = prompt.length > 40 ? prompt.slice(0, 40) + "..." : prompt;
  return {
    text: `Oke, aku pahami rencanamu! Berikut jadwal yang aku buat untuk kegiatanmu:`,
    tasks: [
      { title: shortPrompt, startTime: "09:00", endTime: "11:00", duration: "2 jam", category: "Lainnya", color: "amber", selected: true },
      { title: "Persiapan sebelumnya", startTime: "08:30", endTime: "09:00", duration: "30 menit", category: "Personal", color: "pink", selected: false },
      { title: "Evaluasi & Catatan", startTime: "11:00", endTime: "11:30", duration: "30 menit", category: "Review", color: "blue", selected: false },
    ],
  };
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 1,
    role: "ai",
    content:
      "Halo! 👋 Saya AI Scheduler.\n\nCeritakan rencanamu — meeting, kelas, belajar, atau kegiatan apapun — dan saya akan otomatis membuat jadwal yang optimal untukmu!\n\nApa rencanamu hari ini?",
  },
];

export function AITaskInput() {
  const { addTask } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextIdRef = useRef(2);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (text?: string) => {
    const msg = (text ?? inputText).trim();
    if (!msg || isTyping) return;

    const userId = nextIdRef.current++;
    const aiId = nextIdRef.current++;

    // Add user message
    setMessages((prev) => [
      ...prev,
      { id: userId, role: "user", content: msg },
    ]);
    setInputText("");
    setIsTyping(true);

    // Simulate AI processing delay
    const delay = 1200 + Math.random() * 800;
    setTimeout(() => {
      const { text: responseText, tasks } = generateAIResponse(msg);
      setMessages((prev) => [
        ...prev,
        {
          id: aiId,
          role: "ai",
          content: responseText,
          tasks,
          saved: false,
        },
      ]);
      setIsTyping(false);
    }, delay);
  };

  const toggleTask = (messageId: number, taskIdx: number) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId && m.tasks
          ? {
              ...m,
              tasks: m.tasks.map((t, i) =>
                i === taskIdx ? { ...t, selected: !t.selected } : t
              ),
            }
          : m
      )
    );
  };

  const saveTasksFromMessage = (messageId: number) => {
    const message = messages.find((m) => m.id === messageId);
    if (!message?.tasks) return;

    const selectedTasks = message.tasks.filter((t) => t.selected);
    selectedTasks.forEach((t) => {
      addTask({
        title: t.title,
        date: TODAY,
        startTime: t.startTime,
        endTime: t.endTime,
        duration: t.duration,
        category: t.category,
        color: t.color,
        notes: "Dibuat oleh AI Scheduler",
      });
    });

    // Mark message tasks as saved
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, saved: true } : m))
    );

    // AI confirmation message
    const confirmId = nextIdRef.current++;
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: confirmId,
          role: "ai",
          content: `✅ Berhasil! **${selectedTasks.length} task** telah ditambahkan ke jadwalmu.\n\nApakah ada rencana lain yang ingin saya bantu susun jadwalnya?`,
        },
      ]);
    }, 300);
  };

  const handleReset = () => {
    setMessages(INITIAL_MESSAGES);
    setIsTyping(false);
    nextIdRef.current = 2;
    inputRef.current?.focus();
  };

  const categoryColors: Record<string, string> = {
    Meeting: "bg-emerald-100 text-emerald-700",
    Kelas: "bg-blue-100 text-blue-700",
    Belajar: "bg-violet-100 text-violet-700",
    Review: "bg-purple-100 text-purple-700",
    Personal: "bg-amber-100 text-amber-700",
    Lainnya: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-130px)] lg:h-[calc(100dvh-73px)]">
      {/* ── Chat Header ── */}
      <div className="px-4 lg:px-6 py-3 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">AI Scheduler</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-gray-400">Online</span>
            </div>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* ── Messages Area ── */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 space-y-4 bg-gray-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                msg.role === "ai"
                  ? "bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm"
                  : "bg-gradient-to-br from-blue-400 to-blue-600 shadow-sm"
              }`}
            >
              {msg.role === "ai" ? (
                <Bot className="w-4 h-4 text-white" />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[80%] lg:max-w-[70%] ${
                msg.role === "user" ? "items-end" : "items-start"
              } flex flex-col gap-2`}
            >
              {/* Text Bubble */}
              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white rounded-tr-sm"
                    : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-sm"
                }`}
              >
                {msg.content}
              </div>

              {/* Task Cards (only for AI messages with tasks) */}
              {msg.role === "ai" && msg.tasks && msg.tasks.length > 0 && (
                <div className="w-full space-y-2">
                  {msg.tasks.map((task, idx) => (
                    <div
                      key={idx}
                      onClick={() => !msg.saved && toggleTask(msg.id, idx)}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        msg.saved
                          ? "bg-white border-gray-100 cursor-default opacity-75"
                          : task.selected
                          ? "bg-blue-50 border-blue-200 cursor-pointer hover:bg-blue-100"
                          : "bg-white border-gray-100 cursor-pointer hover:bg-gray-50"
                      }`}
                    >
                      {/* Checkbox */}
                      {!msg.saved ? (
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                            task.selected
                              ? "bg-blue-500 border-transparent"
                              : "border-gray-300"
                          }`}
                        >
                          {task.selected && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          )}
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}

                      {/* Task Info */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium truncate ${
                            task.selected || msg.saved ? "text-gray-900" : "text-gray-500"
                          }`}
                        >
                          {task.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400">
                            {task.startTime} – {task.endTime} · {task.duration}
                          </span>
                        </div>
                      </div>

                      {/* Category badge */}
                      <span
                        className={`text-xs px-2 py-0.5 rounded-lg font-medium shrink-0 ${
                          categoryColors[task.category] ?? "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {task.category}
                      </span>
                    </div>
                  ))}

                  {/* Save button */}
                  {!msg.saved ? (
                    <button
                      onClick={() => saveTasksFromMessage(msg.id)}
                      disabled={!msg.tasks?.some((t) => t.selected)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors mt-1"
                    >
                      <CalendarPlus className="w-4 h-4" />
                      Simpan ke Jadwal (
                      {msg.tasks?.filter((t) => t.selected).length ?? 0} task)
                    </button>
                  ) : (
                    <div className="flex items-center justify-center gap-2 py-2 bg-emerald-50 rounded-xl text-emerald-600 text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      Tersimpan ke jadwal!
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* AI Typing Indicator */}
        {isTyping && (
          <div className="flex gap-3 flex-row">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-sm">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm border border-gray-100 shadow-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Example Prompts (shown if only initial message) ── */}
      {messages.length === 1 && !isTyping && (
        <div className="px-4 lg:px-6 py-3 bg-white border-t border-gray-100 shrink-0">
          <p className="text-xs text-gray-400 mb-2 font-medium">💡 Coba tanya:</p>
          <div className="flex gap-2 flex-wrap">
            {EXAMPLE_PROMPTS.slice(0, 3).map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="px-3 py-1.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-200 rounded-xl text-xs text-gray-600 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Chat Input ── */}
      <div className="px-4 lg:px-6 py-3 bg-white border-t border-gray-100 shrink-0">
        <div className="flex items-center gap-2 bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-blue-300 focus-within:bg-white transition-all px-4 py-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ceritakan rencanamu..."
            disabled={isTyping}
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim() || isTyping}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shrink-0"
          >
            {isTyping ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-center text-xs text-gray-300 mt-2">
          AI ini menggunakan simulasi • Tekan Enter untuk kirim
        </p>
      </div>
    </div>
  );
}