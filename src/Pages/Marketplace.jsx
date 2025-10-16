import React, { useState, useEffect } from "react";
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
  updateDoc,
  deleteDoc,
  setDoc,
  where,
  getDocs,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Modal from "../Elements/Modal";
import CreateTaskModal from "../Elements/CreateTradeModal";
import EditTradeModal from "../Elements/EditTradeModal";
import DetailTradeModal from "../Elements/DetailTradeModal";
import { FiPlus } from "react-icons/fi";
import Navbar from "../Layouts/Navbar";
import Footer from "../Layouts/Footer";
import CardTrade from "../Elements/CardTrade";
import { showConfirmation, showSuccess, showError } from "../Elements/Alert";

export default function Marketplace() {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [userOffers, setUserOffers] = useState([]);
  const navigate = useNavigate();

  const fetchTasks = () => {
    const q = query(collection(db, "barterTasks"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const taskList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        requiredSkill: doc.data().neededSkill || doc.data().requiredSkill,
      }));
      console.log("Raw tasks from Firestore:", taskList);
      const filteredTasks = taskList.filter(
        (t) => t && t.title && t.description && t.userId
      );
      console.log("Filtered tasks:", filteredTasks);
      setTasks(filteredTasks);
    }, (err) => {
      console.error("Gagal memuat barterTasks:", err.message, err.code);
    });
    return unsubscribe;
  };

  const fetchUserOffers = async () => {
    if (!currentUser) return;
    try {
      const q = query(
        collection(db, "offers"),
        where("offererId", "==", currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const offers = querySnapshot.docs.map((doc) => doc.data().taskId);
      console.log("Fetched user offers:", offers);
      setUserOffers(offers);
    } catch (err) {
      console.error("Gagal memuat user offers:", err.message, err.code);
    }
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const docRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(docRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data());
          console.log("User data:", userSnap.data());
        }
      } else {
        setCurrentUser(null);
        setUserData(null);
      }
    });
    const unsubscribeTasks = fetchTasks();
    return () => {
      unsubscribeAuth();
      unsubscribeTasks();
    };
  }, []);

  useEffect(() => {
    fetchUserOffers();
  }, [currentUser]);

  const handleSendOffer = async (offerData) => {
    try {
      if (!currentUser) throw new Error("User not authenticated");
      console.log("Sending offer:", offerData);
      await addDoc(collection(db, "offers"), offerData);
      console.log("Offer created for task:", offerData.taskId);
      const taskRef = doc(db, "barterTasks", offerData.taskId);
      await updateDoc(taskRef, { status: "proses" });
      console.log("Task status updated to proses:", offerData.taskId);
      const chatId = [currentUser.uid, offerData.taskCreatorId, offerData.taskId].sort().join("_");
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);
      if (!chatSnap.exists()) {
        console.log("Creating chat room:", chatId);
        await setDoc(chatRef, { createdAt: serverTimestamp(), agreements: {} });
        console.log("Chat room created successfully");
      }
      await fetchUserOffers();
    } catch (err) {
      console.error("Gagal mengirim tawaran:", err.message, err.code);
    }
  };

  const handleCardClick = (task) => {
    if (!task) {
      console.error("handleCardClick received undefined task");
      return;
    }
    console.log("Card clicked:", { taskId: task.id, userId: task.userId });
    
    // Jika task milik sendiri, langsung buka detail
    if (currentUser && task.userId === currentUser.uid) {
      setSelectedTask(task);
      setIsDetailOpen(true);
      return;
    }
    
    if (userOffers.includes(task.id)) {
      const chatUserId = task.userId;
      navigate(`/chat/${task.id}/${chatUserId}`);
    } else {
      setSelectedTask(task);
      setIsModalOpen(true);
    }
  };

  const handleOpenDetail = (task) => {
    console.log("Opening detail for task:", task.id);
    setSelectedTask(task);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    console.log("Closing detail modal");
    setIsDetailOpen(false);
    setSelectedTask(null);
  };

  const handleCreateTask = async (formData) => {
    try {
      if (!currentUser) throw new Error("User not authenticated");
      
      const taskData = {
        title: formData.title,
        description: formData.description,
        neededSkill: formData.neededSkill,
        offeredSkill: formData.offeredSkill,
        location: formData.location,
        status: "baru",
        createdBy: userData?.institution || currentUser?.email || "Anonim",
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        requiredSkill: formData.neededSkill,
        ...(formData.imageBase64 && { imageBase64: formData.imageBase64 })
      };

      console.log("Creating task with Base64 image:", {
        ...taskData,
        imageBase64: formData.imageBase64 ? `Base64 string (${formData.imageBase64.length} chars)` : 'No image'
      });

      const docRef = await addDoc(collection(db, "barterTasks"), taskData);
      console.log("Task created successfully. ID:", docRef.id);
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error("Gagal membuat barter:", err.message, err.code);
      showError({
        title: "Gagal Membuat Barter",
        text: err.message
      });
    }
  };

  // Fungsi untuk menghapus task
  const handleDeleteTask = async (taskId) => {
    const result = await showConfirmation({
      title: "Hapus Tawaran Barter",
      text: "Apakah Anda yakin ingin menghapus tawaran barter ini? Tindakan ini tidak dapat dibatalkan.",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal"
    });

    if (!result.isConfirmed) return;

    try {
      // Hapus dari barterTasks
      await deleteDoc(doc(db, "barterTasks", taskId));
      
      // Hapus offers yang terkait dengan task ini
      const offersQuery = query(
        collection(db, "offers"),
        where("taskId", "==", taskId)
      );
      const offersSnapshot = await getDocs(offersQuery);
      
      const deletePromises = offersSnapshot.docs.map(offerDoc => 
        deleteDoc(offerDoc.ref)
      );
      
      await Promise.all(deletePromises);
      
      // Hapus chats yang terkait dengan task ini
      const chatsQuery = query(
        collection(db, "chats"),
        where("id", "array-contains", taskId)
      );
      const chatsSnapshot = await getDocs(chatsQuery);
      
      const deleteChatPromises = chatsSnapshot.docs.map(chatDoc => 
        deleteDoc(chatDoc.ref)
      );
      
      await Promise.all(deleteChatPromises);

      showSuccess({
        title: "Berhasil!",
        text: "Tawaran barter berhasil dihapus."
      });
    } catch (err) {
      console.error("Error deleting task:", err);
      showError({
        title: "Gagal Menghapus",
        text: "Terjadi kesalahan saat menghapus tawaran."
      });
    }
  };

  // Fungsi untuk edit task
  const handleEditTask = async (updatedTask) => {
    try {
      const taskToUpdate = {
        title: updatedTask.title,
        description: updatedTask.description,
        neededSkill: updatedTask.neededSkill,
        offeredSkill: updatedTask.offeredSkill,
        location: updatedTask.location,
        requiredSkill: updatedTask.neededSkill,
        ...(updatedTask.imageBase64 && { imageBase64: updatedTask.imageBase64 })
      };

      await updateDoc(doc(db, "barterTasks", updatedTask.id), taskToUpdate);
      
      showSuccess({
        title: "Berhasil!",
        text: "Tawaran barter berhasil diperbarui."
      });
      
      setIsEditModalOpen(false);
      setSelectedTask(null);
    } catch (err) {
      console.error("Error updating task:", err);
      showError({
        title: "Gagal Memperbarui",
        text: "Terjadi kesalahan saat memperbarui tawaran."
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[var(--color-black)]">
      <Navbar />
      <main className="flex-1 pt-28 pb-16 px-4 sm:px-6 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--color-primary)]">
              Marketplace
            </h1>
            {currentUser ? (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-4 py-2 rounded-xl font-semibold hover:bg-[var(--color-secondary)] transition-all duration-300 shadow-md text-sm sm:text-base"
              >
                <FiPlus className="text-lg" /> Create Barter
              </button>
            ) : (
              <p className="text-sm text-gray-500">
                🔒 Login dulu untuk membuat barter
              </p>
            )}
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-6 text-[var(--color-black)]">
            Tawaran Barter Terbaru
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {tasks.length === 0 ? (
              <p className="text-gray-500 col-span-2 text-center text-sm sm:text-base">
                Belum ada barter yang tersedia di database.
              </p>
            ) : (
              tasks.map((task, index) => (
                <CardTrade
                  key={task.id || index}
                  item={task}
                  user={currentUser}
                  isOwner={currentUser && task.userId === currentUser.uid}
                  onEdit={() => {
                    setSelectedTask(task);
                    setIsEditModalOpen(true);
                  }}
                  onDelete={async () => await handleDeleteTask(task.id)}
                  onClick={() => handleCardClick(task)}
                  onOpenDetail={() => handleOpenDetail(task)}
                />
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
      
      {/* Modal untuk mengirim tawaran */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={selectedTask}
        onSendOffer={handleSendOffer}
      />
      
      {/* Modal untuk membuat tawaran baru */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
      />
      
      {/* Modal untuk edit tawaran */}
      <EditTradeModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTask(null);
        }}
        onEditTask={handleEditTask}
        task={selectedTask}
      />
      
      {/* Modal untuk detail tawaran */}
      <DetailTradeModal
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        task={selectedTask}
      />
    </div>
  );
}