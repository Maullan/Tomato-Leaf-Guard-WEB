import { useState } from "react";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage } from "../services/api";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const validate = () => {
    if (!form.full_name.trim()) return "Nama lengkap tidak boleh kosong";
    if (!form.email) return "Email tidak boleh kosong";
    if (form.password.length < 8) return "Password minimal 8 karakter";
    if (form.password !== form.confirmPassword) return "Konfirmasi password tidak cocok";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) return setError(validationError);

    setLoading(true);
    try {
      await register({
        full_name: form.full_name,
        email: form.email,
        password: form.password,
      });
      setSuccess(true);
      // Redirect ke login setelah 2 detik
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F4] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-6xl bg-white rounded-[40px] overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-2">

        {/* LEFT SIDE */}
        <div className="bg-gradient-to-b from-green-600 to-green-700 p-14 flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center gap-4 mb-10">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-4xl">
                🌱
              </div>
              <div>
                <h1 className="text-white text-4xl font-bold">TomatoCare</h1>
                <p className="text-green-100 text-lg mt-1">Smart AI Plant Diagnosis</p>
              </div>
            </div>

            <h2 className="text-white text-6xl font-bold leading-tight max-w-xl">
              Rawat tanaman tomat lebih mudah bersama AI.
            </h2>

            <p className="text-green-100 text-2xl mt-8 leading-relaxed max-w-2xl">
              Analisis penyakit daun, pantau riwayat tanaman, dan dapatkan rekomendasi perawatan terbaik secara real-time.
            </p>
          </div>

          <div className="flex gap-6 mt-16 flex-wrap">
            <div className="bg-white/15 backdrop-blur-md px-8 py-5 rounded-3xl">
              <h3 className="text-white text-4xl font-bold">98%</h3>
              <p className="text-green-100 mt-2 text-lg">Akurasi Deteksi</p>
            </div>
            <div className="bg-white/15 backdrop-blur-md px-8 py-5 rounded-3xl">
              <h3 className="text-white text-4xl font-bold">24/7</h3>
              <p className="text-green-100 mt-2 text-lg">Monitoring Tanaman</p>
            </div>
          </div>

          <div className="absolute -bottom-24 -right-24 w-[260px] h-[260px] rounded-full bg-white/10" />
          <div className="absolute top-10 right-10 w-[120px] h-[120px] rounded-full bg-white/10" />
        </div>

        {/* RIGHT SIDE */}
        <div className="p-12 lg:p-16 flex flex-col justify-center">
          {success ? (
            <div className="flex flex-col items-center text-center gap-6">
              <CheckCircle2 size={80} className="text-green-500" />
              <h2 className="text-4xl font-bold text-gray-800">Berhasil Daftar!</h2>
              <p className="text-gray-500 text-xl">
                Akun kamu berhasil dibuat. Mengarahkan ke halaman login...
              </p>
            </div>
          ) : (
            <>
              <div className="mb-10">
                <h2 className="text-5xl font-bold text-gray-800">Buat Akun</h2>
                <p className="text-gray-500 text-xl mt-4 leading-relaxed">
                  Daftar untuk mulai memantau kesehatan tanaman tomatmu.
                </p>
              </div>

              {/* ERROR */}
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl px-5 py-3">
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* NAMA */}
                <div>
                  <label className="text-gray-700 text-lg font-medium block mb-3">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    placeholder="Masukkan nama lengkap"
                    value={form.full_name}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full bg-[#F5F7F3] rounded-2xl px-6 py-5 text-lg outline-none border-2 border-transparent focus:border-green-500 transition"
                    required
                  />
                </div>

                {/* EMAIL */}
                <div>
                  <label className="text-gray-700 text-lg font-medium block mb-3">Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Masukkan email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full bg-[#F5F7F3] rounded-2xl px-6 py-5 text-lg outline-none border-2 border-transparent focus:border-green-500 transition"
                    required
                  />
                </div>

                {/* PASSWORD */}
                <div>
                  <label className="text-gray-700 text-lg font-medium block mb-3">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Minimal 8 karakter"
                      value={form.password}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full bg-[#F5F7F3] rounded-2xl px-6 py-5 pr-14 text-lg outline-none border-2 border-transparent focus:border-green-500 transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                    </button>
                  </div>
                </div>

                {/* KONFIRMASI PASSWORD */}
                <div>
                  <label className="text-gray-700 text-lg font-medium block mb-3">
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Masukkan ulang password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      disabled={loading}
                      className={`w-full bg-[#F5F7F3] rounded-2xl px-6 py-5 pr-14 text-lg outline-none border-2 transition ${
                        form.confirmPassword && form.password !== form.confirmPassword
                          ? "border-red-400"
                          : "border-transparent focus:border-green-500"
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showConfirm ? <EyeOff size={24} /> : <Eye size={24} />}
                    </button>
                  </div>
                  {form.confirmPassword && form.password !== form.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1 ml-2">Password tidak cocok</p>
                  )}
                </div>

                {/* BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 transition text-white text-2xl font-semibold py-5 rounded-2xl mt-4 shadow-lg shadow-green-200 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={26} className="animate-spin" />
                      Mendaftar...
                    </>
                  ) : (
                    "Daftar Sekarang"
                  )}
                </button>
              </form>

              {/* LOGIN */}
              <div className="mt-10 text-center">
                <p className="text-gray-500 text-lg">
                  Sudah punya akun?
                  <Link to="/login" className="text-green-600 font-semibold ml-2 hover:underline">
                    Masuk
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
