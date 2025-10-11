import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiUser,
  FiList,
  FiShield,
  FiFileText,
  FiLogOut,
} from "react-icons/fi";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase-config";

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const menuItems = [
    { name: "Profile", icon: <FiUser />, path: "/profile" },
    { name: "Daftar Barter", icon: <FiList />, path: "/barter-list" },
    { name: "Kebijakan Privasi", icon: <FiShield />, path: "/privacy-policy" },
    { name: "Ketentuan Pengguna", icon: <FiFileText />, path: "/terms" },
  ];

  return (
    <aside className="min-h-screen w-64 bg-white border-r border-gray-200 flex flex-col justify-between py-6 px-4 fixed left-0 top-0">
      {/* Logo */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-primary)] text-center mb-8">
          BarterKita
        </h1>

        {/* Menu Navigasi */}
        <nav className="flex flex-col gap-2">
          {menuItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 ${
                  isActive
                    ? "bg-[var(--color-secondary)] text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Tombol Sign Out */}
      <button
        onClick={handleLogout}
        className="flex items-center justify-center gap-2 border border-red-400 text-red-500 hover:bg-red-50 transition-all duration-300 rounded-lg py-2 font-medium"
      >
        <FiLogOut />
        Keluar
      </button>
    </aside>
  );
}
