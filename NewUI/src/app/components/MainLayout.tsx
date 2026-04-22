import { useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  ListTodo,
  Calendar,
  Sparkles,
  LogOut,
  Bell,
  ChevronRight,
} from "lucide-react";
import { useApp } from "../context/AppContext";

const menuItems = [
  {
    path: "/",
    icon: LayoutDashboard,
    label: "Beranda",
    color: "text-blue-500",
    activeBg: "bg-blue-50",
    activeDot: "bg-blue-500",
  },
  {
    path: "/task-manager",
    icon: ListTodo,
    label: "Task",
    color: "text-violet-500",
    activeBg: "bg-violet-50",
    activeDot: "bg-violet-500",
  },
  {
    path: "/schedule",
    icon: Calendar,
    label: "Jadwal",
    color: "text-emerald-500",
    activeBg: "bg-emerald-50",
    activeDot: "bg-emerald-500",
  },
  {
    path: "/ai-generate",
    icon: Sparkles,
    label: "AI",
    color: "text-amber-500",
    activeBg: "bg-amber-50",
    activeDot: "bg-amber-500",
  },
];

const pageLabels: Record<string, string> = {
  "/": "Beranda",
  "/task-manager": "Task Manager",
  "/schedule": "Jadwal",
  "/ai-generate": "AI Scheduler",
};

export function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useApp();

  useEffect(() => {
    if (!user) navigate("/login", { replace: true });
  }, [user, navigate]);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isTaskDetail = location.pathname.startsWith("/task/");
  const currentPageLabel = isTaskDetail
    ? "Detail Task"
    : pageLabels[location.pathname] ?? "AI Scheduler";

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 fixed left-0 top-0 bottom-0 z-40 shadow-sm">
        {/* Logo */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 leading-tight">AI Scheduler</p>
              <p className="text-xs text-gray-400">Personal AI Planner</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-0.5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3 mt-1">
            Menu Utama
          </p>
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group ${
                  active
                    ? `${item.activeBg} ${item.color}`
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 shrink-0 transition-colors ${
                    active ? item.color : "text-gray-400 group-hover:text-gray-600"
                  }`}
                />
                <span className={`text-sm ${active ? "font-semibold" : "font-medium"}`}>
                  {item.label}
                </span>
                {active && (
                  <span
                    className={`ml-auto w-1.5 h-1.5 rounded-full ${item.activeDot}`}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">AI Scheduler</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <Bell className="w-5 h-5 text-gray-500" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              title="Keluar"
            >
              <LogOut className="w-5 h-5 text-gray-500" />
            </button>
            <div className="ml-1 w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Desktop Breadcrumb Header */}
        <header className="hidden lg:flex sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-8 py-4 items-center justify-between shadow-sm">
          <nav className="flex items-center gap-2 text-sm">
            <span className="text-gray-400 font-medium">AI Scheduler</span>
            <ChevronRight className="w-4 h-4 text-gray-300" />
            {isTaskDetail && (
              <>
                <Link
                  to="/task-manager"
                  className="text-gray-400 hover:text-gray-700 transition-colors font-medium"
                >
                  Task Manager
                </Link>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </>
            )}
            <span className="font-semibold text-gray-900">{currentPageLabel}</span>
          </nav>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors relative">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-700">{user.name}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto pb-24 lg:pb-6">
          <div className="max-w-4xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-lg">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center gap-1 flex-1 py-2 relative group"
              >
                {active && (
                  <span
                    className={`absolute top-0.5 w-1 h-1 rounded-full ${item.activeDot}`}
                  />
                )}
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 ${
                    active ? item.activeBg : "group-hover:bg-gray-50"
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 transition-colors duration-200 ${
                      active ? item.color : "text-gray-400 group-hover:text-gray-600"
                    }`}
                  />
                </div>
                <span
                  className={`text-xs transition-colors duration-200 ${
                    active ? `${item.color} font-semibold` : "text-gray-400"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
