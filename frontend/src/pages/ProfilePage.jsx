import { useState, useEffect, useRef } from "react";
import {
  Mail, Phone, MapPin, Pencil, Leaf, ScanLine, Activity,
  Loader2, Check, X, LogOut, Camera
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import authService from "../services/authService";
import { getErrorMessage } from "../services/api";

const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api/v1", "") || "http://localhost:8000";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, updateProfile, uploadAvatar } = useAuth();
  const fileInputRef = useRef(null);

  const [stats, setStats] = useState({ total_scan: 0, total_diseases: 0, success_rate: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", location: "" });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Populate form dari user data
  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || "",
        phone: user.phone || "",
        location: user.location || "",
      });
    }
  }, [user]);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await authService.getStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  const getAvatarUrl = () => {
    if (!user?.avatar_url) return null;
    if (user.avatar_url.startsWith("http")) return user.avatar_url;
    return `${BASE_URL}${user.avatar_url}`;
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      await uploadAvatar(file);
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    setSaveError("");
    if (!form.full_name.trim()) return setSaveError("Nama tidak boleh kosong");

    setSaving(true);
    try {
      await updateProfile({
        full_name: form.full_name,
        phone: form.phone || null,
        location: form.location || null,
      });
      setIsEditing(false);
    } catch (err) {
      setSaveError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    if (confirm("Yakin ingin logout?")) {
      logout();
      navigate("/login");
    }
  };

  const avatarUrl = getAvatarUrl();

  return (
    <div className="min-h-screen bg-[#F7F8F4] px-8 py-10">

      {/* PROFILE HEADER */}
      <div className="bg-white rounded-[40px] shadow-sm p-10 flex flex-col items-center relative">

        {/* EDIT / SAVE BUTTON */}
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="absolute top-8 right-8 bg-green-500 p-4 rounded-full shadow-md hover:bg-green-600 transition"
          >
            <Pencil size={24} className="text-white" />
          </button>
        ) : (
          <div className="absolute top-8 right-8 flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-green-500 p-4 rounded-full shadow-md hover:bg-green-600 transition flex items-center gap-2 px-5"
            >
              {saving ? <Loader2 size={20} className="animate-spin text-white" /> : <Check size={22} className="text-white" />}
            </button>
            <button
              onClick={() => { setIsEditing(false); setSaveError(""); }}
              className="bg-gray-400 p-4 rounded-full shadow-md hover:bg-gray-500 transition"
            >
              <X size={22} className="text-white" />
            </button>
          </div>
        )}

        {/* PROFILE IMAGE */}
        <div className="relative">
          <div className="w-[150px] h-[150px] rounded-full border-4 border-green-200 overflow-hidden">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-green-500 flex items-center justify-center text-white text-6xl font-bold">
                {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}
            {uploadingAvatar && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Loader2 size={30} className="text-white animate-spin" />
              </div>
            )}
          </div>

          {/* Camera button untuk ganti foto */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleAvatarChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 bg-green-500 p-2 rounded-full border-2 border-white hover:bg-green-600 transition"
          >
            <Camera size={16} className="text-white" />
          </button>
        </div>

        {/* NAME */}
        {isEditing ? (
          <div className="w-full max-w-sm mt-6">
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
              className="text-center text-3xl font-bold text-[#2E4B3A] bg-[#F0F7EE] rounded-2xl px-4 py-2 outline-none border-2 border-green-300 w-full"
              placeholder="Nama lengkap"
            />
            {saveError && <p className="text-red-500 text-sm mt-2 text-center">{saveError}</p>}
          </div>
        ) : (
          <>
            <h1 className="text-5xl font-bold text-[#2E4B3A] mt-6">
              Hallo, {user?.full_name?.split(" ")[0] || "User"} 🌱
            </h1>
            <p className="text-green-600 text-2xl mt-2">Petani Tomat</p>
          </>
        )}
      </div>

      {/* BIODATA CARD */}
      <div className="bg-[#EEF5EA] rounded-[35px] p-8 mt-10 flex flex-col gap-6">

        {/* EMAIL */}
        <div className="flex items-center gap-5">
          <div className="bg-white p-4 rounded-full shrink-0">
            <Mail size={28} className="text-green-600" />
          </div>
          <p className="text-2xl text-gray-700">{user?.email || "-"}</p>
        </div>

        {/* PHONE */}
        <div className="flex items-center gap-5">
          <div className="bg-white p-4 rounded-full shrink-0">
            <Phone size={28} className="text-green-600" />
          </div>
          {isEditing ? (
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              placeholder="Nomor telepon"
              className="text-2xl text-gray-700 bg-white rounded-2xl px-4 py-2 outline-none border-2 border-green-300 flex-1"
            />
          ) : (
            <p className="text-2xl text-gray-700">{user?.phone || "-"}</p>
          )}
        </div>

        {/* LOCATION */}
        <div className="flex items-center gap-5">
          <div className="bg-white p-4 rounded-full shrink-0">
            <MapPin size={28} className="text-green-600" />
          </div>
          {isEditing ? (
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
              placeholder="Lokasi (kota, provinsi)"
              className="text-2xl text-gray-700 bg-white rounded-2xl px-4 py-2 outline-none border-2 border-green-300 flex-1"
            />
          ) : (
            <p className="text-2xl text-gray-700">{user?.location || "-"}</p>
          )}
        </div>
      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-3 gap-6 mt-10">
        <div className="bg-white rounded-3xl p-8 shadow-sm flex flex-col items-center">
          <ScanLine size={40} className="text-green-600" />
          <h1 className="text-5xl font-bold text-[#2E4B3A] mt-4">
            {loadingStats ? <Loader2 size={36} className="animate-spin" /> : stats.total_scan}
          </h1>
          <p className="text-gray-500 text-xl mt-2">Total Scan</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm flex flex-col items-center">
          <Leaf size={40} className="text-green-600" />
          <h1 className="text-5xl font-bold text-[#2E4B3A] mt-4">
            {loadingStats ? <Loader2 size={36} className="animate-spin" /> : stats.total_diseases}
          </h1>
          <p className="text-gray-500 text-xl mt-2">Penyakit</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm flex flex-col items-center">
          <Activity size={40} className="text-green-600" />
          <h1 className="text-5xl font-bold text-[#2E4B3A] mt-4">
            {loadingStats ? <Loader2 size={36} className="animate-spin" /> : `${stats.success_rate}%`}
          </h1>
          <p className="text-gray-500 text-xl mt-2">Keberhasilan</p>
        </div>
      </div>

      {/* DAILY TIPS */}
      <div className="bg-[#DFF3D8] rounded-[35px] p-8 mt-10">
        <h1 className="text-3xl font-bold text-[#2E4B3A]">Tips Hari Ini 🌤️</h1>
        <p className="text-2xl text-gray-700 leading-relaxed mt-4">
          Hindari menyiram daun tomat pada malam hari untuk mencegah pertumbuhan jamur dan bakteri.
        </p>
      </div>

      {/* LOGOUT BUTTON */}
      <button
        onClick={handleLogout}
        className="w-full mt-10 bg-red-50 border-2 border-red-200 text-red-500 hover:bg-red-100 hover:border-red-300 text-2xl font-semibold py-5 rounded-3xl flex items-center justify-center gap-3 transition"
      >
        <LogOut size={28} />
        Keluar dari Akun
      </button>
    </div>
  );
}