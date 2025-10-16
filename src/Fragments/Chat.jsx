import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend, FiArrowLeft, FiMessageSquare, FiCheckCircle, FiUser, FiMenu, FiX } from "react-icons/fi";
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
import Button from "../Elements/Button";
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
  const [otherUserAvatar, setOtherUserAvatar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);
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

  // Fetch other user's name and avatar
  useEffect(() => {
    if (!userId) return;
    const fetchOtherUser = async () => {
      try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setOtherUserName(userData.institution || userData.email || "Unknown");
          setOtherUserAvatar(userData.avatar);
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
              const userData = userSnap.exists() ? userSnap.data() : null;
              const userName = userData?.institution || userData?.email || "Unknown";
              const userAvatar = userData?.avatar;
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
                userAvatar,
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
            const userData = userSnap.exists() ? userSnap.data() : null;
            const userName = userData?.institution || userData?.email || "Unknown";
            const userAvatar = userData?.avatar;
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
              userAvatar,
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

  // Fetch messages and agreements in real-time
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
      unsubscribeChat = onSnapshot(chatRef,
        async (docSnapshot) => {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            console.log("Chat data:", data);
            const currentAgreements = data.agreements || {};
            setAgreements(currentAgreements);
            if (currentAgreements[currentUser.uid] === true) {
              setHasAgreed(true);
            }
            try {
              const taskRef = doc(db, "barterTasks", taskId);
              const taskSnap = await getDoc(taskRef);
              if (taskSnap.exists() && currentAgreements[currentUser.uid] && currentAgreements[userId]) {
                if (currentAgreements[currentUser.uid] === true && currentAgreements[userId] === true) {
                  try {
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
                    await deleteDoc(taskRef);
                    console.log("Task deleted:", taskId);
                    await deleteDoc(chatRef);
                    console.log("Chat deleted:", chatId);
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
    if (!currentUser || !taskId || !userId || hasAgreed) return;
    const result = await showConfirmation({
      title: "Konfirmasi Penyelesaian Barter",
      text: "Apakah Anda yakin ingin menyetujui penyelesaian barter ini? Tindakan ini tidak dapat dibatalkan.",
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
      const currentData = chatSnap.data();
      if (currentData.agreements?.[currentUser.uid] === true) {
        setHasAgreed(true);
        showError({
          title: "Sudah Disetujui",
          text: "Anda sudah menyetujui penyelesaian barter ini."
        });
        return;
      }
      let updatedAgreements = currentData.agreements || {};
      updatedAgreements[currentUser.uid] = true;
      await updateDoc(chatRef, { agreements: updatedAgreements });
      console.log("Agreement recorded for user:", currentUser.uid, updatedAgreements);
      setHasAgreed(true);
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
    setSidebarOpen(false);
  };

  // Render avatar with fallback
  const renderAvatar = (avatar, name, size = "w-10 h-10") => {
    if (avatar) {
      return (
        <img
          src={avatar}
          alt={name}
          className={`${size} rounded-full object-cover border-2 border-[var(--color-secondary)]`}
        />
      );
    }
    return (
      <div className={`${size} rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-bold border-2 border-[var(--color-secondary)]`}>
        {name ? name.charAt(0).toUpperCase() : <FiUser />}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[var(--color-white)] to-gray-50">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transition-all duration-300
        ${sidebarOpen ? 'w-64' : 'w-16'} lg:w-64
      `}>
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onItemClick={() => setSidebarOpen(false)}
          isOpen={sidebarOpen}
        />
      </div>
      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 min-w-0 ${sidebarOpen ? 'ml-64' : 'ml-16'} lg:ml-64`}>
        <div className="p-4 sm:p-6 md:p-8 h-screen flex flex-col">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between mb-4">
            <div className="w-10"></div>
            <h1 className="text-lg font-bold text-[var(--color-primary)]">
              {taskId && userId ? "Chat" : "Percakapan"}
            </h1>
            <div className="w-10"></div>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 text-sm sm:text-base">Memuat chat...</p>
              </div>
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
                  className="h-full flex flex-col"
                >
                  <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
                    <h1 className="text-lg sm:text-xl font-bold text-[var(--color-primary)] mb-2">
                      💬 Percakapan Anda
                    </h1>
                    <p className="text-gray-600 text-sm">
                      Kelola semua percakapan barter Anda di satu tempat
                    </p>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    {contacts.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center py-8 sm:py-12">
                        <FiMessageSquare className="text-3xl sm:text-4xl text-[var(--color-primary)] mb-3 sm:mb-4" />
                        <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">
                          Belum ada percakapan
                        </h3>
                        <p className="text-gray-500 text-xs sm:text-sm max-w-md px-4">
                          Mulai barter dengan mengirim tawaran atau menunggu tawaran masuk dari pengguna lain.
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 h-full overflow-y-auto pr-2">
                        {contacts.map((contact) => (
                          <motion.div
                            key={contact.key}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            onClick={() => handleContactClick(contact)}
                            className="bg-white/80 backdrop-blur-md border border-[var(--color-secondary)]/30 rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg hover:bg-[var(--color-secondary)]/5 cursor-pointer transition-all duration-300 p-3 sm:p-4 group"
                          >
                            <div className="flex items-start gap-3">
                              {renderAvatar(contact.userAvatar, contact.userName, "w-8 h-8 sm:w-10 sm:h-10")}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-[var(--color-black)] text-xs sm:text-sm truncate group-hover:text-[var(--color-primary)] transition-colors">
                                  {contact.userName}
                                </h3>
                                <p className="text-xs text-gray-600 mb-1 truncate">
                                  {contact.taskTitle}
                                </p>
                                <p className="text-xs text-gray-500 italic truncate">
                                  {contact.latestMessage}
                                </p>
                              </div>
                            </div>
                            {contact.latestMessage === "Tawaran masuk" && (
                              <div className="mt-2 sm:mt-3 flex justify-end">
                                <span className="bg-[var(--color-secondary)] text-[var(--color-black)] text-xs font-medium px-2 py-1 rounded-full">
                                  Tawaran Baru
                                </span>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
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
                  className="h-full flex flex-col"
                >
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6"
                  >
                    <div className="flex items-center justify-between flex-col sm:flex-row gap-3 sm:gap-4">
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <Button
                          onClick={() => navigate("/profile", { state: { activeTab: "barter" } })}
                          variant="outline"
                          className="p-2 sm:p-3 flex-shrink-0"
                        >
                          <FiArrowLeft className="text-lg" />
                        </Button>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {renderAvatar(otherUserAvatar, otherUserName, "w-10 h-10 sm:w-12 sm:h-12")}
                          <div className="min-w-0 flex-1">
                            <h1 className="text-base sm:text-lg font-bold text-[var(--color-black)] truncate">
                              {task?.title || "Loading..."}
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-600 truncate">
                              Dengan: {otherUserName}
                            </p>
                          </div>
                        </div>
                      </div>
                      {task && (
                        <div className="flex items-center gap-2 bg-[var(--color-primary)]/10 rounded-lg px-3 py-2">
                          <FiCheckCircle className="text-[var(--color-primary)] text-sm sm:text-base" />
                          <span className="text-xs sm:text-sm font-medium text-[var(--color-primary)]">
                            {task.status === 'baru' ? 'Barter Baru' : 'Dalam Proses'}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                  <div className="flex-1 flex flex-col bg-white/80 backdrop-blur-md border border-[var(--color-secondary)]/30 rounded-2xl shadow-lg overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
                      <AnimatePresence>
                        {messages.length === 0 ? (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center h-full text-gray-500 py-8 sm:py-12"
                          >
                            <FiMessageSquare className="text-3xl sm:text-4xl md:text-5xl text-[var(--color-primary)] mb-3 sm:mb-4" />
                            <p className="text-xs sm:text-sm text-center max-w-md px-4">
                              Mulai percakapan dengan mengirim pesan pertama untuk membahas detail barter
                            </p>
                          </motion.div>
                        ) : (
                          messages.map((message) => (
                            <motion.div
                              key={message.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                              className={`flex ${message.senderId === currentUser?.uid ? "justify-end" : "justify-start"}`}
                            >
                              <div className={`max-w-[90%] sm:max-w-[85%] md:max-w-[70%] flex gap-2 sm:gap-3 ${message.senderId === currentUser?.uid ? "flex-row-reverse" : "flex-row"}`}>
                                {message.senderId !== currentUser?.uid && (
                                  <div className="flex-shrink-0">
                                    {renderAvatar(otherUserAvatar, otherUserName, "w-8 h-8 sm:w-10 sm:h-10")}
                                  </div>
                                )}
                                <div
                                  className={`p-3 sm:p-4 rounded-2xl ${
                                    message.senderId === currentUser?.uid
                                      ? "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)]/90 text-white rounded-br-none"
                                      : "bg-gray-100 text-[var(--color-black)] rounded-bl-none border border-gray-200"
                                  }`}
                                >
                                  <p className="text-sm sm:text-base break-words">{message.text}</p>
                                  <p className={`text-xs mt-1 sm:mt-2 ${
                                    message.senderId === currentUser?.uid ? "text-white/70" : "text-gray-500"
                                  }`}>
                                    {message.createdAt?.toDate().toLocaleTimeString('id-ID', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </AnimatePresence>
                      <div ref={messagesEndRef} />
                    </div>
                    {task && (
                      <div className="border-t border-gray-200 bg-gray-50/50 p-4 sm:p-6">
                        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-[var(--color-black)] mb-3 sm:mb-4 text-center">
                          🎉 Status Penyelesaian Barter
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                          <div className={`flex items-center justify-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl ${
                            agreements[currentUser?.uid] ? "bg-green-100 border border-green-200" : "bg-gray-100 border border-gray-200"
                          }`}>
                            <FiCheckCircle className={`text-lg sm:text-xl ${agreements[currentUser?.uid] ? "text-green-600" : "text-gray-400"}`} />
                            <div>
                              <p className="font-medium text-xs sm:text-sm">Anda</p>
                              <p className={`text-xs sm:text-sm ${agreements[currentUser?.uid] ? "text-green-700" : "text-gray-600"}`}>
                                {agreements[currentUser?.uid] ? "✅ Sudah Setuju" : "⏳ Belum Setuju"}
                              </p>
                            </div>
                          </div>
                          <div className={`flex items-center justify-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl ${
                            agreements[userId] ? "bg-green-100 border border-green-200" : "bg-gray-100 border border-gray-200"
                          }`}>
                            <FiCheckCircle className={`text-lg sm:text-xl ${agreements[userId] ? "text-green-600" : "text-gray-400"}`} />
                            <div>
                              <p className="font-medium text-xs sm:text-sm">{otherUserName}</p>
                              <p className={`text-xs sm:text-sm ${agreements[userId] ? "text-green-700" : "text-gray-600"}`}>
                                {agreements[userId] ? "✅ Sudah Setuju" : "⏳ Belum Setuju"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={handleAgreeToComplete}
                          disabled={hasAgreed || agreements[currentUser?.uid]}
                          variant={(hasAgreed || agreements[currentUser?.uid]) ? "outline" : "primary"}
                          className="w-full py-2 sm:py-3 text-sm sm:text-base font-semibold"
                        >
                          <FiCheckCircle className="inline mr-2" />
                          {(hasAgreed || agreements[currentUser?.uid]) ? "✅ Sudah Disetujui" : "Setuju Selesaikan Barter"}
                        </Button>
                      </div>
                    )}
                    {task && (
                      <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-3 sm:p-4">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Ketik pesan Anda..."
                            className="flex-1 p-2 sm:p-3 md:p-4 rounded-xl bg-white border border-[var(--color-secondary)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm sm:text-base shadow-sm"
                          />
                          <Button
                            type="submit"
                            disabled={!newMessage.trim()}
                            variant="primary"
                            className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 flex items-center gap-1 sm:gap-2 font-semibold text-sm sm:text-base"
                          >
                            <FiSend className="text-base sm:text-lg" />
                            <span className="hidden sm:inline">Kirim</span>
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
}