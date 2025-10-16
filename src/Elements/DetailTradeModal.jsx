import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiMapPin, FiStar, FiMessageSquare, FiUser, FiCalendar, FiImage } from "react-icons/fi";
import Button from "./Button";
import { StatusLabel, SkillLabel } from "./Label";

export default function DetailTradeModal({ isOpen, onClose, task }) {
  const navigate = useNavigate();

  const handleOpenChat = () => {
    console.log("handleOpenChat called for task:", task?.id);
    if (!task) return;
    
    const chatUserId = task.offererId || task.userId;
    if (chatUserId) {
      navigate(`/chat/${task.id}/${chatUserId}`);
      onClose(); // Tutup modal setelah membuka chat
    } else {
      console.error("User ID tidak ditemukan untuk task:", task);
    }
  };

  // Format tanggal
  const formatDate = (timestamp) => {
    if (!timestamp) return "Tanggal tidak tersedia";
    try {
      const date = timestamp.toDate();
      return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return "Tanggal tidak valid";
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
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              console.log("Backdrop clicked");
              onClose();
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 30 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            className="relative bg-white/90 backdrop-blur-md border border-[var(--color-secondary)]/30 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2 text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition text-xl shadow-lg"
            >
              <FiX />
            </button>

            {/* Gambar */}
            <div className="h-64 bg-gray-200 relative overflow-hidden rounded-t-3xl">
              {task.imageBase64 ? (
                <img 
                  src={task.imageBase64} 
                  alt={task.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400">
                  <FiImage className="text-4xl mb-2" />
                  <p className="text-sm">Tidak ada gambar</p>
                </div>
              )}
              
              {/* Status Badge */}
              <div className="absolute top-4 left-4">
                <StatusLabel status={task.status} />
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-2 flex items-center gap-2">
                  <FiStar className="text-[var(--color-secondary)] flex-shrink-0" />
                  {task.title || "Tanpa Judul"}
                </h2>
                
                {/* Informasi Creator dan Tanggal */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <FiUser className="text-[var(--color-primary)]" />
                    <span>Oleh: {task.createdBy || "Anonim"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiCalendar className="text-[var(--color-primary)]" />
                    <span>{formatDate(task.createdAt)}</span>
                  </div>
                </div>

                {/* Deskripsi */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">
                    {task.description || "Tidak ada deskripsi yang disediakan."}
                  </p>
                </div>
              </div>

              {/* Skills Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-[var(--color-secondary)]/10 rounded-xl p-4 border border-[var(--color-secondary)]/20">
                  <h3 className="font-semibold text-[var(--color-primary)] text-sm mb-2 flex items-center gap-2">
                    <FiStar className="text-[var(--color-secondary)]" />
                    Skill yang Dibutuhkan
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <SkillLabel type="needed">
                      {task.requiredSkill || task.neededSkill || "Tidak ditentukan"}
                    </SkillLabel>
                  </div>
                </div>
                
                <div className="bg-[var(--color-primary)]/10 rounded-xl p-4 border border-[var(--color-primary)]/20">
                  <h3 className="font-semibold text-[var(--color-primary)] text-sm mb-2 flex items-center gap-2">
                    <FiStar className="text-[var(--color-primary)]" />
                    Skill yang Ditawarkan
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <SkillLabel type="offered">
                      {task.offeredSkill || "Tidak ditentukan"}
                    </SkillLabel>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3 text-[var(--color-black)]">
                  <div className="bg-[var(--color-primary)]/10 p-2 rounded-lg">
                    <FiMapPin className="text-[var(--color-primary)] text-lg" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-600">Lokasi</p>
                    <p className="text-[var(--color-black)]">
                      {task.location || "Lokasi tidak ditentukan"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <Button
                  onClick={handleOpenChat}
                  variant="primary"
                  className="flex-1 flex items-center justify-center gap-2 py-3"
                >
                  <FiMessageSquare className="text-lg" />
                  Buka Chat
                </Button>
                
                <Button
                  onClick={onClose}
                  variant="secondary"
                  className="flex-1 py-3"
                >
                  Tutup
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}