import React from "react";

const reasons = [
  "COMMUNITY ORIENTED",
  "SEMUA BISA BIKIN EVENT",
  "BISA NARIK DUIT SEBELUM ACARA DIMULAI",
  "PESERTA GA WAJIB BIKIN AKUN BUAT BELI TIKET",
  "FEE SUPER RENDAH",
  "METODE PEMBAYARAN LENGKAP",
  "LIVE DASHBOARD PENJUALAN TIKET",
  "BLAST EMAIL GRATIS SEPUASNYA",
  "ADA INSIGHT NYA",
  "FITUR CHECK IN DI WEBSITE",
  "BISA BANYAK KATEGORI TIKET",
  "CUSTOM KODE PROMO",
  "ADDITIONAL QUESTION",
];

function AboutUs() {
  return (
    <div className="min-h-screen text-white flex flex-col gap-8 py-5">
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-2 gap-x-8 items-center">
          {/* Kiri */}
          <div className="flex flex-col gap-4">
            <h1 className="text-[56px] font-light leading-none tracking-wide mb-4">MULAI EVENT</h1>
            <div className="w-[360px] h-[120px] rounded-[48px] overflow-hidden mb-4">
              <img
                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
                alt="event"
                className="object-cover w-full h-full"
              />
            </div>
            <p className="text-lg font-light">
              Kebbu bantu kamu bikin dan kelola event komunitas dengan mudah dan tidak pake repot.
            </p>
          </div>
          {/* Kanan */}
          <div className="flex flex-col items-end gap-4">
            <div className="w-[340px] h-[110px] rounded-[48px] overflow-hidden mb-4">
              <img
                src="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80"
                alt="komunitas"
                className="object-cover w-full h-full"
              />
            </div>
            <h2 className="text-[48px] md:text-[56px] text-right font-light leading-tight mb-4">KOMUNITAS DISINI</h2>
            <div className="flex gap-4">
              <button className="px-7 py-2 border border-white rounded-full font-medium hover:bg-white/10 transition">
                Explore Event
              </button>
              <button className="px-7 py-2 bg-gradient-to-r from-[#44A08D] to-[#00594F] hover:from-[#58c1ac] hover:to-[#007467] rounded-full font-medium transition">
                Bikin Event
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 13 Reasons Section */}
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-8">
        <h3 className="text-[32px] font-light mb-2 text-center">13 REASONS WHY PAKE KEBBU</h3>
        <div className="flex flex-wrap gap-3 justify-between">
          {reasons.map((text, i) => (
            <div
              key={i}
              className="px-5 py-2 border border-white rounded-full text-base font-light hover:bg-white/10 transition"
            >
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-5xl mx-auto w-full mt-12">
        <div className="bg-gradient-to-r from-[#44A08D] to-[#00594F] rounded-xl flex flex-col md:flex-row items-center justify-between px-8 py-5 gap-5">
          <span className="text-xl md:text-2xl font-light">Cobain dulu yuk bikin eventnya</span>
          <button className="px-7 py-2 bg-transparent border-white text-white rounded-full font-medium hover:bg-[#007467] hover:border-white transition">
            Bikin Event
          </button>
        </div>
      </div>
    </div>
  );
}

export default AboutUs;