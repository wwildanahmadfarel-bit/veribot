import React from 'react';

interface FooterProps {
  onOpenDbModal: () => void;
  onOpenTicketLookup: () => void;
  onStartPreScreening: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenDbModal,
  onOpenTicketLookup,
  onStartPreScreening,
}) => {
  return (
    <footer className="bg-dark text-light pt-5 pb-4 mt-auto border-top border-dark-subtle">
      <div className="container">
        <div className="row g-4">
          {/* Kolom 1: Brand & Bio */}
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center mb-3">
              <div className="bg-primary text-white fw-bold rounded-3 d-flex align-items-center justify-content-center me-2" style={{ width: '38px', height: '38px' }}>V</div>
              <h5 className="fw-bold mb-0 text-white">AIPEX <span className="text-primary">VeriBot</span></h5>
            </div>
            <p className="text-secondary small mb-3">
              Platform pra-pemeriksaan (pre-screening) dokumen kependudukan berbasis Cognitive AI untuk efisiensi layanan antrean di kantor kelurahan.
            </p>
            <div className="d-flex flex-wrap gap-2">
              <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill">
                <i className="bi bi-shield-check me-1"></i>UU PDP Compliant
              </span>
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill">
                <i className="bi bi-cpu me-1"></i>Cognitive AI Powered
              </span>
            </div>
          </div>

          {/* Kolom 2: Akses Warga */}
          <div className="col-lg-2 col-md-6">
            <h6 className="fw-bold text-white mb-3 text-uppercase tracking-wider" style={{ fontSize: '0.8rem' }}>Akses Warga</h6>
            <ul className="list-unstyled small mb-0">
              <li className="mb-2">
                <button type="button" className="btn btn-link p-0 text-secondary text-decoration-none hover:text-white transition-colors text-start d-inline-block shadow-none border-0" onClick={onStartPreScreening}>
                  <i className="bi bi-chevron-right me-1 text-primary"></i>Pre-Screening Berkas
                </button>
              </li>
              <li className="mb-2">
                <button type="button" className="btn btn-link p-0 text-secondary text-decoration-none hover:text-white transition-colors text-start d-inline-block shadow-none border-0" onClick={onOpenTicketLookup}>
                  <i className="bi bi-chevron-right me-1 text-primary"></i>Cek Tiket & QR Code
                </button>
              </li>
              <li className="mb-2">
                <button type="button" className="btn btn-link p-0 text-secondary text-decoration-none hover:text-white transition-colors text-start d-inline-block shadow-none border-0">
                  <i className="bi bi-chevron-right me-1 text-primary"></i>Panduan Syarat
                </button>
              </li>
              <li className="mb-2">
                <button type="button" className="btn btn-link p-0 text-secondary text-decoration-none hover:text-white transition-colors text-start d-inline-block shadow-none border-0">
                  <i className="bi bi-chevron-right me-1 text-primary"></i>Tanya Jawab (FAQ)
                </button>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Layanan Administrasi */}
          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold text-white mb-3 text-uppercase tracking-wider" style={{ fontSize: '0.8rem' }}>Layanan Administrasi</h6>
            <ul className="list-unstyled small mb-0">
              <li className="mb-2 text-secondary"><i className="bi bi-check-circle-fill text-success me-2"></i>Perekaman & Cetak KTP-el</li>
              <li className="mb-2 text-secondary"><i className="bi bi-check-circle-fill text-success me-2"></i>Penerbitan Kartu Keluarga (KK)</li>
              <li className="mb-2 text-secondary"><i className="bi bi-check-circle-fill text-success me-2"></i>Surat Keterangan Pindah (SKPWNI)</li>
              <li className="mb-2 text-secondary"><i className="bi bi-check-circle-fill text-success me-2"></i>Pengantar Akta Kelahiran</li>
            </ul>
          </div>

          {/* Kolom 4: Lokasi Pelayanan */}
          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold text-white mb-3 text-uppercase tracking-wider" style={{ fontSize: '0.8rem' }}>Lokasi Pelayanan</h6>
            <ul className="list-unstyled small text-secondary mb-0">
              <li className="mb-2 d-flex"><i className="bi bi-geo-alt-fill text-primary me-2 mt-1"></i><span>Kantor Kelurahan Sukamaju, Jl. Pemuda No. 1</span></li>
              <li className="mb-2 d-flex"><i className="bi bi-clock-fill text-primary me-2 mt-1"></i><span>Senin - Jumat: 08.00 - 15.30 WIB</span></li>
              <li className="mb-2 d-flex"><i className="bi bi-telephone-fill text-primary me-2 mt-1"></i><span>Call Center / WA: (021) 555-0199</span></li>
            </ul>
          </div>
        </div>

        <hr className="my-4 border-secondary opacity-25" />

        {/* Bottom Copyright Bar */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center small text-secondary pb-2">
          <div className="mb-2 mb-md-0">
            © 2026 Pemerintah Kelurahan Sukamaju & Ditjen Dukcapil. Seluruh Hak Cipta Dilindungi.
          </div>
          <div>
            Sistem Inovasi Pelayanan Mandiri • <span className="text-white fw-semibold">AIPEX VeriBot v1.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
