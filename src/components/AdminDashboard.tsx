import React, { useState, useEffect } from 'react';
import { Pengajuan, Petugas } from '../types';
import { QRScannerModal } from './QRScannerModal';

interface AdminDashboardProps {
  currentPetugas: Petugas;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentPetugas,
  onLogout,
}) => {
  const [pengajuanList, setPengajuanList] = useState<Pengajuan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('semua');
  const [cardFilter, setCardFilter] = useState<'ALL' | 'LULUS_AI' | 'REVISI' | 'MENUNGGU'>('ALL');

  // Selected item for modal detail
  const [selectedPengajuan, setSelectedPengajuan] = useState<Pengajuan | null>(null);
  const [officerNote, setOfficerNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Scanner Modal
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);

  // Derived state for client-side card filtering
  const filteredByCard = pengajuanList.filter((item) => {
    if (cardFilter === 'ALL') return true;
    if (cardFilter === 'LULUS_AI') {
      return item.skor_ai >= 75 || item.status_petugas === 'Disetujui' || item.status_ai === 'Lulus_AI';
    }
    if (cardFilter === 'REVISI') {
      return item.status_petugas === 'Butuh_Perbaikan' || item.status_ai === 'Butuh_Revisi';
    }
    if (cardFilter === 'MENUNGGU') {
      return item.status_petugas === 'Menunggu_Verifikasi';
    }
    return true;
  });

  // Fetch Submissions
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const url = new URL('/api/pengajuan', window.location.origin);
      if (statusFilter !== 'semua') {
        url.searchParams.set('status_petugas', statusFilter);
      }
      if (searchQuery.trim()) {
        url.searchParams.set('search', searchQuery.trim());
      }

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setPengajuanList(data.data);
      }
    } catch (err) {
      console.error('Error fetching pengajuan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [statusFilter]);

  // Handle Review Action (Approve / Need Revision / Reject)
  const handleReviewAction = async (newStatus: 'Disetujui' | 'Butuh_Perbaikan' | 'Ditolak') => {
    if (!selectedPengajuan) return;
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/pengajuan/${selectedPengajuan.id}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status_petugas: newStatus,
          catatan_petugas: officerNote.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        if (newStatus === 'Disetujui' && data.wa_sent) {
          setToastMessage(`Status tiket ${selectedPengajuan.kode_tiket} berhasil diubah menjadi: Disetujui & Notifikasi WA Terkirim`);
          setSelectedPengajuan(null);
        } else {
          setToastMessage(`Status tiket ${selectedPengajuan.kode_tiket} berhasil diubah menjadi: ${newStatus}`);
          setSelectedPengajuan(data.data);
        }
        fetchSubmissions();
      }
    } catch (err: any) {
      alert('Gagal memperbarui status: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Compute Stats
  const totalHariIni = pengajuanList.length;
  const lulusAi = pengajuanList.filter((p) => p.status_ai === 'Lulus_AI').length;
  const butuhRevisi = pengajuanList.filter((p) => p.status_petugas === 'Butuh_Perbaikan' || p.status_ai === 'Butuh_Revisi').length;
  const antreanPetugas = pengajuanList.filter((p) => p.status_petugas === 'Menunggu_Verifikasi').length;

  const getStatusBadge = (statusPetugas: string) => {
    switch (statusPetugas) {
      case 'Disetujui':
        return <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-pill text-xs font-semibold"><i className="bi bi-check-circle-fill me-1 text-emerald-600"></i> Disetujui</span>;
      case 'Butuh_Perbaikan':
        return <span className="badge bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-pill text-xs font-semibold"><i className="bi bi-exclamation-circle-fill me-1 text-amber-600"></i> Butuh Perbaikan</span>;
      case 'Ditolak':
        return <span className="badge bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-pill text-xs font-semibold"><i className="bi bi-x-circle-fill me-1 text-rose-600"></i> Ditolak</span>;
      default:
        return <span className="badge bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-pill text-xs font-semibold"><i className="bi bi-hourglass-split me-1 text-blue-600"></i> Menunggu Verifikasi</span>;
    }
  };

  const handleScanSuccess = async (ticketCode: string) => {
    try {
      const res = await fetch(`/api/pengajuan/${ticketCode}`);
      const data = await res.json();
      
      if (data.success && data.data) {
        setToastMessage(`Tiket ${ticketCode} Berhasil Ditemukan. Menampilkan Detail Berkas.`);
        setSelectedPengajuan(data.data);
      } else {
        setToastMessage(`Error: Tiket ${ticketCode} tidak ditemukan di sistem.`);
      }
    } catch (err) {
      console.error(err);
      setToastMessage(`Error: Gagal memuat detail resi ${ticketCode}.`);
    }
  };

  return (
    <div className="container-fluid py-4 px-md-5 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className="position-fixed top-0 end-0 p-3"
          style={{ zIndex: 1060 }}
        >
          <div className="toast show align-items-center text-bg-dark border border-slate-700 shadow-xl rounded-2xl" role="alert">
            <div className="d-flex">
              <div className="toast-body d-flex align-items-center gap-2 text-xs">
                <i className="bi bi-check-circle-fill text-emerald-400 fs-6"></i>
                <span className="text-white">{toastMessage}</span>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto opacity-70"
                onClick={() => setToastMessage(null)}
              ></button>
            </div>
          </div>
        </div>
      )}

      {/* Topbar & Officer Credentials */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4 pb-4 border-b border-slate-200">
        <div className="d-flex align-items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl d-flex align-items-center justify-content-center shadow-md shadow-blue-500/20">
            <i className="bi bi-person-badge fs-4"></i>
          </div>
          <div>
            <div className="d-flex align-items-center gap-2">
              <h4 className="fw-bold text-slate-900 mb-0 tracking-tight text-lg">Loket Verifikasi Administrasi Kependudukan</h4>
              <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[11px] rounded-full font-medium">
                Petugas Aktif
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {currentPetugas.nama_petugas} — <strong className="text-slate-700">{currentPetugas.jabatan}</strong>
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-3">
          <div className="text-end d-none d-md-block">
            <div className="text-xs fw-semibold text-slate-700">Kantor Kelurahan Sukamaju</div>
            <div className="text-slate-400 font-mono" style={{ fontSize: '11px' }}>MySQL db_veribot Active</div>
          </div>
          <button
             id="btnOpenScanner"
             type="button"
             className="btn btn-primary btn-sm rounded-pill px-4 shadow-sm text-xs font-semibold"
             onClick={() => setIsScannerModalOpen(true)}
          >
             <i className="bi bi-qr-code-scan me-1"></i> Pindai QR Tiket
          </button>
          <button
            type="button"
            className="btn btn-outline-danger btn-sm rounded-pill px-3.5 text-xs font-semibold hover:bg-rose-50"
            onClick={onLogout}
          >
            <i className="bi bi-box-arrow-right me-1"></i> Keluar
          </button>
        </div>
      </div>

      {/* Stat Cards - 4 Columns */}
      <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-3 mb-4">
        {/* Card 1 */}
        <div className="col">
          <div 
            className={`card shadow-sm rounded-2xl p-4 bg-white transition-all cursor-pointer ${
              cardFilter === 'ALL' ? 'border-2 border-blue-500 ring-2 ring-blue-100' : 'border border-slate-200/80 hover:border-slate-300'
            }`}
            onClick={() => setCardFilter('ALL')}
            data-filter="ALL"
          >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-[11px] fw-bold text-slate-400 text-uppercase tracking-wider">Total Pengajuan</span>
              <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl d-flex align-items-center justify-content-center">
                <i className="bi bi-folder2-open fs-5"></i>
              </div>
            </div>
            <h2 className="text-3xl fw-bold text-slate-900 mb-0">{totalHariIni}</h2>
            <div className="text-xs text-slate-400 mt-1">Seluruh tiket di kelurahan</div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="col">
          <div 
            className={`card shadow-sm rounded-2xl p-4 bg-white transition-all cursor-pointer ${
              cardFilter === 'LULUS_AI' ? 'border-2 border-emerald-500 ring-2 ring-emerald-100' : 'border border-slate-200/80 hover:border-slate-300'
            }`}
            onClick={() => setCardFilter('LULUS_AI')}
            data-filter="LULUS_AI"
          >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-[11px] fw-bold text-slate-400 text-uppercase tracking-wider">Lulus Pre-Screening</span>
              <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl d-flex align-items-center justify-content-center">
                <i className="bi bi-patch-check-fill fs-5"></i>
              </div>
            </div>
            <h2 className="text-3xl fw-bold text-emerald-600 mb-0">{lulusAi}</h2>
            <div className="text-xs text-slate-400 mt-1">Skor AI ≥ 75% (Fast-Track)</div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="col">
          <div 
            className={`card shadow-sm rounded-2xl p-4 bg-white transition-all cursor-pointer ${
              cardFilter === 'REVISI' ? 'border-2 border-amber-500 ring-2 ring-amber-100' : 'border border-slate-200/80 hover:border-slate-300'
            }`}
            onClick={() => setCardFilter('REVISI')}
            data-filter="REVISI"
          >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-[11px] fw-bold text-slate-400 text-uppercase tracking-wider">Butuh Revisi Berkas</span>
              <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-xl d-flex align-items-center justify-content-center">
                <i className="bi bi-exclamation-triangle-fill fs-5"></i>
              </div>
            </div>
            <h2 className="text-3xl fw-bold text-amber-600 mb-0">{butuhRevisi}</h2>
            <div className="text-xs text-slate-400 mt-1">Foto buram / NIK belum cocok</div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="col">
          <div 
            className={`card shadow-sm rounded-2xl p-4 bg-white transition-all cursor-pointer ${
              cardFilter === 'MENUNGGU' ? 'border-2 border-sky-500 ring-2 ring-sky-100' : 'border border-slate-200/80 hover:border-slate-300'
            }`}
            onClick={() => setCardFilter('MENUNGGU')}
            data-filter="MENUNGGU"
          >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-[11px] fw-bold text-slate-400 text-uppercase tracking-wider">Antrean Menunggu</span>
              <div className="w-9 h-9 bg-sky-50 text-sky-600 rounded-xl d-flex align-items-center justify-content-center">
                <i className="bi bi-clock-history fs-5"></i>
              </div>
            </div>
            <h2 className="text-3xl fw-bold text-blue-600 mb-0">{antreanPetugas}</h2>
            <div className="text-xs text-slate-400 mt-1">Menunggu validasi petugas</div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden bg-white mb-5">
        {/* Table Filters Header */}
        <div className="card-header bg-white border-b border-slate-100 p-4">
          <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
            {/* Status Filter Buttons */}
            <div className="d-flex flex-wrap gap-1.5">
              {[
                { id: 'semua', label: 'Semua Tiket' },
                { id: 'Menunggu_Verifikasi', label: 'Menunggu Verifikasi' },
                { id: 'Disetujui', label: 'Disetujui' },
                { id: 'Butuh_Perbaikan', label: 'Butuh Perbaikan' },
                { id: 'Ditolak', label: 'Ditolak' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  className={`btn btn-sm rounded-pill px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    statusFilter === btn.id
                      ? 'bg-slate-900 text-white shadow-sm border-0'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-0'
                  }`}
                  onClick={() => setStatusFilter(btn.id)}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchSubmissions();
              }}
              className="d-flex gap-2"
              style={{ maxWidth: '360px' }}
            >
              <div className="input-group input-group-sm rounded-xl overflow-hidden border border-slate-200 bg-white">
                <span className="input-group-text bg-white border-0 text-slate-400 ps-2.5 pe-1">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-0 text-xs shadow-none text-slate-800"
                  placeholder="Cari Kode Tiket / NIK / Nama..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-dark btn-sm rounded-pill px-3.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 border-0">
                Filter
              </button>
            </form>
          </div>
        </div>

        {/* Data Table Responsive */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 text-xs font-semibold text-slate-500 text-uppercase tracking-wider">Waktu & Kode Resi</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-slate-500 text-uppercase tracking-wider">Nama Warga & NIK</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-slate-500 text-uppercase tracking-wider">Layanan</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-slate-500 text-uppercase tracking-wider">Skor & AI Status</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-slate-500 text-uppercase tracking-wider">Status Petugas</th>
                <th className="py-3.5 px-4 text-xs font-semibold text-slate-500 text-uppercase tracking-wider text-end">Aksi Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-2">Memuat antrean berkas warga...</div>
                  </td>
                </tr>
              ) : filteredByCard.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-5">
                    <i className="bi bi-inbox text-slate-300 fs-1 d-block mb-2"></i>
                    <div className="fw-semibold text-slate-700">Tidak ada tiket pengajuan yang sesuai</div>
                    <div className="text-xs text-slate-400 mt-0.5">Coba ubah filter atau kata kunci pencarian.</div>
                  </td>
                </tr>
              ) : (
                filteredByCard.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-slate-50/75">
                    {/* Kode Tiket */}
                    <td className="py-3.5 px-4">
                      <div className="font-monospace fw-bold text-blue-600 text-xs tracking-wide">{item.kode_tiket}</div>
                      <div className="text-slate-400 font-mono text-[11px]">
                        {item.created_at.slice(0, 16)}
                      </div>
                    </td>

                    {/* Nama Warga */}
                    <td className="py-3.5 px-3">
                      <div className="fw-bold text-slate-900 text-sm">{item.warga?.nama_lengkap || 'Warga'}</div>
                      <div className="font-monospace text-xs text-slate-500">NIK: {item.warga?.nik}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        <i className="bi bi-whatsapp text-emerald-600 me-1"></i>
                        {item.warga?.no_whatsapp}
                      </div>
                    </td>

                    {/* Layanan */}
                    <td className="py-3.5 px-3">
                      <span className="badge bg-slate-100 text-slate-700 border border-slate-200 font-medium px-2.5 py-1 text-xs rounded-lg">
                        {item.layanan?.nama_layanan || 'Administrasi'}
                      </span>
                    </td>

                    {/* Skor AI */}
                    <td className="py-3.5 px-3">
                      <div className="d-flex align-items-center gap-2">
                        <span
                          className={`fw-bold font-monospace text-sm ${
                            item.skor_ai >= 75 ? 'text-emerald-600' : 'text-amber-600'
                          }`}
                        >
                          {item.skor_ai}%
                        </span>
                        <span
                          className={`badge rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            item.status_ai === 'Lulus_AI' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {item.status_ai === 'Lulus_AI' ? 'Lulus AI' : 'Butuh Revisi'}
                        </span>
                      </div>
                    </td>

                    {/* Status Petugas */}
                    <td className="py-3.5 px-3">{getStatusBadge(item.status_petugas)}</td>

                    {/* Action Button */}
                    <td className="py-3.5 px-4 text-end">
                      <button
                        type="button"
                        className="btn btn-white btn-sm rounded-pill px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200 hover:text-blue-600 hover:border-blue-300 shadow-xs transition-all"
                        onClick={() => {
                          setSelectedPengajuan(item);
                          setOfficerNote(item.catatan_petugas || '');
                        }}
                      >
                        <i className="bi bi-eye me-1.5 text-blue-500"></i> Periksa Berkas
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL DETAIL PREVIEW (`modal-lg`) */}
      {/* Menampilkan foto berkas unggahan bersandingan dengan catatan analisis AI */}
      {/* ========================================================================= */}
      {selectedPengajuan && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1055 }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-2xl rounded-3xl overflow-hidden bg-white">
              {/* Modal Header */}
              <div className="modal-header bg-[#0f172a] text-white p-4 border-b border-slate-800">
                <div className="d-flex align-items-center gap-3">
                  <div className="w-11 h-11 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl d-flex align-items-center justify-content-center shadow-inner">
                    <i className="bi bi-clipboard2-check fs-5 text-blue-400"></i>
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold mb-0 text-white tracking-tight">
                      Audit Berkas: {selectedPengajuan.kode_tiket}
                    </h5>
                    <small className="text-slate-400 text-xs">
                      Pemohon: {selectedPengajuan.warga?.nama_lengkap} (NIK: {selectedPengajuan.warga?.nik})
                    </small>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white opacity-70 hover:opacity-100"
                  onClick={() => setSelectedPengajuan(null)}
                ></button>
              </div>

              {/* Modal Body */}
              <div className="modal-body p-4 bg-slate-50">
                {/* Citizen Overview Box */}
                <div className="card border border-slate-200/80 rounded-2xl p-4 bg-white shadow-sm mb-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="text-xs text-slate-400 font-medium">Layanan yang Diajukan:</div>
                      <div className="fw-bold text-slate-900 text-sm mt-0.5">{selectedPengajuan.layanan?.nama_layanan}</div>
                    </div>
                    <div className="col-md-6">
                      <div className="text-xs text-slate-400 font-medium">Alamat Domisili:</div>
                      <div className="text-slate-700 text-xs mt-0.5">{selectedPengajuan.warga?.alamat}</div>
                    </div>
                    <div className="col-md-6">
                      <div className="text-xs text-slate-400 font-medium">Nomor WhatsApp:</div>
                      <a
                        href={`https://wa.me/${selectedPengajuan.warga?.no_whatsapp?.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-600 fw-semibold text-xs text-decoration-none mt-0.5 d-inline-block hover:underline"
                      >
                        <i className="bi bi-whatsapp me-1"></i>
                        {selectedPengajuan.warga?.no_whatsapp}
                      </a>
                    </div>
                    <div className="col-md-6">
                      <div className="text-xs text-slate-400 font-medium">Status Saat Ini:</div>
                      <div className="mt-1">{getStatusBadge(selectedPengajuan.status_petugas)}</div>
                    </div>
                  </div>
                </div>

                {/* Document & AI Notes Side-by-Side Comparison */}
                <h6 className="fw-bold text-slate-900 mb-3 text-xs text-uppercase tracking-wider">
                  <i className="bi bi-images text-blue-600 me-1"></i> Foto Berkas & Catatan Analisis AI:
                </h6>

                <div className="d-flex flex-column gap-3 mb-4">
                  {selectedPengajuan.dokumen && selectedPengajuan.dokumen.length > 0 ? (
                    selectedPengajuan.dokumen.map((doc, idx) => (
                      <div key={idx} className="card border border-slate-200/80 rounded-2xl p-3.5 bg-white shadow-sm">
                        <div className="row g-3 align-items-center">
                          {/* File Image Preview */}
                          <div className="col-md-5">
                            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 text-center" style={{ height: '160px' }}>
                              <img
                                src={doc.file_path}
                                alt={doc.jenis_dokumen}
                                className="w-100 h-100 object-contain"
                              />
                            </div>
                            <div className="text-xs fw-bold text-slate-800 mt-1.5 text-center">{doc.jenis_dokumen}</div>
                          </div>

                          {/* AI Inspection Notes */}
                          <div className="col-md-7">
                            <div className="d-flex align-items-center justify-content-between mb-2">
                              <span className="badge bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 text-[11px] font-semibold rounded-md">
                                Evaluasi Cognitive AI
                              </span>
                              <span className={`badge ${doc.is_valid ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'} text-[11px] font-semibold rounded-md px-2 py-1`}>
                                {doc.is_valid ? 'Lolos Audit AI' : 'Perlu Diperbaiki'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/80 mb-0 lh-relaxed">
                              {doc.catatan_ai}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="alert alert-info text-xs rounded-xl border border-sky-200 bg-sky-50 text-sky-900">Tidak ada lampiran dokumen fisik tercatat.</div>
                  )}
                </div>

                {/* Official Officer Notes Input */}
                <div className="card border border-slate-200/80 rounded-2xl p-4 bg-white shadow-sm">
                  <label className="form-label fw-bold text-slate-900 text-xs text-uppercase tracking-wider mb-1">
                    <i className="bi bi-pencil-square text-blue-600 me-1"></i>
                    Catatan Resmi Petugas Kelurahan:
                  </label>
                  <p className="text-xs text-slate-400 mb-2.5">
                    Catatan ini akan dikirimkan kepada warga jika berkas disetujui atau memerlukan perbaikan.
                  </p>
                  <textarea
                    className="form-control rounded-xl border-slate-200 text-xs p-3 text-slate-800"
                    rows={3}
                    placeholder="Contoh: Berkas e-KTP dan KK sudah diverifikasi valid. Silakan langsung menuju Loket 1 membawa dokumen fisik asli."
                    value={officerNote}
                    onChange={(e) => setOfficerNote(e.target.value)}
                  />
                </div>
              </div>

              {/* Modal Footer with Verification Actions */}
              <div className="modal-footer bg-white p-3 border-t border-slate-100 d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-light border border-slate-200 rounded-pill px-4 text-xs font-medium text-slate-600"
                  onClick={() => setSelectedPengajuan(null)}
                >
                  Tutup
                </button>

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-danger rounded-pill px-4 text-xs fw-semibold text-red-700 border-red-300 hover:bg-red-50"
                    disabled={isUpdating}
                    onClick={() => handleReviewAction('Butuh_Perbaikan')}
                  >
                    <i className="bi bi-x-circle me-1"></i> Tolak & Minta Upload Ulang
                  </button>

                  <button
                    type="button"
                    className="btn btn-success rounded-pill px-4 text-xs fw-bold shadow-md shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 border-0"
                    disabled={isUpdating}
                    onClick={() => handleReviewAction('Disetujui')}
                  >
                    <i className="bi bi-check2-circle me-1"></i> Setujui & Cetak Dokumen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      <QRScannerModal 
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
};
