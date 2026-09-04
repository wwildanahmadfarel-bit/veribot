import React, { useState } from 'react';
import { Petugas } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (petugas: Petugas) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('petugas1');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/petugas/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        onLoginSuccess(data.user);
        onClose();
      } else {
        setError(data.message || 'Login gagal. Periksa username dan password.');
      }
    } catch (err: any) {
      setError('Koneksi terputus: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const setPreset = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div
      className="modal show d-block"
      tabIndex={-1}
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1055 }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-2xl rounded-4 overflow-hidden">
          {/* Header */}
          <div className="modal-header bg-[#0f172a] text-white p-4 border-b border-slate-800">
            <div className="d-flex align-items-center gap-3">
              <div className="w-11 h-11 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl d-flex align-items-center justify-content-center shadow-inner">
                <i className="bi bi-shield-lock-fill fs-5 text-blue-400"></i>
              </div>
              <div>
                <h5 className="modal-title fw-bold mb-0 text-white tracking-tight">Autentikasi Petugas Loket</h5>
                <small className="text-slate-400 text-xs">Kelurahan Sukamaju — Portal Verifikator Resmi</small>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white opacity-70 hover:opacity-100"
              onClick={onClose}
            ></button>
          </div>

          {/* Body */}
          <div className="modal-body p-4 bg-white">
            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 rounded-xl small mb-4 border border-rose-200 bg-rose-50 text-rose-800">
                <i className="bi bi-exclamation-triangle-fill flex-shrink-0 text-rose-600"></i>
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold text-slate-700 text-xs text-uppercase tracking-wider">Username Petugas</label>
                <div className="input-group">
                  <span className="input-group-text bg-slate-50 border-slate-200 text-slate-400">
                    <i className="bi bi-person"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-slate-200 text-slate-800 focus:border-blue-500"
                    placeholder="petugas1"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold text-slate-700 text-xs text-uppercase tracking-wider">Kata Sandi (Password)</label>
                <div className="input-group">
                  <span className="input-group-text bg-slate-50 border-slate-200 text-slate-400">
                    <i className="bi bi-key"></i>
                  </span>
                  <input
                    type="password"
                    className="form-control border-slate-200 text-slate-800 focus:border-blue-500"
                    placeholder=""
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Quick Preset Accounts Box */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 mb-4">
                <div className="text-xs fw-semibold text-slate-600 mb-2 d-flex align-items-center gap-1.5">
                  <i className="bi bi-lightning-charge-fill text-amber-500"></i> Akun Pengujian Cepat:
                </div>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-white btn-sm border border-slate-200 rounded-pill px-3 py-1 text-slate-700 hover:bg-slate-100 fw-medium shadow-xs"
                    style={{ fontSize: '11px' }}
                    onClick={() => setPreset('petugas1', 'admin123')}
                  >
                    Kasi Pelayanan (petugas1)
                  </button>
                  <button
                    type="button"
                    className="btn btn-white btn-sm border border-slate-200 rounded-pill px-3 py-1 text-slate-700 hover:bg-slate-100 fw-medium shadow-xs"
                    style={{ fontSize: '11px' }}
                    onClick={() => setPreset('petugas2', 'admin123')}
                  >
                    Staf Loket (petugas2)
                  </button>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  className="btn btn-light rounded-pill px-4 text-slate-600 border border-slate-200 hover:bg-slate-100"
                  onClick={onClose}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary rounded-pill px-4 fw-bold shadow-md shadow-blue-500/25 bg-blue-600 hover:bg-blue-700 border-0"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                      <span>Memverifikasi...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right me-1"></i>
                      <span>Masuk Portal</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
