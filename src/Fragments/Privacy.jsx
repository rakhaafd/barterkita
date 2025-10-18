import React from "react";
import { FiShield, FiDatabase, FiEye, FiTrash2, FiMail, FiLock, FiUserCheck } from "react-icons/fi";

export default function Privacy() {
  return (
    <div className="p-6 sm:p-8 bg-gradient-to-br from-[var(--color-white)] to-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-2xl mb-4">
            <FiShield className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-black)] mb-3">
            Privasi Kamu, Prioritas Kita
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Kami jaga data pribadimu seperti kami menjaga data sendiri. Transparan dan aman!
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-6 sm:p-8 border border-gray-200/60">
          <div className="prose prose-lg max-w-none">
            {/* Introduction */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-8 border border-indigo-200">
              <p className="text-[var(--color-black)] text-lg leading-relaxed text-center">
                🔒 Di <span className="font-bold text-[var(--color-primary)]">BarterKita</span>, 
                privasimu adalah hak fundamental. Kami berkomitmen melindungi data pribadimu 
                dengan standar keamanan tertinggi.
              </p>
            </div>

            {/* Data Collection */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-6 flex items-center gap-3">
                <FiDatabase className="text-[var(--color-secondary)]" />
                Data yang Kami Simpan
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-2">📝 Info Profil</h3>
                  <p className="text-sm text-gray-700">
                    Nama, email, skill, dan lokasi untuk mempertemukanmu dengan partner barter yang tepat.
                  </p>
                </div>
                
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-2">💬 Aktivitas Barter</h3>
                  <p className="text-sm text-gray-700">
                    Riwayat tawaran, chat, dan deal untuk memastikan pengalaman barter yang aman.
                  </p>
                </div>
                
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                  <h3 className="font-semibold text-purple-800 mb-2">🔧 Data Teknis</h3>
                  <p className="text-sm text-gray-700">
                    Info device dan browser untuk keamanan akun dan pengalaman yang optimal.
                  </p>
                </div>
                
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <h3 className="font-semibold text-amber-800 mb-2">🎯 Yang Tidak Kami Simpan</h3>
                  <p className="text-sm text-gray-700">
                    Data finansial sensitif, password (terenkripsi), atau info pribadi lain tanpa izin.
                  </p>
                </div>
              </div>
            </div>

            {/* How We Use Data */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-6 flex items-center gap-3">
                <FiEye className="text-[var(--color-secondary)]" />
                Gimana Kami Pakai Data?
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4 bg-gray-50 rounded-xl p-4">
                  <div className="w-8 h-8 bg-[var(--color-primary)] rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Untuk Barter yang Lancar</h3>
                    <p className="text-sm text-gray-600">
                      Menghubungkanmu dengan partner barter yang sesuai skill dan lokasi.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 bg-gray-50 rounded-xl p-4">
                  <div className="w-8 h-8 bg-[var(--color-primary)] rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Untuk Keamanan</h3>
                    <p className="text-sm text-gray-600">
                      Mendeteksi dan mencegah aktivitas mencurigakan atau penyalahgunaan.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 bg-gray-50 rounded-xl p-4">
                  <div className="w-8 h-8 bg-[var(--color-primary)] rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Untuk Pengembangan</h3>
                    <p className="text-sm text-gray-600">
                      Memperbaiki fitur dan membuat BarterKita makin keren buat kamu!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security & Rights */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200">
                <div className="flex items-center gap-3 mb-3">
                  <FiLock className="text-emerald-600 text-xl" />
                  <h3 className="text-lg font-bold text-emerald-800">Keamanan Level Up! 🚀</h3>
                </div>
                <p className="text-gray-700 text-sm">
                  Data kamu dilindungi dengan enkripsi canggih. Kayak brankas digital, 
                  aman dari tangan-tangan jahil!
                </p>
              </div>

              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-200">
                <div className="flex items-center gap-3 mb-3">
                  <FiUserCheck className="text-cyan-600 text-xl" />
                  <h3 className="text-lg font-bold text-cyan-800">Hak Kamu Sepenuhnya</h3>
                </div>
                <p className="text-gray-700 text-sm">
                  Bisa lihat, edit, atau hapus data pribadi kapan aja. Mau tutup akun? 
                  Tinggal klik, kami proses!
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="text-center bg-gradient-to-r from-slate-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center justify-center gap-2 mb-3">
                <FiMail className="text-[var(--color-secondary)] text-xl" />
                <h3 className="text-lg font-bold text-[var(--color-black)]">Pertanyaan Privasi?</h3>
              </div>
              <p className="text-gray-600 mb-3">
                Khawatir tentang data kamu? Tim privacy kita siap jelasin dengan transparan!
              </p>
              <a
                href="mailto:privacy@barterkita.com"
                className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white px-6 py-3 rounded-xl hover:bg-[var(--color-secondary)] transition-all duration-300 font-medium"
              >
                <FiMail className="text-lg" />
                Hubungi Tim Privasi
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}