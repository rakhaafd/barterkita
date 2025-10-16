import React, { useState, useEffect } from "react";
import {
  FiUser,
  FiList,
  FiShield,
  FiFileText,
  FiLogOut,
  FiX,
  FiMenu,
} from "react-icons/fi";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase/firebase-config";
import { useNavigate, useLocation } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function Sidebar({ activeTab, setActiveTab, onItemClick, isOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(isOpen);

  // Sync sidebarOpen with prop
  useEffect(() => {
    setSidebarOpen(isOpen);
  }, [isOpen]);

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    onItemClick(!sidebarOpen);
  };

  // Responsive: update state on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
        onItemClick(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [onItemClick]);

  // Detect active tab
  const getActiveTab = () => activeTab;

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
      onItemClick(false);
    }
  };

  // Menu items
  const menuItems = [
    { name: "Profil", icon: <FiUser className="w-5 h-5" />, tab: "profile" },
    { name: "Daftar Barter", icon: <FiList className="w-5 h-5" />, tab: "barter" },
    { name: "Ketentuan Pengguna", icon: <FiFileText className="w-5 h-5" />, tab: "terms" },
    { name: "Kebijakan Privasi", icon: <FiShield className="w-5 h-5" />, tab: "privacy" },
  ];

  return (
    <aside
      className={`bg-white h-screen shadow-md flex flex-col justify-between transition-all duration-300
        ${sidebarOpen ? "w-64" : "w-16"} lg:w-64 p-4 lg:p-6 fixed top-0 left-0 z-50 border-r border-gray-200`}
    >
      {/* Header + Toggle */}
      <div>
        <div className="flex items-center justify-center lg:justify-between my-5 gap-10 relative">
          <h1
            className={`text-3xl font-extrabold text-[var(--color-primary)] text-center
              ${sidebarOpen ? "block" : "hidden"} lg:block`}
          >
            BarterKita
          </h1>
          <button
            className="text-gray-700 lg:hidden focus:outline-none"
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? "Close Sidebar" : "Open Sidebar"}
          >
            {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
        {/* Navigation */}
        <nav className="flex flex-col gap-2 mt-6">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                setActiveTab(item.tab);
                navigate("/profile");
                if (window.innerWidth < 1024) {
                  setSidebarOpen(false);
                  onItemClick(false);
                }
              }}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all relative
                ${getActiveTab() === item.tab
                  ? "bg-[var(--color-secondary)] text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
                }
                ${sidebarOpen ? "justify-start" : "justify-center"} lg:justify-start`}
            >
              <div className="text-xl">{item.icon}</div>
              <span className={`${sidebarOpen ? "block" : "hidden"} lg:block font-medium`}>
                {item.name}
              </span>
            </button>
          ))}
        </nav>
      </div>
      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className={`flex items-center gap-3 border border-red-400 text-red-500 hover:bg-red-50 transition-all duration-300 rounded-lg py-3 w-full
          ${sidebarOpen ? "justify-start px-4" : "justify-center"} lg:justify-start`}
      >
        <FiLogOut className="w-5 h-5" />
        <span className={`${sidebarOpen ? "block" : "hidden"} lg:block font-medium`}>
          Keluar
        </span>
      </button>
    </aside>
  );
}