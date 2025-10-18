import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiMenu, FiX, FiHome, FiShoppingBag, FiUser, FiLogOut } from "react-icons/fi";
import { FaUserCircle, FaExchangeAlt } from "react-icons/fa";
import Button from "../Elements/Button";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "../firebase/firebase-config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userAvatar, setUserAvatar] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Pantau perubahan user login Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoggedIn(!!user);
      if (user) {
        // Fetch user data including avatar
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserAvatar(userData.avatar || null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUserAvatar(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const toggleProfileMenu = () => setShowProfileMenu(!showProfileMenu);
  
  const closeMenus = () => {
    setIsOpen(false);
    setShowProfileMenu(false);
  };

  // Fungsi navigasi ke section
  const scrollToSection = (sectionId) => {
    if (location.pathname === "/") {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate("/");
      // Delay scroll untuk memberi waktu halaman load
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
    closeMenus();
  };

  // Navigasi ke marketplace
  const navigateToMarketplace = () => {
    navigate("/marketplace");
    closeMenus();
  };

  // Navigasi ke profile
  const navigateToProfile = () => {
    navigate("/profile");
    closeMenus();
  };

  // Fungsi Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsLoggedIn(false);
      setUserAvatar(null);
      closeMenus();
      navigate("/login");
    } catch (err) {
      console.error("Gagal logout:", err);
    }
  };

  // Navigation items untuk home sections
  const homeSections = [
    { id: "hero-section", label: "Home" },
    { id: "tentang", label: "Tentang" },
    { id: "dampak", label: "Dampak" },
    { id: "testimoni", label: "Testimoni" },
    { id: "pemakaian", label: "Pemakaian" },
    { id: "FAQ", label: "FAQ" }
  ];

  return (
    <nav className="fixed top-4 left-0 right-0 z-50 flex justify-center">
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-[90%] max-w-6xl px-6 py-3 border border-[var(--color-secondary)]/20 rounded-full bg-white/95 backdrop-blur-xl shadow-lg flex items-center justify-between relative"
      >
        
        {/* Animated Background Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)]/5 to-[var(--color-secondary)]/5 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-500" />
        
        {/* LOGO */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative z-10"
        >
          <Link
            to="/"
            className="flex items-center gap-2 group/logo"
            onClick={() => scrollToSection("home")}
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, repeatDelay: 8 }}
              className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] p-1.5 rounded-lg"
            >
              <FaExchangeAlt className="text-white text-sm" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-lg font-black bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
                <h1>BarterKita</h1>
              </span>
            </div>
          </Link>
        </motion.div>

        {/* DESKTOP MENU - Home Sections */}
        <div className="hidden md:flex items-center gap-1 relative z-10">
          {homeSections.map((section, index) => (
            <motion.button
              key={section.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollToSection(section.id)}
              className="px-3 py-1.5 rounded-full font-medium text-sm text-[var(--color-black)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all duration-300"
            >
              {section.label}
            </motion.button>
          ))}
        </div>

        {/* DESKTOP ACTIONS */}
        <div className="hidden md:flex items-center gap-3 relative z-10">
          {/* Visit Marketplace Button */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={navigateToMarketplace}
            className="flex items-center gap-2 px-4 py-1.5 bg-[var(--color-primary)] text-white rounded-full text-sm font-semibold hover:bg-[#093a4b] transition-colors shadow-md"
          >
            <FiShoppingBag size={14} />
            Visit Marketplace
          </motion.button>

          {/* Profile atau Login Button */}
          {isLoggedIn ? (
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.05 }}
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleProfileMenu}
                className="flex items-center gap-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white p-1.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {userAvatar ? (
                  <img 
                    src={userAvatar} 
                    alt="Profile" 
                    className="w-6 h-6 rounded-full object-cover border border-white"
                  />
                ) : (
                  <FaUserCircle size={16} />
                )}
              </motion.button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 bg-white/95 backdrop-blur-xl border border-gray-200 rounded-xl shadow-2xl py-2 w-40 z-50"
                  >
                    <button
                      onClick={navigateToProfile}
                      className="flex items-center gap-3 w-full text-left px-3 py-2 hover:bg-[var(--color-primary)]/5 transition-colors text-[var(--color-black)] text-sm"
                    >
                      <FiUser className="text-[var(--color-primary)]" size={14} />
                      <span>Profil Saya</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full text-left px-3 py-2 text-red-500 hover:bg-red-50 transition-colors text-sm"
                    >
                      <FiLogOut size={14} />
                      <span>Keluar</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <Link to="/login">
              <Button variant="secondary" className="font-semibold text-sm py-1.5 px-4">
                Login
              </Button>
            </Link>
          )}
        </div>

        {/* MOBILE SECTION */}
        <div className="flex items-center gap-3 md:hidden relative z-10">
          {/* Visit Marketplace Button Mobile */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={navigateToMarketplace}
            className="p-1.5 bg-[var(--color-primary)] text-white rounded-full shadow-md"
          >
            <FiShoppingBag size={16} />
          </motion.button>

          {/* Profile atau Login Button Mobile */}
          {isLoggedIn ? (
            <motion.div 
              className="relative"
              whileTap={{ scale: 0.9 }}
            >
              <button
                onClick={toggleProfileMenu}
                className="p-1.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white rounded-full shadow-lg"
              >
                {userAvatar ? (
                  <img 
                    src={userAvatar} 
                    alt="Profile" 
                    className="w-5 h-5 rounded-full object-cover border border-white"
                  />
                ) : (
                  <FaUserCircle size={16} />
                )}
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 bg-white/95 backdrop-blur-xl border border-gray-200 rounded-xl shadow-2xl py-2 w-36 z-50"
                  >
                    <button
                      onClick={navigateToProfile}
                      className="flex items-center gap-3 w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors text-sm"
                    >
                      <FiUser className="text-[var(--color-primary)]" size={14} />
                      <span>Profil Saya</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full text-left px-3 py-2 text-red-500 hover:bg-red-50 transition-colors text-sm"
                    >
                      <FiLogOut size={14} />
                      <span>Keluar</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <Link to="/login">
              <Button variant="secondary" className="font-semibold text-sm py-1.5 px-3">
                Login
              </Button>
            </Link>
          )}
          
          {/* HAMBURGER MENU */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setIsOpen(!isOpen);
              setShowProfileMenu(false);
            }}
            className="p-1.5 rounded-full bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 text-[var(--color-primary)] hover:from-[var(--color-primary)]/20 hover:to-[var(--color-secondary)]/20 transition-all"
          >
            {isOpen ? <FiX size={16} /> : <FiMenu size={16} />}
          </motion.button>
        </div>
      </motion.div>

      {/* MOBILE DROPDOWN MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="absolute top-20 w-[90%] max-w-6xl bg-white/95 backdrop-blur-xl border border-[var(--color-secondary)]/20 rounded-2xl shadow-2xl p-4 z-40"
          >
            <div className="space-y-2">
              {/* Home Sections */}
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
                  Navigasi
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {homeSections.map((section, index) => (
                    <motion.button
                      key={section.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      onClick={() => scrollToSection(section.id)}
                      className="text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-colors duration-200"
                    >
                      {section.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Marketplace */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                onClick={navigateToMarketplace}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-colors"
              >
                <FiShoppingBag size={14} />
                Visit Marketplace
              </motion.button>

              {/* Login untuk yang belum login */}
              {!isLoggedIn && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  className="pt-2 border-t border-gray-200"
                >
                  <Link to="/login" onClick={closeMenus} className="block w-full">
                    <Button variant="secondary" className="w-full font-semibold text-sm py-2">
                      Login
                    </Button>
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;