import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

// Pages
import Home from "./Pages/Home.jsx";
import Profile from "./Pages/Profile.jsx";
import Login from "./Pages/Login.jsx";
import Register from "./Pages/Register.jsx";
import Marketplace from "./Pages/Marketplace.jsx";

// Admin Pages
import Dashboard from "./Pages/Admin/Dashboard.jsx";
import AdminLogin from "./Pages/Admin/Login.jsx";
import User from "./Pages/Admin/User.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/marketplace" element={<Marketplace />} /> */}

        {/* Admin Nested */}
        {/* <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/user" element={<User />} /> */}
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
