import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, BarChart, Users, Settings } from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const links = [
    { path: "/admin/dashboard", label: "Dashboard", icon: <BarChart size={18} /> },
    { path: "/admin/user", label: "Users", icon: <Users size={18} /> },
    { path: "/marketplace", label: "Marketplace", icon: <Home size={18} /> },
    { path: "/profile", label: "Profile", icon: <Settings size={18} /> },
  ];

  return (
    <aside className="w-64 h-screen bg-[var(--color-primary)] text-[var(--color-white)] flex flex-col p-4 fixed">
      <h1 className="text-2xl font-bold mb-6">
        Barter<span className="text-[var(--color-secondary)]">Kita</span>
      </h1>

      <nav className="flex flex-col gap-3">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
              location.pathname === link.path
                ? "bg-[var(--color-secondary)] text-[var(--color-black)]"
                : "hover:bg-[#0e607e]"
            }`}
          >
            {link.icon}
            <span className="font-medium">{link.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
