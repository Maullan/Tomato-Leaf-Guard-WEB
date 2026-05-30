import { useState, useEffect } from "react";
import { Bell, Search, Trash2, Loader2, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import historyService from "../services/historyService";
import diagnosisService from "../services/diagnosisService";
import { getErrorMessage } from "../services/api";

const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api/v1", "") || "http://localhost:8000";

export default function HistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await historyService.getHistory(1, 50);
      setHistory(data);
      setFilteredHistory(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Filter berdasarkan search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredHistory(history);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredHistory(
        history.filter(
          (item) =>
            item.disease?.display_name?.toLowerCase().includes(q) ||
            item.disease?.class_name?.toLowerCase().includes(q) ||
            new Date(item.diagnosed_at).toLocaleDateString("id-ID").includes(q)
        )
      );
    }
  }, [searchQuery, history]);

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus riwayat ini?")) return;
    setDeletingId(id);
    try {
      await historyService.deleteHistory(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getAvatarUrl = () => {
    if (!user?.avatar_url) return null;
    if (user.avatar_url.startsWith("http")) return user.avatar_url;
    return `${BASE_URL}${user.avatar_url}`;
  };

  const avatarUrl = getAvatarUrl();

  return (
    <div className="min-h-screen bg-[#F7F8F4]">

      {/* HEADER */}
      <div className="bg-[#EEF5EA] px-8 py-5 flex justify-between items-center">
        <Link to="/profile" className="flex items-center gap-4 cursor-pointer">
          {avatarUrl ? (
            <img src={avatarUrl} alt="profile" className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white text-2xl font-bold">
              {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
            </div>
          )}
          <div>
            <h1 className="text-4xl font-semibold text-gray-800">
              Hallo, {user?.full_name?.split(" ")[0] || "User"} 👋
            </h1>
            <p className="text-gray-500 text-lg">Semua riwayat tanamanmu ada di sini</p>
          </div>
        </Link>

        <button
          onClick={() => alert("Fitur notifikasi segera hadir!")}
          className="bg-white p-4 rounded-full shadow-sm cursor-pointer hover:shadow-md transition"
        >
          <Bell size={28} className="text-gray-700" />
        </button>
      </div>

      {/* SEARCH */}
      <div className="px-8 mt-8">
        <div className="bg-[#EEF5EA] rounded-3xl px-6 py-5 flex items-center gap-4">
          <Search size={35} className="text-gray-500 shrink-0" />
          <input
            type="text"
            placeholder="Cari riwayat tanaman..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none text-2xl placeholder:text-gray-400 w-full"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={50} className="text-green-500 animate-spin" />
            <p className="text-gray-500 text-xl">Memuat riwayat...</p>
          </div>
        </div>
      )}

      {/* ERROR */}
      {error && !loading && (
        <div className="mx-8 mt-8 bg-red-50 border border-red-200 rounded-2xl px-6 py-4 flex items-center gap-3">
          <AlertCircle size={24} className="text-red-500 shrink-0" />
          <div>
            <p className="text-red-600 font-medium">{error}</p>
            <button onClick={fetchHistory} className="text-red-500 underline text-sm mt-1">
              Coba lagi
            </button>
          </div>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && !error && filteredHistory.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-6">
          <div className="text-8xl">🌱</div>
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-gray-700">
              {searchQuery ? "Tidak ditemukan" : "Belum ada riwayat"}
            </h2>
            <p className="text-gray-500 text-xl mt-3">
              {searchQuery
                ? `Tidak ada hasil untuk "${searchQuery}"`
                : "Mulai diagnosis pertamamu sekarang!"}
            </p>
          </div>
          {!searchQuery && (
            <Link
              to="/diagnosis"
              className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-2xl text-xl font-semibold transition"
            >
              Mulai Diagnosis →
            </Link>
          )}
        </div>
      )}

      {/* HISTORY LIST */}
      {!loading && !error && filteredHistory.length > 0 && (
        <div className="px-8 py-10 flex flex-col gap-8">
          <p className="text-gray-500 text-lg">
            {filteredHistory.length} riwayat ditemukan
          </p>

          {filteredHistory.map((item) => {
            const imageUrl = diagnosisService.getImageUrl(item.image_path);
            const severity = diagnosisService.getSeverityLabel(item.severity_percent);

            return (
              <div
                key={item.id}
                className="flex gap-8 items-start bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer"
                onClick={() => navigate("/solution", { state: { diagnosis: item } })}
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="leaf"
                    className="w-[140px] h-[140px] rounded-2xl object-cover shrink-0"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                ) : (
                  <div className="w-[140px] h-[140px] rounded-2xl bg-green-100 flex items-center justify-center shrink-0">
                    <span className="text-5xl">🍃</span>
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-800">
                        {formatDate(item.diagnosed_at)}
                      </h2>
                      <p className="text-2xl font-bold text-green-700 mt-1">
                        {item.disease?.display_name || "Tidak Dikenali"}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      disabled={deletingId === item.id}
                      className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-xl transition"
                    >
                      {deletingId === item.id
                        ? <Loader2 size={22} className="animate-spin" />
                        : <Trash2 size={22} />
                      }
                    </button>
                  </div>

                  <p className="text-xl text-gray-600 mt-3 leading-relaxed">
                    {item.disease?.description?.substring(0, 120) || "Tidak ada deskripsi"}
                    {item.disease?.description?.length > 120 ? "..." : ""}
                  </p>

                  <div className="flex gap-4 mt-4 flex-wrap">
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      severity === "Rendah" ? "bg-lime-100 text-lime-700"
                      : severity === "Sedang" ? "bg-yellow-100 text-yellow-700"
                      : severity === "Tinggi" ? "bg-red-100 text-red-600"
                      : "bg-gray-100 text-gray-600"
                    }`}>
                      Keparahan: {severity}
                    </span>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium">
                      Confidence: {((item.confidence_score || 0) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}