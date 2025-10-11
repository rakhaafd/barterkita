import { useState } from "react";
import { Link } from "react-router";
import { FiMenu, FiX } from "react-icons/fi";
import Button from "../Elements/Button";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-4 left-0 right-0 z-50 flex justify-center">
      <div className="w-[90%] max-w-6xl px-5 py-3 md:px-6 border rounded-full bg-[var(--color-white)] shadow-md backdrop-blur-md">
        <div className="flex items-center justify-between">
          {/* LOGO */}
          <Link
            to="/"
            className="text-2xl font-bold text-[var(--color-primary)] tracking-wide"
          >
            Barter<span className="text-[var(--color-secondary)]">Kita</span>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-8 font-medium text-[var(--color-black)]">
            <Link
              to="/"
              className="hover:text-[var(--color-secondary)] transition-colors"
            >
              Home
            </Link>
            <Link
              to="/marketplace"
              className="hover:text-[var(--color-secondary)] transition-colors"
            >
              Marketplace
            </Link>
            <Link
              to="/profile"
              className="hover:text-[var(--color-secondary)] transition-colors"
            >
              Profile
            </Link>
          </div>

          {/* DESKTOP BUTTONS */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button variant="secondary" className="font-semibold">
                Login
              </Button>
            </Link>
          </div>

          {/* MOBILE MENU TOGGLE */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-[var(--color-black)]"
          >
            {isOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        {isOpen && (
          <div className="md:hidden mt-3 bg-[var(--color-white)] border rounded-2xl shadow-md p-4 text-center flex flex-col gap-4">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="text-[var(--color-black)] hover:text-[var(--color-secondary)] transition-colors"
            >
              Home
            </Link>
            <Link
              to="/marketplace"
              onClick={() => setIsOpen(false)}
              className="text-[var(--color-black)] hover:text-[var(--color-secondary)] transition-colors"
            >
              Marketplace
            </Link>
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="text-[var(--color-black)] hover:text-[var(--color-secondary)] transition-colors"
            >
              Profile
            </Link>
            <div className="flex flex-col gap-2 mt-2">
              <Link to="/login" onClick={() => setIsOpen(false)}>
                <Button variant="secondary" className="w-full font-semibold">
                  Login
                </Button>
              </Link>
              <Link to="/register" onClick={() => setIsOpen(false)}>
                <Button variant="primary" className="w-full font-semibold">
                  Register
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
