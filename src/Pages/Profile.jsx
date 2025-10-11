import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../Elements/Sidebar";
import EditProfile from "./EditProfile";
import BarterList from "./BarterList";
import Terms from "./Terms";

export default function Profile() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    // Determine active tab based on the current route
    switch (location.pathname) {
      case "/barter-list":
        return "barter";
      case "/terms":
        return "terms";
      case "/profile":
      default:
        return "profile";
    }
  });

  return (
    <div className="flex min-h-screen bg-[var(--color-white)]">
      <Sidebar setActiveTab={setActiveTab} />
      <main className="flex-1 ml-64">
        <>
          {activeTab === "profile" && <EditProfile />}
          {activeTab === "barter" && <BarterList />}
          {activeTab === "terms" && <Terms />}
        </>
      </main>
    </div>
  );
}