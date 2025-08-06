import React, { useRef, useEffect, useState } from "react";

const sections = [
  {
    title: "Definisi",
    content: [
      "Platform: Kebbu.id dan seluruh layanan yang dikelola oleh Kebbu.",
      "Pengguna: Individu atau badan (sebagai peserta atau penyelenggara) yang menggunakan layanan Kebbu.",
      "Penyelenggara: Pihak yang membuat dan menjalankan acara melalui Kebbu.",
      "Peserta: Pengguna yang membeli tiket untuk menghadiri suatu event.",
    ],
  },
  {
    title: "Ruang Lingkup & Penggunaan",
    content: [
      "Syarat & Ketentuan ini merupakan kesepakatan sah antara Anda dan Kebbu.",
      "Penggunaan terus-menerus atas layanan Kebbu setelah adanya perubahan syarat berarti Anda menerima perubahan tersebut.",
      "Jika Anda tidak menyetujui versi terbaru, Anda wajib menghentikan penggunaan platform.",
    ],
  },
  {
    title: "Akun & Keamanan",
    content: [
      "Pengguna wajib membuat akun dengan data yang benar, lengkap, dan terbaru.",
      "Setiap aktivitas yang terkait akun Anda adalah tanggung jawab Anda secara penuh.",
      "Kebbu tidak bertanggung jawab atas kerugian akibat penyalahgunaan akun oleh pihak lain.",
      "Anda wajib menjaga kerahasiaan kredensial akun (email & password).",
    ],
  },
  {
    title: "Kebijakan Tiket & Penyelenggaraan",
    content: [
      "Penyelenggara bertanggung jawab atas semua aspek kegiatan acara, mulai dari informasi hingga kelancaran pelaksanaan.",
      "Setiap acara wajib mencantumkan detail seperti tanggal, lokasi, harga, kapasitas peserta, dan ketentuan refund.",
      "Tiket yang dibeli tidak dapat dipindahtangankan, ditukar nama, atau dikembalikan kecuali kebijakan refund dinyatakan oleh penyelenggara.",
      "Penyelenggara berhak menetapkan batasan usia, jumlah pembelian per akun, serta kewajiban memasukkan data peserta sesuai identitas resmi.",
    ],
  },
  {
    title: "Pembayaran & Penjualan Tiket",
    content: [
      "Semua transaksi pembayaran tiket dilakukan melalui payment gateway resmi yang bekerja sama dengan Kebbu.",
      "Tiket akan dikirim secara digital (QR code atau PDF) ke email/WhatsApp terdaftar setelah pembayaran berhasil.",
      "Pengguna wajib mengisi data peserta secara akurat termasuk identitas fisik yang akan diverifikasi saat hari-H.",
    ],
  },
  {
    title: "Pembatalan & Refund",
    content: [
      "Kebbu berperan sebagai perantara antara peserta dan penyelenggara. Dana hasil penjualan tiket langsung diteruskan ke penyelenggara tanpa melalui Kebbu.",
      "Oleh sebab itu, Kebbu tidak bertanggung jawab atas pembatalan acara, perubahan jadwal, atau kejadian luar biasa (force majeure seperti bencana, pandemi, kerusuhan, dll.).",
      "Jika acara dibatalkan, refund merupakan hak dan tanggung jawab penyelenggara, dan akan dilakukan sesuai syarat yang telah ditetapkan penyelenggara. Kebbu hanya dapat membantu memfasilitasi komunikasi jika diperlukan.",
      "Biaya layanan, convenience fee, atau biaya pemrosesan lain yang dibebankan kepada pembeli tidak dapat dikembalikan dalam kondisi apa pun.",
    ],
  },
  {
    title: "Hak Kekayaan Intelektual",
    content: [
      "Semua konten di Kebbu mulai dari desain, teks, hingga logo adalah milik Kebbu atau pihak yang memberi lisensi.",
      "Dilarang menggunakan, menyalin, atau menyebarkan konten Kebbu tanpa izin tertulis.",
    ],
  },
  {
    title: "Batasan Tanggung Jawab & Ganti Rugi",
    content: [
      "Kebbu tidak menjamin platform akan bebas gangguan atau downtime.",
      "Kebbu tidak bertanggung jawab atas kerugian langsung atau tidak langsung akibat penggunaan layanan.",
      "Pengguna setuju untuk membebaskan Kebbu dari klaim atau tuntutan yang ditimbulkan dari penggunaan platform atau pelanggaran syarat ini.",
    ],
  },
  {
    title: "Larangan Penggunaan",
    subtitle: "Pengguna dilarang:",
    content: [
      "Melakukan aktivitas ilegal, penipuan, spam, atau phishing.",
      "Mengunggah virus, malware, konten pornografi, atau informasi berbahaya.",
      "Mengakses sistem Kebbu tanpa otorisasi.",
    ],
  },
  {
    title: "Penghentian Layanan",
    content: [
      "Kebbu berhak menangguhkan atau menonaktifkan akun tanpa pemberitahuan jika ditemukan pelanggaran ketentuan.",
      "Pengguna dapat meminta penghapusan akun dengan menghubungi tim support.",
    ],
  },
  {
    title: "Hukum & Penyelesaian Sengketa",
    content: [
      "Syarat ini diatur oleh hukum Republik Indonesia.",
      "Setiap sengketa akan diselesaikan di pengadilan yang berwenang di Jakarta Selatan (atau wilayah hukum domisili Kebbu).",
    ],
  },
  {
    title: "Hubungi Kami",
    subtitle: "Untuk pertanyaan atau permintaan bantuan, hubungi kami melalui Email kebbu.workspace@gmail.com atau Whatsapp 08119432148.",
  },
];

function TermsPage() {
  const [activeIdx, setActiveIdx] = useState(0);
  const contentRefs = useRef([]);
  const sectionIds = sections.map((s) => s.title.replace(/\s+/g, "-").toLowerCase());
  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);
  
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
    if (idx === 0) {
      // Scroll to very top of page for first section
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    } else {
      const offset = -100; // ganti sesuai tinggi header/navbar, ex: -80, -100
      const element = contentRefs.current[idx];
      const y = element.getBoundingClientRect().top + window.pageYOffset + offset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="py-10 px-6 text-white">
      <h1 className="text-responsive-title mb-2">Syarat & Ketentuan</h1>
      <p className="mb-8 text-responsive-regular text-white">
        Dengan menggunakan atau mengakses Kebbu.id, Anda menyatakan bahwa telah membaca, memahami, dan menyetujui seluruh ketentuan di bawah ini. Jika Anda tidak setuju, mohon hentikan penggunaan layanan ini.
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TermsPage;
