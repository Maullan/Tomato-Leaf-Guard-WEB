// src/services/authService.js
import api from "./api";

const authService = {
  /**
   * Register user baru
   * @param {Object} data - { full_name, email, password }
   */
  async register(data) {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  /**
   * Login user
   * @param {Object} data - { email, password }
   * @returns {{ access_token, token_type, user }}
   */
  async login(data) {
    const response = await api.post("/auth/login", data);
    const { access_token, user } = response.data;

    // Simpan ke localStorage
    localStorage.setItem("token", access_token);
    localStorage.setItem("user", JSON.stringify(user));

    return response.data;
  },

  /**
   * Ambil data user yang sedang login
   */
  async getMe() {
    const response = await api.get("/auth/me");
    return response.data;
  },

  /**
   * Update profil user
   * @param {Object} data - { full_name, phone, location }
   */
  async updateProfile(data) {
    const response = await api.put("/auth/profile", data);
    const updatedUser = response.data;

    // Update di localStorage juga
    localStorage.setItem("user", JSON.stringify(updatedUser));

    return updatedUser;
  },

  /**
   * Upload foto profil
   * @param {File} file - file gambar
   */
  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/auth/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const updatedUser = response.data;
    localStorage.setItem("user", JSON.stringify(updatedUser));
    return updatedUser;
  },

  /**
   * Kirim request forgot password
   * @param {string} email
   */
  async forgotPassword(email) {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  /**
   * Reset password dengan token
   * @param {string} token
   * @param {string} newPassword
   */
  async resetPassword(token, newPassword) {
    const response = await api.post("/auth/reset-password", {
      token,
      new_password: newPassword,
    });
    return response.data;
  },

  /**
   * Ambil statistik user
   */
  async getStats() {
    const response = await api.get("/auth/stats");
    return response.data;
  },

  /**
   * Logout — hapus dari localStorage
   */
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    api.post("/auth/logout").catch(() => {}); // Fire and forget
  },

  /**
   * Cek apakah user sudah login
   */
  isAuthenticated() {
    return !!localStorage.getItem("token");
  },

  /**
   * Ambil user dari localStorage
   */
  getStoredUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
};

export default authService;
