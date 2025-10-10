import React from "react";

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "secondary", // default: secondary
  className = "",
}) => {
  const baseStyle =
    "px-4 py-2 rounded-xl font-semibold transition-all duration-200 focus:outline-none";

  const variants = {
    primary:
      "bg-[var(--color-primary)] text-[var(--color-white)] hover:bg-[#093a4b]",
    secondary:
      "bg-[var(--color-secondary)] text-[var(--color-black)] hover:bg-[#e5aa2f]",
    outline:
      "border-2 border-[var(--color-secondary)] text-[var(--color-black)] hover:bg-[var(--color-secondary)] hover:text-[var(--color-black)]",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
