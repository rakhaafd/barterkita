import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase/firebase-config";
import CardTrade from "../Elements/CardTrade";
import Modal from "../Elements/Modal";
import EditTradeModal from "../Elements/EditTradeModal";
import DetailTradeModal from "../Elements/DetailTradeModal";
import Terms from "../Fragments/Terms";
import { showConfirmation, showSuccess, showError } from "../Elements/Alert";
import Privacy from "./Privacy";
import { FiPlus, FiRefreshCw, FiPackage, FiDownload, FiUpload, FiSearch } from "react-icons/fi";

export default function BarterList() {
  const [activeTab, setActiveTab] = useState("baru");
  const [barterData, setBarterData] = useState([]);
  const [incomingOffers, setIncomingOffers] = useState([]);
  const [assignedOffers, setAssignedOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) navigate("/login");
    });
    return () => unsubscribe();
  }, [navigate]);

  // Fetch barters in real-time
  const fetchBarters = () => {
    if (!user) return;
    setLoading(true);
    const q = query(collection(db, "barterTasks"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        requiredSkill: doc.data().neededSkill || doc.data().requiredSkill,
      }));
      setBarterData(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching barter data:", error.message);
      setLoading(false);
    });
    return unsubscribe;
  };

  // Fetch incoming offers
  const fetchIncomingOffers = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, "offers"),
        where("taskCreatorId", "==", user.uid),
        where("status", "==", "pending")
      );
      const querySnapshot = await getDocs(q);
      const offerData = await Promise.all(
        querySnapshot.docs.map(async (docSnapshot) => {
          const offer = docSnapshot.data();
          const taskSnap = await getDoc(doc(db, "barterTasks", offer.taskId));
          if (!taskSnap.exists()) return null; // Skip if task is deleted
          const chatId = [user.uid, offer.offererId, offer.taskId].sort().join("_");
          const chatRef = doc(db, "chats", chatId);
          const chatSnap = await getDoc(chatRef);
          if (!chatSnap.exists()) {
            await setDoc(chatRef, { createdAt: serverTimestamp(), agreements: {} });
          }
          const userSnap = await getDoc(doc(db, "users", offer.offererId));
          return {
            id: taskSnap.id,
            ...taskSnap.data(),
            requiredSkill: taskSnap.data().neededSkill || taskSnap.data().requiredSkill,
            offererId: offer.offererId,
            offerId: docSnapshot.id,
            offererName: userSnap.exists()
              ? userSnap.data().name || userSnap.data().email || "Unknown"
              : "Unknown",
            chatId,
          };
        })
      );
      setIncomingOffers(offerData.filter((t) => t));
    } catch (error) {
      console.error("Error fetching incoming offers:", error.message);
    }
  };

  // Fetch assigned offers
  const fetchAssignedOffers = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, "offers"),
        where("offererId", "==", user.uid),
        where("status", "in", ["pending", "accepted"])
      );
      const querySnapshot = await getDocs(q);
      const offerData = await Promise.all(
        querySnapshot.docs.map(async (docSnapshot) => {
          const offer = docSnapshot.data();
          const taskSnap = await getDoc(doc(db, "barterTasks", offer.taskId));
          if (!taskSnap.exists()) return null; // Skip if task is deleted
          const chatId = [user.uid, offer.taskCreatorId, offer.taskId].sort().join("_");
          const chatRef = doc(db, "chats", chatId);
          const chatSnap = await getDoc(chatRef);
          if (!chatSnap.exists()) {
            await setDoc(chatRef, { createdAt: serverTimestamp(), agreements: {} });
          }
          const userSnap = await getDoc(doc(db, "users", offer.taskCreatorId));
          return {
            id: taskSnap.id,
            ...taskSnap.data(),
            requiredSkill: taskSnap.data().neededSkill || taskSnap.data().requiredSkill,
            taskCreatorId: offer.taskCreatorId,
            taskCreatorName: userSnap.exists()
              ? userSnap.data().name || userSnap.data().email || "Unknown"
              : "Unknown",
            chatId,
            offerStatus: offer.status,
          };
        })
      );
      setAssignedOffers(offerData.filter((t) => t));
    } catch (error) {
      console.error("Error fetching assigned offers:", error.message);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await Promise.all([fetchIncomingOffers(), fetchAssignedOffers()]);
    setRefreshing(false);
  };

  useEffect(() => {
    if (user) {
      const unsubscribeBarters = fetchBarters();
      refreshData();
      return () => unsubscribeBarters();
    }
  }, [user]);

  const handleDeleteTask = async (taskId) => {
    const confirm = await showConfirmation("Hapus barter ini?");
    if (!confirm) return;
    try {
      await deleteDoc(doc(db, "barterTasks", taskId));
      showSuccess("Tawaran barter berhasil dihapus!");
      await refreshData();
    } catch (err) {
      console.error("Error deleting task:", err);
      showError("Gagal menghapus barter.");
    }
  };

  const handleEditTask = async (updatedTask) => {
    try {
      await updateDoc(doc(db, "barterTasks", updatedTask.id), updatedTask);
      showSuccess("Tawaran barter berhasil diperbarui!");
      setIsEditModalOpen(false);
      await refreshData();
    } catch (err) {
      console.error("Error updating task:", err);
      showError("Gagal memperbarui barter.");
    }
  };

  const handleCardClick = (trade) => {
    // Untuk tawaran masuk: buka chat dengan offerer
    if (trade.offererId) {
      navigate(`/chat/${trade.id}/${trade.offererId}`);
    } 
    // Untuk tawaran diambil: buka chat dengan task creator
    else if (trade.taskCreatorId) {
      navigate(`/chat/${trade.id}/${trade.taskCreatorId}`);
    }
    // Untuk tawaran milik sendiri: buka detail
    else {
      setSelectedTask(trade);
      setIsDetailOpen(true);
    }
  };

  const handleOpenDetail = (trade) => {
    setSelectedTask(trade);
    setIsDetailOpen(true);
  };

  // Filter data berdasarkan tab dan search term
  const filteredData =
    activeTab === "masuk"
      ? incomingOffers
      : activeTab === "diambil"
        ? assignedOffers
        : barterData;

  const searchedData = filteredData.filter(trade =>
    trade.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trade.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trade.requiredSkill?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trade.offeredSkill?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCount = (tab) => {
    if (tab === "masuk") return incomingOffers.length;
    if (tab === "diambil") return assignedOffers.length;
    return barterData.length;
  };

  const tabConfig = [
    { 
      key: "baru", 
      label: "Tawaran Anda", 
      icon: FiPackage,
      description: "Barter yang Anda buat",
      color: "from-blue-500 to-cyan-500"
    },
    { 
      key: "masuk", 
      label: "Tawaran Masuk", 
      icon: FiDownload,
      description: "Tawaran dari pengguna lain",
      color: "from-green-500 to-emerald-500"
    },
    { 
      key: "diambil", 
      label: "Tawaran Diambil", 
      icon: FiUpload,
      description: "Barter yang Anda ambil",
      color: "from-purple-500 to-violet-500"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-white)] to-gray-50 pl-4 md:pl-12 px-4 sm:px-6 md:px-8 py-6 md:py-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-black)] mb-2">
              Kelola Barter Anda 🎯
            </h1>
            <p className="text-lg text-gray-600">
              Pantau semua aktivitas barter dalam satu tempat
            </p>
          </div>
          
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={refreshData}
              disabled={refreshing}
              className="flex items-center gap-2 bg-white text-[var(--color-black)] px-4 py-3 rounded-xl border border-gray-200 hover:border-[var(--color-primary)] transition-all shadow-sm"
            >
              <FiRefreshCw className={`text-lg ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/marketplace")}
              className="flex items-center gap-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)]/90 text-white px-4 py-3 rounded-xl hover:from-[var(--color-secondary)] hover:to-[var(--color-secondary)]/90 transition-all shadow-lg"
            >
              <FiPlus className="text-lg" />
              <span className="hidden sm:inline">Cari Barter</span>
            </motion.button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="text"
            placeholder="Cari barter..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none transition-all"
          />
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-3 mb-8"
      >
        {tabConfig.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          const count = getCount(tab.key);
          
          return (
            <motion.button
              key={tab.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center justify-between w-full sm:w-auto px-4 py-4 rounded-2xl border-2 transition-all duration-300 group ${
                isActive
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-lg border-transparent`
                  : "bg-white/80 hover:bg-white text-gray-700 border-gray-200/60 hover:border-[var(--color-primary)]/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${
                  isActive 
                    ? "bg-white/20" 
                    : "bg-gray-100 group-hover:bg-[var(--color-primary)]/10"
                }`}>
                  <Icon className={`text-lg ${
                    isActive ? "text-white" : "text-gray-600 group-hover:text-[var(--color-primary)]"
                  }`} />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm sm:text-base">{tab.label}</div>
                  <div className={`text-xs ${
                    isActive ? "text-white/80" : "text-gray-500"
                  }`}>
                    {tab.description}
                  </div>
                </div>
              </div>
              <span
                className={`ml-3 px-2.5 py-1 rounded-full text-xs font-bold ${
                  isActive
                    ? "bg-white text-gray-800"
                    : "bg-gray-200 text-gray-700 group-hover:bg-[var(--color-primary)] group-hover:text-white"
                }`}
              >
                {count}
              </span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Content Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      >
        {loading ? (
          // Loading Skeleton
          Array.from({ length: 6 }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/50 rounded-2xl p-6 border border-gray-200/60 animate-pulse"
            >
              <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </motion.div>
          ))
        ) : searchedData.length > 0 ? (
          searchedData.map((trade, index) => (
            <motion.div
              key={trade.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <CardTrade
                item={trade}
                user={user}
                isOwner={activeTab === "baru" && trade.userId === user?.uid}
                onEdit={() => {
                  setSelectedTask(trade);
                  setIsEditModalOpen(true);
                }}
                onDelete={async () => await handleDeleteTask(trade.id)}
                onClick={() => handleCardClick(trade)}
                onOpenDetail={() => handleOpenDetail(trade)}
              />
            </motion.div>
          ))
        ) : (
          // Empty State
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="col-span-full text-center py-12"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <FiPackage className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm ? "Tidak ada hasil pencarian" : "Belum ada tawaran"}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              {searchTerm 
                ? `Tidak ditemukan barter dengan kata kunci "${searchTerm}"`
                : activeTab === "baru" 
                  ? "Mulai buat tawaran barter pertama Anda!"
                  : activeTab === "masuk"
                    ? "Belum ada tawaran yang masuk untuk barter Anda"
                    : "Belum ada tawaran barter yang Anda ambil"
              }
            </p>
            {activeTab === "baru" && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/marketplace")}
                className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)]/90 text-white px-6 py-3 rounded-xl hover:from-[var(--color-secondary)] hover:to-[var(--color-secondary)]/90 transition-all shadow-lg"
              >
                Buat Tawaran Barter
              </motion.button>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Modals */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} task={selectedTask} />
      <EditTradeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onEditTask={handleEditTask}
        task={selectedTask}
      />
      <DetailTradeModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        task={selectedTask}
      />
    </div>
  );
}