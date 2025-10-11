import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCheckCircle } from "react-icons/fi";

export default function CreateTaskModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    neededSkill: "",
    offeredSkill: "",
    location: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description)
      return alert("Lengkapi semua data!");
    onSubmit(formData);
    setFormData({
      title: "",
      description: "",
      neededSkill: "",
      offeredSkill: "",
      location: "",
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="relative bg-white/90 backdrop-blur-md border border-[var(--color-secondary)]/30 rounded-3xl shadow-2xl max-w-lg w-[90%] p-8 text-[var(--color-black)]"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition text-2xl"
            >
              <FiX />
            </button>

            <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-5 flex items-center gap-2">
              <FiCheckCircle className="text-[var(--color-secondary)]" />
              Create Barter Task
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Judul Barter"
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)]"
              />
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Deskripsi"
                rows="3"
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)]"
              />

              <div className="grid md:grid-cols-2 gap-4">
                <select
                  name="neededSkill"
                  value={formData.neededSkill}
                  onChange={handleChange}
                  className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)]"
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
                  className="p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)]"
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
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)]"
              />

              <button
                type="submit"
                className="w-full py-3 mt-2 bg-[var(--color-primary)] text-white font-semibold rounded-xl hover:opacity-90 transition"
              >
                Submit Task
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
