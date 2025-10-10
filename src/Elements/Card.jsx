import React from "react";

const Card = ({ children, className = "" }) => {
  return (
    <div
      className={`bg-[var(--color-white)] shadow-md rounded-2xl p-4 border border-[var(--color-primary)] hover:shadow-lg transition-all duration-200 ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
