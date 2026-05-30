// src/services/diagnosisService.js
import api from "./api";

const diagnosisService = {
  /**
   * Upload gambar daun dan dapatkan hasil diagnosis AI
   * @param {File} imageFile - file gambar daun tomat
   * @param {Function} onProgress - callback untuk progress upload (optional)
   */
  async diagnose(imageFile, onProgress) {
    const formData = new FormData();
    formData.append("file", imageFile);

    const response = await api.post("/diagnosis/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });

    return response.data;
  },

  /**
   * Ambil detail satu diagnosis
   * @param {string} diagnosisId
   */
  async getDiagnosis(diagnosisId) {
    const response = await api.get(`/diagnosis/${diagnosisId}`);
    return response.data;
  },

  /**
   * Helper: konversi nilai severity menjadi label
   */
  getSeverityLabel(severityPercent) {
    if (severityPercent === null || severityPercent === undefined) return "Tidak Diketahui";
    if (severityPercent < 25) return "Rendah";
    if (severityPercent < 60) return "Sedang";
    return "Tinggi";
  },

  /**
   * Helper: konversi severity ke warna Tailwind
   */
  getSeverityColor(severityPercent) {
    if (severityPercent === null || severityPercent === undefined) return "gray";
    if (severityPercent < 25) return "green";
    if (severityPercent < 60) return "yellow";
    return "red";
  },

  /**
   * Helper: format URL gambar
   */
  getImageUrl(imagePath) {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api/v1", "") || "http://localhost:8000";
    return `${BASE_URL}${imagePath}`;
  },
};

export default diagnosisService;
