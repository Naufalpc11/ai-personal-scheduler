import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Sparkles, Mail, Lock, Eye, EyeOff, CalendarCheck, BrainCircuit, Zap } from "lucide-react";
import { useApp } from "../context/AppContext";

export function Login() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Email dan password harus diisi.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      const name = email.split("@")[0];
      const displayName = name.charAt(0).toUpperCase() + name.slice(1);
      login(displayName, email);
      navigate("/");
    }, 600);
  };

  const features = [
    { icon: BrainCircuit, color: "text-blue-500", bg: "bg-blue-50", label: "AI Cerdas" },
    { icon: CalendarCheck, color: "text-emerald-500", bg: "bg-emerald-50", label: "Jadwal Otomatis" },
    { icon: Zap, color: "text-amber-500", bg: "bg-amber-50", label: "Super Cepat" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-violet-50 flex items-center justify-center p-5">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-gray-900 text-2xl font-bold">AI Scheduler</h1>
          <p className="text-gray-500 text-sm mt-1">
            Kelola jadwalmu dengan kecerdasan buatan
          </p>

          {/* Feature badges */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {features.map((f, i) => (
              <div
                key={i}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 ${f.bg} rounded-xl`}
              >
                <f.icon className={`w-3.5 h-3.5 ${f.color}`} />
                <span className={`text-xs font-medium ${f.color}`}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/80 p-7 border border-gray-100">
          <h2 className="text-gray-900 font-bold mb-1">Masuk</h2>
          <p className="text-gray-400 text-sm mb-5">Selamat datang kembali!</p>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-500">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition bg-gray-50 focus:bg-white"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition bg-gray-50 focus:bg-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-400"
                />
                <span className="text-sm text-gray-600">Ingat saya</span>
              </label>
              <button type="button" className="text-sm text-blue-500 hover:text-blue-600 hover:underline">
                Lupa password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-200 active:scale-95 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-sm text-gray-500">
              Belum punya akun?{" "}
              <Link
                to="/register"
                className="text-blue-500 font-semibold hover:underline"
              >
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-300 mt-6">
          © 2026 AI Scheduler. All rights reserved.
        </p>
      </div>
    </div>
  );
}
