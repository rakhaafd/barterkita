import React from "react";

// Komponen Label untuk Skill
export const SkillLabel = ({ type, children }) => {
  const baseClasses = "px-2 py-1 rounded text-xs font-medium";
  
  const typeClasses = {
    needed: "bg-[#0b4e65] text-white", // primary color
    offered: "bg-[#fbc13a] text-[#2a2b2a]", // secondary color
  };

  return (
    <span className={`${baseClasses} ${typeClasses[type] || typeClasses.needed}`}>
      {children}
    </span>
  );
};

// Komponen Label untuk Status
export const StatusLabel = ({ status }) => {
  const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold";
  
  const statusConfig = {
    baru: {
      className: "bg-green-100 text-green-800 border border-green-200",
      label: "Baru"
    },
    proses: {
      className: "bg-blue-100 text-blue-800 border border-blue-200",
      label: "Proses"
    },
    selesai: {
      className: "bg-gray-100 text-gray-800 border border-gray-200",
      label: "Selesai"
    }
  };

  const config = statusConfig[status] || statusConfig.baru;

  return (
    <span className={`${baseClasses} ${config.className}`}>
      {config.label}
    </span>
  );
};

// Komponen Label untuk Kepemilikan
export const OwnerLabel = () => {
  return (
    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#0b4e65] text-white border border-[#0b4e65]">
      Milik Anda
    </span>
  );
};

// Komponen Label Kustom dengan warna primary
export const PrimaryLabel = ({ children, className = "" }) => {
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-[#0b4e65] text-white border border-[#0b4e65] ${className}`}>
      {children}
    </span>
  );
};

// Komponen Label Kustom dengan warna secondary
export const SecondaryLabel = ({ children, className = "" }) => {
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-[#fbc13a] text-[#2a2b2a] border border-[#fbc13a] ${className}`}>
      {children}
    </span>
  );
};

export default {
  SkillLabel,
  StatusLabel,
  OwnerLabel,
  PrimaryLabel,
  SecondaryLabel
};