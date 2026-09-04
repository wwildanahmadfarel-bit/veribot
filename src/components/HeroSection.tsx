import React, { useState } from 'react';

interface HeroSectionProps {
  onStartPreScreening: () => void;
  onQuickTicketSearch: (kodeTiket: string) => void;
  onExploreServices: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartPreScreening,
  onQuickTicketSearch,
  onExploreServices,
}) => {
  const [ticketInput, setTicketInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticketInput.trim()) {
      onQuickTicketSearch(ticketInput.trim());
    }
  };

  return (
    <section className="py-6 sm:py-8 bg-[#F8FAFC]">
      <div className="container">
        {/* =============================================================== */}
        {/* SLEEK BANNER: Royal Blue to Navy Gradient Banner */}
        {/* =============================================================== */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-xl shadow-blue-900/20 mb-8">
          <div className="relative z-10 max-w-2xl">
            <span className="bg-blue-400/30 text-blue-100 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4 inline-flex items-center gap-1.5 backdrop-blur-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-200 animate-ping"></span>
              Inovasi Layanan Publik Digital Kelurahan 2026
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3 text-white leading-tight">
              Layanan Pre-Screening Administrasi Kelurahan Berbasis AI
            </h1>
            <p className="text-blue-100 text-base sm:text-lg mb-6 leading-relaxed">
              Cek & Validasi Berkas Kependudukan dari Rumah. Sekali Datang ke Loket, Langsung Beres.
            </p>
            <div className="flex flex-wrap gap-3 items-center">
              <button
                type="button"
                className="bg-white text-blue-700 hover:bg-blue-50 px-6 py-3.5 rounded-xl font-bold text-base shadow-xl shadow-blue-900/20 active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer border-0"
                onClick={onStartPreScreening}
              >
                <span>Mulai Cek Dokumen Mandiri</span>
                <i className="bi bi-arrow-right"></i>
              </button>
              <button
                type="button"
                className="bg-blue-700/60 hover:bg-blue-700 text-white border border-blue-400/30 px-5 py-3.5 rounded-xl font-semibold text-base active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer"
                onClick={() => {
                  const el = document.getElementById('lacak-tiket-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <i className="bi bi-search text-blue-200"></i>
                <span>Lacak Status Resi</span>
              </button>
            </div>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 pointer-events-none flex items-center justify-center select-none d-none d-md-flex">
            <span className="text-[200px] leading-none">🤖</span>
          </div>
        </div>

        {/* =============================================================== */}
        {/* QUICK SEARCH BAR & BADGES */}
        {/* =============================================================== */}
        <div id="lacak-tiket-section" className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm mb-8">
          <div className="row align-items-center g-3">
            <div className="col-lg-5">
              <div className="d-flex align-items-center gap-2 mb-1">
                <i className="bi bi-patch-check-fill text-blue-600 fs-5"></i>
                <span className="font-bold text-slate-800 text-sm">Lacak Berkas Mandiri Anda</span>
              </div>
              <p className="text-xs text-slate-500 m-0">
                Masukkan kode tiket (contoh: <code>TKT-202508-001</code>) untuk memeriksa status validasi AI atau catatan petugas loket.
              </p>
            </div>
            <div className="col-lg-7">
              <form onSubmit={handleSearchSubmit} className="d-flex gap-2">
                <div className="position-relative flex-grow-1">
                  <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-slate-400"></i>
                  <input
                    type="text"
                    className="form-control rounded-xl border-slate-200 ps-5 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Ketik kode tiket Anda di sini..."
                    value={ticketInput}
                    onChange={(e) => setTicketInput(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="btn bg-[#212529] hover:bg-slate-800 text-white rounded-xl px-4 py-2.5 text-sm font-semibold text-nowrap d-flex align-items-center gap-2"
                >
                  <i className="bi bi-search text-slate-300"></i>
                  <span>Cari Tiket</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* =============================================================== */}
        {/* TWO-COLUMN FEATURE: LIVE SCANNER PREVIEW & VERIBOT AI MONITOR */}
        {/* =============================================================== */}
        <div className="row g-4 mb-8">
          {/* Left Column: Live AI Vision Scanner Card */}
          <div className="col-lg-7">
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover-lift h-100 d-flex flex-column">
              <div className="bg-[#212529] text-white px-5 py-3.5 d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-sm font-bold tracking-tight">Live Computer Vision Engine</span>
                </div>
                <span className="badge bg-blue-600 text-white font-mono text-[10px] px-2.5 py-1 rounded-md">
                  OCR + BLUR DETECTOR
                </span>
              </div>
              <div className="p-5 flex-grow-1 d-flex flex-column justify-content-between">
                {/* Simulated Document Scanning Frame */}
                <div className="ai-scan-overlay rounded-2xl border-2 border-blue-500/80 bg-slate-50 p-4 mb-4 position-relative">
                  <div className="ai-scan-laser"></div>
                  <div className="ai-grid-scanner p-3 rounded-xl">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 text-start">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="badge bg-blue-50 text-blue-600 border border-blue-200 font-bold text-[10px] uppercase px-2.5 py-1 rounded-md">
                          REPUBLIK INDONESIA - KTP-EL
                        </span>
                        <div className="d-flex align-items-center gap-1 text-emerald-600 text-xs font-semibold">
                          <i className="bi bi-shield-fill-check fs-5"></i>
                          <span>Asli Terverifikasi</span>
                        </div>
                      </div>
                      <div className="font-mono font-bold text-slate-800 text-base mb-1">
                        NIK: 3201011504950001
                      </div>
                      <div className="text-xs text-slate-600 font-medium">
                        Nama: AHMAD SANTOSO
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Alamat: JL. CEMPAKA RAYA NO. 12 RT 03/05, KEL. SUKAMAJU
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score & Evaluation Meter */}
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Skor Kelayakan AI Berkas
                    </span>
                    <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs px-3 py-1 rounded-full d-flex align-items-center gap-1.5">
                      <i className="bi bi-check-circle-fill text-emerald-500"></i>
                      <span>96% SIAP KE LOKET</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 mb-4 overflow-hidden">
                    <div className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500" style={{ width: '96%' }}></div>
                  </div>

                  {/* Badges Grid */}
                  <div className="row g-2">
                    <div className="col-6 col-sm-3">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-emerald-700 font-medium d-flex align-items-center gap-1.5">
                        <i className="bi bi-check2-circle text-emerald-500 fs-6"></i>
                        <span>Anti-Blur 99%</span>
                      </div>
                    </div>
                    <div className="col-6 col-sm-3">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-emerald-700 font-medium d-flex align-items-center gap-1.5">
                        <i className="bi bi-check2-circle text-emerald-500 fs-6"></i>
                        <span>Tanpa Silau</span>
                      </div>
                    </div>
                    <div className="col-6 col-sm-3">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-emerald-700 font-medium d-flex align-items-center gap-1.5">
                        <i className="bi bi-check2-circle text-emerald-500 fs-6"></i>
                        <span>OCR 16 Digit</span>
                      </div>
                    </div>
                    <div className="col-6 col-sm-3">
                      <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200/80 text-xs text-blue-700 font-medium d-flex align-items-center gap-1.5">
                        <i className="bi bi-lightning-charge-fill text-blue-600 fs-6"></i>
                        <span>Jalur Prioritas</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sleek VeriBot AI Monitor Card */}
          <div className="col-lg-5">
            <div className="bg-white border border-slate-200 rounded-3xl h-full flex flex-col p-6 shadow-sm hover-lift">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-base">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                VeriBot AI Monitor
              </h3>
              <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-100 p-5 flex flex-col justify-between">
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <div className="w-24 h-24 border-4 border-dashed border-blue-200 rounded-full flex items-center justify-center mb-3 relative">
                    <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin-slow"></div>
                    <span className="text-3xl">📂</span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 m-0">Menunggu Unggahan Berkas</p>
                  <p className="text-[11px] text-slate-500 max-w-[220px] mt-1 mb-0 leading-normal">
                    Silakan pilih layanan untuk memulai proses analisis Computer Vision & verifikasi mandiri
                  </p>
                </div>
                <div className="space-y-2.5 mt-4">
                  <div className="h-12 bg-white rounded-xl border border-slate-200/70 p-3 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">SIMULASI OCR</span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                      READY
                    </span>
                  </div>
                  <div className="h-12 bg-white rounded-xl border border-slate-200/70 p-3 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AMBANG KELAYAKAN</span>
                    </div>
                    <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md">
                      ≥ 75%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =============================================================== */}
        {/* 4 LANGKAH ALUR PELAYANAN MANDIRI */}
        {/* =============================================================== */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="text-center mb-6">
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full uppercase tracking-widest inline-block mb-2">
              Alur Pelayanan Mandiri
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-1">
              4 Langkah Mudah Pre-Screening Berkas
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 m-0">
              Cukup dari smartphone atau komputer tanpa perlu antre bolak-balik
            </p>
          </div>

          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-3">
            {/* Step 1 */}
            <div className="col">
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 text-center hover-lift h-100 d-flex flex-col items-center">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-sm mb-3 shadow-md shadow-blue-600/30">
                  1
                </div>
                <h3 className="font-bold text-slate-800 text-sm mb-1">Pilih Urusan</h3>
                <p className="text-xs text-slate-500 m-0 leading-normal">
                  Tentukan layanan (KTP, KK, Pindah, atau Akta Lahir) & lengkapi data kependudukan.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="col">
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 text-center hover-lift h-100 d-flex flex-col items-center">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-sm mb-3 shadow-md shadow-blue-600/30">
                  2
                </div>
                <h3 className="font-bold text-slate-800 text-sm mb-1">Upload Berkas</h3>
                <p className="text-xs text-slate-500 m-0 leading-normal">
                  Ambil foto dokumen asli langsung melalui kamera HP atau drag & drop file scan.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="col">
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 text-center hover-lift h-100 d-flex flex-col items-center">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-sm mb-3 shadow-md shadow-blue-600/30">
                  3
                </div>
                <h3 className="font-bold text-slate-800 text-sm mb-1">Analisis AI & CV</h3>
                <p className="text-xs text-slate-500 m-0 leading-normal">
                  Cognitive AI memindai ketajaman gambar, silau lampu, dan OCR 16 digit nomor NIK.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="col">
              <div className="bg-emerald-50/50 border border-emerald-200/70 rounded-2xl p-4 text-center hover-lift h-100 d-flex flex-col items-center">
                <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold text-sm mb-3 shadow-md shadow-emerald-600/30">
                  4
                </div>
                <h3 className="font-bold text-emerald-800 text-sm mb-1">Cetak Tiket QR</h3>
                <p className="text-xs text-slate-600 m-0 leading-normal">
                  Dapatkan kode tiket & QR code validasi resmi untuk akses Loket Fast-Track kelurahan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
