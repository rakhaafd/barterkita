import React from "react";

export default function Terms() {
  return (
    <div className="p-8 bg-[var(--color-white)] min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-[var(--color-black)]">
        Kebijakan Pengguna
      </h1>
        <p className="text-[var(--color-black)] mb-4 leading-relaxed">
          Selamat datang di BarterKita! Dengan menggunakan platform kami, Anda setuju untuk mematuhi kebijakan pengguna berikut. Kebijakan ini dibuat untuk memastikan pengalaman barter yang aman, adil, dan menyenangkan bagi semua pengguna.
        </p>
        <h2 className="text-xl font-semibold text-[var(--color-primary)] mb-3">
          Ketentuan Umum
        </h2>
        <ul className="list-disc list-inside space-y-2 text-[var(--color-black)] text-sm">
          <li>
            <span className="font-medium">Perilaku Pengguna:</span> Anda harus menghormati pengguna lain, tidak melakukan tindakan yang melanggar hukum, atau menggunakan bahasa yang tidak pantas.
          </li>
          <li>
            <span className="font-medium">Keakuratan Informasi:</span> Semua informasi yang Anda berikan (judul, deskripsi, keterampilan) harus akurat dan tidak menyesatkan.
          </li>
          <li>
            <span className="font-medium">Aturan Barter:</span> Penawaran barter harus jelas, dan Anda bertanggung jawab untuk memenuhi kesepakatan yang telah disetujui.
          </li>
          <li>
            <span className="font-medium">Keamanan Akun:</span> Anda bertanggung jawab atas keamanan akun Anda dan tidak boleh membagikan kredensial login Anda.
          </li>
          <li>
            <span className="font-medium">Pelanggaran:</span> Pelanggaran kebijakan dapat mengakibatkan penangguhan atau penghapusan akun Anda.
          </li>
        </ul>
        <h2 className="text-xl font-semibold text-[var(--color-primary)] mt-6 mb-3">
          Kontak Kami
        </h2>
        <p className="text-[var(--color-black)] text-sm">
          Jika Anda memiliki pertanyaan tentang kebijakan ini, silakan hubungi kami melalui fitur chat atau email di{" "}
          <a
            href="mailto:support@barterkita.com"
            className="text-[var(--color-secondary)] hover:underline"
          >
            support@barterkita.com
          </a>.
        </p>
      </div>
  );
}