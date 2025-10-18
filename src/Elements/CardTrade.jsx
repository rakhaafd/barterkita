import React from "react";
import { motion } from "framer-motion";
import { 
  FiInfo, 
  FiMessageSquare, 
  FiImage, 
  FiEdit, 
  FiTrash2, 
  FiMapPin, 
  FiUser,
  FiClock,
  FiStar
} from "react-icons/fi";
import { SkillLabel, StatusLabel, OwnerLabel } from "./Label";

export default function CardTrade({ item, user, isOwner, onEdit, onDelete, onClick, onOpenDetail }) {
  const showEditDeleteButtons = isOwner;
  const showTawarButton = !isOwner && user;

  // Format date if available
  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    try {
      const date = timestamp.toDate();
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return "";
    }
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden hover:border-[var(--color-primary)]/20"
    >
      {/* Gambar dengan overlay gradient */}
      <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
        {item.imageBase64 ? (
          <img 
            src={item.imageBase64} 
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10">
            <div className="relative">
              <FiImage className="text-4xl text-gray-400 mb-2" />
              <div className="absolute -inset-2 bg-[var(--color-primary)]/10 rounded-full blur-sm"></div>
            </div>
            <p className="text-gray-500 text-sm font-medium">No Image</p>
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Status & Owner Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <StatusLabel status={item.status} />
          {isOwner && <OwnerLabel />}
        </div>

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-secondary)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Header dengan icon */}
        <div className="mb-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-lg flex items-center justify-center">
                <FiStar className="text-white text-sm" />
              </div>
              <h3 className="text-lg font-bold text-[var(--color-black)] line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors duration-300 leading-tight">
                {item.title}
              </h3>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-4">
            {item.description}
          </p>
        </div>

        {/* Skills dengan background */}
        <div className="flex flex-wrap gap-2 mb-5">
          <div className="flex-1 min-w-[120px]">
            <SkillLabel type="needed">
              <span className="font-semibold">Butuh:</span> {item.requiredSkill || item.neededSkill}
            </SkillLabel>
          </div>
          <div className="flex-1 min-w-[120px]">
            <SkillLabel type="offered">
              <span className="font-semibold">Tawaran:</span> {item.offeredSkill}
            </SkillLabel>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50/80 rounded-lg px-3 py-2">
            <div className="w-6 h-6 bg-[var(--color-primary)]/10 rounded flex items-center justify-center">
              <FiMapPin className="text-[var(--color-primary)]" size={12} />
            </div>
            <span className="font-medium truncate">{item.location}</span>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50/80 rounded-lg px-3 py-2">
            <div className="w-6 h-6 bg-[var(--color-secondary)]/10 rounded flex items-center justify-center">
              <FiUser className="text-[var(--color-secondary)]" size={12} />
            </div>
            <span className="font-medium truncate">{item.createdBy}</span>
          </div>
        </div>

        {/* Date if available */}
        {item.createdAt && (
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
            <FiClock size={12} />
            <span>{formatDate(item.createdAt)}</span>
          </div>
        )}

        {/* Actions dengan gradient border */}
        <div className="flex gap-3 pt-4 border-t border-gray-200/60">
          {/* Tombol Detail */}
          <motion.button
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenDetail}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 hover:text-[var(--color-primary)] transition-all duration-300 text-sm font-semibold border border-transparent hover:border-gray-300"
          >
            <FiInfo className="text-sm" />
            Detail
          </motion.button>

          {/* Tombol Edit & Delete atau Chat */}
          {showEditDeleteButtons ? (
            <>
              <motion.button
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onEdit}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white py-3 rounded-xl hover:from-amber-600 hover:to-yellow-600 transition-all duration-300 text-sm font-semibold shadow-md"
              >
                <FiEdit className="text-sm" />
                Edit
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onDelete}
                className="flex-1 flex items-center justify-center gap-2 bg-red-400 text-white py-3 rounded-xl hover:bg-red-600 transition-all duration-300 text-sm font-semibold shadow-md"
              >
                <FiTrash2 className="text-sm" />
                Hapus
              </motion.button>
            </>
          ) : (
            showTawarButton && (
              <motion.button
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClick}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white py-3 rounded-xl hover:from-[var(--color-primary)]/90 hover:to-[var(--color-secondary)]/90 transition-all duration-300 text-sm font-semibold shadow-lg group"
              >
                <FiMessageSquare className="text-sm group-hover:scale-110 transition-transform" />
                Tawar
              </motion.button>
            )
          )}
        </div>

        {/* Progress indicator untuk status proses */}
        {item.status === "proses" && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Progress Barter</span>
              <span className="font-semibold text-[var(--color-primary)]">Dalam Proses</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "60%" }}
                transition={{ duration: 1, delay: 0.5 }}
                className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] h-1.5 rounded-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
}