import React from "react";
import { FiUsers, FiShield, FiFileText, FiAlertTriangle, FiMail } from "react-icons/fi";

export default function Terms() {
  return (
    <div className="p-6 sm:p-8 bg-gradient-to-br from-[var(--color-white)] to-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-2xl mb-4">
            <FiFileText className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-black)] mb-3">
            Aturan Main BarterKita
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Mari jaga komunitas barter kita tetap seru, aman, dan saling menguntungkan!
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-6 sm:p-8 border border-gray-200/60">
          <div className="prose prose-lg max-w-none">
            {/* Introduction */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 mb-8 border border-blue-200">
              <p className="text-[var(--color-black)] text-lg leading-relaxed text-center">
                🎉 Selamat datang di <span className="font-bold text-[var(--color-primary)]">BarterKita</span>! 
                Dengan bergabung, kamu setuju untuk bermain fair dan menghormati sesama barter enthusiast.
              </p>
            </div>

            {/* Rules Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <FiUsers className="text-green-600 text-lg" />
                  </div>
                  <h3 className="text-lg font-bold text-green-800">Main Sopan Yuk!</h3>
                </div>
                <p className="text-gray-700 text-sm">
                  Hormati sesama barter buddy. No bullying, no hate speech, no toxic behavior. 
                  Kita di sini untuk kolaborasi, bukan konflik!
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FiShield className="text-blue-600 text-lg" />
                  </div>
                  <h3 className="text-lg font-bold text-blue-800">Jujur Itu Keren</h3>
                </div>
                <p className="text-gray-700 text-sm">
                  Deskripsi skill dan penawaran harus sesuai realita. Jangan janji yang 
                  nggak bisa ditepati. Trust is everything in barter world!
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <FiAlertTriangle className="text-purple-600 text-lg" />
                  </div>
                  <h3 className="text-lg font-bold text-purple-800">Keep It Real</h3>
                </div>
                <p className="text-gray-700 text-sm">
                  Barter yang kamu tawarin harus jelas dan bisa dipertanggungjawabkan. 
                  Deal is a deal - kalau udah setuju, tepati komitmen!
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <FiShield className="text-orange-600 text-lg" />
                  </div>
                  <h3 className="text-lg font-bold text-orange-800">Akun = Tanggung Jawab</h3>
                </div>
                <p className="text-gray-700 text-sm">
                  Jaga rahasia akunmu baik-baik. Jangan kasih password ke siapapun, 
                  termasuk pacar yang kamu percaya! 😉
                </p>
              </div>
            </div>

            {/* Consequences */}
            <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6 border border-red-200 mb-8">
              <div className="flex items-center gap-3 mb-3">
                <FiAlertTriangle className="text-red-500 text-xl" />
                <h3 className="text-lg font-bold text-red-800">Heads Up!</h3>
              </div>
              <p className="text-gray-700">
                Kalau ketauan melanggar aturan, konsekuensinya bisa dari 
                <span className="font-semibold"> peringatan</span> sampe 
                <span className="font-semibold"> akun ditutup permanen</span>. 
                Yuk, main fair biar semua happy!
              </p>
            </div>

            {/* Contact */}
            <div className="text-center bg-gradient-to-r from-gray-50 to-slate-100 rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center justify-center gap-2 mb-3">
                <FiMail className="text-[var(--color-secondary)] text-xl" />
                <h3 className="text-lg font-bold text-[var(--color-black)]">Butuh Bantuan?</h3>
              </div>
              <p className="text-gray-600 mb-3">
                Ada pertanyaan atau mau lapor sesuatu? Tim support kita siap bantu!
              </p>
              <a
                href="mailto:support@barterkita.com"
                className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white px-6 py-3 rounded-xl hover:bg-[var(--color-secondary)] transition-all duration-300 font-medium"
              >
                <FiMail className="text-lg" />
                Email Support Kita
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}