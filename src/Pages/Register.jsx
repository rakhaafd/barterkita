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
  FiUserPlus,
  FiArrowRight
} from "react-icons/fi";
import { motion } from "framer-motion";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    institution: "",
    skill: "",
    address: ""
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState([]);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [passwordError, setPasswordError] = useState("");

  // Load skills from JSON
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await fetch('/data/skills.json');
        if (!response.ok) throw new Error('Failed to fetch skills');
        const data = await response.json();
        setSkills(data.skills);
      } catch (error) {
        console.error('Error loading skills:', error);
        setSkills([
          "Photo & Videographer",
          "Illustrator",
          "Editor",
          "Marketing",
          "Content Creator",
          "Designer",
          "Website Developer",
          "Animator",
          "Copy Writer",
          "3D Artist"
        ]);
      } finally {
        setSkillsLoading(false);
      }
    };
    fetchSkills();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Validasi password saat user mengetik
    if (name === "password") {
      if (value.length > 0 && value.length < 6) {
        setPasswordError("Password harus terdiri dari minimal 6 karakter");
      } else {
        setPasswordError("");
      }
    }
  };

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
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Hanya file gambar (JPEG, PNG, GIF, WebP) yang diizinkan!');
        return;
      }
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
    setPasswordError("");

    // Validasi password sebelum submit
    if (formData.password.length < 6) {
      setPasswordError("Password harus terdiri dari minimal 6 karakter");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Generate default avatar
      let avatarBase64 = avatar;
      if (!avatarBase64 && formData.institution) {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        
        const gradient = ctx.createLinearGradient(0, 0, 200, 200);
        gradient.addColorStop(0, '#0b4e65');
        gradient.addColorStop(1, '#fbc13a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 80px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(formData.institution.charAt(0).toUpperCase(), canvas.width/2, canvas.height/2);
        
        avatarBase64 = canvas.toDataURL();
      }

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        institution: formData.institution,
        skill: formData.skill,
        address: formData.address,
        email: formData.email,
        avatar: avatarBase64,
        createdAt: new Date(),
      });

      navigate("/marketplace");
    } catch (err) {
      console.error(err);
      setError(err.message.includes('email-already') 
        ? "Email sudah terdaftar. Silakan gunakan email lain atau login." 
        : "Gagal mendaftar. Pastikan data valid dan coba lagi!"
      );
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
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
          >
            <FiUserPlus className="text-white text-2xl" />
          </motion.div>
          <h1 className="text-3xl font-bold text-[var(--color-black)] mb-2">
            Bergabung dengan BarterKita! 🚀
          </h1>
          <p className="text-gray-600">
            Buat akun dan mulai perjalanan bertukar skill Anda
          </p>
        </div>

        {/* Register Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleRegister}
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

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column - Personal Info */}
            <div className="space-y-5">
              {/* Avatar Upload */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center"
              >
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Foto Profil (Opsional)
                </label>
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-2xl border-4 border-[var(--color-secondary)] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-lg">
                    {avatarPreview ? (
                      <>
                        <img 
                          src={avatarPreview} 
                          alt="Preview Avatar" 
                          className="w-full h-full object-cover"
                        />
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={handleRemoveAvatar}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 text-xs shadow-lg"
                        >
                          <FiX />
                        </motion.button>
                      </>
                    ) : (
                      <FiUser className="text-3xl text-gray-400" />
                    )}
                  </div>
                  <motion.label
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute -bottom-2 -right-2 bg-[var(--color-primary)] text-white rounded-full p-2 cursor-pointer hover:bg-[var(--color-secondary)] transition-colors shadow-lg"
                  >
                    <FiCamera className="text-sm" />
                    <input
                      type="file"
                      accept="image/jpeg, image/jpg, image/png, image/gif, image/webp"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </motion.label>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  JPEG, PNG, GIF, WebP (max 1MB)
                </p>
              </motion.div>

              {/* Institution */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="relative"
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nama Instansi / Perseorangan
                </label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type="text"
                    name="institution"
                    placeholder="Nama Anda atau perusahaan"
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300"
                    value={formData.institution}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </motion.div>

              {/* Skill */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="relative"
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Keahlian Utama
                </label>
                <div className="relative">
                  <FiBriefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg z-10" />
                  <select
                    name="skill"
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-white/50 backdrop-blur-sm appearance-none transition-all duration-300"
                    value={formData.skill}
                    onChange={handleInputChange}
                    required
                    disabled={skillsLoading}
                  >
                    <option value="">
                      {skillsLoading ? "Memuat keahlian..." : "Pilih keahlian Anda"}
                    </option>
                    {skills.map((skillItem, index) => (
                      <option key={index} value={skillItem}>
                        {skillItem}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                    ▼
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Account Info */}
            <div className="space-y-5">
              {/* Address */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="relative"
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Alamat Lengkap
                </label>
                <div className="relative">
                  <FiHome className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type="text"
                    name="address"
                    placeholder="Alamat tempat tinggal/kerja"
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </motion.div>

              {/* Email */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="relative"
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Alamat Email
                </label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type="email"
                    name="email"
                    placeholder="nama@email.com"
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </motion.div>

              {/* Password */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="relative"
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Buat password yang kuat"
                    className={`w-full pl-12 pr-12 py-4 rounded-xl border bg-white/50 backdrop-blur-sm transition-all duration-300 ${
                      passwordError 
                        ? "border-red-300 focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                        : "border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    }`}
                    value={formData.password}
                    onChange={handleInputChange}
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
                
                {/* Password Error Message */}
                {passwordError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-2 text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center gap-2"
                  >
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    {passwordError}
                  </motion.div>
                )}
                
                {/* Password Strength Indicator */}
                {formData.password.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2"
                  >
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className={`w-full h-1 rounded-full ${
                        formData.password.length < 6 
                          ? "bg-red-500" 
                          : formData.password.length < 8 
                            ? "bg-yellow-500" 
                            : "bg-green-500"
                      }`}></div>
                      <span className={`text-xs ${
                        formData.password.length < 6 
                          ? "text-red-600" 
                          : formData.password.length < 8 
                            ? "text-yellow-600" 
                            : "text-green-600"
                      }`}>
                        {formData.password.length < 6 
                          ? "Lemah" 
                          : formData.password.length < 8 
                            ? "Sedang" 
                            : "Kuat"
                        }
                      </span>
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* Register Button */}
              <motion.button
                type="submit"
                disabled={loading || skillsLoading || passwordError}
                whileHover={{ scale: (loading || skillsLoading || passwordError) ? 1 : 1.02 }}
                whileTap={{ scale: (loading || skillsLoading || passwordError) ? 1 : 0.98 }}
                className={`w-full py-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)]/90 text-white font-bold rounded-xl transition-all duration-300 shadow-lg mt-4 ${
                  loading || skillsLoading || passwordError
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:from-[var(--color-secondary)] hover:to-[var(--color-secondary)]/90 hover:shadow-xl'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Membuat Akun...
                  </div>
                ) : skillsLoading ? (
                  "Memuat Data..."
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>Buat Akun Saya</span>
                    <FiArrowRight className="text-lg" />
                  </div>
                )}
              </motion.button>
            </div>
          </div>

          {/* Login Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-6 pt-6 border-t border-gray-200"
          >
            <p className="text-gray-600 text-sm">
              Sudah punya akun?{" "}
              <Link
                to="/login"
                className="text-[var(--color-primary)] font-semibold hover:text-[var(--color-secondary)] transition-colors inline-flex items-center gap-1 group"
              >
                Masuk di sini
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </p>
          </motion.div>
        </motion.form>
      </motion.div>
    </div>
  );
}