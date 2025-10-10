import React from "react";

const Input = ({ type = "text", placeholder, value, onChange, className = "" }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-2 border rounded-lg bg-[var(--color-white)] border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-secondary)] focus:outline-none ${className}`}
    />
  );
};

export default Input;
