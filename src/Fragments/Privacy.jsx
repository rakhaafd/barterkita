import React from "react";

export default function Privacy() {
  return (
    <div className="p-8 bg-[var(--color-white)] min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-[var(--color-black)]">
        Kebijakan Privasi
      </h1>
      <p className="text-[var(--color-black)] mb-4 leading-relaxed">
        Di BarterKita, kami menghormati privasi Anda dan berkomitmen untuk melindungi data pribadi yang Anda berikan saat menggunakan platform kami. Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda.
      </p>

      <h2 className="text-xl font-semibold text-[var(--color-primary)] mb-3">
        Informasi yang Kami Kumpulkan
      </h2>
      <ul className="list-disc list-inside space-y-2 text-[var(--color-black)] text-sm">
        <li>
          <span className="font-medium">Data Akun:</span> Kami mengumpulkan informasi seperti nama, alamat email, dan keterampilan yang Anda masukkan saat membuat akun.
        </li>
        <li>
          <span className="font-medium">Aktivitas Barter:</span> Kami mencatat aktivitas seperti tawaran barter, pesan, dan transaksi untuk memastikan pengalaman yang aman.
        </li>
        <li>
          <span className="font-medium">Data Teknis:</span> Kami dapat mengumpulkan informasi teknis seperti alamat IP, jenis perangkat, dan browser untuk keperluan keamanan dan analitik.
        </li>
      </ul>

      <h2 className="text-xl font-semibold text-[var(--color-primary)] mt-6 mb-3">
        Bagaimana Kami Menggunakan Informasi
      </h2>
      <ul className="list-disc list-inside space-y-2 text-[var(--color-black)] text-sm">
        <li>Untuk mengelola akun dan memfasilitasi aktivitas barter antar pengguna.</li>
        <li>Untuk meningkatkan keamanan dan mencegah aktivitas yang mencurigakan.</li>
        <li>Untuk mengembangkan fitur baru dan meningkatkan kualitas layanan.</li>
      </ul>

      <h2 className="text-xl font-semibold text-[var(--color-primary)] mt-6 mb-3">
        Perlindungan Data
      </h2>
      <p className="text-[var(--color-black)] text-sm mb-4">
        Kami menggunakan teknologi enkripsi dan langkah-langkah keamanan lainnya untuk melindungi data Anda dari akses tidak sah, kehilangan, atau penyalahgunaan.
      </p>

      <h2 className="text-xl font-semibold text-[var(--color-primary)] mb-3">
        Hak Pengguna
      </h2>
      <p className="text-[var(--color-black)] text-sm mb-4">
        Anda berhak mengakses, memperbarui, atau menghapus data pribadi Anda kapan saja melalui pengaturan akun. Jika Anda ingin menghapus akun sepenuhnya, silakan hubungi tim kami.
      </p>

      <h2 className="text-xl font-semibold text-[var(--color-primary)] mt-6 mb-3">
        Kontak Kami
      </h2>
      <p className="text-[var(--color-black)] text-sm">
        Jika Anda memiliki pertanyaan tentang kebijakan privasi ini, silakan hubungi kami di{" "}
        <a
          href="mailto:privacy@barterkita.com"
          className="text-[var(--color-secondary)] hover:underline"
        >
          privacy@barterkita.com
        </a>.
      </p>
    </div>
  );
}
