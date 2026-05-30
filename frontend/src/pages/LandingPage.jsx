import logo from "../assets/logo.png";
import tomatoBg from "../assets/tomato-bg.jpg";
import question from "../assets/question.png";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Camera,
  ClipboardCheck,
  BookOpen,
 Globe,
Mail,
Phone,
Leaf
} from "lucide-react";

export default function LandingPage() {
  return (
    <motion.div
  initial={{ opacity: 0, y: 40 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.7 }}
  className="min-h-screen bg-white"
>
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-16 py-6">

        {/* LOGO */}
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="logo"
             className="w-12 h-12 object-contain"
          />

          <h1 className="text-2xl font-bold text-green-700">
            Tomato LeafGuard
          </h1>
        </div>

        {/* MENU */}
<ul className="flex gap-10 text-green-500 font-medium text-lg">

  <li>
    <Link
      to="/"
      className="hover:text-green-700 transition"
    >
      Home
    </Link>
  </li>

  <li>
    <Link
      to="/diagnosis"
      className="hover:text-green-700 transition"
    >
      Diagnosis
    </Link>
  </li>

  <li>
    <Link
      to="/history"
      className="hover:text-green-700 transition"
    >
      Riwayat
    </Link>
  </li>

</ul>

       {/* BUTTON */}
<div className="flex gap-4">

  <Link
    to="/login"
    className="border border-green-500 px-6 py-2 rounded-full text-green-500 hover:bg-green-50 transition"
  >
    Login
  </Link>

  <Link
    to="/register"
    className="bg-cyan-400 text-white px-6 py-2 rounded-full hover:bg-cyan-500 transition"
  >
    Sign Up
  </Link>

</div>
      </nav>

      {/* HERO SECTION */}
      <section className="flex flex-col items-center justify-center text-center mt-40 px-4">

        <h1 className="text-7xl font-bold text-green-600">
          Tomato LeafGuard
        </h1>

        <p className="text-3xl mt-6 max-w-4xl text-gray-800">
          Diagnosis akurat dalam hitungan detik.
          Hemat biaya pestisida hingga 60%
          dengan targeted treatment.
        </p>

        <Link
      to="/diagnosis"
       className="mt-10 bg-green-500 text-white px-10 py-4 rounded-full text-lg hover:bg-green-600 transition inline-block"
      >
       Mulai Diagnosis Sekarang →
      </Link>

      </section>
{/* LAYANAN KAMI */}
<section
  className="relative min-h-screen bg-cover bg-center flex flex-col items-center justify-center px-10 py-20"
  style={{
    backgroundImage: `linear-gradient(rgba(115, 190, 90, 0.85), rgba(115, 190, 90, 0.85)), url(${tomatoBg})`,
  }}
>

  {/* TITLE */}
  <h1 className="text-7xl font-bold text-white">
    Layanan Kami
  </h1>

  {/* SUBTITLE */}
  <p className="text-white text-2xl text-center mt-6 max-w-4xl">
    Penuh dengan fitur yang membuat perawatan tanaman terasa mudah,
    bukan beban
  </p>

  {/* CARD CONTAINER */}
  <div className="flex gap-10 mt-20 flex-wrap justify-center">

    {/* CARD 1 */}
    <div className="border-4 border-white rounded-[40px] p-8 w-[320px] text-white">

      <Camera size={70} className="mb-6 text-white" />

      <h2 className="text-3xl font-bold">
        Deteksi Penyakit
      </h2>

      <div className="w-full h-[2px] bg-white my-4"></div>

      <p className="text-lg">
        Analisis bertenaga AI mengidentifikasi penyakit,
        hama, dan kekurangan nutrisi dari satu foto
      </p>

    </div>

    {/* CARD 2 */}
    <div className="border-4 border-white rounded-[40px] p-8 w-[320px] text-white">

      <ClipboardCheck size={70} className="mb-6 text-white" />

      <h2 className="text-3xl font-bold">
        Panduan Perawatan
      </h2>

      <div className="w-full h-[2px] bg-white my-4"></div>

      <p className="text-lg">
        Rencana perawatan langkah demi langkah
        dengan pelacakan kemajuan
      </p>

    </div>

    {/* CARD 3 */}
    <div className="border-4 border-white rounded-[40px] p-8 w-[320px] text-white hover:scale-105 transition duration-300">
      <BookOpen size={70} className="mb-6 text-white" />

      <h2 className="text-3xl font-bold">
        Jurnal Penyakit Tomat
      </h2>

      <div className="w-full h-[2px] bg-white my-4"></div>

      <p className="text-lg">
        Lacak kesehatan tanaman Anda dari waktu ke waktu
        dengan foto dan riwayat perawatan
      </p>

    </div>

  </div>

</section>
{/* CARA PENGGUNAAN */}
<section className="bg-[#F3F3F3] py-32 px-20">

  <div className="flex items-center justify-between gap-20 flex-wrap">

    {/* LEFT IMAGE */}
    <div className="flex-1 flex justify-center">
      <img
        src={question}
        alt="question"
        className="w-[450px]"
      />
    </div>

    {/* RIGHT CONTENT */}
    <div className="flex-1">

      <h1 className="text-6xl font-bold text-gray-700 mb-20">
        Cara Penggunaan
      </h1>

      {/* STEP 1 */}
      <div className="flex gap-8 mb-14">

        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-cyan-500 text-white flex items-center justify-center text-xl font-bold">
            1
          </div>

          <div className="w-1 h-28 bg-cyan-500"></div>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-gray-700">
            Ambil foto/Upload Foto
          </h2>

          <p className="text-gray-500 mt-4 text-lg max-w-xl">
            Arahkan kamera ke tanaman apa saja baik yang terlihat sehat,
            layu, atau di antaranya.
          </p>
        </div>

      </div>

      {/* STEP 2 */}
      <div className="flex gap-8 mb-14">

        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-cyan-500 text-white flex items-center justify-center text-xl font-bold">
            2
          </div>

          <div className="w-1 h-28 bg-cyan-500"></div>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-gray-700">
            Dapatkan diagnosis AI
          </h2>

          <p className="text-gray-500 mt-4 text-lg max-w-xl">
            AI menganalisis foto Anda dan mengidentifikasi penyakit,
            kekurangan nutrisi, atau hama.
          </p>
        </div>

      </div>

      {/* STEP 3 */}
      <div className="flex gap-8">

        <div className="w-14 h-14 rounded-full bg-cyan-500 text-white flex items-center justify-center text-xl font-bold">
          3
        </div>

        <div>
          <h2 className="text-3xl font-bold text-gray-700">
            Ikuti rencana perawatan
          </h2>

          <p className="text-gray-500 mt-4 text-lg max-w-xl">
            Terima rekomendasi perawatan dan instruksi langkah demi langkah.
          </p>
        </div>

      </div>

    </div>

  </div>

</section>
{/* FOOTER */}
<footer className="bg-green-600 text-white py-12 px-20">

  <div className="flex justify-between items-center flex-wrap gap-10">

    {/* LOGO */}
    <div className="flex items-center gap-4">

      <img
        src={logo}
        alt="logo"
        className="w-12 h-12"
      />

      <h1 className="text-2xl font-bold">
        Tomato LeafGuard
      </h1>

    </div>

    {/* MENU */}
    <div className="flex gap-10 text-xl">
      <p>Home</p>
      <p>Services</p>
      <p>About Us</p>
    </div>

   {/* SOCIAL */}
<div className="flex gap-4">

  <div className="bg-white text-green-600 w-10 h-10 rounded flex items-center justify-center hover:scale-110 transition">
    <Globe size={20} />
  </div>

  <div className="bg-white text-green-600 w-10 h-10 rounded flex items-center justify-center hover:scale-110 transition">
    <Mail size={20} />
  </div>

  <div className="bg-white text-green-600 w-10 h-10 rounded flex items-center justify-center hover:scale-110 transition">
    <Phone size={20} />
  </div>

  <div className="bg-white text-green-600 w-10 h-10 rounded flex items-center justify-center hover:scale-110 transition">
    <Leaf size={20} />
  </div>

</div>

  </div>

  <div className="w-full h-[1px] bg-white/40 my-10"></div>

  <p className="text-center text-sm">
    © 2026 Tomato LeafGuard
  </p>

</footer>
    </motion.div>
  )
}