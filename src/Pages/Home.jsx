import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { FiChevronDown, FiChevronUp, FiPlay, FiPause, FiPlus, FiMinus } from "react-icons/fi";

import "../index.css";
import Button from "../Elements/Button.jsx";
import Card from "../Elements/Card.jsx";
import Navbar from "../Layouts/Navbar.jsx";
import Footer from "../Layouts/Footer.jsx";
import DemoPemakaian from "../assets/vid.mp4"; // ganti dengan video kamu

const Home = () => {
  const [counts, setCounts] = useState({ instansi: 0, keahlian: 0, tawaran: 0 });
  const [dampakData, setDampakData] = useState([]);
  const [testimonis, setTestimonis] = useState([]);

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

  const steps = [
    {
      number: 1,
      title: "Login ke Akun Anda",
      details: [
        "Buka halaman utama website.",
        "Klik tombol Login di pojok kanan atas.",
        "Masukkan username dan password Anda.",
      ],
    },
    {
      number: 2,
      title: "Pilih Fitur Barter",
      details: [
        "Masuk ke halaman Marketplace.",
        "Klik 'Create Barter Task' untuk membuat barter baru.",
      ],
    },
    {
      number: 3,
      title: "Isi Detail Barter",
      details: [
        "Tambahkan deskripsi skill dan kebutuhanmu.",
        "Upload gambar atau file pendukung.",
      ],
    },
    {
      number: 4,
      title: "Mulai Barter",
      details: [
        "Kirim tawaran dan tunggu persetujuan.",
        "Chat otomatis terbuka jika barter disetujui.",
      ],
    },
  ];

  const faqs = [
  {
    question: "Apa itu BarterKita?",
    answer:
      "BarterKita adalah platform untuk menukar skill atau jasa secara adil tanpa uang. Kamu bisa menemukan partner yang memiliki keahlian sesuai kebutuhanmu.",
  },
  {
    question: "Apakah barter di BarterKita gratis?",
    answer:
      "Ya, seluruh proses barter di platform ini gratis. Tidak ada biaya tambahan dalam pertukaran skill.",
  },
  {
    question: "Bagaimana cara melakukan barter?",
    answer:
      "Kamu bisa membuat tawaran barter, menjelajahi barter lain, lalu saling menyetujui pertukaran sebelum memulai kolaborasi.",
  },
  {
    question: "Apakah ada sistem penilaian setelah barter selesai?",
    answer:
      "Ya, pengguna bisa memberikan testimoni atau rating agar komunitas tetap transparan dan terpercaya.",
  },
];

  // COUNTER ANIMATION
  useEffect(() => {
    const targets = { instansi: 80, keahlian: 90, tawaran: 150 };
    const duration = 2000;
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

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-white)] overflow-x-hidden">
      <Navbar />

      {/* HERO SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-[var(--color-primary)] text-[var(--color-white)] py-32 px-6 text-center"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4">BarterKita</h1>
        <p className="text-lg md:text-xl mb-6">
          Tukar keahlianmu dengan orang lain tanpa menggunakan uang.
        </p>
        <Button>Mulai Barter</Button>
      </motion.section>

      {/* ABOUT SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-20 px-6 max-w-6xl mx-auto"
      >
        <div className="md:flex md:items-center md:justify-between gap-10">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold mb-6 text-left text-[var(--color-black)]">
              Tentang BarterKita
            </h2>
            <p className="text-gray-700 text-left leading-relaxed">
              BarterKita adalah platform digital untuk menukar skill dan
              menyelesaikan tugas secara adil, membangun komunitas kolaboratif
              tanpa uang. Di sini kamu bisa menemukan partner yang punya skill
              sesuai kebutuhanmu.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-6 text-center md:text-left">
              <div>
                <h3 className="text-4xl font-bold text-[var(--color-primary)]">
                  {counts.instansi}
                </h3>
                <p className="text-gray-700 font-medium mt-1">Instansi</p>
              </div>
              <div>
                <h3 className="text-4xl font-bold text-[var(--color-primary)]">
                  {counts.keahlian}
                </h3>
                <p className="text-gray-700 font-medium mt-1">Keahlian</p>
              </div>
              <div>
                <h3 className="text-4xl font-bold text-[var(--color-primary)]">
                  {counts.tawaran}+
                </h3>
                <p className="text-gray-700 font-medium mt-1">Tawaran</p>
              </div>
            </div>
          </div>

          {/* Swiper Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="md:w-1/2 mt-10 md:mt-0 flex flex-col items-center"
          >
            <Swiper
              modules={[Navigation]}
              navigation={{
                prevEl: ".swiper-button-prev-custom",
                nextEl: ".swiper-button-next-custom",
              }}
              spaceBetween={30}
              slidesPerView={1}
              loop
              className="w-72 h-72 rounded-2xl bg-gray-100 shadow-inner"
            >
              <SwiperSlide>
                <div className="flex items-center justify-center h-full text-gray-400 text-lg font-medium">
                  Ilustrasi 1
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className="flex items-center justify-center h-full text-gray-400 text-lg font-medium">
                  Ilustrasi 2
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className="flex items-center justify-center h-full text-gray-400 text-lg font-medium">
                  Ilustrasi 3
                </div>
              </SwiperSlide>
            </Swiper>

            {/* Custom Navigation */}
            <div className="flex gap-6 mt-4">
              <button className="swiper-button-prev-custom text-[var(--color-secondary)] text-xl font-bold hover:scale-110 transition-transform">
                ‹
              </button>
              <button className="swiper-button-next-custom text-[var(--color-secondary)] text-xl font-bold hover:scale-110 transition-transform">
                ›
              </button>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* DAMPak SECTION */}
      <section className="py-20 px-6 bg-gray-100 relative">
        <h2 className="text-3xl font-bold mb-16 text-center text-[var(--color-secondary)]">
          Dampak
        </h2>

        <motion.svg
          className="absolute left-1/2 transform -translate-x-1/2 top-0 h-full w-[2px]"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        >
          <motion.line
            x1="0"
            y1="0"
            x2="0"
            y2="100%"
            stroke="rgba(0,0,0,0.1)"
            strokeWidth="2"
            strokeDasharray="10 10"
          />
        </motion.svg>

        <div className="flex flex-col gap-12 max-w-4xl mx-auto relative z-10">
          {dampakData.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -80 : 80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.15 }}
              className={`flex flex-col md:flex-row ${
                index % 2 === 1 ? "md:flex-row-reverse" : ""
              } items-center gap-8`}
            >
              <div className="md:w-1/2">
                <Card className="shadow-lg p-6 bg-white rounded-2xl">
                  <h3 className="text-2xl font-semibold mb-3 text-[var(--color-primary)]">
                    {item.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{item.description}</p>
                </Card>
              </div>

              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="md:w-1/2 flex justify-center"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-56 h-56 object-contain rounded-xl shadow-md"
                />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TESTIMONI SECTION */}
      <section className="py-20 px-6 bg-[var(--color-white)]">
        <h2 className="text-3xl font-bold mb-12 text-center text-[var(--color-secondary)]">
          Testimoni
        </h2>

        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={20}
          slidesPerView={1}
          loop
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="max-w-6xl mx-auto"
        >
          {testimonis.map((item) => (
            <SwiperSlide key={item.id}>
              <div className="bg-white shadow-md rounded-2xl p-6 h-48 flex flex-col justify-between border border-gray-100">
                <p className="text-gray-700 leading-relaxed mb-4">
                  “{item.text}”
                </p>
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-[var(--color-black)]">
                    {item.name}
                  </h4>
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* CARA PEMAKAIAN SECTION */}
      <section id="carapemakaian" className="py-12 sm:py-16">
        <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between max-w-[90%]">
          {/* Text Section */}
          <div className="w-full lg:w-1/2 mb-8 lg:mb-0 lg:pr-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-secondary)] mb-6">
              Cara Pemakaian
            </h2>

            <div className="space-y-4">
              {steps.map((step) => (
                <div key={step.number}>
                  {step.number === 1 ? (
                    <div className="flex items-center justify-between w-full text-left">
                      <span className="flex items-center">
                        <span
                          className={`w-8 h-8 flex items-center justify-center rounded-full mr-3 border border-[var(--color-secondary)] ${
                            openStep === step.number
                              ? "bg-[var(--color-secondary)] text-white"
                              : "text-[var(--color-secondary)]"
                          }`}
                        >
                          {step.number}
                        </span>
                        <span className="text-lg font-medium text-[var(--color-black)]">
                          {step.title}
                        </span>
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setOpenStep(step.number);
                        setExpandedStep(
                          expandedStep === step.number ? null : step.number
                        );
                      }}
                      className="flex items-center justify-between w-full text-left focus:outline-none cursor-pointer"
                    >
                      <span className="flex items-center">
                        <span
                          className={`w-8 h-8 flex items-center justify-center rounded-full mr-3 border border-[var(--color-secondary)] ${
                            openStep === step.number
                              ? "bg-[var(--color-secondary)] text-white"
                              : "text-[var(--color-secondary)]"
                          }`}
                        >
                          {step.number}
                        </span>
                        <span className="text-lg font-medium text-[var(--color-black)]">
                          {step.title}
                        </span>
                      </span>
                      {expandedStep === step.number ? (
                        <FiChevronUp className="text-[var(--color-secondary)]" />
                      ) : (
                        <FiChevronDown className="text-[var(--color-secondary)]" />
                      )}
                    </button>
                  )}

                  {expandedStep === step.number && step.details.length > 0 && (
                    <ul className="mt-2 ml-11 space-y-1 text-gray-600 list-disc">
                      {step.details.map((detail, index) => (
                        <li key={index}>{detail}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Video Section */}
          <div
            className="w-full lg:w-1/2 relative"
            onMouseEnter={handlePointerEnter}
            onMouseLeave={handlePointerLeave}
            onTouchStart={handlePointerEnter}
          >
            <video
              ref={videoRef}
              src={DemoPemakaian}
              className="rounded-lg shadow-lg w-full h-auto object-cover border border-[var(--color-secondary)]"
              onClick={togglePlay}
            >
              Your browser does not support the video tag.
            </video>

            {showIcon && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  className="bg-[var(--color-secondary)] text-white rounded-full w-16 h-16 flex items-center justify-center hover:bg-[var(--color-primary)] shadow-md transition duration-300 cursor-pointer"
                  onClick={togglePlay}
                >
                  {isPlaying ? <FiPause /> : <FiPlay />}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* TANYA JAWAB SECTION */}
<section id="tanyajawab" className="py-12 sm:py-16 bg-[var(--color-white)]">
  <div className="text-center mb-10">
    <h2 className="text-3xl sm:text-4xl font-bold font-second text-[var(--color-secondary)] mb-2">
      Tanya Jawab
    </h2>
    <p className="text-gray-600 max-w-2xl mx-auto">
      Temukan jawaban dari pertanyaan umum seputar penggunaan BarterKita
      dan cara berkolaborasi dalam barter skill.
    </p>
  </div>

  {/* Container */}
  <div className="container mx-auto max-w-[90%]">
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      {/* LEFT: FAQ LIST */}
      <div className="w-full lg:w-2/3 space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full flex justify-between items-center px-4 py-3 text-left font-medium text-[var(--color-black)] focus:outline-none cursor-pointer"
            >
              <span>{faq.question}</span>
              {activeIndex === index ? (
                <FiMinus className="text-[var(--color-secondary)]" />
              ) : (
                <FiPlus className="text-[var(--color-secondary)]" />
              )}
            </button>
            {activeIndex === index && (
              <div className="px-4 pb-4 text-gray-700">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* RIGHT: CONTACT CARD */}
      <div className="w-full lg:w-1/3 flex items-stretch">
        <div className="bg-[var(--color-secondary)]/10 p-6 sm:p-8 rounded-2xl text-center flex flex-col justify-center w-full shadow-md">
          <h3 className="text-xl font-semibold mb-2 leading-tight text-[var(--color-black)]">
            Punya Pertanyaan Lain?
          </h3>
          <p className="mb-4 text-gray-600 leading-relaxed">
            Kami siap membantu. Jangan ragu untuk menghubungi tim kami kapan saja.
          </p>
          <Button
            color="secondary"
            href="https://wa.me/62895339023888?text=Halo%20Tim%20BarterKita%F0%9F%91%8B%2C%0A%0ASaya%20memiliki%20pertanyaan%20terkait%3A%0A%0A(pesanmu)%0A%0ATerima%20kasih%20%F0%9F%99%8F."
            target="_blank"
          >
            Hubungi Kami
          </Button>
        </div>
      </div>
    </div>
  </div>
</section>


      <Footer />
    </div>
  );
};

export default Home;
