import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import Button from "../Elements/Button";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "../firebase/firebase-config";
import { onAuthStateChanged, signOut } from "firebase/auth";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  // Pantau perubahan user login Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  const toggleProfileMenu = () => setShowProfileMenu(!showProfileMenu);
  const closeMenus = () => {
    setIsOpen(false);
    setShowProfileMenu(false);
  };

  // Fungsi Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsLoggedIn(false);
      closeMenus();
      navigate("/login"); // redirect ke login
    } catch (err) {
      console.error("Gagal logout:", err);
    }
  };

  return (
    <nav className="fixed top-4 left-0 right-0 z-50 flex justify-center">
      <div className="w-[90%] max-w-6xl px-5 py-3 md:px-6 border rounded-xl md:rounded-full bg-[var(--color-white)] shadow-md backdrop-blur-md flex items-center justify-between relative">
        {/* LOGO */}
        <Link
          to="/"
          className="text-2xl font-bold text-[var(--color-primary)] tracking-wide"
        >
          Barter<span className="text-[var(--color-secondary)]">Kita</span>
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-8 font-medium text-[var(--color-black)]">
          <Link to="/" className="hover:text-[var(--color-secondary)] transition-colors">
            Home
          </Link>
          <Link to="/marketplace" className="hover:text-[var(--color-secondary)] transition-colors">
            Marketplace
          </Link>
          <Link to="/dashboard" className="hover:text-[var(--color-secondary)] transition-colors">
            Dashboard
          </Link>
        </div>

        {/* DESKTOP BUTTON / AVATAR */}
        <div className="hidden md:flex items-center gap-3 relative">
          {isLoggedIn ? (
            <div className="relative">
              <FaUserCircle
                size={32}
                className="cursor-pointer text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition"
                onClick={toggleProfileMenu}
              />
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 bg-white border rounded-xl shadow-lg py-2 w-44 text-sm z-50"
                  >
                    <Link
                      to="/profile"
                      onClick={closeMenus}
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Profil Saya
                    </Link>
                    <Link
                      to="/my-barters"
                      onClick={closeMenus}
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Daftar Barter
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                    >
                      Keluar
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/login">
              <Button variant="secondary" className="font-semibold">
                Login
              </Button>
            </Link>
          )}
        </div>

        {/* MOBILE SECTION */}
        <div className="flex items-center gap-3 md:hidden">
          {/* ICON PROFIL MOBILE */}
          {isLoggedIn && (
            <div className="relative">
              <FaUserCircle
                size={28}
                className="cursor-pointer text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition"
                onClick={toggleProfileMenu}
              />
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 bg-white border rounded-xl shadow-lg py-2 w-44 text-sm z-50"
                  >
                    <Link
                      to="/profile"
                      onClick={closeMenus}
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Profil Saya
                    </Link>
                    <Link
                      to="/my-barters"
                      onClick={closeMenus}
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Daftar Barter
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                    >
                      Keluar
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* HAMBURGER MENU */}
          <button
            onClick={() => {
              setIsOpen(!isOpen);
              setShowProfileMenu(false);
            }}
            className="text-[var(--color-black)]"
          >
            {isOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="absolute top-[75px] w-[90%] max-w-6xl bg-[var(--color-white)] border rounded-2xl shadow-lg p-5 text-center flex flex-col gap-4 z-40"
          >
            <Link
              to="/"
              onClick={closeMenus}
              className="text-[var(--color-black)] hover:text-[var(--color-secondary)] transition-colors"
            >
              Home
            </Link>
            <Link
              to="/marketplace"
              onClick={closeMenus}
              className="text-[var(--color-black)] hover:text-[var(--color-secondary)] transition-colors"
            >
              Marketplace
            </Link>
            <Link
              to="/dashboard"
              onClick={closeMenus}
              className="text-[var(--color-black)] hover:text-[var(--color-secondary)] transition-colors"
            >
              Dashboard
            </Link>

            {/* Jika belum login tampilkan tombol login */}
            {!isLoggedIn && (
              <Link to="/login" onClick={closeMenus}>
                <Button variant="secondary" className="w-full font-semibold">
                  Login
                </Button>
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
