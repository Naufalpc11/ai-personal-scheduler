import { createContext, useContext, useState, ReactNode } from "react";

export interface SubTask {
  id: number;
  title: string;
  completed: boolean;
}

export interface Task {
  id: number;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  duration: string;
  notes: string;
  category: string;
  color: "blue" | "purple" | "amber" | "green" | "red" | "pink";
  subtasks: SubTask[];
}

export interface User {
  name: string;
  email: string;
}

interface AppContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, "id" | "subtasks">) => void;
  updateTask: (id: number, updates: Partial<Omit<Task, "id" | "subtasks">>) => void;
  deleteTask: (id: number) => void;
  addSubtask: (taskId: number, title: string) => void;
  updateSubtask: (taskId: number, subtaskId: number, title: string) => void;
  toggleSubtask: (taskId: number, subtaskId: number) => void;
  deleteSubtask: (taskId: number, subtaskId: number) => void;
  user: User | null;
  login: (name: string, email: string) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const TODAY = "2026-04-21";

const MOCK_TASKS: Task[] = [
  {
    id: 1,
    title: "Kelas Pak Cahyo",
    date: TODAY,
    startTime: "09:00",
    endTime: "11:00",
    duration: "2 jam",
    notes: "Perancangan sistem berbasis AI. Kumpulkan tugas sebelum kelas dimulai.",
    category: "Kelas",
    color: "blue",
    subtasks: [
      { id: 1, title: "Siapkan catatan", completed: true },
      { id: 2, title: "Kumpulkan tugas kelas", completed: false },
    ],
  },
  {
    id: 2,
    title: "Review PR Github",
    date: TODAY,
    startTime: "11:30",
    endTime: "12:30",
    duration: "1 jam",
    notes: "Review pull request dari tim untuk fitur authentication baru.",
    category: "Review",
    color: "purple",
    subtasks: [],
  },
  {
    id: 3,
    title: "Beli Batagor",
    date: TODAY,
    startTime: "13:00",
    endTime: "14:30",
    duration: "1.5 jam",
    notes: "Beli batagor di warung Bu Siti. Jangan lupa uang cash.",
    category: "Personal",
    color: "amber",
    subtasks: [],
  },
  {
    id: 4,
    title: "Sprint Planning Meeting",
    date: TODAY,
    startTime: "15:00",
    endTime: "17:00",
    duration: "2 jam",
    notes: "Sprint planning untuk minggu depan bersama seluruh tim dev.",
    category: "Meeting",
    color: "green",
    subtasks: [
      { id: 1, title: "Siapkan backlog items", completed: false },
      { id: 2, title: "Review velocity sprint lalu", completed: false },
    ],
  },
  {
    id: 5,
    title: "Client Presentation",
    date: "2026-04-22",
    startTime: "10:00",
    endTime: "12:00",
    duration: "2 jam",
    notes: "Presentasi proposal sistem AI ke klien baru dari Jakarta.",
    category: "Meeting",
    color: "green",
    subtasks: [],
  },
  {
    id: 6,
    title: "Belajar TypeScript",
    date: "2026-04-22",
    startTime: "14:00",
    endTime: "16:00",
    duration: "2 jam",
    notes: "Lanjut belajar advanced TypeScript patterns.",
    category: "Belajar",
    color: "blue",
    subtasks: [],
  },
];

function getSavedUser(): User | null {
  try {
    const saved = localStorage.getItem("ai_scheduler_user");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [user, setUser] = useState<User | null>(getSavedUser);

  const addTask = (task: Omit<Task, "id" | "subtasks">) => {
    setTasks((prev) => [...prev, { ...task, id: Date.now(), subtasks: [] }]);
  };

  const updateTask = (id: number, updates: Partial<Omit<Task, "id" | "subtasks">>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTask = (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const addSubtask = (taskId: number, title: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, subtasks: [...t.subtasks, { id: Date.now(), title, completed: false }] }
          : t
      )
    );
  };

  const updateSubtask = (taskId: number, subtaskId: number, title: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subtasks: t.subtasks.map((st) =>
                st.id === subtaskId ? { ...st, title } : st
              ),
            }
          : t
      )
    );
  };

  const toggleSubtask = (taskId: number, subtaskId: number) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subtasks: t.subtasks.map((st) =>
                st.id === subtaskId ? { ...st, completed: !st.completed } : st
              ),
            }
          : t
      )
    );
  };

  const deleteSubtask = (taskId: number, subtaskId: number) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, subtasks: t.subtasks.filter((st) => st.id !== subtaskId) }
          : t
      )
    );
  };

  const login = (name: string, email: string) => {
    const userData = { name, email };
    localStorage.setItem("ai_scheduler_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("ai_scheduler_user");
    setUser(null);
  };

  return (
    <AppContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        deleteTask,
        addSubtask,
        updateSubtask,
        toggleSubtask,
        deleteSubtask,
        user,
        login,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

// Color helpers
export const colorMap = {
  blue: {
    bg: "bg-blue-100",
    border: "border-blue-400",
    text: "text-blue-700",
    dot: "bg-blue-400",
    badge: "bg-blue-500",
    light: "bg-blue-50",
  },
  purple: {
    bg: "bg-purple-100",
    border: "border-purple-400",
    text: "text-purple-700",
    dot: "bg-purple-400",
    badge: "bg-purple-500",
    light: "bg-purple-50",
  },
  amber: {
    bg: "bg-amber-100",
    border: "border-amber-400",
    text: "text-amber-700",
    dot: "bg-amber-400",
    badge: "bg-amber-500",
    light: "bg-amber-50",
  },
  green: {
    bg: "bg-green-100",
    border: "border-green-400",
    text: "text-green-700",
    dot: "bg-green-400",
    badge: "bg-green-500",
    light: "bg-green-50",
  },
  red: {
    bg: "bg-red-100",
    border: "border-red-400",
    text: "text-red-700",
    dot: "bg-red-400",
    badge: "bg-red-500",
    light: "bg-red-50",
  },
  pink: {
    bg: "bg-pink-100",
    border: "border-pink-400",
    text: "text-pink-700",
    dot: "bg-pink-400",
    badge: "bg-pink-500",
    light: "bg-pink-50",
  },
};
