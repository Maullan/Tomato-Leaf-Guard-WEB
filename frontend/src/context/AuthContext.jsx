// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useCallback } from "react";
import authService from "../services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // loading saat cek token awal

  // Inisialisasi: cek apakah sudah ada token di localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));

        // Verifikasi token masih valid dengan fetch /me
        try {
          const freshUser = await authService.getMe();
          setUser(freshUser);
          localStorage.setItem("user", JSON.stringify(freshUser));
        } catch (err) {
          // Token expired atau invalid
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  /**
   * Register user baru
   */
  const register = useCallback(async (data) => {
    const newUser = await authService.register(data);
    return newUser;
  }, []);

  /**
   * Login user
   */
  const login = useCallback(async (data) => {
    const result = await authService.login(data);
    setToken(result.access_token);
    setUser(result.user);
    return result;
  }, []);

  /**
   * Logout
   */
  const logout = useCallback(() => {
    authService.logout();
    setToken(null);
    setUser(null);
  }, []);

  /**
   * Update profil user
   */
  const updateProfile = useCallback(async (data) => {
    const updatedUser = await authService.updateProfile(data);
    setUser(updatedUser);
    return updatedUser;
  }, []);

  /**
   * Upload avatar
   */
  const uploadAvatar = useCallback(async (file) => {
    const updatedUser = await authService.uploadAvatar(file);
    setUser(updatedUser);
    return updatedUser;
  }, []);

  /**
   * Refresh user data dari server
   */
  const refreshUser = useCallback(async () => {
    const freshUser = await authService.getMe();
    setUser(freshUser);
    localStorage.setItem("user", JSON.stringify(freshUser));
    return freshUser;
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    register,
    login,
    logout,
    updateProfile,
    uploadAvatar,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
