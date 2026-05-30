import { useState } from "react";
import { Mail, Eye, EyeOff, Loader2 } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage } from "../services/api";
import tomatoBg from "../assets/tomato-bg.jpg";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect ke halaman yang dituju sebelum login, atau ke /diagnosis
  const from = location.state?.from?.pathname || "/diagnosis";

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(""); // clear error saat user mengetik
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validasi client-side
    if (!form.email) return setError("Email tidak boleh kosong");
    if (!form.password) return setError("Password tidak boleh kosong");

    setLoading(true);
    try {
      await login({ email: form.email, password: form.password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center relative"
      style={{ backgroundImage: `url(${tomatoBg})` }}
    >
      {/* OVERLAY */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />

      {/* LOGIN BOX */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 flex flex-col items-center w-full max-w-md px-6"
      >
        {/* TITLE */}
        <h1 className="text-5xl font-bold text-[#355E3B] tracking-tight mb-16">
          Tomato LeafGuard
        </h1>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="w-[400px] mb-4 bg-red-50 border border-red-300 rounded-2xl px-5 py-3">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* EMAIL */}
        <div className="w-[400px] mb-8">
          <label className="text-white text-3xl">Masukan E-mail</label>
          <div className="mt-3 bg-white/20 backdrop-blur-md rounded-full px-6 py-2 flex items-center justify-between border-2 border-transparent focus-within:border-white transition">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              disabled={loading}
              className="bg-transparent outline-none text-white placeholder:text-white/70 text-lg w-full"
              required
            />
            <Mail size={35} className="text-white" />
          </div>
        </div>

        {/* PASSWORD */}
        <div className="w-[400px] mb-6">
          <label className="text-white text-3xl">Masukan Password</label>
          <div className="mt-3 bg-white/20 backdrop-blur-md rounded-full px-6 py-2 flex items-center justify-between border-2 border-transparent focus-within:border-white transition">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              disabled={loading}
              className="bg-transparent outline-none text-white placeholder:text-white/70 text-lg w-full"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-white ml-2 focus:outline-none"
            >
              {showPassword ? <EyeOff size={35} /> : <Eye size={35} />}
            </button>
          </div>
        </div>

        {/* LINKS */}
        <div className="flex flex-col items-center mb-10">
          <p className="text-white text-2xl">
            Belum punya akun?
            <Link
              to="/register"
              className="text-2xl font-bold text-green-900 ml-2 hover:underline"
            >
              Daftar
            </Link>
          </p>
          <Link
            to="/forgot-password"
            className="text-white text-2xl underline mt-4 cursor-pointer hover:text-green-200"
          >
            Lupa Password?
          </Link>
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-[260px] py-3 rounded-full text-xl font-semibold bg-green-600 hover:bg-green-700 hover:scale-105 transition text-white shadow-xl shadow-green-900/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading ? (
            <>
              <Loader2 size={22} className="animate-spin" />
              Masuk...
            </>
          ) : (
            "Masuk"
          )}
        </button>
      </form>
    </div>
  );
}