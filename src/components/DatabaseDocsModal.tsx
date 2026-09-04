import React, { useState, useEffect } from 'react';

interface DatabaseDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseDocsModal: React.FC<DatabaseDocsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'schema' | 'koneksi' | 'panduan'>('schema');
  const [schemaCode, setSchemaCode] = useState<string>('');
  const [koneksiCode, setKoneksiCode] = useState<string>('');
  const [panduanText, setPanduanText] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/raw-files/schema.sql')
        .then((r) => r.text())
        .then((text) => setSchemaCode(text))
        .catch((_) => {});

      fetch('/api/raw-files/koneksi.php')
        .then((r) => r.text())
        .then((text) => setKoneksiCode(text))
        .catch((_) => {});

      fetch('/api/raw-files/panduan.md')
        .then((r) => r.text())
        .then((text) => setPanduanText(text))
        .catch((_) => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getCurrentCode = () => {
    if (activeTab === 'schema') return schemaCode;
    if (activeTab === 'koneksi') return koneksiCode;
    return panduanText;
  };

  const getFileName = () => {
    if (activeTab === 'schema') return 'schema.sql';
    if (activeTab === 'koneksi') return 'koneksi.php';
    return 'panduan_instalasi.md';
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCurrentCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([getCurrentCode()], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = getFileName();
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div
      className="modal show d-block"
      tabIndex={-1}
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1055 }}
    >
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-2xl rounded-4 overflow-hidden">
          {/* Header */}
          <div className="modal-header bg-[#0f172a] text-white p-4 border-b border-slate-800">
            <div className="d-flex align-items-center gap-3">
              <div className="w-11 h-11 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl d-flex align-items-center justify-content-center shadow-inner">
                <i className="bi bi-database-fill-gear fs-5 text-amber-400"></i>
              </div>
              <div>
                <h5 className="modal-title fw-bold mb-0 text-white tracking-tight">Arsitektur Agile: Python Backend Hub & MySQL</h5>
                <small className="text-slate-400 text-xs">
                  Sistem Utama: <code className="text-amber-300 bg-slate-900 px-1.5 py-0.5 rounded text-xs font-mono">db_veribot</code> (5 Tabel Relasional: warga, layanan, pengajuan, dokumen_pengajuan, petugas)
                </small>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white opacity-70 hover:opacity-100"
              onClick={onClose}
            ></button>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-slate-900 px-4 pt-3 border-b border-slate-800 d-flex flex-wrap align-items-center justify-content-between gap-3">
            <ul className="nav nav-tabs border-0 gap-2">
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link border-0 rounded-t-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                    activeTab === 'schema' ? 'bg-[#0f172a] text-white border-t-2 border-blue-500 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  onClick={() => setActiveTab('schema')}
                >
                  <i className="bi bi-filetype-sql me-1.5 text-amber-400"></i> schema.sql (MySQL)
                </button>
              </li>
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link border-0 rounded-t-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                    activeTab === 'koneksi' ? 'bg-[#0f172a] text-white border-t-2 border-blue-500 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  onClick={() => setActiveTab('koneksi')}
                >
                  <i className="bi bi-filetype-php me-1.5 text-blue-400"></i> koneksi.php (PDO Driver)
                </button>
              </li>
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link border-0 rounded-t-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                    activeTab === 'panduan' ? 'bg-[#0f172a] text-white border-t-2 border-blue-500 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  onClick={() => setActiveTab('panduan')}
                >
                  <i className="bi bi-book-half me-1.5 text-emerald-400"></i> Panduan Instalasi Lokal
                </button>
              </li>
            </ul>

            <div className="d-flex gap-2 pb-2">
              <button
                type="button"
                className="btn btn-sm border border-slate-700 bg-slate-800 text-slate-200 rounded-pill px-3 py-1 text-xs hover:bg-slate-700"
                onClick={handleCopy}
              >
                <i className={`bi ${copied ? 'bi-check2 text-emerald-400' : 'bi-clipboard'} me-1`}></i>
                {copied ? 'Tersalin!' : 'Salin Kode'}
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm rounded-pill px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 border-0 shadow-sm"
                onClick={handleDownload}
              >
                <i className="bi bi-download me-1"></i> Unduh {getFileName()}
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="modal-body p-4 bg-[#0b1120]">
            {activeTab === 'schema' && (
              <div>
                <div className="alert bg-slate-900 border border-slate-800 text-slate-300 py-2.5 px-3 text-xs rounded-xl mb-3 d-flex align-items-center justify-content-between">
                  <span>
                    <i className="bi bi-info-circle-fill me-1.5 text-blue-400"></i> Siap diimpor langsung ke <strong>phpMyAdmin</strong>. Sudah memuat 5 tabel relasional lengkap dengan Foreign Key dan dummy data pengujian.
                  </span>
                  <span className="badge bg-blue-600/30 text-blue-400 border border-blue-500/30 font-mono text-[10px]">UTF8MB4</span>
                </div>
                <pre
                  className="bg-[#030712] text-emerald-400 border border-slate-800/80 p-3.5 rounded-2xl overflow-auto font-mono text-xs shadow-inner"
                  style={{ maxHeight: '460px', fontSize: '11.5px', lineHeight: 1.6 }}
                >
                  <code>{schemaCode || 'Memuat skema SQL...'}</code>
                </pre>
              </div>
            )}

            {activeTab === 'koneksi' && (
              <div>
                <div className="alert bg-slate-900 border border-slate-800 text-slate-300 py-2.5 px-3 text-xs rounded-xl mb-3">
                  <i className="bi bi-check-circle-fill me-1.5 text-emerald-400"></i> Script koneksi PHP PDO dengan penanganan kesalahan (PDOException), UTF8mb4 init command, dan prepared statements anti-SQL Injection.
                </div>
                <pre
                  className="bg-[#030712] text-sky-300 border border-slate-800/80 p-3.5 rounded-2xl overflow-auto font-mono text-xs shadow-inner"
                  style={{ maxHeight: '460px', fontSize: '11.5px', lineHeight: 1.6 }}
                >
                  <code>{koneksiCode || 'Memuat kode koneksi PHP...'}</code>
                </pre>
              </div>
            )}

            {activeTab === 'panduan' && (
              <div>
                <div className="alert bg-slate-900 border border-slate-800 text-slate-300 py-2.5 px-3 text-xs rounded-xl mb-3">
                  <i className="bi bi-lightbulb-fill me-1.5 text-amber-400"></i> Ikuti langkah demi langkah di bawah ini untuk menjalankan aplikasi di XAMPP / Laragon atau Node.js lokal.
                </div>
                <pre
                  className="bg-[#030712] text-slate-300 border border-slate-800/80 p-4 rounded-2xl overflow-auto text-xs font-mono shadow-inner"
                  style={{ maxHeight: '460px', fontSize: '12px', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}
                >
                  {panduanText || 'Memuat panduan instalasi...'}
                </pre>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer bg-[#0f172a] border-t border-slate-800 p-3 d-flex justify-content-between">
            <div className="text-xs text-slate-400">
              File tersimpan di root proyek: <code className="text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded">/schema.sql</code> & <code className="text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded">/koneksi.php</code>
            </div>
            <button
              type="button"
              className="btn btn-light border border-slate-700 bg-slate-800 text-slate-200 rounded-pill px-4 text-xs hover:bg-slate-700"
              onClick={onClose}
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
