import { useState } from "react";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import authService from "../services/authService";
import { getErrorMessage } from "../services/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resetToken, setResetToken] = useState(""); // hanya untuk demo

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) return setError("Email tidak boleh kosong");

    setLoading(true);
    try {
      const data = await authService.forgotPassword(email);
      setSuccess(true);
      // Di production hapus ini — hanya untuk demo lokal
      if (data.reset_token) {
        setResetToken(data.reset_token);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F4] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-5xl bg-white rounded-[40px] overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-2">

        {/* LEFT SIDE */}
        <div className="bg-gradient-to-b from-green-600 to-green-700 p-14 flex flex-col justify-between relative overflow-hidden">
          <div>
            <Link
              to="/login"
              className="flex items-center gap-3 text-white text-xl mb-10 hover:opacity-80 transition"
            >
              <ArrowLeft size={24} />
              Kembali ke Login
            </Link>

            <div className="w-24 h-24 rounded-3xl bg-white/20 flex items-center justify-center text-5xl mb-10">
              🔐
            </div>

            <h1 className="text-white text-6xl font-bold leading-tight max-w-xl">
              Lupa Password?
            </h1>

            <p className="text-green-100 text-2xl mt-8 leading-relaxed max-w-xl">
              Jangan khawatir. Masukkan email akunmu dan kami akan mengirimkan link untuk reset password.
            </p>
          </div>

          <div className="bg-white/15 backdrop-blur-md rounded-3xl p-8 mt-16">
            <h3 className="text-white text-3xl font-bold mb-3">Keamanan Akun</h3>
            <p className="text-green-100 text-lg leading-relaxed">
              Pastikan email yang digunakan aktif agar proses pemulihan akun berjalan lancar.
            </p>
          </div>

          <div className="absolute -bottom-24 -right-24 w-[260px] h-[260px] rounded-full bg-white/10" />
          <div className="absolute top-10 right-10 w-[120px] h-[120px] rounded-full bg-white/10" />
        </div>

        {/* RIGHT SIDE */}
        <div className="p-12 lg:p-16 flex flex-col justify-center">
          {success ? (
            <div className="flex flex-col items-center text-center gap-6">
              <CheckCircle2 size={80} className="text-green-500" />
              <h2 className="text-4xl font-bold text-gray-800">Email Terkirim!</h2>
              <p className="text-gray-500 text-xl leading-relaxed">
                Instruksi reset password telah dikirim ke <strong>{email}</strong>.
                Periksa inbox atau folder spam kamu.
              </p>

              {/* Demo only — tampilkan token untuk testing */}
              {resetToken && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 w-full text-left">
                  <p className="text-yellow-700 text-sm font-semibold mb-1">
                    🔧 Token Reset (Demo/Testing):
                  </p>
                  <p className="text-xs font-mono text-gray-600 break-all">{resetToken}</p>
                  <p className="text-xs text-yellow-600 mt-2">
                    Di production, token ini dikirim via email. Hapus bagian ini.
                  </p>
                </div>
              )}

              <Link
                to="/login"
                className="text-green-600 font-semibold text-lg hover:underline"
              >
                Kembali ke Login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-10">
                <h2 className="text-5xl font-bold text-gray-800">Reset Password</h2>
                <p className="text-gray-500 text-xl mt-4 leading-relaxed">
                  Kami akan mengirimkan instruksi reset password ke email kamu.
                </p>
              </div>

              {/* ERROR */}
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl px-5 py-3">
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* EMAIL INPUT */}
                <div>
                  <label className="text-gray-700 text-lg font-medium block mb-3">Email</label>
                  <div className="flex items-center bg-[#F5F7F3] rounded-2xl px-6 py-5 border-2 border-transparent focus-within:border-green-500 transition">
                    <Mail size={24} className="text-green-600" />
                    <input
                      type="email"
                      placeholder="Masukkan email akun"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      disabled={loading}
                      className="bg-transparent outline-none w-full ml-4 text-lg"
                      required
                    />
                  </div>
                </div>

                {/* BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 transition text-white text-2xl font-semibold py-5 rounded-2xl mt-10 shadow-lg shadow-green-200 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={26} className="animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    "Kirim Link Reset"
                  )}
                </button>
              </form>

              {/* LOGIN */}
              <div className="mt-10 text-center">
                <p className="text-gray-500 text-lg">
                  Ingat password?
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
