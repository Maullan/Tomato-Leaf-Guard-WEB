// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * ProtectedRoute — hanya bisa diakses jika sudah login.
 * Jika belum login, redirect ke /login dengan menyimpan path asal.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Tampilkan loading spinner saat pengecekan token awal
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8F4] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 text-lg">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Simpan path yang dituju agar setelah login bisa redirect ke sana
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
