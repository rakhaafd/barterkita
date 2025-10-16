import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiMapPin, FiSend, FiStar, FiMessageSquare } from "react-icons/fi";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/firebase-config";
import Button from "./Button";
import { showSuccess, showError } from "./Alert";

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

      showSuccess({ title: "Berhasil!", text: "Tawaran berhasil dikirim!" });
      navigate(`/chat/${task.id}/${task.userId}`);
    } catch (err) {
      console.error("Gagal mengirim tawaran:", err.message, err.code);
      showError({ title: "Gagal!", text: "Gagal mengirim tawaran: " + err.message });
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
      showSuccess({ title: "Berhasil!", text: "Tawaran berhasil diterima!" });
      navigate(`/chat/${task.id}/${task.offererId}`);
      onClose();
    } catch (err) {
      console.error("Gagal menerima tawaran:", err.message, err.code);
      showError({ title: "Gagal!", text: "Gagal menerima tawaran: " + err.message });
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 30 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            className="relative bg-white/80 backdrop-blur-md border border-[var(--color-secondary)]/30 rounded-3xl shadow-2xl max-w-lg w-[90%] p-8 text-[var(--color-black)]"
          >
            <button
              onClick={() => {
                console.log("Close button clicked");
                onClose();
              }}
              className="absolute top-4 right-4 text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition text-2xl"
            >
              <FiX />
            </button>
            <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-2 flex items-center gap-2">
              <FiStar className="text-[var(--color-secondary)]" />
              {task.title}
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">{task.description}</p>
            <div className="border-t border-gray-200 my-4"></div>
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
            <div className="mt-8 flex justify-center gap-4">
              {onAcceptOffer && offerId ? (
                <>
                  <Button
                    onClick={handleAcceptOffer}
                    variant="primary"
                  >
                    Terima Tawaran
                  </Button>
                  <Button
                    onClick={handleOpenChat}
                    variant="outline"
                  >
                    <FiMessageSquare className="inline text-lg mr-1" /> Buka Chat
                  </Button>
                </>
              ) : task.status === "proses" ? (
                <Button
                  onClick={handleOpenChat}
                  variant="primary"
                >
                  <FiMessageSquare className="inline text-lg mr-1" /> Buka Chat
                </Button>
              ) : (
                <Button
                  onClick={handleSendOffer}
                  variant="primary"
                >
                  <FiSend className="inline text-lg mr-1" /> Kirim Tawaran Barter
                </Button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}