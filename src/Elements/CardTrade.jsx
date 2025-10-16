import React from "react";
import { FiInfo, FiMessageSquare, FiImage, FiEdit, FiTrash2 } from "react-icons/fi";
import { SkillLabel, StatusLabel, OwnerLabel } from "./Label";

export default function CardTrade({ item, user, isOwner, onEdit, onDelete, onClick, onOpenDetail }) {
  // Untuk Marketplace, tampilkan tombol berbeda berdasarkan kepemilikan
  const showEditDeleteButtons = isOwner;
  const showTawarButton = !isOwner && user;

  return (
    <div className="bg-white/80 backdrop-blur-md border border-[var(--color-secondary)]/30 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Gambar */}
      <div className="h-48 bg-gray-200 relative overflow-hidden">
        {item.imageBase64 ? (
          <img 
            src={item.imageBase64} 
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <FiImage className="text-4xl text-gray-400" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <StatusLabel status={item.status} />
        </div>

        {/* Owner Badge */}
        {isOwner && (
          <div className="absolute top-3 right-3">
            <OwnerLabel />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-[var(--color-black)] mb-2 line-clamp-2">
          {item.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {item.description}
        </p>

        {/* Skills */}
        <div className="flex flex-wrap gap-2 mb-3">
          <SkillLabel type="needed">
            Butuh: {item.requiredSkill || item.neededSkill}
          </SkillLabel>
          <SkillLabel type="offered">
            Tawaran: {item.offeredSkill}
          </SkillLabel>
        </div>

        {/* Location & Creator */}
        <div className="text-xs text-gray-500 mb-4">
          <p>📍 {item.location}</p>
          <p>Oleh: {item.createdBy}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {/* Tombol Detail selalu ditampilkan */}
          <button
            onClick={onOpenDetail}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition text-sm"
          >
            <FiInfo />
            Detail
          </button>

          {/* Tombol Edit & Delete untuk pemilik */}
          {showEditDeleteButtons ? (
            <>
              <button
                onClick={onEdit}
                className="flex-1 flex items-center justify-center gap-2 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition text-sm"
              >
                <FiEdit />
                Edit
              </button>
              <button
                onClick={onDelete}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition text-sm"
              >
                <FiTrash2 />
                Hapus
              </button>
            </>
          ) : (
            /* Tombol Tawar untuk user lain yang login */
            showTawarButton && (
              <button
                onClick={onClick}
                className="flex-1 flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white py-2 rounded-lg hover:bg-[var(--color-secondary)] transition text-sm"
              >
                <FiMessageSquare />
                Chat
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}