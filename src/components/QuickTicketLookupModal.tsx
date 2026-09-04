import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Pengajuan } from '../types';

interface QuickTicketLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTicketCode?: string;
}

export const QuickTicketLookupModal: React.FC<QuickTicketLookupModalProps> = ({
  isOpen,
  onClose,
  initialTicketCode = '',
}) => {
  const [ticketCode, setTicketCode] = useState(initialTicketCode);
  const [searchResult, setSearchResult] = useState<Pengajuan | null>(null);
  const [qrUrl, setQrUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchTicket = async (codeToSearch: string) => {
    const cleanCode = codeToSearch.trim();
    if (!cleanCode) return;

    setLoading(true);
    setError('');
    setSearchResult(null);

    try {
      const res = await fetch(`/api/pengajuan/${encodeURIComponent(cleanCode)}`);
      const data = await res.json();
      if (data.success && data.data) {
        setSearchResult(data.data);

        // Generate QR
        const qrPayload = JSON.stringify({
          app: 'AIPEX VeriBot',
          kodeTiket: data.data.kode_tiket,
          nik: data.data.warga?.nik,
          skor: data.data.skor_ai,
          status: data.data.status_petugas,
        });
        const url = await QRCode.toDataURL(qrPayload, { width: 220, margin: 2, color: { dark: '#0d6efd', light: '#ffffff' } });
        setQrUrl(url);
      } else {
        setError('Tiket dengan kode tersebut tidak ditemukan di basis data kelurahan.');
      }
    } catch (err: any) {
      setError('Gagal mencari tiket: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (initialTicketCode) {
        setTicketCode(initialTicketCode);
        searchTicket(initialTicketCode);
      } else {
        setSearchResult(null);
        setError('');
      }
    }
  }, [isOpen, initialTicketCode]);

  if (!isOpen) return null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchTicket(ticketCode);
  };

  return (
    <div
      className="modal show d-block"
      tabIndex={-1}
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1055 }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-2xl rounded-3xl overflow-hidden bg-white">
          <div className="modal-header bg-[#0f172a] text-white p-4 border-b border-slate-800">
            <div className="d-flex align-items-center gap-3">
              <div className="w-11 h-11 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl d-flex align-items-center justify-content-center shadow-inner">
                <i className="bi bi-qr-code-scan fs-5 text-blue-400"></i>
              </div>
              <div>
                <h5 className="modal-title fw-bold mb-0 text-white tracking-tight">Pelacak Status Tiket VeriBot</h5>
                <small className="text-slate-400 text-xs">Cek status verifikasi & jadwal kedatangan ke loket kelurahan</small>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white opacity-70 hover:opacity-100"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body p-4 p-md-5 bg-slate-50">
            {/* Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="mb-4">
              <div className="input-group input-group-lg shadow-sm rounded-2xl overflow-hidden border border-slate-200 bg-white">
                <span className="input-group-text bg-white border-0 text-blue-600 ps-3 pe-2">
                  <i className="bi bi-ticket-detailed fs-5"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-0 text-slate-800 focus:ring-0 shadow-none font-monospace text-sm"
                  placeholder="Ketik kode tiket (misal: TKT-202508-001)..."
                  value={ticketCode}
                  onChange={(e) => setTicketCode(e.target.value)}
                />
                <button type="submit" className="btn btn-primary px-4 fw-semibold bg-blue-600 hover:bg-blue-700 border-0" disabled={loading}>
                  {loading ? 'Mencari...' : 'Periksa Tiket'}
                </button>
              </div>
              <div className="d-flex align-items-center gap-2 mt-2.5 ps-1">
                <span className="text-xs text-slate-500 fw-medium">Contoh siap uji:</span>
                <button
                  type="button"
                  className="btn btn-white btn-sm border border-slate-200 rounded-pill px-2.5 py-0.5 text-xs text-slate-600 hover:text-blue-600 shadow-xs"
                  onClick={() => {
                    setTicketCode('TKT-202508-001');
                    searchTicket('TKT-202508-001');
                  }}
                >
                  TKT-202508-001 (Disetujui)
                </button>
                <button
                  type="button"
                  className="btn btn-white btn-sm border border-slate-200 rounded-pill px-2.5 py-0.5 text-xs text-slate-600 hover:text-blue-600 shadow-xs"
                  onClick={() => {
                    setTicketCode('TKT-202508-003');
                    searchTicket('TKT-202508-003');
                  }}
                >
                  TKT-202508-003 (Butuh Perbaikan)
                </button>
              </div>
            </form>

            {error && (
              <div className="alert alert-warning rounded-2xl small d-flex align-items-center gap-2 border border-amber-200 bg-amber-50 text-amber-900 p-3 mb-4">
                <i className="bi bi-exclamation-triangle-fill flex-shrink-0 text-amber-600"></i>
                <div>{error}</div>
              </div>
            )}

            {/* Ticket Result Details */}
            {searchResult && (
              <div className="card border border-slate-200/80 rounded-2xl p-4 bg-white shadow-sm">
                <div className="row g-4 align-items-center">
                  <div className="col-md-4 text-center border-end-md">
                    {qrUrl && (
                      <div className="p-3 border border-slate-200 rounded-2xl bg-white d-inline-block shadow-sm mb-2">
                        <img src={qrUrl} alt="QR Tiket" className="img-fluid rounded-lg" style={{ width: '150px', height: '150px' }} />
                      </div>
                    )}
                    <div className="font-monospace fw-bold text-blue-600 text-sm tracking-wide">{searchResult.kode_tiket}</div>
                    <div className="text-slate-400 text-xs mt-0.5">
                      {searchResult.created_at}
                    </div>
                  </div>

                  <div className="col-md-8">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <span className="badge bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-pill text-xs fw-bold">
                        {searchResult.layanan?.nama_layanan}
                      </span>
                      <div>
                        {searchResult.status_petugas === 'Disetujui' && (
                          <span className="badge bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs px-3 py-1.5 rounded-pill font-semibold">
                            <i className="bi bi-check-circle-fill me-1 text-emerald-600"></i> Disetujui Petugas
                          </span>
                        )}
                        {searchResult.status_petugas === 'Butuh_Perbaikan' && (
                          <span className="badge bg-amber-100 text-amber-800 border border-amber-300 text-xs px-3 py-1.5 rounded-pill font-semibold">
                            <i className="bi bi-exclamation-circle-fill me-1 text-amber-600"></i> Butuh Perbaikan
                          </span>
                        )}
                        {searchResult.status_petugas === 'Menunggu_Verifikasi' && (
                          <span className="badge bg-blue-100 text-blue-800 border border-blue-300 text-xs px-3 py-1.5 rounded-pill font-semibold">
                            <i className="bi bi-clock-history me-1 text-blue-600"></i> Menunggu Verifikasi
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-xs text-slate-500 font-medium">Nama Pemohon:</div>
                      <div className="fw-bold text-slate-900 text-base">{searchResult.warga?.nama_lengkap}</div>
                      <div className="font-monospace text-xs text-slate-500">NIK: {searchResult.warga?.nik}</div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1.5">
                        <span className="text-xs fw-semibold text-slate-600">Skor Pre-Screening AI:</span>
                        <span className="fw-bold font-monospace text-emerald-600 text-sm">{searchResult.skor_ai}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${searchResult.skor_ai >= 75 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: `${searchResult.skor_ai}%` }}
                        ></div>
                      </div>
                    </div>

                    {searchResult.catatan_petugas ? (
                      <div className="alert alert-info text-xs mb-0 rounded-xl border border-sky-200 bg-sky-50 text-sky-900 p-3">
                        <strong className="d-block mb-1 text-sky-950 font-semibold">
                          <i className="bi bi-chat-left-text-fill me-1 text-sky-600"></i> Catatan Petugas Kelurahan:
                        </strong>
                        <div>{searchResult.catatan_petugas}</div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 d-flex align-items-center gap-1.5">
                        <i className="bi bi-info-circle text-slate-400"></i> Berkas sedang dalam antrean pemeriksaan petugas loket.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer bg-white p-3 border-t border-slate-100">
            <button type="button" className="btn btn-light border border-slate-200 rounded-pill px-4 text-slate-600 text-sm" onClick={onClose}>
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
