import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
    await Promise.all([fetchIncomingOffers(), fetchAssignedOffers()]);
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

  // Filter data berdasarkan tab
  const filteredData =
    activeTab === "masuk"
      ? incomingOffers
      : activeTab === "diambil"
        ? assignedOffers
        : barterData;

  const getCount = (tab) => {
    if (tab === "masuk") return incomingOffers.length;
    if (tab === "diambil") return assignedOffers.length;
    return barterData.length;
  };

  return (
    <div className="min-h-screen bg-[var(--color-white)] pl-4 md:pl-12 px-4 sm:px-6 md:px-8 py-6 md:py-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-6 text-[var(--color-black)] text-center sm:text-left">
        Daftar Barter Anda
      </h1>
      <div className="flex flex-wrap justify-center sm:justify-start gap-3 mb-8">
        {[
          { key: "baru", label: "Tawaran Barter Anda" },
          { key: "masuk", label: "Tawaran Masuk" },
          { key: "diambil", label: "Tawaran Diambil" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center justify-between w-full sm:w-auto px-4 py-2.5 rounded-lg border transition-all duration-300 text-sm sm:text-base ${
              activeTab === tab.key
                ? "bg-[var(--color-secondary)] text-white shadow-md border-[var(--color-secondary)]"
                : "bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`ml-2 px-2 py-0.5 rounded-full text-xs sm:text-sm font-semibold ${
                activeTab === tab.key
                  ? "bg-white text-[var(--color-secondary)]"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {getCount(tab.key)}
            </span>
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-gray-500 text-center py-8 animate-pulse col-span-full">
            Memuat data barter...
          </p>
        ) : filteredData.length > 0 ? (
          filteredData.map((trade, index) => (
            <CardTrade
              key={trade.id || index}
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
          ))
        ) : (
          <p className="text-gray-500 text-center py-8 col-span-full">
            Belum ada tawaran di kategori ini.
          </p>
        )}
      </div>
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