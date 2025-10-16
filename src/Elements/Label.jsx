import React from "react";

export default function Label({ type }) {
  let labelConfig = {
    baru: {
      text: "🌟 Terbaru",
      bg: "bg-blue-100",
      textColor: "text-blue-700",
    },
    match: {
      text: "🧠 Sesuai Keahlian Anda",
      bg: "bg-purple-100",
      textColor: "text-purple-700",
    },
    proses: {
      text: "📦 Dalam Proses",
      bg: "bg-yellow-100",
      textColor: "text-yellow-700",
    },
    selesai: {
      text: "✅ Selesai",
      bg: "bg-green-100",
      textColor: "text-green-700",
    },
  };

  const { text, bg, textColor } = labelConfig[type] || labelConfig["baru"];

  return (
    <span
      className={`inline-block mt-2 ${bg} ${textColor} text-xs font-semibold px-3 py-1 rounded-full w-fit`}
    >
      {text}
    </span>
  );
}
