import { useState, useRef } from "react";
import { ArrowLeft, Camera, ImagePlus, Info, Sparkles, X, Loader2, AlertCircle } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/logo.png";
import diagnosisService from "../services/diagnosisService";
import { getErrorMessage } from "../services/api";

export default function DiagnosisPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [selectedFiles, setSelectedFiles] = useState([]); // File objects untuk upload
  const [previewUrls, setPreviewUrls] = useState([]);      // URL preview lokal
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [results, setResults] = useState([]); // Hasil diagnosis dari server

  const handleFiles = (files) => {
    const validFiles = Array.from(files).filter((f) => {
      const ext = f.name.split(".").pop().toLowerCase();
      return ["jpg", "jpeg", "png", "webp"].includes(ext) && f.size <= 10 * 1024 * 1024;
    });

    if (validFiles.length !== files.length) {
      setError("Beberapa file tidak valid. Gunakan JPG/PNG/WEBP maks 10MB.");
    }

    const urls = validFiles.map((f) => URL.createObjectURL(f));
    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setPreviewUrls((prev) => [...prev, ...urls]);
    setError("");
    setResults([]);
  };

  const removeFile = (index) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    setResults([]);
  };

  const clearAll = () => {
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setSelectedFiles([]);
    setPreviewUrls([]);
    setResults([]);
    setError("");
  };

  const handleAnalyze = async () => {
    if (selectedFiles.length === 0) {
      setError("Pilih minimal satu gambar daun tomat terlebih dahulu.");
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);
    const newResults = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      setUploadProgress(0);
      try {
        const result = await diagnosisService.diagnose(
          selectedFiles[i],
          (progress) => setUploadProgress(progress)
        );
        newResults.push({ ...result, previewUrl: previewUrls[i] });
      } catch (err) {
        newResults.push({
          error: getErrorMessage(err),
          previewUrl: previewUrls[i],
          filename: selectedFiles[i].name,
        });
      }
    }

    setResults(newResults);
    setLoading(false);

    // Jika hanya 1 gambar dan berhasil, bisa langsung navigate ke solution
    if (newResults.length === 1 && !newResults[0].error) {
      // Simpan dulu hasil, tidak langsung navigate agar user bisa lihat
    }
  };

  const goToSolution = (diagnosis) => {
    navigate("/solution", { state: { diagnosis } });
  };

  const getSeverityBadge = (severity) => {
    const label = diagnosisService.getSeverityLabel(severity);
    const colors = {
      Rendah: "bg-lime-100 text-lime-700",
      Sedang: "bg-yellow-100 text-yellow-700",
      Tinggi: "bg-red-100 text-red-600",
      "Tidak Diketahui": "bg-gray-100 text-gray-600",
    };
    return { label, className: colors[label] || colors["Tidak Diketahui"] };
  };

  return (
    <>
      <div className="min-h-screen bg-[#F7F8F4] flex flex-col">

        {/* HEADER */}
        <div className="flex items-start justify-between p-8">
          <div className="flex gap-4">
            <Link to="/">
              <ArrowLeft size={40} className="text-green-800 cursor-pointer hover:text-green-600 transition" />
            </Link>
            <div>
              <h1 className="text-3xl font-semibold text-gray-800">Diagnosis Daun</h1>
              <p className="text-green-500 text-sm">
                Unggah satu atau lebih gambar daun tomat untuk dianalisis oleh AI
              </p>
            </div>
          </div>
          <img src={logo} alt="logo" className="w-16 h-16 object-contain" />
        </div>

        {/* ERROR GLOBAL */}
        {error && (
          <div className="mx-8 mb-4 bg-red-50 border border-red-200 rounded-2xl px-6 py-4 flex items-center gap-3">
            <AlertCircle size={22} className="text-red-500 shrink-0" />
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* UPLOAD AREA */}
        <input
          type="file"
          accept="image/*"
          multiple
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div
          onClick={() => fileInputRef.current.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
          className="mx-8 bg-[#EAF1E7] rounded-[40px] py-20 flex flex-col items-center justify-center border-2 border-dashed border-green-300 cursor-pointer hover:border-green-500 transition"
        >
          <h2 className="text-3xl text-gray-700">Seret gambar ke sini</h2>
          <p className="text-green-500 text-xl mt-2">atau klik untuk unggah</p>
          <div className="mt-6 bg-[#DCE9D8] px-8 py-3 rounded-xl text-gray-700">
            JPG, PNG, WEBP • Maks 10 MB/gambar
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-center gap-40 mt-10">
          <div className="flex flex-col items-center cursor-pointer" onClick={() => fileInputRef.current.click()}>
            <div className="bg-white shadow-md p-6 rounded-2xl hover:shadow-lg transition">
              <Camera size={45} className="text-green-600" />
            </div>
            <p className="mt-3 text-gray-700">Ambil Foto</p>
          </div>
          <div className="flex flex-col items-center cursor-pointer" onClick={() => fileInputRef.current.click()}>
            <div className="bg-white shadow-md p-6 rounded-2xl hover:shadow-lg transition">
              <ImagePlus size={45} className="text-green-600" />
            </div>
            <p className="mt-3 text-gray-700">Pilih dari Galeri</p>
          </div>
        </div>

        {/* IMAGE PREVIEW SECTION */}
        {previewUrls.length > 0 && (
          <div className="px-10 mt-14">
            <div className="flex justify-between items-center">
              <p className="text-2xl text-gray-700">
                Gambar yang diunggah ({previewUrls.length}/10)
              </p>
              <p className="text-red-500 cursor-pointer hover:underline" onClick={clearAll}>
                Hapus semua
              </p>
            </div>

            <div className="flex justify-center gap-8 mt-8 flex-wrap">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`leaf-${index}`}
                    className="w-[160px] h-[200px] object-cover rounded-2xl shadow-md"
                  />
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>

            {/* TIPS */}
            <div className="mx-0 mt-10 bg-[#EAF1E7] rounded-2xl p-6 flex items-center gap-4">
              <Info size={35} className="text-green-600 shrink-0" />
              <p className="text-gray-700 text-lg">
                Tips terbaik untuk hasil akurat: Pastikan gambar jelas, fokus pada daun, dan pencahayaan cukup baik.
              </p>
            </div>

            {/* LOADING PROGRESS */}
            {loading && (
              <div className="mt-8 bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <Loader2 size={24} className="text-green-600 animate-spin" />
                  <p className="text-gray-700 font-medium">Menganalisis gambar dengan AI...</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-gray-500 text-sm mt-2 text-right">{uploadProgress}%</p>
              </div>
            )}

            {/* ANALYZE BUTTON */}
            <div className="mt-8">
              <button
                onClick={handleAnalyze}
                disabled={loading || selectedFiles.length === 0}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition text-white text-3xl py-6 flex items-center justify-center gap-4 rounded-2xl"
              >
                {loading ? (
                  <>
                    <Loader2 size={35} className="animate-spin" />
                    Menganalisis...
                  </>
                ) : (
                  <>
                    <Sparkles size={35} />
                    Analisis Sekarang ({selectedFiles.length} gambar)
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* HASIL ANALISIS */}
        {results.length > 0 && (
          <div className="w-full px-10 mt-20 mb-20">
            <div className="flex justify-between items-center mb-10">
              <h1 className="text-4xl font-semibold text-gray-800">Hasil Analisis</h1>
              <Link to="/history" className="bg-[#EEF5EA] text-green-500 px-8 py-3 rounded-xl hover:bg-green-100 transition">
                Lihat History
              </Link>
            </div>

            <div className="flex flex-col gap-8 w-full">
              {results.map((result, index) => {
                if (result.error) {
                  return (
                    <div key={index} className="bg-red-50 rounded-3xl border border-red-200 p-8 flex gap-8 items-center">
                      <img src={result.previewUrl} alt="leaf" className="w-[120px] h-[150px] object-cover rounded-2xl" />
                      <div>
                        <p className="text-red-600 font-semibold text-xl">Gagal menganalisis</p>
                        <p className="text-red-500 mt-2">{result.error}</p>
                      </div>
                    </div>
                  );
                }

                const severity = getSeverityBadge(result.severity_percent);
                const imageUrl = diagnosisService.getImageUrl(result.image_path);

                return (
                  <div key={result.id || index} className="bg-white rounded-3xl border border-gray-200 p-8 flex gap-8 items-start shadow-sm">
                    <img
                      src={imageUrl || result.previewUrl}
                      alt="leaf"
                      className="w-[160px] h-[190px] object-cover rounded-2xl"
                    />

                    <div className="flex-1 grid grid-cols-2 gap-8">
                      {/* LEFT */}
                      <div>
                        <h2 className="text-3xl font-semibold text-gray-700">
                          {index + 1}. {result.disease?.display_name || "Tidak Dikenali"}
                        </h2>

                        <div className="flex justify-between items-center mt-6">
                          <p className="text-gray-400 text-lg">Keparahan</p>
                          <span className={`px-4 py-1 rounded-lg text-base font-medium ${severity.className}`}>
                            {severity.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex-1 bg-gray-200 h-4 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                severity.label === "Tinggi" ? "bg-red-500"
                                : severity.label === "Sedang" ? "bg-yellow-500"
                                : severity.label === "Tidak Diketahui" ? "bg-gray-400"
                                : "bg-green-500"
                              }`}
                              style={{ width: `${result.severity_percent ?? 0}%` }}
                            />
                          </div>
                          <span className="text-gray-500 text-lg">
                            {result.severity_percent === null || result.severity_percent === undefined
                              ? "-"
                              : `${result.severity_percent.toFixed(0)}%`}
                          </span>
                        </div>

                        <div className="flex justify-between items-center mt-6">
                          <p className="text-gray-400 text-lg">Confidence</p>
                          <span className="text-gray-500 text-lg">
                            {((result.confidence_score || 0) * 100).toFixed(0)}%
                          </span>
                        </div>

                        {result.disease && (
                          <button
                            onClick={() => goToSolution(result)}
                            className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl text-lg transition"
                          >
                            Lihat Solusi →
                          </button>
                        )}
                      </div>

                      {/* RIGHT */}
                      <div className="bg-[#F7FAF5] rounded-2xl p-6 border border-[#E3E8DF]">
                        <h3 className="text-xl font-semibold text-gray-700 mb-4">
                          Tentang Penyakit
                        </h3>
                        <p className="text-gray-500 leading-relaxed text-lg">
                          {result.disease?.description || result.notes || "Tidak ada deskripsi tersedia."}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {previewUrls.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-16 text-gray-400">
            <ImagePlus size={80} className="mb-4 opacity-30" />
            <p className="text-xl">Belum ada gambar yang dipilih</p>
          </div>
        )}
      </div>
    </>
  );
}
