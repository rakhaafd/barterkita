import React, { useState, useEffect } from "react";
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
  FiCamera,
  FiX,
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
  const [skills, setSkills] = useState([]);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Load skills from JSON using fetch
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await fetch('/data/skills.json');
        if (!response.ok) {
          throw new Error('Failed to fetch skills');
        }
        const data = await response.json();
        setSkills(data.skills);
      } catch (error) {
        console.error('Error loading skills:', error);
        setError('Gagal memuat daftar keahlian. Silakan refresh halaman.');
        // Fallback skills jika fetch gagal
        setSkills([
          "photo & videographer",
          "illustrator",
          "editor",
          "marketing",
          "content creator",
          "designer",
          "website developer",
          "animator",
          "copy writer",
          "3d artist"
        ]);
      } finally {
        setSkillsLoading(false);
      }
    };

    fetchSkills();
  }, []);

  // Fungsi untuk convert file ke Base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi tipe file
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Hanya file gambar (JPEG, PNG, GIF, WebP) yang diizinkan!');
        return;
      }

      // Validasi ukuran file (max 1MB)
      if (file.size > 1 * 1024 * 1024) {
        alert('Ukuran file maksimal 1MB!');
        return;
      }

      try {
        const base64 = await convertToBase64(file);
        setAvatar(base64);
        setAvatarPreview(base64);
      } catch (error) {
        console.error('Error converting avatar:', error);
        alert('Gagal memproses gambar. Silakan coba lagi.');
      }
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar(null);
    setAvatarPreview(null);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Generate default avatar jika tidak ada avatar yang diupload
      let avatarBase64 = avatar;
      if (!avatarBase64 && institution) {
        // Buat avatar default dengan huruf pertama nama institution
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        
        // Background color
        ctx.fillStyle = '#4F46E5'; // Warna primary
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 80px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(institution.charAt(0).toUpperCase(), canvas.width/2, canvas.height/2);
        
        avatarBase64 = canvas.toDataURL();
      }

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        institution,
        skill,
        address,
        email,
        avatar: avatarBase64,
        createdAt: new Date(),
      });

      navigate("/marketplace");
    } catch (err) {
      console.error(err);
      setError("Gagal mendaftar. Pastikan data valid dan coba lagi!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-white)] px-6 py-8">
      <form
        onSubmit={handleRegister}
        className="flex flex-col gap-4 w-full max-w-md"
      >
        <h1 className="text-2xl font-bold text-[var(--color-black)] mb-4 text-center">
          Register
        </h1>

        {error && (
          <p className="text-red-500 bg-[var(--color-black)]/5 py-2 px-4 rounded-md text-sm text-center">
            {error}
          </p>
        )}

        {/* Upload Foto Profil */}
        <div className="flex flex-col items-center mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Foto Profil (Opsional)
          </label>
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-[var(--color-secondary)] overflow-hidden bg-gray-200 flex items-center justify-center">
              {avatarPreview ? (
                <>
                  <img 
                    src={avatarPreview} 
                    alt="Preview Avatar" 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                  >
                    <FiX />
                  </button>
                </>
              ) : (
                <FiUser className="text-3xl text-gray-400" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-[var(--color-primary)] text-white rounded-full p-2 cursor-pointer hover:bg-[var(--color-secondary)] transition-colors">
              <FiCamera className="text-sm" />
              <input
                type="file"
                accept="image/jpeg, image/jpg, image/png, image/gif, image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            JPEG, PNG, GIF, WebP (max 1MB)
          </p>
        </div>

        {/* Nama Instansi / Perseorangan */}
        <div className="relative">
          <FiUser className="absolute left-3 top-3 text-[var(--color-black)]/60" />
          <input
            type="text"
            placeholder="Nama Instansi / Perseorangan"
            className="w-full pl-10 pr-4 py-2 rounded-md bg-[var(--color-black)]/5 text-[var(--color-black)] placeholder-[var(--color-black)]/60 focus:ring-2 focus:ring-[var(--color-secondary)] outline-none"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            required
          />
        </div>

        {/* Keahlian */}
        <div className="relative">
          <FiBriefcase className="absolute left-3 top-3 text-[var(--color-black)]/60" />
          <select
            className="w-full pl-10 pr-4 py-2 rounded-md bg-[var(--color-black)]/5 text-[var(--color-black)] focus:ring-2 focus:ring-[var(--color-secondary)] outline-none"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            required
            disabled={skillsLoading}
          >
            <option value="" disabled>
              {skillsLoading ? "Memuat keahlian..." : "Pilih Keahlian"}
            </option>
            {skills.map((skillItem, index) => (
              <option key={index} value={skillItem}>
                {skillItem}
              </option>
            ))}
          </select>
          {skillsLoading && (
            <div className="absolute right-3 top-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--color-primary)]"></div>
            </div>
          )}
        </div>

        {/* Alamat */}
        <div className="relative">
          <FiHome className="absolute left-3 top-3 text-[var(--color-black)]/60" />
          <input
            type="text"
            placeholder="Alamat Lengkap"
            className="w-full pl-10 pr-4 py-2 rounded-md bg-[var(--color-black)]/5 text-[var(--color-black)] placeholder-[var(--color-black)]/60 focus:ring-2 focus:ring-[var(--color-secondary)] outline-none"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>

        {/* Email */}
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

        {/* Password */}
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

        {/* Tombol Register */}
        <button
          type="submit"
          disabled={loading || skillsLoading}
          className={`${
            loading || skillsLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[var(--color-secondary)] hover:bg-[var(--color-primary)]"
          } text-[var(--color-white)] font-semibold py-2 rounded-md transition-all duration-300`}
        >
          {loading ? "Mendaftarkan..." : "Register"}
        </button>

        {/* Sudah punya akun */}
        <p className="text-[var(--color-black)] text-sm text-center">
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