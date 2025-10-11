import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase/firebase-config";
import { setDoc, doc } from "firebase/firestore";
import {
  FiMail,
  FiLock,
  FiHome,
  FiBriefcase,
  FiUser,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [institution, setInstitution] = useState("");
  const [skill, setSkill] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Buat akun di Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Simpan data tambahan ke Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        institution,
        skill,
        address,
        email,
        createdAt: new Date(),
      });

      // Redirect ke marketplace
      navigate("/marketplace");
    } catch (err) {
      console.error(err);
      setError("Gagal mendaftar. Pastikan data valid dan coba lagi!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[var(--color-primary)]/10 to-[var(--color-white)] px-6 py-10">
      <form
        onSubmit={handleRegister}
        className="flex flex-col gap-4 w-full max-w-md bg-white/90 backdrop-blur-lg border border-gray-200 p-8 rounded-2xl shadow-lg"
      >
        <h1 className="text-3xl font-bold text-center text-[var(--color-primary)] mb-4">
          Daftar Akun Baru
        </h1>

        {error && (
          <p className="text-red-500 bg-red-100 py-2 px-4 rounded-md text-sm text-center">
            {error}
          </p>
        )}

        {/* Instansi / Perseorangan */}
        <div className="relative">
          <FiUser className="absolute left-3 top-3 text-gray-500" />
          <input
            type="text"
            placeholder="Nama Instansi / Perseorangan"
            className="w-full pl-10 pr-4 py-2 rounded-md bg-white shadow-sm text-gray-700 focus:ring-2 focus:ring-[var(--color-secondary)] outline-none"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            required
          />
        </div>

        {/* Keahlian */}
        <div className="relative">
          <FiBriefcase className="absolute left-3 top-3 text-gray-500" />
          <select
            className="w-full pl-10 pr-4 py-2 rounded-md bg-white shadow-sm text-gray-700 focus:ring-2 focus:ring-[var(--color-secondary)] outline-none"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            required
          >
            <option value="" disabled>
              Pilih Keahlian
            </option>
            <option value="Web Development">Web Development</option>
            <option value="Graphic Design">Graphic Design</option>
            <option value="Digital Marketing">Digital Marketing</option>
            <option value="Data Analysis">Data Analysis</option>
            <option value="Photography">Photography</option>
          </select>
        </div>

        {/* Alamat */}
        <div className="relative">
          <FiHome className="absolute left-3 top-3 text-gray-500" />
          <input
            type="text"
            placeholder="Alamat Lengkap"
            className="w-full pl-10 pr-4 py-2 rounded-md bg-white shadow-sm text-gray-700 focus:ring-2 focus:ring-[var(--color-secondary)] outline-none"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>

        {/* Email */}
        <div className="relative">
          <FiMail className="absolute left-3 top-3 text-gray-500" />
          <input
            type="email"
            placeholder="Email"
            className="w-full pl-10 pr-4 py-2 rounded-md bg-white shadow-sm text-gray-700 focus:ring-2 focus:ring-[var(--color-secondary)] outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <div className="relative">
          <FiLock className="absolute left-3 top-3 text-gray-500" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full pl-10 pr-10 py-2 rounded-md bg-white shadow-sm text-gray-700 focus:ring-2 focus:ring-[var(--color-secondary)] outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-500"
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>

        {/* Tombol Register */}
        <button
          type="submit"
          disabled={loading}
          className={`${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[var(--color-secondary)] hover:bg-[var(--color-primary)]"
          } text-white font-semibold py-2 rounded-md transition-all duration-300 shadow-md`}
        >
          {loading ? "Mendaftarkan..." : "Register"}
        </button>

        {/* Sudah punya akun */}
        <p className="text-gray-700 text-sm text-center mt-2">
          Sudah punya akun?{" "}
          <Link
            to="/login"
            className="text-[var(--color-secondary)] font-semibold hover:underline"
          >
            Masuk di sini
          </Link>
        </p>
      </form>
    </div>
  );
}
