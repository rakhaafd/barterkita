import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebase-config";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import Modal from "../Elements/Modal";
import CreateTaskModal from "../Elements/CreateTaskModal";
import { FiPlus } from "react-icons/fi";
import Navbar from "../Layouts/Navbar";
import Footer from "../Layouts/Footer";

export default function Marketplace() {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchTasks = async () => {
    const q = query(collection(db, "barterTasks"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    setTasks(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSendOffer = (task) => {
    alert(`Tawaran barter telah dikirim ke "${task.title}" 🎉`);
  };

  const handleCreateTask = async (formData) => {
    try {
      await addDoc(collection(db, "barterTasks"), {
        ...formData,
        createdAt: serverTimestamp(),
      });
      fetchTasks();
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[var(--color-black)]">
      {/* Navbar */}
      <Navbar />

      {/* Konten utama dengan padding atas agar tidak tertutup navbar */}
      <main className="flex-1 pt-28 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[var(--color-primary)]">
              🔁 Marketplace
            </h1>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-4 py-2 rounded-xl font-semibold hover:bg-[var(--color-secondary)] transition-all duration-300 shadow-md"
            >
              <FiPlus className="text-lg" /> Create Barter
            </button>
          </div>

          {/* TASK LIST */}
          <h2 className="text-2xl font-semibold mb-6 text-[var(--color-black)]">
            📋 Tawaran Barter Terbaru
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {tasks.length === 0 ? (
              <p className="text-gray-500 col-span-2 text-center">
                Belum ada barter yang dibuat.
              </p>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="relative bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col gap-2"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--color-primary)]">
                        {task.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {task.offeredSkill || "Anonim"} • {task.location}
                      </p>
                    </div>
                    <div className="flex items-center justify-center w-10 h-10 bg-[var(--color-secondary)]/20 rounded-xl">
                      <span className="text-[var(--color-primary)] text-lg font-bold">
                        {task.neededSkill?.charAt(0) || "?"}
                      </span>
                    </div>
                  </div>

                  {/* Badge */}
                  <span className="inline-block mt-2 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-semibold px-3 py-1 rounded-full w-fit">
                    🌟 Baru untuk kamu
                  </span>

                  {/* Description */}
                  <p className="mt-3 text-gray-600 text-sm line-clamp-2">
                    {task.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-xs text-gray-400">
                      {task.createdAt?.toDate
                        ? task.createdAt.toDate().toLocaleString()
                        : "Baru saja"}
                    </p>

                    <button
                      onClick={() => {
                        setSelectedTask(task);
                        setIsModalOpen(true);
                      }}
                      className="text-[var(--color-primary)] font-semibold hover:underline text-sm"
                    >
                      Lihat Detail →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Footer selalu di bawah */}
      <Footer />

      {/* MODALS */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={selectedTask}
        onSendOffer={handleSendOffer}
      />

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  );
}
