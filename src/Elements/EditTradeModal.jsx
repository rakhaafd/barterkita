import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCheckCircle, FiUpload, FiImage } from "react-icons/fi";

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

  // Initialize form when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        neededSkill: task.neededSkill || task.requiredSkill || "",
        offeredSkill: task.offeredSkill || "",
        location: task.location || "",
        image: null
      });
      setImagePreview(task.imageBase64 || null);
    }
  }, [task]);

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
        alert('Ukuran file maksimal 1MB untuk Base64!');
        return;
      }

      setFormData({ ...formData, image: file });

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
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
    if (!formData.title || !formData.description) {
      alert("Lengkapi semua data yang diperlukan!");
      return;
    }

    setIsUploading(true);

    try {
      let imageBase64 = task.imageBase64; // Keep existing image by default

      // Convert new image to Base64 if provided
      if (formData.image) {
        console.log('Converting new image to Base64...');
        imageBase64 = await convertToBase64(formData.image);
      }

      // Prepare updated task data
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

      // Reset form
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
      console.error("Error updating task:", error);
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 30 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            className="relative bg-white/90 backdrop-blur-md border border-[var(--color-secondary)]/30 rounded-3xl shadow-2xl max-w-lg w-[90%] p-8 text-[var(--color-black)] max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={onClose}
              disabled={isUploading}
              className="absolute top-4 right-4 text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition text-2xl disabled:opacity-50"
            >
              <FiX />
            </button>

            <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-5 flex items-center gap-2">
              <FiCheckCircle className="text-[var(--color-secondary)]" />
              Edit Barter Task
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Upload Gambar */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Upload Gambar Baru (Opsional - max 1MB)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[var(--color-primary)] transition-colors">
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="mx-auto h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        disabled={isUploading}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs disabled:opacity-50"
                      >
                        <FiX />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <FiImage className="mx-auto text-3xl text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 mb-2">
                        Klik untuk upload gambar baru
                      </p>
                      <p className="text-xs text-gray-400 mb-2">
                        JPEG, PNG, GIF, WebP (max 1MB)
                      </p>
                      <label className={`cursor-pointer bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 ${
                        isUploading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}>
                        <FiUpload />
                        Pilih Gambar
                        <input
                          type="file"
                          accept="image/jpeg, image/jpg, image/png, image/gif, image/webp"
                          onChange={handleImageChange}
                          className="hidden"
                          disabled={isUploading}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Judul Barter"
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                required
                disabled={isUploading}
              />
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Deskripsi"
                rows="3"
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                required
                disabled={isUploading}
              />

              <div className="grid md:grid-cols-2 gap-4">
                <select
                  name="neededSkill"
                  value={formData.neededSkill}
                  onChange={handleChange}
                  className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  required
                  disabled={isUploading}
                >
                  <option value="">Skill yang Dibutuhkan</option>
                  <option>Design</option>
                  <option>Programming</option>
                  <option>Writing</option>
                  <option>Marketing</option>
                  <option>Photography</option>
                </select>

                <select
                  name="offeredSkill"
                  value={formData.offeredSkill}
                  onChange={handleChange}
                  className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  required
                  disabled={isUploading}
                >
                  <option value="">Skill yang Ditawarkan</option>
                  <option>UI/UX</option>
                  <option>React.js</option>
                  <option>SEO</option>
                  <option>Illustration</option>
                  <option>Editing</option>
                </select>
              </div>

              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Lokasi"
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                required
                disabled={isUploading}
              />

              <button
                type="submit"
                disabled={isUploading}
                className={`w-full py-3 mt-2 bg-[var(--color-primary)] text-white font-semibold rounded-xl hover:opacity-90 transition ${
                  isUploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isUploading ? 'Memperbarui...' : 'Update Task'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}