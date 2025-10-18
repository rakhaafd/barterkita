import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase-config";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiUserPlus } from "react-icons/fi";
import { motion } from "framer-motion";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      setError("Email atau password salah! Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--color-white)] to-gray-50 px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
          >
            <FiArrowRight className="text-white text-2xl" />
          </motion.div>
          <h1 className="text-3xl font-bold text-[var(--color-black)] mb-2">
            Selamat Datang Kembali! 👋
          </h1>
          <p className="text-gray-600">
            Masuk ke akun Anda dan mulai bertukar skill
          </p>
        </div>

        {/* Login Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleLogin}
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/60 p-8"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-5">
            {/* Email Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Alamat Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="email"
                  placeholder="nama@email.com"
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </motion.div>

            {/* Password Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="relative"
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  className="w-full pl-12 pr-12 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[var(--color-primary)] transition-colors"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </motion.button>
              </div>
            </motion.div>

            {/* Login Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className={`w-full py-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)]/90 text-white font-bold rounded-xl transition-all duration-300 shadow-lg ${
                loading
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:from-[var(--color-secondary)] hover:to-[var(--color-secondary)]/90 hover:shadow-xl'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Memproses...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Masuk ke Akun</span>
                  <FiArrowRight className="text-lg" />
                </div>
              )}
            </motion.button>
          </div>

          {/* Register Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center mt-6 pt-6 border-t border-gray-200"
          >
            <p className="text-gray-600 text-sm">
              Belum punya akun?{" "}
              <Link
                to="/register"
                className="text-[var(--color-primary)] font-semibold hover:text-[var(--color-secondary)] transition-colors inline-flex items-center gap-1 group"
              >
                Daftar Sekarang
                <FiUserPlus className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </p>
          </motion.div>
        </motion.form>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-6"
        > 
        </motion.div>
      </motion.div>
    </div>
  );
}