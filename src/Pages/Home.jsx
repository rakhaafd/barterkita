import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import {
  FiChevronDown,
  FiChevronUp,
  FiPlay,
  FiPause,
  FiPlus,
  FiMinus,
  FiUsers,
  FiAward,
  FiTrendingUp,
  FiArrowRight,
  FiStar,
  FiCheckCircle,
  FiMessageCircle
} from "react-icons/fi";
import "../index.css";
import Button from "../Elements/Button.jsx";
import Card from "../Elements/Card.jsx";
import Navbar from "../Layouts/Navbar.jsx";
import Footer from "../Layouts/Footer.jsx";
import DemoPemakaian from "../assets/penggunaan.mp4";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [counts, setCounts] = useState({ instansi: 0, keahlian: 0, tawaran: 0 });
  const [dampakData, setDampakData] = useState([]);
  const [testimonis, setTestimonis] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  // untuk section cara pemakaian
  const [openStep, setOpenStep] = useState(1);
  const [expandedStep, setExpandedStep] = useState(1);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showIcon, setShowIcon] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

const navigate = useNavigate()

// Fungsi untuk scroll ke section tertentu
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Fungsi untuk redirect ke WhatsApp
  const redirectToWhatsApp = () => {
    const message = "Halo Tim BarterKita 👋,\n\nSaya memiliki pertanyaan terkait:\n\n[Silakan tulis pertanyaan Anda di sini]\n\nTerima kasih 🙏";
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/62895339023888?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const steps = [
    {
      number: 1,
      title: "Login ke Akun Anda",
      details: [
        "Buka halaman utama website.",
        "Klik tombol Login di pojok kanan atas.",
        "Masukkan username dan password Anda.",
      ],
      icon: "👤"
    },
    {
      number: 2,
      title: "Pilih Fitur Barter",
      details: [
        "Masuk ke halaman Marketplace.",
        "Klik 'Create Barter Task' untuk membuat barter baru.",
      ],
      icon: "🛍️"
    },
    {
      number: 3,
      title: "Isi Detail Barter",
      details: [
        "Tambahkan deskripsi skill dan kebutuhanmu.",
        "Upload gambar atau file pendukung.",
      ],
      icon: "📝"
    },
    {
      number: 4,
      title: "Mulai Barter",
      details: [
        "Kirim tawaran dan tunggu persetujuan.",
        "Chat otomatis terbuka jika barter disetujui.",
      ],
      icon: "🚀"
    },
  ];

  const faqs = [
    {
      question: "Apa itu BarterKita?",
      answer: "BarterKita adalah platform untuk menukar skill atau jasa secara adil tanpa uang. Kamu bisa menemukan partner yang memiliki keahlian sesuai kebutuhanmu.",
    },
    {
      question: "Apakah barter di BarterKita gratis?",
      answer: "Ya, seluruh proses barter di platform ini gratis. Tidak ada biaya tambahan dalam pertukaran skill.",
    },
    {
      question: "Bagaimana cara melakukan barter?",
      answer: "Kamu bisa membuat tawaran barter, menjelajahi barter lain, lalu saling menyetujui pertukaran sebelum memulai kolaborasi.",
    },
    {
      question: "Apakah ada sistem penilaian setelah barter selesai?",
      answer: "Ya, pengguna bisa memberikan testimoni atau rating agar komunitas tetap transparan dan terpercaya.",
    },
  ];

  // Animasi counter
  useEffect(() => {
    const targets = { instansi: 80, keahlian: 90, tawaran: 150 };
    const duration = 5000;
    const frameRate = 20;
    const steps = duration / frameRate;
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      setCounts({
        instansi: Math.min(Math.floor((targets.instansi / steps) * currentStep), targets.instansi),
        keahlian: Math.min(Math.floor((targets.keahlian / steps) * currentStep), targets.keahlian),
        tawaran: Math.min(Math.floor((targets.tawaran / steps) * currentStep), targets.tawaran),
      });
      if (currentStep >= steps) clearInterval(timer);
    }, frameRate);
    return () => clearInterval(timer);
  }, []);

  // Intersection Observer untuk animasi scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    const target = document.getElementById('hero-section');
    if (target) observer.observe(target);
    return () => {
      if (target) observer.unobserve(target);
    };
  }, []);

  // FETCH JSON DAMPak
  useEffect(() => {
    fetch("/data/dampak.json")
      .then((res) => res.json())
      .then((data) => setDampakData(data))
      .catch((err) => console.error("Gagal memuat dampak.json:", err));
  }, []);

  // FETCH TESTIMONI
  useEffect(() => {
    fetch("/data/testimoni.json")
      .then((res) => res.json())
      .then((data) => setTestimonis(data))
      .catch((err) => console.error("Gagal memuat testimoni.json:", err));
  }, []);

  // VIDEO CONTROL
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handlePointerEnter = () => setShowIcon(true);
  const handlePointerLeave = () => setShowIcon(false);

  // Animasi variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const floatingAnimation = {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-white)] overflow-x-hidden">
      <Navbar />
      {/* HERO SECTION - Diperbarui dengan animasi yang lebih menarik */}
      <motion.section
        id="hero-section"
        initial={{ opacity: 0 }}
        animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1 }}
        className="relative bg-gradient-to-br from-[var(--color-primary)] via-[#0d5a7a] to-[var(--color-primary)] text-[var(--color-white)] py-32 px-6 text-center overflow-hidden"
      >
        {/* Background Animation */}
        <motion.div
          className="absolute inset-0 opacity-10"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(251, 193, 58, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 20%, rgba(251, 193, 58, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 40% 80%, rgba(251, 193, 58, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(251, 193, 58, 0.3) 0%, transparent 50%)',
            ]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-[var(--color-white)] to-[var(--color-secondary)] bg-clip-text text-transparent"
          >
            BarterKita
          </motion.h1>
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl mb-8 leading-relaxed"
          >
            Tukar <span className="text-[var(--color-secondary)] font-semibold">keahlianmu</span> dengan orang lain
            <br />tanpa menggunakan <span className="text-[var(--color-secondary)] font-semibold">uang</span>
          </motion.p>
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button className="group" onClick={() => navigate("/marketplace")}>
              <span className="flex items-center gap-2">
                Mulai Barter Sekarang
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-[var(--color-primary)]" onClick={() => scrollToSection("FAQ")}>
              Pelajari Lebih Lanjut
            </Button>
          </motion.div>
          {/* Floating Elements */}
          <motion.div
            animate={floatingAnimation}
            className="absolute top-10 left-10 text-6xl opacity-20"
          >
            🔄
          </motion.div>
          <motion.div
            animate={floatingAnimation}
            transition={{ delay: 1 }}
            className="absolute bottom-20 right-10 text-4xl opacity-20"
          >
            💡
          </motion.div>
          <motion.div
            animate={floatingAnimation}
            transition={{ delay: 2 }}
            className="absolute left-30 right-10 text-4xl opacity-20"
          >
            💸
          </motion.div>
          <motion.div
            animate={floatingAnimation}
            transition={{ delay: 3 }}
            className="absolute bottom-5 left-5 text-4xl opacity-20"
          >
            ✨
          </motion.div>
          <motion.div
            animate={floatingAnimation}
            transition={{ delay: 3 }}
            className="absolute top-8 right-30 text-6xl opacity-20"
          >
            🤝🏻
          </motion.div>
        </div>
      </motion.section>
      {/* FEATURES SECTION - Section baru */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-black)] mb-4">
              Mengapa Memilih BarterKita?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Platform barter skill pertama di Indonesia yang menghubungkan talenta dengan cara yang mudah dan menguntungkan
            </p>
          </motion.div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: <FiUsers className="text-3xl" />,
                title: "Komunitas Terpercaya",
                description: "Bergabung dengan ribuan profesional yang siap berkolaborasi dalam ekosistem yang aman dan terverifikasi"
              },
              {
                icon: <FiAward className="text-3xl" />,
                title: "Skill Berkualitas",
                description: "Temukan talenta dengan berbagai keahlian spesifik dari berbagai bidang dan industri"
              },
              {
                icon: <FiTrendingUp className="text-3xl" />,
                title: "Tanpa Biaya",
                description: "Seluruh proses barter 100% gratis tanpa biaya tersembunyi atau komisi tambahan"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="bg-[var(--color-secondary)]/10 w-16 h-16 rounded-xl flex items-center justify-center text-[var(--color-secondary)] mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-[var(--color-black)] mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      {/* ABOUT SECTION - Diperbarui */}
      <motion.section
        id="tentang"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-20 px-6 max-w-6xl mx-auto"
      >
        <div className="md:flex md:items-center md:justify-between gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="md:w-1/2"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[var(--color-black)]">
              Tentang <span className="text-[var(--color-secondary)]">BarterKita</span>
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-8">
              BarterKita adalah platform digital revolusioner untuk menukar skill dan
              menyelesaikan tugas secara adil, membangun komunitas kolaboratif tanpa uang.
              Di sini kamu bisa menemukan partner yang punya skill sesuai kebutuhanmu.
            </p>
            <div className="space-y-4 mb-8">
              {[
                "Platform barter skill pertama di Indonesia",
                "Komunitas profesional yang terus berkembang",
                "Proses barter yang aman dan terjamin",
                "100% gratis tanpa biaya tambahan"
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <FiCheckCircle className="text-[var(--color-secondary)] text-xl flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </motion.div>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="grid grid-cols-3 gap-6 text-center md:text-left"
            >
              {[
                { count: counts.instansi, label: "Instansi", icon: "🏢" },
                { count: counts.keahlian, label: "Keahlian", icon: "🔧" },
                { count: counts.tawaran, label: "Tawaran", icon: "🤝" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="text-center"
                >
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <h3 className="text-3xl font-bold text-[var(--color-primary)] mb-1">
                    {stat.count}{stat.label === 'Tawaran' && '+'}
                  </h3>
                  <p className="text-gray-600 font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
          {/* Swiper Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="md:w-1/2 mt-10 md:mt-0 flex flex-col items-center"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <Swiper
                modules={[Navigation, Autoplay]}
                navigation={{
                  prevEl: ".swiper-button-prev-custom",
                  nextEl: ".swiper-button-next-custom",
                }}
                autoplay={{ delay: 3000 }}
                spaceBetween={30}
                slidesPerView={1}
                loop
                className="w-80 h-80 rounded-3xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] shadow-2xl"
              >
                <SwiperSlide>
                  <div className="flex items-center justify-center h-full text-white text-lg font-medium">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🎨</div>
                      <p>Design & Creative</p>
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide>
                  <div className="flex items-center justify-center h-full text-white text-lg font-medium">
                    <div className="text-center">
                      <div className="text-6xl mb-4">💻</div>
                      <p>Tech & Development</p>
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide>
                  <div className="flex items-center justify-center h-full text-white text-lg font-medium">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📊</div>
                      <p>Business & Marketing</p>
                    </div>
                  </div>
                </SwiperSlide>
              </Swiper>
              {/* Custom Navigation */}
              <div className="flex gap-4 mt-6">
                <button className="swiper-button-prev-custom bg-white text-[var(--color-primary)] rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                  ‹
                </button>
                <button className="swiper-button-next-custom bg-white text-[var(--color-primary)] rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                  ›
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
      {/* DAMPAK SECTION - Diperbarui */}
      <section className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden" id="dampak">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-black)] mb-4">
            Dampak <span className="text-[var(--color-secondary)]">Positif</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Lihat bagaimana BarterKita mengubah cara orang berkolaborasi dan berkembang bersama
          </p>
        </motion.div>
        <div className="flex flex-col gap-16 max-w-4xl mx-auto relative">
          {dampakData.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className={`flex flex-col md:flex-row ${index % 2 === 1 ? "md:flex-row-reverse" : ""} items-center gap-8`}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="md:w-1/2 flex justify-center"
              >
                <div className="relative">
                  <Card className="w-64 h-64 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </Card>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-4 border-4 border-[var(--color-secondary)]/30 rounded-2xl"
                  />
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.3 }}
                className="md:w-1/2"
              >
                <Card className="shadow-2xl p-8 bg-white rounded-2xl border border-gray-100">
                  <h3 className="text-2xl font-bold text-[var(--color-primary)] mb-4">
                    {item.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {item.description}
                  </p>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>
      {/* TESTIMONI SECTION - Diperbarui */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50" id="testimoni">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-black)] mb-4">
            Kata <span className="text-[var(--color-secondary)]">Mereka</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Dengarkan pengalaman langsung dari komunitas BarterKita
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="max-w-6xl mx-auto px-6"
        >
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={30}
            slidesPerView={1}
            loop
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="pb-12"
          >
            {testimonis.map((item, index) => (
              <SwiperSlide key={item.id}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 h-64 flex flex-col justify-between border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start mb-4">
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} className="text-[var(--color-secondary)] fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4 flex-1">
                    "{item.text}"
                  </p>
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-[var(--color-black)]">
                        {item.name}
                      </h4>
                      <p className="text-gray-500 text-sm">{item.role}</p>
                    </div>
                    <img
                      src={item.img}
                      alt={item.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-[var(--color-secondary)]"
                    />
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      </section>
      {/* CARA PEMAKAIAN SECTION - Diperbarui */}
      <section id="pemakaian" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            {/* Text Section */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="w-full lg:w-1/2"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-black)] mb-6">
                Cara <span className="text-[var(--color-secondary)]">Pemakaian</span>
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                Mulai barter skill Anda dalam 4 langkah mudah
              </p>
              <div className="space-y-4">
                {steps.map((step) => (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: step.number * 0.1 }}
                    className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-300"
                  >
                    <button
                      onClick={() => {
                        setOpenStep(step.number);
                        setExpandedStep(expandedStep === step.number ? null : step.number);
                      }}
                      className="flex items-center justify-between w-full text-left focus:outline-none cursor-pointer"
                    >
                      <span className="flex items-center gap-4">
                        <span className="text-2xl">{step.icon}</span>
                        <span className="flex items-center gap-3">
                          <span
                            className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                              openStep === step.number
                                ? "bg-[var(--color-secondary)] border-[var(--color-secondary)] text-white"
                                : "border-[var(--color-secondary)] text-[var(--color-secondary)]"
                            }`}
                          >
                            {step.number}
                          </span>
                          <span className="text-lg font-semibold text-[var(--color-black)]">
                            {step.title}
                          </span>
                        </span>
                      </span>
                      {expandedStep === step.number ? (
                        <FiChevronUp className="text-[var(--color-secondary)] text-xl" />
                      ) : (
                        <FiChevronDown className="text-[var(--color-secondary)] text-xl" />
                      )}
                    </button>
                    {expandedStep === step.number && (
                      <motion.ul
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 ml-16 space-y-2 text-gray-600"
                      >
                        {step.details.map((detail, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="flex items-center gap-2"
                          >
                            <FiCheckCircle className="text-[var(--color-secondary)] flex-shrink-0" />
                            {detail}
                          </motion.li>
                        ))}
                      </motion.ul>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
            {/* Video Section */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="w-full lg:w-1/2 relative"
              onMouseEnter={handlePointerEnter}
              onMouseLeave={handlePointerLeave}
              onTouchStart={handlePointerEnter}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative rounded-2xl overflow-hidden shadow-2xl"
              >
                <video
                  ref={videoRef}
                  src={DemoPemakaian}
                  className="w-full h-auto object-cover"
                  onClick={togglePlay}
                >
                  Your browser does not support the video tag.
                </video>
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                {showIcon && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-[var(--color-secondary)] text-white rounded-full w-20 h-20 flex items-center justify-center shadow-2xl hover:bg-[var(--color-primary)] transition-colors duration-300 cursor-pointer"
                      onClick={togglePlay}
                    >
                      {isPlaying ? <FiPause size={24} /> : <FiPlay size={24} />}
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* TANYA JAWAB SECTION - Diperbarui */}
      <section id="FAQ" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-black)] mb-4">
              Pertanyaan <span className="text-[var(--color-secondary)]">Umum</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Temukan jawaban dari pertanyaan umum seputar penggunaan BarterKita
            </p>
          </motion.div>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* FAQ List */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="w-full lg:w-2/3 space-y-4"
            >
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex justify-between items-center px-6 py-4 text-left font-semibold text-[var(--color-black)] focus:outline-none cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                  >
                    <span className="text-lg">{faq.question}</span>
                    {activeIndex === index ? (
                      <FiMinus className="text-[var(--color-secondary)] text-xl" />
                    ) : (
                      <FiPlus className="text-[var(--color-secondary)] text-xl" />
                    )}
                  </button>
                  {activeIndex === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-6 pb-4 text-gray-700 leading-relaxed"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </motion.div>
            {/* Contact Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="w-full lg:w-1/3"
            >
              <div className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white p-8 rounded-2xl shadow-2xl text-center h-full">
                <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiMessageCircle className="text-2xl" />
                </div>
                <h3 className="text-2xl font-bold mb-4">
                  Masih Punya Pertanyaan?
                </h3>
                <p className="text-white/90 leading-relaxed mb-6">
                  Tim support kami siap membantu menjawab semua pertanyaan Anda dengan senang hati
                </p>
                <Button
                  variant="secondary"
                  onClick={redirectToWhatsApp}
                  className="w-full bg-white text-[var(--color-primary)] hover:bg-gray-100"
                >
                  Hubungi Kami
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Home;