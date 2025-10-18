import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCheckCircle, FiUpload, FiImage, FiType, FiFileText, FiMapPin, FiEdit, FiRefreshCw, FiCamera } from "react-icons/fi";

export default function EditTradeModal({ isOpen, onClose, onEditTask, task }) {
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
  const [isChangingImage, setIsChangingImage] = useState(false);

  // Fetch skills from JSON
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await fetch('/data/skills.json');
        if (!response.ok) throw new Error('Failed to fetch skills');
        const data = await response.json();
        setSkills(data.skills);
      } catch (error) {
        console.error('Error loading skills:', error);
        // Fallback skills jika fetch gagal
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

  // Initialize form when task changes
  useEffect(() => {
    if (task) {
      const currentNeededSkill = task.neededSkill || task.requiredSkill || "";
      const currentOfferedSkill = task.offeredSkill || "";
      
      setFormData({
        title: task.title || "",
        description: task.description || "",
        neededSkill: currentNeededSkill,
        offeredSkill: currentOfferedSkill,
        location: task.location || "",
        image: null
      });
      setImagePreview(task.imageBase64 || null);
      setIsChangingImage(false);

      // Add current skills to options if they don't exist
      if (currentNeededSkill && !skills.includes(currentNeededSkill)) {
        setSkills(prev => [...prev, currentNeededSkill]);
      }
      if (currentOfferedSkill && !skills.includes(currentOfferedSkill)) {
        setSkills(prev => [...prev, currentOfferedSkill]);
      }
    }
  }, [task, skills]);

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
      setIsChangingImage(true);

      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: null });
    setImagePreview(null);
    setIsChangingImage(true);
  };

  const handleRestoreOriginalImage = () => {
    setFormData({ ...formData, image: null });
    setImagePreview(task.imageBase64 || null);
    setIsChangingImage(false);
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
      let imageBase64 = task.imageBase64;
      
      // Jika ada gambar baru, convert ke base64
      if (formData.image) {
        imageBase64 = await convertToBase64(formData.image);
      }
      
      // Jika gambar dihapus, set ke null
      if (isChangingImage && !formData.image && !imagePreview) {
        imageBase64 = null;
      }

      const updatedTask = {
        id: task.id,
        title: formData.title,
        description: formData.description,
        neededSkill: formData.neededSkill,
        offeredSkill: formData.offeredSkill,
        location: formData.location,
        requiredSkill: formData.neededSkill,
        imageBase64: imageBase64
      };

      await onEditTask(updatedTask);

      setFormData({
        title: "",
        description: "",
        neededSkill: "",
        offeredSkill: "",
        location: "",
        image: null
      });
      setImagePreview(null);
      setIsChangingImage(false);

    } catch (error) {
      console.error("Error:", error);
      alert("Gagal memperbarui tawaran. Silakan coba lagi.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!task) return null;

  return (
    <AnimatePresence>
      {isOpen && task && (
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
                  <FiEdit className="text-white text-lg" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--color-black)]">
                    Edit Barter
                  </h2>
                  <p className="text-sm text-gray-600">Perbarui detail tawaran barter</p>
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
              {/* Image Upload Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-gray-700">
                    Gambar Barter
                  </label>
                  {task.imageBase64 && isChangingImage && (
                    <motion.button
                      type="button"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleRestoreOriginalImage}
                      disabled={isUploading}
                      className="flex items-center gap-1 text-xs text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors disabled:opacity-50"
                    >
                      <FiRefreshCw size={12} />
                      Kembali ke gambar asli
                    </motion.button>
                  )}
                </div>

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
                      
                      {/* Image Action Buttons */}
                      <div className="flex justify-center gap-2 mt-3">
                        <motion.label
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`flex items-center gap-2 bg-[var(--color-primary)] text-white px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                            isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[var(--color-secondary)]'
                          }`}
                        >
                          <FiCamera size={12} />
                          Ganti
                          <input
                            type="file"
                            accept="image/jpeg, image/jpg, image/png, image/gif, image/webp"
                            onChange={handleImageChange}
                            className="hidden"
                            disabled={isUploading}
                          />
                        </motion.label>
                        
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleRemoveImage}
                          disabled={isUploading}
                          className="flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-600 transition-all disabled:opacity-50"
                        >
                          <FiX size={12} />
                          Hapus
                        </motion.button>
                      </div>

                      {/* Change Indicator */}
                      {isChangingImage && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg"
                        >
                          BARU
                        </motion.div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.label
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`cursor-pointer block ${
                        isUploading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <div className="relative">
                        <FiImage className="mx-auto text-4xl text-gray-400 mb-3" />
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 rounded-full blur-sm"></div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {task.imageBase64 ? "Klik untuk ganti gambar" : "Upload gambar barter"}
                      </p>
                      <p className="text-xs text-gray-500 mb-3">
                        JPEG, PNG, GIF, WebP • Maks. 1MB
                      </p>
                      <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white px-4 py-2.5 rounded-xl inline-flex items-center gap-2 text-sm font-medium">
                        <FiUpload />
                        {task.imageBase64 ? "Ganti Gambar" : "Upload Gambar"}
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

                {/* Image Status Info */}
                <AnimatePresence>
                  {isChangingImage && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-blue-50 border border-blue-200 rounded-xl p-3"
                    >
                      <div className="flex items-center gap-2 text-blue-700 text-xs">
                        <FiCheckCircle className="text-blue-500" />
                        <span>Gambar baru telah dipilih. Klik "Update Barter" untuk menyimpan perubahan.</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
                  {/* Skill yang Dibutuhkan */}
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
                        <option 
                          key={`needed-${index}`} 
                          value={skill}
                          className={skill === formData.neededSkill ? "bg-[var(--color-primary)]/10 font-semibold" : ""}
                        >
                          {skill}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-3.5 text-gray-400 pointer-events-none">
                      ▼
                    </div>
                  </div>

                  {/* Skill yang Ditawarkan */}
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
                        <option 
                          key={`offered-${index}`} 
                          value={skill}
                          className={skill === formData.offeredSkill ? "bg-[var(--color-primary)]/10 font-semibold" : ""}
                        >
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
                    Memperbarui...
                  </div>
                ) : skillsLoading ? (
                  "Memuat Skills..."
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <FiCheckCircle className="text-lg" />
                    Update Barter
                    {isChangingImage && " + Gambar"}
                  </div>
                )}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}