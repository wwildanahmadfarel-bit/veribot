import React from 'react';
import { Layanan } from '../types';

interface ServiceCardsProps {
  layananList: Layanan[];
  onSelectService: (serviceId: number) => void;
}

export const ServiceCards: React.FC<ServiceCardsProps> = ({
  layananList,
  onSelectService,
}) => {
  const getIconConfig = (id: number) => {
    switch (id) {
      case 1:
        return {
          emoji: '🪪',
          bg: 'bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white',
          tag: 'Paling Sering Diajukan',
          tagClass: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 2:
        return {
          emoji: '👨‍👩‍👧‍👦',
          bg: 'bg-emerald-50 group-hover:bg-emerald-600 text-emerald-600 group-hover:text-white',
          tag: 'Prioritas Keluarga',
          tagClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 3:
        return {
          emoji: '🚚',
          bg: 'bg-orange-50 group-hover:bg-orange-600 text-orange-600 group-hover:text-white',
          tag: 'Antar Domisili',
          tagClass: 'bg-orange-50 text-orange-700 border-orange-200',
        };
      case 4:
        return {
          emoji: '👶',
          bg: 'bg-purple-50 group-hover:bg-purple-600 text-purple-600 group-hover:text-white',
          tag: 'Bayi Baru Lahir',
          tagClass: 'bg-purple-50 text-purple-700 border-purple-200',
        };
      default:
        return {
          emoji: '📄',
          bg: 'bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white',
          tag: 'Layanan Resmi',
          tagClass: 'bg-blue-50 text-blue-700 border-blue-200',
        };
    }
  };

  return (
    <section id="layanan-section" className="py-8 bg-[#F8FAFC]">
      <div className="container">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full uppercase tracking-widest inline-block mb-2">
            Katalog Layanan Administrasi
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-2">
            Pilih Urusan Kependudukan Anda
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Seluruh layanan pre-screening ini diawasi langsung oleh verifikator Kelurahan Sukamaju untuk memastikan berkas Anda 100% tepat sebelum datang ke kantor.
          </p>
        </div>

        {/* 4 Cards Grid - Sleek Interface Theme */}
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mb-8">
          {layananList.map((item) => {
            const config = getIconConfig(item.id);
            return (
              <div className="col" key={item.id}>
                <div
                  className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between h-100"
                  onClick={() => onSelectService(item.id)}
                >
                  <div>
                    {/* Top Icon & Tag */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-colors shrink-0 shadow-xs ${config.bg}`}
                      >
                        <span>{config.emoji}</span>
                      </div>
                      <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${config.tagClass}`}>
                        {config.tag}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-800 text-base mb-1 group-hover:text-blue-600 transition-colors">
                      {item.nama_layanan}
                    </h3>
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                      {item.deskripsi}
                    </p>

                    {/* Requirements Checklist */}
                    <div className="border-t border-slate-100 pt-3 mb-4">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <i className="bi bi-card-checklist text-blue-600"></i>
                        <span>Syarat Dokumen:</span>
                      </div>
                      <ul className="list-unstyled text-xs space-y-1.5 m-0">
                        {item.persyaratan_json.map((syarat, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-slate-600">
                            <i className="bi bi-check-circle-fill text-emerald-500 text-xs shrink-0 mt-0.5"></i>
                            <span className="line-clamp-1">{syarat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Card Action Button */}
                  <button
                    type="button"
                    className="w-full py-2.5 px-4 bg-slate-50 group-hover:bg-blue-600 text-slate-700 group-hover:text-white rounded-xl text-xs font-bold border border-slate-200 group-hover:border-blue-600 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectService(item.id);
                    }}
                  >
                    <span>Cek Berkas Ini</span>
                    <i className="bi bi-arrow-right font-bold"></i>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Accordion Section */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="row align-items-center g-4">
            <div className="col-lg-4">
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-widest inline-block mb-2">
                Tanya Jawab Warga (FAQ)
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 mb-2">
                Informasi Penting Administrasi RT/RW & Kelurahan
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mb-4 leading-relaxed">
                Penyebab utama berkas warga ditolak saat datang ke kantor kelurahan dan bagaimana AIPEX VeriBot membantu menyelesaikannya.
              </p>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="flex items-center gap-2 mb-1">
                  <i className="bi bi-clock-history text-blue-600"></i>
                  <span className="font-bold text-slate-800 text-xs">Jam Pelayanan Loket:</span>
                </div>
                <div className="text-xs text-slate-600 font-medium">Senin - Jumat: 08.00 - 15.30 WIB</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Sabtu, Minggu & Hari Libur Tutup</div>
              </div>
            </div>

            <div className="col-lg-8">
              <div className="accordion accordion-flush space-y-3" id="faqAccordion">
                {/* FAQ 1 */}
                <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl overflow-hidden">
                  <h4 className="m-0" id="headingOne">
                    <button
                      className="accordion-button collapsed bg-transparent shadow-none px-4 py-3.5 text-sm font-bold text-slate-800 flex items-center gap-2.5"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseOne"
                      aria-expanded="false"
                      aria-controls="collapseOne"
                    >
                      <i className="bi bi-question-circle-fill text-blue-600"></i>
                      <span>Mengapa foto KTP sering ditolak saat pengajuan di loket kelurahan?</span>
                    </button>
                  </h4>
                  <div
                    id="collapseOne"
                    className="accordion-collapse collapse"
                    aria-labelledby="headingOne"
                    data-bs-parent="#faqAccordion"
                  >
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60">
                      Penyebab paling umum adalah pantulan kilatan lampu/flash (glare) yang menutupi nomor NIK atau masa berlaku, foto goyang/buram (blur), dan sudut kartu terpotong. Sistem AIPEX VeriBot menggunakan Cognitive Vision untuk mendeteksi potensi masalah ini sebelum Anda datang ke kelurahan.
                    </div>
                  </div>
                </div>

                {/* FAQ 2 */}
                <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl overflow-hidden">
                  <h4 className="m-0" id="headingTwo">
                    <button
                      className="accordion-button collapsed bg-transparent shadow-none px-4 py-3.5 text-sm font-bold text-slate-800 flex items-center gap-2.5"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseTwo"
                      aria-expanded="false"
                      aria-controls="collapseTwo"
                    >
                      <i className="bi bi-question-circle-fill text-blue-600"></i>
                      <span>Apakah surat pengantar dari RT/RW masih diwajibkan?</span>
                    </button>
                  </h4>
                  <div
                    id="collapseTwo"
                    className="accordion-collapse collapse"
                    aria-labelledby="headingTwo"
                    data-bs-parent="#faqAccordion"
                  >
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60">
                      Untuk penerbitan KK baru, perubahan status anggota keluarga, dan pembuatan KTP pemula 17 tahun, surat pengantar RT/RW tetap menjadi dasar verifikasi kewilayahan. Namun untuk cetak ulang KTP rusak/hilang yang sudah ber-NIK, warga dapat langsung membawa surat kehilangan polisi dan fotokopi KK.
                    </div>
                  </div>
                </div>

                {/* FAQ 3 */}
                <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl overflow-hidden">
                  <h4 className="m-0" id="headingThree">
                    <button
                      className="accordion-button collapsed bg-transparent shadow-none px-4 py-3.5 text-sm font-bold text-slate-800 flex items-center gap-2.5"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseThree"
                      aria-expanded="false"
                      aria-controls="collapseThree"
                    >
                      <i className="bi bi-question-circle-fill text-blue-600"></i>
                      <span>Bagaimana cara kerja Jalur Khusus (Fast-Track) Tiket VeriBot?</span>
                    </button>
                  </h4>
                  <div
                    id="collapseThree"
                    className="accordion-collapse collapse"
                    aria-labelledby="headingThree"
                    data-bs-parent="#faqAccordion"
                  >
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60">
                      Warga yang dokumennya telah memperoleh skor AI di atas 75% akan mendapatkan QR Code Validasi Resmi. Saat tiba di kantor kelurahan, tunjukkan QR Code pada mesin scanner di Loket 1 Fast-Track. Petugas tidak perlu lagi mengetik ulang dari awal sehingga dokumen dapat disahkan dalam hitungan menit!
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
