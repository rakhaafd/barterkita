import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "../firebase/firebase-config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updatePassword } from "firebase/auth";
import { FiCamera, FiX, FiEdit, FiLock, FiSave, FiUser, FiMapPin, FiMail, FiAward } from "react-icons/fi";

export default function EditProfile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login");
        return;
      }
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserData(data);
          setEditedData(data);
          setAvatarPreview(data.avatar);
        }
      } catch (error) {
        console.error("Gagal mengambil data profil:", error);
        setError("Gagal memuat data profil.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [navigate]);

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
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Hanya file gambar (JPEG, PNG, GIF, WebP) yang diizinkan!');
        return;
      }

      if (file.size > 1 * 1024 * 1024) {
        alert('Ukuran file maksimal 1MB!');
        return;
      }

      setIsUploadingAvatar(true);
      try {
        const base64 = await convertToBase64(file);
        setAvatarPreview(base64);
        setEditedData(prev => ({ ...prev, avatar: base64 }));
      } catch (error) {
        console.error('Error converting avatar:', error);
        alert('Gagal memproses gambar. Silakan coba lagi.');
      } finally {
        setIsUploadingAvatar(false);
      }
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setEditedData(prev => ({ ...prev, avatar: null }));
  };

  const generateDefaultAvatar = (name) => {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 200, 200);
    gradient.addColorStop(0, '#0b4e65');
    gradient.addColorStop(1, '#fbc13a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name.charAt(0).toUpperCase(), canvas.width/2, canvas.height/2);
    
    return canvas.toDataURL();
  };

  const handleEditProfile = () => {
    setIsEditing(!isEditing);
    setError("");
    setSuccess("");
  };

  const handleSaveProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      
      let finalAvatar = editedData.avatar;
      if (!finalAvatar && editedData.institution) {
        finalAvatar = generateDefaultAvatar(editedData.institution);
      }

      const updateData = {
        ...editedData,
        avatar: finalAvatar
      };

      await updateDoc(userRef, updateData);
      setUserData(updateData);
      setAvatarPreview(finalAvatar);
      setIsEditing(false);
      setSuccess("🎉 Profil berhasil diperbarui!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Gagal menyimpan profil:", error);
      setError("❌ Gagal menyimpan profil. Silakan coba lagi.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("🔒 Password baru dan konfirmasi tidak cocok.");
      return;
    }
    if (newPassword.length < 6) {
      setError("🔒 Password baru harus minimal 6 karakter.");
      return;
    }
    const user = auth.currentUser;
    if (!user) {
      setError("🔒 User tidak terautentikasi.");
      return;
    }
    try {
      await updatePassword(user, newPassword);
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("✅ Password berhasil diubah!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      if (error.code === "auth/requires-recent-login") {
        setError("🔒 Silakan login ulang untuk mengubah password.");
      } else if (error.code === "auth/weak-password") {
        setError("🔒 Password terlalu lemah.");
      } else {
        setError("❌ Gagal mengubah password. Silakan coba lagi.");
      }
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[var(--color-white)] to-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-medium text-[var(--color-black)]">
            Memuat data profil...
          </p>
        </motion.div>
      </div>
    );

  if (!userData)
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[var(--color-white)] to-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiX className="text-red-500 text-2xl" />
          </div>
          <p className="text-lg font-medium text-red-500">
            Data profil tidak ditemukan.
          </p>
        </motion.div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-white)] to-gray-50">
      <div className="px-4 py-8 sm:px-6 md:px-8 lg:px-12 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-3xl mb-4">
            <FiUser className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-black)] mb-3">
            Kelola Profil Anda
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Personalisasi profil Anda untuk pengalaman barter yang lebih baik
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-200/60"
        >
          {/* Notifikasi */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3"
              >
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                  <FiX className="text-red-500 text-sm" />
                </div>
                <span className="text-sm font-medium">{error}</span>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3"
              >
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <FiSave className="text-green-500 text-sm" />
                </div>
                <span className="text-sm font-medium">{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Avatar & Basic Info */}
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-8 mb-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative group"
            >
              <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-2xl border-4 border-[var(--color-secondary)] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg">
                {avatarPreview ? (
                  <>
                    <img 
                      src={avatarPreview} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                    {isEditing && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                      >
                        <FiX className="text-sm" />
                      </button>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center">
                    <span className="text-white text-4xl lg:text-5xl font-bold">
                      {userData.institution?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </div>
              
              {isEditing && (
                <motion.label
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute bottom-2 right-2 bg-[var(--color-primary)] text-white rounded-full p-3 cursor-pointer hover:bg-[var(--color-secondary)] transition-all shadow-lg"
                >
                  <FiCamera className="text-lg" />
                  <input
                    type="file"
                    accept="image/jpeg, image/jpg, image/png, image/gif, image/webp"
                    onChange={handleAvatarChange}
                    className="hidden"
                    disabled={isUploadingAvatar}
                  />
                </motion.label>
              )}
              
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-2xl flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </motion.div>

            <div className="flex-1 text-center lg:text-left space-y-4">
              <div>
                <h3 className="text-2xl lg:text-3xl font-bold text-[var(--color-black)] mb-2">
                  {isEditing ? (
                    <input
                      type="text"
                      name="institution"
                      value={editedData.institution || ""}
                      onChange={handleInputChange}
                      placeholder="Nama Instansi/Perseorangan"
                      className="w-full bg-transparent border-b-2 border-gray-300 focus:border-[var(--color-primary)] outline-none text-center lg:text-left text-2xl lg:text-3xl font-bold"
                    />
                  ) : (
                    userData.institution
                  )}
                </h3>
                <p className="text-gray-500 text-lg flex items-center justify-center lg:justify-start gap-2">
                  <FiMail className="text-[var(--color-primary)]" />
                  {userData.email}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-2 flex items-center justify-center lg:justify-start gap-2">
                  <FiAward className="text-[var(--color-secondary)]" />
                  Keahlian Utama
                </p>
                {isEditing ? (
                  <input
                    type="text"
                    name="skill"
                    value={editedData.skill || ""}
                    onChange={handleInputChange}
                    placeholder="Contoh: Web Development, Desain Grafis, dll."
                    className="w-full bg-transparent border-b-2 border-gray-300 focus:border-[var(--color-primary)] outline-none text-center lg:text-left text-lg font-medium text-[var(--color-primary)]"
                  />
                ) : (
                  <p className="text-lg font-medium text-[var(--color-primary)]">
                    {userData.skill || "Belum diisi"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Detail Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FiUser className="text-blue-600 text-lg" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-800">Instansi / Perseorangan</h4>
                  {isEditing ? (
                    <input
                      type="text"
                      name="institution"
                      value={editedData.institution || ""}
                      onChange={handleInputChange}
                      className="w-full mt-1 bg-transparent border-b border-blue-300 focus:border-blue-500 outline-none"
                    />
                  ) : (
                    <p className="text-[var(--color-black)] mt-1">
                      {userData.institution}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <FiAward className="text-green-600 text-lg" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-800">Keahlian</h4>
                  {isEditing ? (
                    <textarea
                      name="skill"
                      value={editedData.skill || ""}
                      onChange={handleInputChange}
                      rows={2}
                      placeholder="Jelaskan keahlian Anda..."
                      className="w-full mt-1 bg-transparent border-b border-green-300 focus:border-green-500 outline-none resize-none"
                    />
                  ) : (
                    <p className="text-[var(--color-black)] mt-1">
                      {userData.skill || "Belum diisi"}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-200 lg:col-span-2"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <FiMapPin className="text-purple-600 text-lg" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-purple-800">Alamat</h4>
                  {isEditing ? (
                    <textarea
                      name="address"
                      value={editedData.address || ""}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Masukkan alamat lengkap Anda..."
                      className="w-full mt-1 bg-white/50 border border-purple-300 rounded-lg p-3 focus:border-purple-500 outline-none resize-none"
                    />
                  ) : (
                    <p className="text-[var(--color-black)] mt-1">
                      {userData.address || "Belum diisi"}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200"
          >
            {isEditing ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSaveProfile}
                  disabled={isUploadingAvatar}
                  className="flex-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)]/90 text-white px-6 py-4 rounded-xl font-semibold hover:from-[var(--color-secondary)] hover:to-[var(--color-secondary)]/90 transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <FiSave className="text-xl" />
                  {isUploadingAvatar ? "Mengupload..." : "Simpan Perubahan"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEditProfile}
                  className="flex-1 bg-gray-200 text-[var(--color-black)] px-6 py-4 rounded-xl font-semibold hover:bg-gray-300 transition-all flex items-center justify-center gap-3"
                >
                  <FiX className="text-xl" />
                  Batalkan
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEditProfile}
                  className="flex-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)]/90 text-white px-6 py-4 rounded-xl font-semibold hover:from-[var(--color-secondary)] hover:to-[var(--color-secondary)]/90 transition-all shadow-lg flex items-center justify-center gap-3"
                >
                  <FiEdit className="text-xl" />
                  Edit Profil
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowPasswordModal(true)}
                  className="flex-1 bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-secondary)]/90 text-white px-6 py-4 rounded-xl font-semibold hover:from-[var(--color-primary)] hover:to-[var(--color-primary)]/90 transition-all shadow-lg flex items-center justify-center gap-3"
                >
                  <FiLock className="text-xl" />
                  Ubah Password
                </motion.button>
              </>
            )}
          </motion.div>
        </motion.div>

        {/* Modal Ubah Password */}
        <AnimatePresence>
          {showPasswordModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowPasswordModal(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white rounded-3xl p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FiLock className="text-white text-2xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-[var(--color-black)] mb-2">
                    Ubah Password
                  </h3>
                  <p className="text-gray-600">
                    Masukkan password baru yang aman untuk akun Anda
                  </p>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-4">
                  {[
                    {
                      label: "Password Saat Ini",
                      value: currentPassword,
                      setValue: setCurrentPassword,
                      icon: FiLock,
                    },
                    {
                      label: "Password Baru",
                      value: newPassword,
                      setValue: setNewPassword,
                      icon: FiLock,
                    },
                    {
                      label: "Konfirmasi Password Baru",
                      value: confirmPassword,
                      setValue: setConfirmPassword,
                      icon: FiLock,
                    },
                  ].map((field, i) => (
                    <div key={i}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {field.label}
                      </label>
                      <div className="relative">
                        <field.icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="password"
                          value={field.value}
                          onChange={(e) => field.setValue(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-all"
                          required
                        />
                      </div>
                    </div>
                  ))}
                  
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm"
                    >
                      {error}
                    </motion.div>
                  )}
                  
                  <div className="flex gap-3 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)]/90 text-white py-3 rounded-xl font-semibold hover:from-[var(--color-secondary)] hover:to-[var(--color-secondary)]/90 transition-all"
                    >
                      Simpan Password
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => {
                        setShowPasswordModal(false);
                        setError("");
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                      }}
                      className="flex-1 bg-gray-200 text-[var(--color-black)] py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                    >
                      Batal
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}