import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Sparkles, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useApp } from "../context/AppContext";

export function Register() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok.");
      return;
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    // Mock register — auto login after registration
    login(name, email);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-violet-50 flex flex-col items-center justify-center p-5">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-gray-900 text-2xl font-bold">AI Scheduler</h1>
          <p className="text-gray-500 text-sm mt-1">
            Buat akun dan mulai kelola jadwalmu
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/80 p-7 border border-gray-100">
          <h2 className="text-gray-900 font-bold mb-1">Daftar Akun Baru</h2>
          <p className="text-gray-400 text-sm mb-5">Gratis selamanya!</p>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-500">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama kamu"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition bg-gray-50 focus:bg-white"
                  required
                />
              </div>
            </div>

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
                  placeholder="Min. 6 karakter"
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

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Konfirmasi Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition bg-gray-50 focus:bg-white"
                  required
                />
              </div>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 mt-0.5 rounded border-gray-300 text-blue-500 focus:ring-blue-400"
                required
              />
              <span className="text-sm text-gray-600">
                Saya setuju dengan{" "}
                <button type="button" className="text-blue-500 hover:underline">
                  syarat dan ketentuan
                </button>
              </span>
            </label>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-200 active:scale-95 transition-all"
            >
              Daftar Sekarang
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-sm text-gray-500">
              Sudah punya akun?{" "}
              <Link to="/login" className="text-blue-500 font-semibold hover:underline">
                Masuk sekarang
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