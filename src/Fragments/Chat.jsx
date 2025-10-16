import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend, FiArrowLeft, FiMessageSquare, FiCheckCircle } from "react-icons/fi";
import { db, auth } from "../firebase/firebase-config";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
  getDocs,
  where,
  limit,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Sidebar from "../Elements/Sidebar";
import { showSuccess, showError, showConfirmation } from "../Elements/Alert";

export default function Chat() {
  const { taskId, userId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [task, setTask] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [activeTab, setActiveTab] = useState("chat");
  const [agreements, setAgreements] = useState({});
  const [otherUserName, setOtherUserName] = useState("Unknown");
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Monitor user login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoading(false);
      if (!user && taskId && userId) {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate, taskId, userId]);

  // Validate taskId and userId
  useEffect(() => {
    if (!taskId || !userId) {
      console.error("Missing parameters:", { taskId, userId });
      navigate("/profile", { state: { activeTab: "barter" } });
    }
  }, [taskId, userId, navigate]);

  // Fetch other user's name
  useEffect(() => {
    if (!userId) return;
    const fetchOtherUser = async () => {
      try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setOtherUserName(userSnap.data().name || userSnap.data().email || "Unknown");
        } else {
          console.warn("User not found:", userId);
        }
      } catch (err) {
        console.error("Gagal memuat data pengguna lain:", err.message, err.code);
      }
    };
    fetchOtherUser();
  }, [userId]);

  // Fetch contacts (chats and pending offers)
  useEffect(() => {
    if (isLoading || !currentUser?.uid) {
      console.warn("Current user not initialized for fetchContacts");
      return;
    }
    const fetchContacts = async () => {
      try {
        const chatsCollection = collection(db, "chats");
        const chatSnapshot = await getDocs(chatsCollection);
        const chatList = await Promise.all(
          chatSnapshot.docs
            .filter((doc) => doc.id && doc.id.includes(currentUser.uid))
            .map(async (chatDoc, index) => {
              const chatId = chatDoc.id.replace(/\*/g, "_");
              const [user1Id, user2Id, taskId] = chatId.split("_");
              if (!user1Id || !user2Id || !taskId) {
                console.warn("Invalid chatId format:", chatId);
                return null;
              }
              const otherUserId = user1Id === currentUser.uid ? user2Id : user1Id;
              const userRef = doc(db, "users", otherUserId);
              const userSnap = await getDoc(userRef);
              const userName = userSnap.exists()
                ? userSnap.data().name || userSnap.data().email || "Unknown"
                : "Unknown";
              const taskRef = doc(db, "barterTasks", taskId);
              const taskSnap = await getDoc(taskRef);
              const taskTitle = taskSnap.exists()
                ? taskSnap.data().title
                : "Task Tidak Ditemukan";
              const messagesQuery = query(
                collection(db, `chats/${chatId}/messages`),
                orderBy("createdAt", "desc"),
                limit(1)
              );
              const messagesSnap = await getDocs(messagesQuery);
              const latestMessage = messagesSnap.docs[0]?.data()?.text || "Belum ada pesan";
              return {
                chatId,
                taskId,
                otherUserId,
                userName,
                taskTitle,
                latestMessage,
                key: `${chatId}_${index}`,
              };
            })
        );
        const offersQuery = query(
          collection(db, "offers"),
          where("taskCreatorId", "==", currentUser.uid),
          where("status", "==", "pending")
        );
        const offerSnapshot = await getDocs(offersQuery);
        const offerList = await Promise.all(
          offerSnapshot.docs.map(async (offerDoc, index) => {
            const offer = offerDoc.data();
            const chatId = [currentUser.uid, offer.offererId, offer.taskId].sort().join("_");
            const chatRef = doc(db, "chats", chatId);
            const chatSnap = await getDoc(chatRef);
            if (chatSnap.exists()) return null;
            const userRef = doc(db, "users", offer.offererId);
            const userSnap = await getDoc(userRef);
            const userName = userSnap.exists()
              ? userSnap.data().name || userSnap.data().email || "Unknown"
              : "Unknown";
            const taskRef = doc(db, "barterTasks", offer.taskId);
            const taskSnap = await getDoc(taskRef);
            const taskTitle = taskSnap.exists()
              ? taskSnap.data().title
              : "Task Tidak Ditemukan";
            return {
              chatId,
              taskId: offer.taskId,
              otherUserId: offer.offererId,
              userName,
              taskTitle,
              latestMessage: "Tawaran masuk",
              key: `offer_${offerDoc.id}_${index}`,
            };
          })
        );
        setContacts([
          ...chatList.filter((contact) => contact && contact.taskTitle !== "Task Tidak Ditemukan"),
          ...offerList.filter((contact) => contact !== null),
        ]);
      } catch (err) {
        console.error("Gagal memuat kontak:", err.message, err.code);
      }
    };
    fetchContacts();
  }, [currentUser, isLoading]);

  // Fetch task details
  useEffect(() => {
    if (!taskId) return;
    const fetchTask = async () => {
      try {
        const taskRef = doc(db, "barterTasks", taskId);
        const taskSnap = await getDoc(taskRef);
        if (taskSnap.exists()) {
          setTask(taskSnap.data());
        } else {
          console.error("Task tidak ditemukan:", taskId);
          setTask(null);
        }
      } catch (err) {
        console.error("Gagal memuat task:", err.message, err.code);
      }
    };
    fetchTask();
  }, [taskId]);

  // Fetch messages and agreements in real-time, and handle deletion when both agree
  useEffect(() => {
    if (isLoading || !currentUser?.uid || !taskId || !userId) return;
    
    console.log("Chat params:", { taskId, userId });
    const chatId = [currentUser.uid, userId, taskId].sort().join("_");
    console.log("Generated chatId:", chatId);
    
    const chatRef = doc(db, "chats", chatId);
    const messagesCollectionRef = collection(db, `chats/${chatId}/messages`);
    const messagesQuery = query(messagesCollectionRef, orderBy("createdAt", "asc"));

    let unsubscribeMessages = () => {};
    let unsubscribeChat = () => {};

    try {
      // Subscribe to messages
      unsubscribeMessages = onSnapshot(messagesQuery, 
        (snapshot) => {
          const messageList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setMessages(messageList);
        }, 
        (err) => {
          console.error("Gagal memuat pesan:", err.message, err.code);
          showError({
            title: "Gagal Memuat Pesan",
            text: err.message
          });
        }
      );

      // Subscribe to chat document
      unsubscribeChat = onSnapshot(chatRef, 
        async (docSnapshot) => {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            console.log("Chat data:", data);
            setAgreements(data.agreements || {});
            
            try {
              const taskRef = doc(db, "barterTasks", taskId);
              const taskSnap = await getDoc(taskRef);
              
              if (taskSnap.exists() && data.agreements?.[currentUser.uid] && data.agreements?.[userId]) {
                // Check if both users have agreed
                if (data.agreements[currentUser.uid] === true && data.agreements[userId] === true) {
                  try {
                    // Delete offer from offers collection
                    const offersQuery = query(
                      collection(db, "offers"),
                      where("taskId", "==", taskId),
                      where("status", "in", ["pending", "accepted"])
                    );
                    const offerSnapshot = await getDocs(offersQuery);
                    if (!offerSnapshot.empty) {
                      for (const offerDoc of offerSnapshot.docs) {
                        await deleteDoc(offerDoc.ref);
                        console.log("Offer deleted:", offerDoc.id);
                      }
                    }
                    // Delete task from barterTasks collection
                    await deleteDoc(taskRef);
                    console.log("Task deleted:", taskId);
                    // Delete chat from chats collection
                    await deleteDoc(chatRef);
                    console.log("Chat deleted:", chatId);
                    
                    // Show success alert
                    showSuccess({
                      title: "Barter Selesai!",
                      text: "Tawaran, task, dan chat telah berhasil dihapus."
                    }).then(() => {
                      navigate("/profile", { state: { activeTab: "barter" } });
                    });
                  } catch (err) {
                    console.error("Gagal menghapus data setelah kedua user setuju:", err.message, err.code);
                    showError({
                      title: "Gagal Menghapus Data",
                      text: err.message
                    });
                  }
                }
              }
            } catch (taskErr) {
              console.error("Error checking task:", taskErr);
            }
          }
        }, 
        (err) => {
          console.error("Gagal memuat chat:", err.message, err.code);
          showError({
            title: "Gagal Memuat Chat",
            text: err.message
          });
        }
      );
    } catch (error) {
      console.error("Error setting up listeners:", error);
    }

    return () => {
      unsubscribeMessages();
      unsubscribeChat();
    };
  }, [currentUser, isLoading, taskId, userId, navigate]);

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;
    try {
      const chatId = [currentUser.uid, userId, taskId].sort().join("_");
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);
      if (!chatSnap.exists()) {
        await setDoc(chatRef, { createdAt: serverTimestamp(), agreements: {} });
      }
      await addDoc(collection(db, `chats/${chatId}/messages`), {
        text: newMessage,
        senderId: currentUser.uid,
        senderEmail: currentUser.email,
        createdAt: serverTimestamp(),
      });
      setNewMessage("");
    } catch (err) {
      console.error("Gagal mengirim pesan:", err.message, err.code);
      showError({
        title: "Gagal Mengirim Pesan",
        text: err.message
      });
    }
  };

  // Handle agreement to complete barter
  const handleAgreeToComplete = async () => {
    if (!currentUser || !taskId || !userId) return;
    
    const result = await showConfirmation({
      title: "Konfirmasi Penyelesaian Barter",
      text: "Apakah Anda yakin ingin menyetujui penyelesaian barter ini?",
      confirmButtonText: "Ya, Setuju",
      cancelButtonText: "Batal"
    });
    
    if (!result.isConfirmed) return;
    
    try {
      const chatId = [currentUser.uid, userId, taskId].sort().join("_");
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);
      if (!chatSnap.exists()) {
        console.error("Chat not found:", chatId);
        throw new Error("Chat tidak ditemukan");
      }
      let updatedAgreements = chatSnap.data().agreements || {};
      updatedAgreements[currentUser.uid] = true;
      await updateDoc(chatRef, { agreements: updatedAgreements });
      console.log("Agreement recorded for user:", currentUser.uid, updatedAgreements);
      
      showSuccess({
        title: "Berhasil!",
        text: "Anda telah menyetujui penyelesaian barter. Menunggu persetujuan dari pengguna lain."
      });
    } catch (err) {
      console.error("Gagal mencatat persetujuan:", err.message, err.code);
      showError({
        title: "Gagal Mencatat Persetujuan",
        text: err.message
      });
    }
  };

  // Handle contact click
  const handleContactClick = (contact) => {
    navigate(`/chat/${contact.taskId}/${contact.otherUserId}`);
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-white)]">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 pl-16 md:pl-64 transition-all duration-300 p-4 sm:p-6 md:p-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-sm sm:text-base">Memuat...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {!taskId || !userId ? (
              <motion.div
                key="contact-list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-primary)] mb-6">
                  Daftar Kontak
                </h1>
                <div className="space-y-4">
                  {contacts.length === 0 ? (
                    <p className="text-gray-500 text-center py-8 text-sm sm:text-base">
                      Belum ada kontak atau tawaran masuk.
                    </p>
                  ) : (
                    contacts.map((contact) => (
                      <motion.div
                        key={contact.key}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => handleContactClick(contact)}
                        className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-md border border-[var(--color-secondary)]/30 rounded-2xl shadow-md hover:shadow-lg hover:bg-[var(--color-secondary)]/10 cursor-pointer transition-all duration-300"
                      >
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-bold">
                          {contact.userName[0]?.toUpperCase() || "?"}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base sm:text-lg font-semibold text-[var(--color-black)]">
                            {contact.userName}
                          </h3>
                          <p className="text-sm text-gray-600">{contact.taskTitle}</p>
                          <p className="text-sm text-gray-500 italic truncate">
                            {contact.latestMessage}
                          </p>
                        </div>
                        {contact.latestMessage === "Tawaran masuk" && (
                          <span className="bg-[var(--color-secondary)] text-white text-xs rounded-full px-2 py-1">
                            Baru
                          </span>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="chat-room"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center justify-between mb-6 flex-col sm:flex-row gap-4 sm:gap-0"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate("/profile", { state: { activeTab: "barter" } })}
                      className="text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition text-xl sm:text-2xl"
                    >
                      <FiArrowLeft />
                    </button>
                    <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-primary)]">
                      Chat: {task?.title || "Loading..."}
                    </h1>
                  </div>
                  <div className="text-sm sm:text-base text-[var(--color-black)] text-center sm:text-right">
                    Dengan: {otherUserName}
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white/80 backdrop-blur-md border border-[var(--color-secondary)]/30 rounded-3xl shadow-2xl p-4 sm:p-6 h-[60vh] flex flex-col"
                >
                  <div className="flex-1 overflow-y-auto pr-2">
                    <AnimatePresence>
                      {messages.length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col items-center justify-center h-full text-gray-500"
                        >
                          <FiMessageSquare className="text-3xl sm:text-4xl text-[var(--color-primary)] mb-2" />
                          <p className="text-sm sm:text-base">Belum ada pesan. Mulai obrolan sekarang!</p>
                        </motion.div>
                      ) : (
                        messages.map((message) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`flex ${
                              message.senderId === currentUser?.uid ? "justify-end" : "justify-start"
                            } mb-4`}
                          >
                            <div
                              className={`max-w-[70%] p-3 rounded-2xl text-sm sm:text-base ${
                                message.senderId === currentUser?.uid
                                  ? "bg-[var(--color-primary)] text-white"
                                  : "bg-[var(--color-secondary)]/20 text-[var(--color-black)]"
                              }`}
                            >
                              <p>{message.text}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {message.createdAt?.toDate().toLocaleTimeString()}
                              </p>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                  </div>
                  {task && (
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <h3 className="text-base sm:text-lg font-semibold text-[var(--color-black)] mb-2">
                        Status Penyelesaian Barter
                      </h3>
                      <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <FiCheckCircle
                            className={`text-lg ${
                              agreements[currentUser?.uid] ? "text-green-500" : "text-gray-400"
                            }`}
                          />
                          <span className="text-sm sm:text-base">
                            Anda: {agreements[currentUser?.uid] ? "Sudah Setuju" : "Belum Setuju"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiCheckCircle
                            className={`text-lg ${agreements[userId] ? "text-green-500" : "text-gray-400"}`}
                          />
                          <span className="text-sm sm:text-base">
                            {otherUserName}: {agreements[userId] ? "Sudah Setuju" : "Belum Setuju"}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={handleAgreeToComplete}
                        disabled={agreements[currentUser?.uid]}
                        className={`flex items-center justify-center gap-2 w-full px-4 py-2 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${
                          agreements[currentUser?.uid]
                            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                            : "bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)]"
                        }`}
                      >
                        <FiCheckCircle className="text-lg" />
                        {agreements[currentUser?.uid] ? "Menunggu Persetujuan" : "Setuju Selesai"}
                      </button>
                    </div>
                  )}
                  {task && (
                    <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Ketik pesan..."
                        className="flex-1 p-3 rounded-xl bg-[var(--color-white)] border border-[var(--color-secondary)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm sm:text-base"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-[var(--color-primary)] text-white p-3 rounded-xl hover:bg-[var(--color-secondary)] transition-all duration-300 disabled:opacity-50"
                      >
                        <FiSend className="text-lg" />
                      </button>
                    </form>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}