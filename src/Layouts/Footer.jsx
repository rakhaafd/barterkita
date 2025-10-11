import React from "react";
import { Link } from "react-router-dom";
import { FiFacebook, FiInstagram, FiTwitter, FiMail } from "react-icons/fi";

const Footer = () => {
  return (
    <footer className="w-full bg-[var(--color-primary)] text-[var(--color-white)] pt-12 pb-6 mt-20 relative overflow-hidden">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>

      {/* Main Container */}
      <div className="relative max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 z-10">
        {/* Logo & Intro */}
        <div>
          <h2 className="text-2xl font-bold tracking-wide mb-3">
            Barter
            <span className="text-[var(--color-secondary)]">Kita</span>
          </h2>
          <p className="text-sm text-gray-200 leading-relaxed">
            Platform barter skill yang mempertemukan individu kreatif untuk
            saling bertukar keahlian tanpa batas. Bangun kolaborasi nyata, bukan
            hanya transaksi.
          </p>
        </div>

        {/* Navigation Links */}
        <div>
          <h3 className="font-semibold text-[var(--color-secondary)] mb-4 uppercase tracking-wide">
            Navigasi
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                to="/"
                className="hover:text-[var(--color-secondary)] transition-colors"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/marketplace"
                className="hover:text-[var(--color-secondary)] transition-colors"
              >
                Marketplace
              </Link>
            </li>
            <li>
              <Link
                to="/profile"
                className="hover:text-[var(--color-secondary)] transition-colors"
              >
                Profile
              </Link>
            </li>
            <li>
              <Link
                to="/faq"
                className="hover:text-[var(--color-secondary)] transition-colors"
              >
                FAQ
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact & Social */}
        <div>
          <h3 className="font-semibold text-[var(--color-secondary)] mb-4 uppercase tracking-wide">
            Hubungi Kami
          </h3>
          <p className="text-sm text-gray-200 mb-3">
            Ada pertanyaan? Kirim pesan atau hubungi kami lewat media sosial.
          </p>

          <div className="flex items-center gap-4 mt-3">
            <a
              href="mailto:hello@barterkita.id"
              className="p-2 rounded-full bg-[var(--color-secondary)]/20 hover:bg-[var(--color-secondary)]/40 transition"
            >
              <FiMail size={18} />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-[var(--color-secondary)]/20 hover:bg-[var(--color-secondary)]/40 transition"
            >
              <FiFacebook size={18} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-[var(--color-secondary)]/20 hover:bg-[var(--color-secondary)]/40 transition"
            >
              <FiTwitter size={18} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-[var(--color-secondary)]/20 hover:bg-[var(--color-secondary)]/40 transition"
            >
              <FiInstagram size={18} />
            </a>
          </div>
        </div>
      </div>

      {/* Divider & Bottom Text */}
      <div className="border-t border-white/20 mt-10 pt-4 text-center text-sm text-gray-300">
        © {new Date().getFullYear()}{" "}
        <span className="font-semibold text-[var(--color-secondary)]">
          BarterKita
        </span>
        . All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
