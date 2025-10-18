import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiMapPin, FiSend, FiStar, FiMessageSquare, FiUser, FiCheckCircle, FiArrowRight } from "react-icons/fi";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/firebase-config";
import Button from "./Button";
import { showSuccess, showError } from "./Alert";
import { SkillLabel, StatusLabel } from "./Label";

export default function Modal({ isOpen, onClose, task, onSendOffer, onAcceptOffer, offerId }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log("Modal: Current user:", user ? user.uid : "None");
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleSendOffer = async () => {
    console.log("handleSendOffer called for task:", task?.id);
    if (!currentUser) {
      showError({ title: "Gagal!", text: "Anda harus login untuk mengirim tawaran." });
      return;
    }

    try {
      const offerData = {
        taskId: task.id,
        taskCreatorId: task.userId,
        offererId: currentUser.uid,
        status: "pending",
        createdAt: serverTimestamp(),
      };
      console.log("Sending offer data:", offerData);
      await onSendOffer(offerData);

      const chatId = [currentUser.uid, task.userId, task.id].sort().join("_");
      const chatRef = doc(db, "chats", chatId);
      await setDoc(chatRef, { createdAt: serverTimestamp(), agreements: {} }, { merge: true });
      console.log("Created new chat:", chatId);

      showSuccess({ 
        title: "Tawaran Terkirim! 🎉", 
        text: "Tawaran barter berhasil dikirim. Anda akan diarahkan ke chat." 
      });
      navigate(`/chat/${task.id}/${task.userId}`);
    } catch (err) {
      console.error("Gagal mengirim tawaran:", err.message, err.code);
      showError({ 
        title: "Gagal Mengirim", 
        text: "Terjadi kesalahan saat mengirim tawaran. Silakan coba lagi." 
      });
    }
  };

  const handleAcceptOffer = async () => {
    console.log("handleAcceptOffer called:", { offerId, taskId: task.id });
    if (!offerId || !task.id) {
      console.error("Invalid offerId or taskId:", { offerId, taskId: task.id });
      showError({ title: "Gagal!", text: "Data tawaran tidak valid." });
      return;
    }
    try {
      await onAcceptOffer(offerId, task.id);
      showSuccess({ 
        title: "Tawaran Diterima! ✅", 
        text: "Tawaran berhasil diterima. Mulai kolaborasi sekarang!" 
      });
      navigate(`/chat/${task.id}/${task.offererId}`);
      onClose();
    } catch (err) {
      console.error("Gagal menerima tawaran:", err.message, err.code);
      showError({ 
        title: "Gagal Menerima", 
        text: "Terjadi kesalahan saat menerima tawaran." 
      });
    }
  };

  const handleOpenChat = () => {
    console.log("handleOpenChat called for task:", task.id);
    const chatUserId = task.offererId || task.userId;
    navigate(`/chat/${task.id}/${chatUserId}`);
  };

  return (
    <AnimatePresence>
      {isOpen && task && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-3xl shadow-2xl max-w-md w-full p-6 text-[var(--color-black)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] p-2 rounded-xl">
                  <FiStar className="text-white text-lg" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--color-black)]">
                    {onAcceptOffer ? "Terima Tawaran" : "Kirim Tawaran"}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {onAcceptOffer ? "Konfirmasi penerimaan tawaran" : "Ajukan tawaran barter Anda"}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-[var(--color-primary)] transition-colors"
              >
                <FiX className="text-xl" />
              </motion.button>
            </div>

            {/* Task Preview */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100/80 rounded-2xl p-5 mb-6 border border-gray-200/60">
              {/* Task Header */}
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-bold text-[var(--color-black)] leading-tight">
                  {task.title}
                </h3>
                <StatusLabel status={task.status} />
              </div>

              {/* Description */}
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                {task.description}
              </p>

              {/* Skills */}
              <div className="flex flex-wrap gap-2 mb-4">
                <SkillLabel type="needed">
                  Butuh: {task.requiredSkill || task.neededSkill}
                </SkillLabel>
                <SkillLabel type="offered">
                  Tawaran: {task.offeredSkill}
                </SkillLabel>
              </div>

              {/* Location & Creator */}
              <div className="flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-white/80 px-2 py-1 rounded-lg">
                    <FiMapPin className="text-[var(--color-primary)]" size={12} />
                    <span>{task.location}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white/80 px-2 py-1 rounded-lg">
                    <FiUser className="text-[var(--color-secondary)]" size={12} />
                    <span>{task.createdBy}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-[var(--color-primary)]/5 to-[var(--color-secondary)]/5 rounded-2xl p-4 mb-6 border border-[var(--color-primary)]/20"
            >
              <div className="flex items-center gap-3">
                <div className="bg-[var(--color-primary)] text-white p-2 rounded-lg">
                  <FiCheckCircle className="text-lg" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-primary)]">
                    {onAcceptOffer ? "Siap Kolaborasi?" : "Siap Bertukar Skill?"}
                  </p>
                  <p className="text-xs text-gray-600">
                    {onAcceptOffer 
                      ? "Terima tawaran untuk memulai kolaborasi barter" 
                      : "Kirim tawaran untuk memulai percakapan barter"
                    }
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              {onAcceptOffer && offerId ? (
                <>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={handleAcceptOffer}
                      variant="primary"
                      className="w-full py-4 text-base font-semibold flex items-center justify-center gap-2"
                    >
                      <FiCheckCircle className="text-lg" />
                      Terima & Mulai Kolaborasi
                      <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={handleOpenChat}
                      variant="outline"
                      className="w-full py-3 text-sm font-medium border-2 flex items-center justify-center gap-2"
                    >
                      <FiMessageSquare className="text-lg" />
                      Lihat Chat Dulu
                    </Button>
                  </motion.div>
                </>
              ) : task.status === "proses" ? (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleOpenChat}
                    variant="primary"
                    className="w-full py-4 text-base font-semibold flex items-center justify-center gap-2"
                  >
                    <FiMessageSquare className="text-lg" />
                    Buka Chat Barter
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleSendOffer}
                    variant="primary"
                    className="w-full py-4 text-base font-semibold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)]/90 hover:from-[var(--color-secondary)] hover:to-[var(--color-secondary)]/90 flex items-center justify-center gap-2"
                    disabled={!currentUser}
                  >
                    {currentUser ? (
                      <>
                        <FiSend className="text-lg" />
                        Kirim Tawaran Barter
                        <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                      </>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <FiSend className="text-lg" />
                        Login untuk Mengirim Tawaran
                      </span>
                    )}
                  </Button>
                </motion.div>
              )}

              {/* Login Prompt */}
              {!currentUser && !onAcceptOffer && task.status !== "proses" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="text-center"
                >
                  <p className="text-xs text-gray-500 mt-2">
                    🔒 Anda perlu login terlebih dahulu untuk mengirim tawaran
                  </p>
                </motion.div>
              )}
            </div>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 text-center"
            >
              <p className="text-xs text-gray-500">
                {onAcceptOffer 
                  ? "Dengan menerima, Anda setuju untuk memulai kolaborasi barter" 
                  : "Tawaran akan dikirim dan chat otomatis dibuat"
                }
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}