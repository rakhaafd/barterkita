import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase-config";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/marketplace");
    } catch (err) {
      setError("Email atau password salah!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-white)] px-6">
      <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-[var(--color-black)] mb-4 text-center">Login</h1>
        {error && (
          <p className="text-red-500 bg-[var(--color-black)]/5 py-2 px-4 rounded-md text-sm text-center">
            {error}
          </p>
        )}
        <div className="relative">
          <FiMail className="absolute left-3 top-3 text-[var(--color-black)]/60" />
          <input
            type="email"
            placeholder="Email"
            className="w-full pl-10 pr-4 py-2 rounded-md bg-[var(--color-black)]/5 text-[var(--color-black)] placeholder-[var(--color-black)]/60 focus:ring-2 focus:ring-[var(--color-secondary)] outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="relative">
          <FiLock className="absolute left-3 top-3 text-[var(--color-black)]/60" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full pl-10 pr-10 py-2 rounded-md bg-[var(--color-black)]/5 text-[var(--color-black)] placeholder-[var(--color-black)]/60 focus:ring-2 focus:ring-[var(--color-secondary)] outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-[var(--color-black)]/60"
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>
        <button
          type="submit"
          className="bg-[var(--color-secondary)] text-[var(--color-white)] font-semibold py-2 rounded-md hover:bg-[var(--color-primary)] transition-all duration-300"
        >
          Login
        </button>
        <p className="text-[var(--color-black)] text-sm text-center">
          Belum punya akun?{" "}
          <Link
            to="/register"
            className="text-[var(--color-secondary)] font-semibold hover:underline"
          >
            Daftar Sekarang
          </Link>
        </p>
      </form>
    </div>
  );
}