import React from "react";

const Label = ({ htmlFor, children, className = "" }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`block mb-1 font-medium text-[var(--color-black)] ${className}`}
    >
      {children}
    </label>
  );
};

export default Label;
