import React, { useState, useEffect } from "react";
import Sidebar from "../Elements/Sidebar";
import EditProfile from "../Fragments/EditProfile";
import BarterList from "../Fragments/BarterList";
import Terms from "../Fragments/Terms";
import Privacy from "../Fragments/Privacy";
import { useLocation } from "react-router-dom";

export default function Profile() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || "profile");
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 768);

  // Responsif: ubah saat ukuran layar berubah
  useEffect(() => {
    const handleResize = () => setIsSidebarOpen(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  const renderContent = () => {
    switch (activeTab) {
      case "barter":
        return <BarterList />;
      case "terms":
        return <Terms />;
      case "privacy":
        return <Privacy />;
      default:
        return <EditProfile />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-white)]">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Konten utama - HAPUS PADDING DI SINI karena sudah dihandle di komponen child */}
      <main
        className={`flex-1 transition-all duration-300 min-w-0
          ${isSidebarOpen ? "md:ml-64" : "ml-16 md:ml-64"}`}
      >
        {renderContent()}
      </main>
    </div>
  );
}