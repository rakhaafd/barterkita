import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/firebase-config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updatePassword } from "firebase/auth";
import { FiCamera, FiX } from "react-icons/fi";

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
    
    // Background color
    ctx.fillStyle = '#4F46E5'; // Warna primary
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
      
      // Generate default avatar jika avatar dihapus
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
      setSuccess("Profil berhasil diperbarui!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Gagal menyimpan profil:", error);
      setError("Gagal menyimpan profil. Silakan coba lagi.");
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
      setError("Password baru dan konfirmasi tidak cocok.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password baru harus minimal 6 karakter.");
      return;
    }
    const user = auth.currentUser;
    if (!user) {
      setError("User tidak terautentikasi.");
      return;
    }
    try {
      await updatePassword(user, newPassword);
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Password berhasil diubah!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      if (error.code === "auth/requires-recent-login") {
        setError("Silakan login ulang untuk mengubah password.");
      } else if (error.code === "auth/weak-password") {
        setError("Password terlalu lemah.");
      } else {
        setError("Gagal mengubah password. Silakan coba lagi.");
      }
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-base sm:text-lg text-[var(--color-black)]">
            Memuat data profil...
          </p>
        </div>
      </div>
    );

  if (!userData)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-base sm:text-lg text-red-500 font-medium">
          Data profil tidak ditemukan.
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[var(--color-white)]">
      <div className="px-4 py-8 sm:px-6 md:px-8 lg:px-12 max-w-5xl mx-auto">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--color-black)] mb-6 sm:mb-8 text-center md:text-left">
          Profil Anda
        </h2>
        <div className="bg-[var(--color-white)] rounded-2xl shadow-lg p-4 sm:p-6 md:p-8">
          {/* Notifikasi */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm sm:text-base">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm sm:text-base">
              {success}
            </div>
          )}

          {/* Header Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 border-b border-gray-200 pb-4 sm:pb-6 mb-4 sm:mb-6 text-center sm:text-left">
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border-4 border-[var(--color-secondary)] overflow-hidden bg-gray-200 flex items-center justify-center">
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
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                      >
                        <FiX />
                      </button>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full bg-[var(--color-primary)] flex items-center justify-center">
                    <span className="text-white text-2xl sm:text-3xl font-bold">
                      {userData.institution?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-[var(--color-primary)] text-white rounded-full p-2 cursor-pointer hover:bg-[var(--color-secondary)] transition-colors">
                  <FiCamera className="text-sm" />
                  <input
                    type="file"
                    accept="image/jpeg, image/jpg, image/png, image/gif, image/webp"
                    onChange={handleAvatarChange}
                    className="hidden"
                    disabled={isUploadingAvatar}
                  />
                </label>
              )}
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <div className="flex-1 w-full">
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-[var(--color-black)]">
                {isEditing ? (
                  <input
                    type="text"
                    name="institution"
                    value={editedData.institution || ""}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-b border-gray-300 focus:border-[var(--color-primary)] outline-none text-center sm:text-left text-lg sm:text-xl md:text-2xl"
                  />
                ) : (
                  userData.institution
                )}
              </h3>
              <p className="text-gray-500 text-sm sm:text-base mt-1 break-words">
                {userData.email}
              </p>
              {isEditing ? (
                <input
                  type="text"
                  name="skill"
                  value={editedData.skill || ""}
                  onChange={handleInputChange}
                  className="text-sm sm:text-base font-medium text-[var(--color-primary)] mt-2 bg-transparent border-b border-gray-300 focus:border-[var(--color-primary)] outline-none w-full text-center sm:text-left"
                />
              ) : (
                <p className="text-sm sm:text-base font-medium text-[var(--color-primary)] mt-2 break-words">
                  {userData.skill}
                </p>
              )}
            </div>
          </div>

          {/* Detail Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <p className="text-sm font-semibold text-gray-500">
                Instansi / Perseorangan
              </p>
              {isEditing ? (
                <input
                  type="text"
                  name="institution"
                  value={editedData.institution || ""}
                  onChange={handleInputChange}
                  className="w-full mt-1 bg-transparent border-b border-gray-300 focus:border-[var(--color-primary)] outline-none text-sm sm:text-base"
                />
              ) : (
                <p className="text-[var(--color-black)] mt-1 break-words text-sm sm:text-base">
                  {userData.institution}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Keahlian</p>
              {isEditing ? (
                <textarea
                  name="skill"
                  value={editedData.skill || ""}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full mt-1 bg-transparent border-b border-gray-300 focus:border-[var(--color-primary)] outline-none resize-none text-sm sm:text-base"
                />
              ) : (
                <p className="text-[var(--color-black)] mt-1 break-words text-sm sm:text-base">
                  {userData.skill}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Alamat</p>
              {isEditing ? (
                <textarea
                  name="address"
                  value={editedData.address || ""}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full mt-1 bg-transparent border border-gray-300 rounded-md p-2 focus:border-[var(--color-primary)] outline-none resize-y text-sm sm:text-base"
                />
              ) : (
                <p className="text-[var(--color-black)] mt-1 break-words text-sm sm:text-base">
                  {userData.address}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Email</p>
              <p className="text-[var(--color-black)] mt-1 break-words text-sm sm:text-base">
                {userData.email}
              </p>
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8 sm:mt-10">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveProfile}
                  disabled={isUploadingAvatar}
                  className="flex-1 bg-[var(--color-primary)] text-white px-4 sm:px-5 py-2 sm:py-3 rounded-lg font-medium hover:bg-[var(--color-secondary)] transition-all shadow-md text-sm sm:text-base disabled:opacity-50"
                >
                  {isUploadingAvatar ? "Mengupload..." : "Simpan"}
                </button>
                <button
                  onClick={handleEditProfile}
                  className="flex-1 bg-gray-200 text-[var(--color-black)] px-4 sm:px-5 py-2 sm:py-3 rounded-lg font-medium hover:bg-gray-300 transition-all text-sm sm:text-base"
                >
                  Batal
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleEditProfile}
                  className="flex-1 bg-[var(--color-primary)] text-white px-4 sm:px-5 py-2 sm:py-3 rounded-lg font-medium hover:bg-[var(--color-secondary)] transition-all shadow-md text-sm sm:text-base"
                >
                  Edit Profil
                </button>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="flex-1 bg-[var(--color-secondary)] text-white px-4 sm:px-5 py-2 sm:py-3 rounded-lg font-medium hover:bg-[var(--color-primary)] transition-all shadow-md text-sm sm:text-base"
                >
                  Ubah Password
                </button>
              </>
            )}
          </div>

          {/* Modal Ubah Password */}
          {showPasswordModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-6">
              <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg sm:text-xl font-bold text-[var(--color-black)] mb-4 text-center sm:text-left">
                  Ubah Password
                </h3>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  {[
                    {
                      label: "Password Saat Ini",
                      value: currentPassword,
                      setValue: setCurrentPassword,
                    },
                    {
                      label: "Password Baru",
                      value: newPassword,
                      setValue: setNewPassword,
                    },
                    {
                      label: "Konfirmasi Password Baru",
                      value: confirmPassword,
                      setValue: setConfirmPassword,
                    },
                  ].map((field, i) => (
                    <div key={i}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                      </label>
                      <input
                        type="password"
                        value={field.value}
                        onChange={(e) => field.setValue(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[var(--color-primary)] outline-none text-sm sm:text-base"
                        required
                      />
                    </div>
                  ))}
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                      {error}
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-[var(--color-primary)] text-white py-2 rounded-lg font-medium hover:bg-[var(--color-secondary)] transition-all text-sm sm:text-base"
                    >
                      Simpan
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordModal(false);
                        setError("");
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                      }}
                      className="flex-1 bg-gray-200 text-[var(--color-black)] py-2 rounded-lg font-medium hover:bg-gray-300 transition-all text-sm sm:text-base"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}