import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiMapPin, FiSend, FiStar } from "react-icons/fi";

export default function Modal({ isOpen, onClose, task, onSendOffer }) {
  return (
    <AnimatePresence>
      {isOpen && task && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 30 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            className="relative bg-white/80 backdrop-blur-md border border-[var(--color-secondary)]/30 rounded-3xl shadow-2xl max-w-lg w-[90%] p-8 text-[var(--color-black)]"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition text-2xl"
            >
              <FiX />
            </button>

            {/* Header */}
            <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-2 flex items-center gap-2">
              <FiStar className="text-[var(--color-secondary)]" />
              {task.title}
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">{task.description}</p>

            {/* Divider */}
            <div className="border-t border-gray-200 my-4"></div>

            {/* Detail Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="bg-[var(--color-secondary)]/10 rounded-lg px-4 py-3">
                <p className="font-semibold text-[var(--color-primary)] text-sm">
                  Skill yang Dibutuhkan
                </p>
                <p className="text-[var(--color-black)]">{task.neededSkill}</p>
              </div>

              <div className="bg-[var(--color-primary)]/10 rounded-lg px-4 py-3">
                <p className="font-semibold text-[var(--color-primary)] text-sm">
                  Skill yang Ditawarkan
                </p>
                <p className="text-[var(--color-black)]">{task.offeredSkill}</p>
              </div>

              <div className="col-span-2 flex items-center mt-2 text-[var(--color-black)] gap-2 text-sm">
                <FiMapPin className="text-[var(--color-primary)]" />
                <span>{task.location}</span>
              </div>
            </div>

            {/* Button */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => {
                  onSendOffer(task);
                  onClose();
                }}
                className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-6 py-2.5 rounded-xl font-semibold shadow-md hover:shadow-lg hover:bg-[var(--color-secondary)] transition-all duration-300"
              >
                <FiSend />
                Kirim Tawaran Barter
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
