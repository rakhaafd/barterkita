import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/firebase-config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updatePassword } from "firebase/auth";

export default function EditProfile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserData(data);
          setEditedData(data);
        } else {
          console.warn("Data user tidak ditemukan di Firestore");
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

  const handleEditProfile = () => {
    setIsEditing(!isEditing);
    setError('');
    setSuccess('');
  };

  const handleSaveProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, editedData);
      setUserData(editedData);
      setIsEditing(false);
      setSuccess("Profil berhasil diperbarui!");
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error("Gagal menyimpan profil:", error);
      setError("Gagal menyimpan profil. Silakan coba lagi.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    
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
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess("Password berhasil diubah!");
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error("Gagal mengubah password:", error);
      if (error.code === 'auth/requires-recent-login') {
        setError("Silakan login ulang untuk mengubah password.");
      } else if (error.code === 'auth/weak-password') {
        setError("Password terlalu lemah.");
      } else {
        setError("Gagal mengubah password. Silakan coba lagi.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--color-white)]">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg text-[var(--color-black)]">Memuat data profil...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--color-white)]">
        <p className="text-lg text-red-500 font-medium">Data profil tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12">
      <h2 className="text-3xl font-bold text-[var(--color-black)] mb-8">Profil Anda</h2>
      <div className="bg-[var(--color-white)] rounded-2xl shadow-lg p-8 max-w-3xl mx-auto">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}
        
        {/* Header Info */}
        <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-gray-200 pb-6 mb-6">
          <img
            src={userData.avatar || "/default-avatar.png"}
            alt="avatar"
            className="w-32 h-32 rounded-full border-4 border-[var(--color-secondary)] object-cover shadow-sm"
          />
          <div className="text-center sm:text-left flex-1">
            <h3 className="text-2xl font-semibold text-[var(--color-black)]">
              {isEditing ? (
                <input
                  type="text"
                  name="institution"
                  value={editedData.institution || ''}
                  onChange={handleInputChange}
                  className="w-full text-2xl font-semibold text-[var(--color-black)] bg-transparent border-b border-gray-300 focus:border-[var(--color-primary)] outline-none"
                />
              ) : (
                userData.institution
              )}
            </h3>
            <p className="text-gray-500 mt-1">{userData.email}</p>
            {isEditing ? (
              <input
                type="text"
                name="skill"
                value={editedData.skill || ''}
                onChange={handleInputChange}
                className="text-sm font-medium text-[var(--color-primary)] mt-2 bg-transparent border-b border-gray-300 focus:border-[var(--color-primary)] outline-none"
              />
            ) : (
              <p className="text-sm font-medium text-[var(--color-primary)] mt-2">{userData.skill}</p>
            )}
          </div>
        </div>

        {/* Detail Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-semibold text-gray-500">Instansi / Perseorangan</p>
            {isEditing ? (
              <input
                type="text"
                name="institution"
                value={editedData.institution || ''}
                onChange={handleInputChange}
                className="text-[var(--color-black)] mt-1 w-full bg-transparent border-b border-gray-300 focus:border-[var(--color-primary)] outline-none"
              />
            ) : (
              <p className="text-[var(--color-black)] mt-1">{userData.institution}</p>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Keahlian</p>
            {isEditing ? (
              <textarea
                name="skill"
                value={editedData.skill || ''}
                onChange={handleInputChange}
                rows={2}
                className="text-[var(--color-black)] mt-1 w-full bg-transparent border-b border-gray-300 focus:border-[var(--color-primary)] outline-none resize-none"
              />
            ) : (
              <p className="text-[var(--color-black)] mt-1">{userData.skill}</p>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Alamat</p>
            {isEditing ? (
              <textarea
                name="address"
                value={editedData.address || ''}
                onChange={handleInputChange}
                rows={3}
                className="text-[var(--color-black)] mt-1 w-full bg-transparent border border-gray-300 rounded-md p-2 focus:border-[var(--color-primary)] outline-none resize-vertical"
              />
            ) : (
              <p className="text-[var(--color-black)] mt-1">{userData.address}</p>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Email</p>
            <p className="text-[var(--color-black)] mt-1">{userData.email}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-10">
          {isEditing ? (
            <>
              <button
                onClick={handleSaveProfile}
                className="bg-[var(--color-primary)] text-[var(--color-white)] px-6 py-3 rounded-lg font-medium hover:bg-[var(--color-secondary)] transition-all duration-300 shadow-md"
              >
                Simpan Perubahan
              </button>
              <button
                onClick={handleEditProfile}
                className="bg-gray-200 text-[var(--color-black)] px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-all duration-300"
              >
                Batal
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleEditProfile}
                className="bg-[var(--color-primary)] text-[var(--color-white)] px-6 py-3 rounded-lg font-medium hover:bg-[var(--color-secondary)] transition-all duration-300 shadow-md"
              >
                Edit Profil
              </button>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="bg-[var(--color-secondary)] text-[var(--color-white)] px-6 py-3 rounded-lg font-medium hover:bg-[var(--color-primary)] transition-all duration-300 shadow-md"
              >
                Ubah Password
              </button>
            </>
          )}
        </div>

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--color-white)] rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-[var(--color-black)] mb-4">Ubah Password</h3>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password Saat Ini</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[var(--color-primary)] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[var(--color-primary)] outline-none"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[var(--color-primary)] outline-none"
                    required
                  />
                </div>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-[var(--color-primary)] text-[var(--color-white)] py-2 rounded-lg font-medium hover:bg-[var(--color-secondary)] transition-all duration-300"
                  >
                    Ubah Password
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setError('');
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    className="flex-1 bg-gray-200 text-[var(--color-black)] py-2 rounded-lg font-medium hover:bg-gray-300 transition-all duration-300"
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
  );
}