import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiUser, FiList, FiShield, FiFileText, FiLogOut } from "react-icons/fi";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase-config";

export default function Sidebar({ setActiveTab }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const menuItems = [
    { name: "Profil", icon: <FiUser className="w-5 h-5" />, path: "/profile", tab: "profile" },
    { name: "Daftar Barter", icon: <FiList className="w-5 h-5" />, path: "/barter-list", tab: "barter" },
    { name: "Kebijakan Privasi", icon: <FiShield className="w-5 h-5" />, path: "/privacy-policy", tab: "privacy" },
    { name: "Ketentuan Pengguna", icon: <FiFileText className="w-5 h-5" />, path: "/terms", tab: "terms" },
  ];

  return (
    <aside className="fixed left-0 top-0 min-h-screen w-64 bg-[var(--color-white)] border-r border-gray-200 flex flex-col justify-between py-8 px-4 shadow-lg">
      {/* Logo */}
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--color-primary)] text-center mb-10">
          BarterKita
        </h1>
        {/* Menu Navigation */}
        <nav className="flex flex-col gap-2">
          {menuItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              onClick={() => setActiveTab(item.tab)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  isActive
                    ? "bg-[var(--color-secondary)] text-[var(--color-white)] shadow-md"
                    : "text-[var(--color-black)] hover:bg-gray-100"
                }`
              }
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>
      {/* Sign Out Button */}
      <button
        onClick={handleLogout}
        className="flex items-center justify-center gap-2 border border-red-400 text-red-500 hover:bg-red-50 transition-all duration-300 rounded-lg py-3 font-medium"
      >
        <FiLogOut className="w-5 h-5" />
        Keluar
      </button>
    </aside>
  );
}