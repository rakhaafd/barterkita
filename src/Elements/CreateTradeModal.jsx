import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCheckCircle, FiUpload, FiImage, FiType, FiFileText, FiMapPin } from "react-icons/fi";

export default function CreateTradeModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    neededSkill: "",
    offeredSkill: "",
    location: "",
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [skills, setSkills] = useState([]);
  const [skillsLoading, setSkillsLoading] = useState(true);

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
          "photo & videographer", "illustrator", "editor", "marketing", 
          "content creator", "designer", "website developer", "animator", 
          "copy writer", "3d artist"
        ]);
      } finally {
        setSkillsLoading(false);
      }
    };

    fetchSkills();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
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

      setFormData({ ...formData, image: file });

      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: null });
    setImagePreview(null);
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.neededSkill || !formData.offeredSkill) {
      alert("Lengkapi semua data yang diperlukan!");
      return;
    }

    setIsUploading(true);

    try {
      let imageBase64 = "";
      if (formData.image) {
        imageBase64 = await convertToBase64(formData.image);
      }

      onSubmit({
        title: formData.title,
        description: formData.description,
        neededSkill: formData.neededSkill,
        offeredSkill: formData.offeredSkill,
        location: formData.location,
        imageBase64: imageBase64
      });

      setFormData({
        title: "",
        description: "",
        neededSkill: "",
        offeredSkill: "",
        location: "",
        image: null
      });
      setImagePreview(null);

    } catch (error) {
      console.error("Error:", error);
      alert("Gagal memproses gambar. Silakan coba lagi.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-3xl shadow-2xl max-w-md w-full p-6 text-[var(--color-black)] max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] p-2 rounded-xl">
                  <FiCheckCircle className="text-white text-lg" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--color-black)]">
                    Buat Barter Baru
                  </h2>
                  <p className="text-sm text-gray-600">Isi detail tawaran barter Anda</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                disabled={isUploading}
                className="p-2 text-gray-400 hover:text-[var(--color-primary)] transition-colors disabled:opacity-50"
              >
                <FiX className="text-xl" />
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Image Upload */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Gambar Barter (Opsional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center transition-all duration-300 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5">
                  {imagePreview ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative"
                    >
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="mx-auto h-32 w-32 object-cover rounded-xl shadow-md"
                      />
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleRemoveImage}
                        disabled={isUploading}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 text-xs shadow-lg disabled:opacity-50"
                      >
                        <FiX />
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.label
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`cursor-pointer block ${
                        isUploading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <FiImage className="mx-auto text-4xl text-gray-400 mb-3" />
                      <p className="text-sm text-gray-600 mb-2">
                        Klik untuk upload gambar
                      </p>
                      <p className="text-xs text-gray-500 mb-3">
                        JPEG, PNG, GIF, WebP • Maks. 1MB
                      </p>
                      <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white px-4 py-2.5 rounded-xl inline-flex items-center gap-2 text-sm font-medium">
                        <FiUpload />
                        Pilih Gambar
                        <input
                          type="file"
                          accept="image/jpeg, image/jpg, image/png, image/gif, image/webp"
                          onChange={handleImageChange}
                          className="hidden"
                          disabled={isUploading}
                        />
                      </div>
                    </motion.label>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="relative">
                  <FiType className="absolute left-3 top-3.5 text-gray-400 text-lg" />
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Judul Barter"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-300"
                    required
                    disabled={isUploading}
                  />
                </div>

                <div className="relative">
                  <FiFileText className="absolute left-3 top-3.5 text-gray-400 text-lg" />
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Deskripsi lengkap tentang barter yang Anda tawarkan..."
                    rows="3"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-white/80 backdrop-blur-sm resize-none transition-all duration-300"
                    required
                    disabled={isUploading}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="relative">
                    <select
                      name="neededSkill"
                      value={formData.neededSkill}
                      onChange={handleChange}
                      className="w-full p-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-white/80 backdrop-blur-sm appearance-none transition-all duration-300"
                      required
                      disabled={isUploading || skillsLoading}
                    >
                      <option value="">
                        {skillsLoading ? "Memuat skill..." : "Skill yang Dibutuhkan"}
                      </option>
                      {skills.map((skill, index) => (
                        <option key={index} value={skill}>
                          {skill}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-3.5 text-gray-400 pointer-events-none">
                      ▼
                    </div>
                  </div>

                  <div className="relative">
                    <select
                      name="offeredSkill"
                      value={formData.offeredSkill}
                      onChange={handleChange}
                      className="w-full p-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-white/80 backdrop-blur-sm appearance-none transition-all duration-300"
                      required
                      disabled={isUploading || skillsLoading}
                    >
                      <option value="">
                        {skillsLoading ? "Memuat skill..." : "Skill yang Ditawarkan"}
                      </option>
                      {skills.map((skill, index) => (
                        <option key={index} value={skill}>
                          {skill}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-3.5 text-gray-400 pointer-events-none">
                      ▼
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <FiMapPin className="absolute left-3 top-3.5 text-gray-400 text-lg" />
                  <input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Lokasi (contoh: Jakarta, Remote, dll)"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-300"
                    required
                    disabled={isUploading}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isUploading || skillsLoading}
                whileHover={{ scale: isUploading ? 1 : 1.02 }}
                whileTap={{ scale: isUploading ? 1 : 0.98 }}
                className={`w-full py-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)]/90 text-white font-bold rounded-xl transition-all duration-300 shadow-lg ${
                  isUploading || skillsLoading 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:from-[var(--color-secondary)] hover:to-[var(--color-secondary)]/90 hover:shadow-xl'
                }`}
              >
                {isUploading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Membuat Barter...
                  </div>
                ) : (
                  "Buat Tawaran Barter"
                )}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}