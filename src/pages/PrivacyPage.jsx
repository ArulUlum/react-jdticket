import React, { useRef, useEffect, useState } from "react";

const sections = [
  {
    title: "Informasi yang Kami Kumpulkan",
    subtitle: "Kami mengumpulkan informasi pribadi secara langsung maupun tidak langsung saat Anda:",
    content: [
      "Membuat akun di Kebbu",
      "Mendaftar atau membeli tiket acara",
      "Menghubungi tim layanan pelanggan kami",
      "Menggunakan platform atau fitur tertentu",
    ],
    subtitle2: "Jenis data pribadi yang dapat kami kumpulkan meliputi:",
    content2: [
      "Nama lengkap",
      "Alamat email",
      "Nomor telepon",
      "Informasi acara yang Anda buat atau ikuti",
      "Data transaksi dan metode pembayaran",
      "Data lokasi (jika diaktifkan)",
      "Informasi teknis (IP address, jenis perangkat, browser, cookies, log aktivitas)",
    ],
  },
  {
    title: "Bagaimana Kami Menggunakan Informasi Anda",
    subtitle: "Kami menggunakan data pribadi Anda untuk:",
    content: [
      "Memproses pendaftaran akun dan pembelian tiket",
      "Menyediakan layanan platform dan dukungan pelanggan",
      "Mengelola transaksi dan konfirmasi pembayaran",
      "Mengirim notifikasi, update, dan pengingat acara",
      "Melakukan analisis internal dan peningkatan layanan",
      "Mencegah aktivitas ilegal atau penyalahgunaan platform",
      "Mengirim komunikasi promosi (dengan persetujuan Anda)",
    ],
  },
  {
    title: "Dasar Hukum Pemrosesan",
    subtitle: "Kami memproses data Anda berdasarkan:",
    content: [
      "Persetujuan yang Anda berikan secara eksplisit",
      "Kewajiban kontrak antara Anda dan Kebbu (misalnya, saat Anda membeli tiket)",
      "Kepentingan sah kami dalam meningkatkan layanan",
      "Kewajiban hukum untuk menyimpan data tertentu (misalnya, catatan pajak)",
    ],
  },
  {
    title: "Berbagi Informasi Anda",
    subtitle: "Kami tidak menjual data pribadi Anda ke pihak ketiga.",
    subtitle2: "Namun, kami dapat membagikan informasi kepada:",
    content2: [
      "Penyelenggara acara (untuk keperluan daftar hadir, validasi tiket, atau pengelolaan peserta)",
      "Mitra pembayaran seperti Xendit untuk proses transaksi",
      "Penyedia layanan IT, server, atau analitik yang membantu operasional kami",
      "Pihak berwenang jika diwajibkan oleh hukum (misalnya dalam proses hukum atau permintaan resmi pemerintah)",
    ],
  },
  {
    title: "Penyimpanan dan Keamanan Data",
    content: [
      "Kami menyimpan data Anda selama akun Anda aktif atau selama diperlukan untuk keperluan bisnis kami.",
      "Data disimpan dengan sistem keamanan dan enkripsi standar industri.",
      "Akses terhadap data dibatasi dan hanya diberikan kepada pihak internal atau mitra resmi yang berkepentingan dan telah menandatangani perjanjian kerahasiaan.",
    ],
  },
  {
    title: "Hak Anda atas Data Pribadi",
    subtitle: "Anda memiliki hak untuk:",
    content: [
      "Mengakses dan meninjau data pribadi Anda",
      "Memperbaiki data yang tidak akurat",
      "Meminta penghapusan akun dan datanya",
      "Menolak penggunaan data Anda untuk tujuan pemasaran",
    ],
    subtitle2: "Permintaan dapat diajukan ke support@kebbu.id, dan akan kami proses sesuai peraturan yang berlaku.",
  },
  {
    title: "Cookie dan Teknologi Pelacakan",
    subtitle: "Kebbu menggunakan cookie untuk:",
    content: [
      "Menyimpan preferensi pengguna",
      "Menganalisis perilaku pengguna untuk meningkatkan pengalaman",
      "Menyediakan iklan atau konten yang relevan",
    ],
    subtitle2: "Anda dapat mengatur preferensi cookie melalui browser Anda.",
  },
  {
    title: "Tautan ke Situs Eksternal",
    subtitle: "Kebbu dapat memuat tautan ke situs lain. Kami tidak bertanggung jawab atas kebijakan privasi atau konten situs eksternal tersebut.",
  },
  {
    title: "Perubahan pada Kebijakan Privasi",
    subtitle: "Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Perubahan akan ditampilkan di halaman ini beserta tanggal pembaruannya. Anda disarankan untuk memeriksanya secara berkala.",
  },
  {
    title: "Hubungi Kami",
    subtitle: "Jika Anda memiliki pertanyaan atau permintaan terkait privasi, silakan hubungi kami melalui Email support@kebbu.id atau Whatsapp 08119432148"
  },
];


function PrivacyPage() {
  const [activeIdx, setActiveIdx] = useState(0);
  const contentRefs = useRef([]);
  const sectionIds = sections.map((s) => s.title.replace(/\s+/g, "-").toLowerCase());

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;
      let foundIdx = 0;
      for (let i = 0; i < contentRefs.current.length; i++) {
        const ref = contentRefs.current[i];
        if (ref) {
          const { offsetTop } = ref;
          if (scrollPosition >= offsetTop) {
            foundIdx = i;
          }
        }
      }
      setActiveIdx(foundIdx);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Manual scroll with offset
  const handleClick = (idx) => {
    setActiveIdx(idx);
    const offset = -100; // ganti sesuai tinggi header/navbar, ex: -80, -100
    const element = contentRefs.current[idx];
    const y = element.getBoundingClientRect().top + window.pageYOffset + offset;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <div className="py-10 px-6 text-white">
      <h1 className="text-responsive-title mb-2">Kebijakan Privasi</h1>
      <p className="mb-8 text-responsive-regular text-white">
        PT Kebbu Acara Lancar (“Kebbu”, “kami”, atau “milik kami”) berkomitmen untuk melindungi dan menghormati privasi Anda. Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi data pribadi Anda saat Anda menggunakan platform kebbu.id dan layanannya.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left: Section Links */}
        <div>
          <ul className="space-y-2 text-gray-400">
            {sections.map((section, idx) => (
              <li key={idx}>
                <button
                  onClick={() => handleClick(idx)}
                  className={`text-left w-full transition cursor-pointer text-responsive-medium
                    ${activeIdx === idx ? "text-white" : "text-[#a2a2a2] hover:text-white"}
                  `}
                  style={{ outline: "none", background: "none", border: "none", padding: 0 }}
                  tabIndex={0}
                >
                  {section.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
        {/* Right: Section Content */}
        <div>
          {sections.map((section, idx) => (
            <div
              key={idx}
              className="mb-8"
              id={sectionIds[idx]}
              ref={el => (contentRefs.current[idx] = el)}
            >
              <div className="text-responsive-sub-title mb-2">{section.title}</div>
              {section.subtitle && (
                <div className="text-white text-responsive-regular mb-1">{section.subtitle}</div>
              )}
              {section.content && (
                <ul className="text-responsive-regular list-disc pl-5 space-y-2 text-white">
                  {section.content.map((item, i) => (
                    <li key={i} className="ml-3">{item}</li>
                  ))}
                </ul>
              )}
              {section.subtitle2 && (
                <div className="text-white text-responsive-regular mt-3 mb-1">{section.subtitle2}</div>
              )}
              {section.content2 && (
                <ul className="text-responsive-regular list-disc pl-5 space-y-2 text-white">
                  {section.content2.map((item, i) => (
                    <li key={i} className="ml-3">{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PrivacyPage;
