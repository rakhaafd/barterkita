import React from "react";

export default function Modal({ isOpen, onClose, task, onSendOffer }) {
  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[var(--color-primary)] hover:text-[var(--color-secondary)] text-xl font-bold"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-3">
          {task.title}
        </h2>
        <p className="text-gray-700 mb-4">{task.description}</p>

        <div className="space-y-2 text-sm">
          <p>
            <strong>Skill yang Dibutuhkan:</strong>{" "}
            <span className="text-[var(--color-black)]">{task.neededSkill}</span>
          </p>
          <p>
            <strong>Skill yang Ditawarkan:</strong>{" "}
            <span className="text-[var(--color-black)]">{task.offeredSkill}</span>
          </p>
          <p>
            <strong>Lokasi:</strong>{" "}
            <span className="text-[var(--color-black)]">{task.location}</span>
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => {
              onSendOffer(task);
              onClose();
            }}
            className="bg-[var(--color-primary)] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-[var(--color-secondary)] transition"
          >
            Kirim Tawaran Barter
          </button>
        </div>
      </div>
    </div>
  );
}
