import React from "react";
import { Link } from "react-router-dom";
import { 
  FiMail, 
  FiLinkedin,
  FiInstagram,
  FiArrowUp
} from "react-icons/fi";
import { FaExchangeAlt } from "react-icons/fa";
import { motion } from "framer-motion";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-gradient-to-br from-[var(--color-primary)] to-[#0d5a7a] text-white">
      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-primary)] p-2 rounded-xl">
                <FaExchangeAlt className="text-white text-lg" />
              </div>
              <div>
                <h2 className="text-2xl font-black bg-gradient-to-r from-white to-[var(--color-secondary)] bg-clip-text text-transparent">
                  BarterKita
                </h2>
                <p className="text-sm text-gray-300">Exchange Skills, Create Value</p>
              </div>
            </div>
            
            <p className="text-gray-300 leading-relaxed mb-6 max-w-md">
              Platform barter skill yang mempertemukan talenta kreatif untuk saling bertukar keahlian.
            </p>
            
            <div className="flex items-center gap-3">
              {[
                { icon: FiLinkedin, href: "https://linkedin.com", label: "LinkedIn" },
                { icon: FiInstagram, href: "https://instagram.com", label: "Instagram" },
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300"
                  title={social.label}
                >
                  <social.icon size={16} />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="font-semibold text-lg mb-4 text-white">Navigasi</h3>
            <ul className="space-y-2">
              {[
                { name: "Home", path: "/" },
                { name: "Marketplace", path: "/marketplace" },
                { name: "Profile", path: "/profile" },
              ].map((link, index) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-300 hover:text-white transition-colors duration-300 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Legal & Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="font-semibold text-lg mb-4 text-white">Support</h3>
            <ul className="space-y-2">
              {[
                { name: "Terms of Service", path: "/profile" },
                { name: "Privacy Policy", path: "/profile" },
                { name: "Contact Support", path: "mailto:hello@barterkita.id" },
              ].map((link, index) => (
                <li key={link.name}>
                  {link.path.startsWith('mailto:') ? (
                    <a
                      href={link.path}
                      className="text-gray-300 hover:text-white transition-colors duration-300 text-sm"
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link
                      to={link.path}
                      className="text-gray-300 hover:text-white transition-colors duration-300 text-sm"
                    >
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="border-t border-white/20 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center"
        >
          <div className="text-gray-300 text-sm text-center md:text-left mb-4 md:mb-0">
            © {new Date().getFullYear()} BarterKita. All rights reserved.
          </div>
          
          <div className="flex items-center gap-4">
            {/* Scroll to Top Button */}
            <motion.button
              onClick={scrollToTop}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 bg-[var(--color-secondary)] text-[var(--color-primary)] rounded-lg hover:bg-white transition-colors"
              title="Back to top"
            >
              <FiArrowUp size={16} />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;