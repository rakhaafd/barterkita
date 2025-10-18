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
import { motion, AnimatePresence } from "framer-motion";
import Modal from "../Elements/Modal";
import CreateTaskModal from "../Elements/CreateTradeModal";
import EditTradeModal from "../Elements/EditTradeModal";
import DetailTradeModal from "../Elements/DetailTradeModal";
import { 
  FiPlus, 
  FiSearch, 
  FiFilter, 
  FiTrendingUp, 
  FiClock,
  FiUsers,
  FiAward,
  FiArrowRight
} from "react-icons/fi";
import Navbar from "../Layouts/Navbar";
import Footer from "../Layouts/Footer";
import CardTrade from "../Elements/CardTrade";
import { showConfirmation, showSuccess, showError } from "../Elements/Alert";

export default function Marketplace() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [userOffers, setUserOffers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Categories for filtering
  const categories = [
    { id: "all", name: "Semua Kategori", icon: "🌟", count: 0 },
    { id: "design", name: "Design & Creative", icon: "🎨", count: 0 },
    { id: "tech", name: "Tech & Development", icon: "💻", count: 0 },
    { id: "business", name: "Business & Marketing", icon: "📊", count: 0 },
    { id: "writing", name: "Writing & Content", icon: "✍️", count: 0 },
    { id: "education", name: "Education", icon: "📚", count: 0 },
    { id: "other", name: "Lainnya", icon: "🔧", count: 0 }
  ];

  const fetchTasks = () => {
    setIsLoading(true);
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
      setFilteredTasks(filteredTasks);
      setIsLoading(false);
    }, (err) => {
      console.error("Gagal memuat barterTasks:", err.message, err.code);
      setIsLoading(false);
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

  // Filter tasks based on search and category
  useEffect(() => {
    let filtered = tasks;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.neededSkill?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.offeredSkill?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category (you might need to add category field to your tasks)
    if (selectedCategory !== "all") {
      filtered = filtered.filter(task => {
        // This is a simple category mapping based on skills
        // You might want to add a proper category field to your tasks
        const skill = task.neededSkill?.toLowerCase() || "";
        switch (selectedCategory) {
          case "design":
            return skill.includes("design") || skill.includes("creative") || skill.includes("ui") || skill.includes("ux");
          case "tech":
            return skill.includes("programming") || skill.includes("development") || skill.includes("coding") || skill.includes("tech");
          case "business":
            return skill.includes("business") || skill.includes("marketing") || skill.includes("sales") || skill.includes("management");
          case "writing":
            return skill.includes("writing") || skill.includes("content") || skill.includes("copy") || skill.includes("blog");
          case "education":
            return skill.includes("teaching") || skill.includes("tutor") || skill.includes("education") || skill.includes("learning");
          default:
            return true;
        }
      });
    }

    setFilteredTasks(filtered);
  }, [tasks, searchTerm, selectedCategory]);

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
      showSuccess({
        title: "Berhasil!",
        text: "Tawaran barter berhasil dibuat."
      });
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-white text-[var(--color-black)]">
      <Navbar />
      
      {/* Hero Section Marketplace */}
      <section className="pt-28 pb-16 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary)]/90 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-[var(--color-secondary)] bg-clip-text text-transparent">
              Marketplace
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
              Temukan talenta terbaik dan tukarkan keahlian Anda di platform barter skill terdepan
            </p>
            
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-8"
            >
              {[
                { icon: <FiUsers className="text-2xl" />, value: tasks.length, label: "Tawaran Aktif" },
                { icon: <FiAward className="text-2xl" />, value: "50+", label: "Kategori Skill" },
                { icon: <FiTrendingUp className="text-2xl" />, value: "95%", label: "Success Rate" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="text-center"
                >
                  <div className="bg-white/20 p-3 rounded-2xl inline-block mb-2">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-white/80 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>

            {currentUser ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-[var(--color-secondary)] text-[var(--color-black)] px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center gap-3 mx-auto"
              >
                <FiPlus className="text-xl" />
                Buat Tawaran Barter
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-white/80 text-lg"
              >
                🔒 <span className="font-semibold">Login dulu</span> untuk mulai membuat tawaran barter
              </motion.p>
            )}
          </motion.div>
        </div>
      </section>

      <main className="flex-1 py-12 px-4 sm:px-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Search and Filter Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100"
          >
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search Bar */}
              <div className="relative flex-1 w-full">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="text"
                  placeholder="Cari skill, keahlian, atau judul..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent bg-gray-50/50"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-3">
                <FiFilter className="text-[var(--color-primary)] text-lg" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] bg-white"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Categories */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap gap-2 mt-4"
            >
              {categories.slice(1).map((category, index) => (
                <motion.button
                  key={category.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedCategory === category.id
                      ? "bg-[var(--color-secondary)] text-[var(--color-black)] shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span>{category.icon}</span>
                  {category.name}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>

          {/* Results Count */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-between items-center mb-6"
          >
            <h2 className="text-2xl font-bold text-[var(--color-black)]">
              Tawaran Barter Terbaru
              <span className="text-[var(--color-primary)] ml-2">
                ({filteredTasks.length})
              </span>
            </h2>
            
            {searchTerm && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setSearchTerm("")}
                className="text-sm text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors"
              >
                Clear filters
              </motion.button>
            )}
          </motion.div>

          {/* Loading State */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center items-center py-12"
            >
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500">Memuat tawaran barter...</p>
              </div>
            </motion.div>
          )}

          {/* Tasks Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {filteredTasks.length === 0 && !isLoading ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="col-span-full text-center py-12"
              >
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {searchTerm ? "Tidak ada hasil ditemukan" : "Belum ada tawaran barter"}
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  {searchTerm 
                    ? "Coba gunakan kata kunci yang berbeda atau hapus filter"
                    : "Jadilah yang pertama membuat tawaran barter!"
                  }
                </p>
                {!searchTerm && currentUser && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mt-4 bg-[var(--color-primary)] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[var(--color-secondary)] hover:text-[var(--color-black)] transition-all duration-300"
                  >
                    Buat Tawaran Pertama
                  </motion.button>
                )}
              </motion.div>
            ) : (
              filteredTasks.map((task, index) => (
                <motion.div
                  key={task.id || index}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  layout
                >
                  <CardTrade
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
                </motion.div>
              ))
            )}
          </motion.div>
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