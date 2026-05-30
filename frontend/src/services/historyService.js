// src/services/historyService.js
import api from "./api";

const historyService = {
  /**
   * Ambil riwayat diagnosis user
   * @param {number} page - halaman (default 1)
   * @param {number} limit - jumlah per halaman (default 10)
   */
  async getHistory(page = 1, limit = 10) {
    const response = await api.get("/history/", {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Hapus satu riwayat diagnosis
   * @param {string} diagnosisId
   */
  async deleteHistory(diagnosisId) {
    await api.delete(`/history/${diagnosisId}`);
    return true;
  },
};

export default historyService;
