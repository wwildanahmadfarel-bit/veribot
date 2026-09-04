import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (ticketCode: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose, onScanSuccess }) => {
  const [manualResi, setManualResi] = useState('');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Small timeout to ensure the DOM element exists
      const timer = setTimeout(() => {
        if (!scannerRef.current) {
          const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
          );

          scanner.render(
            (decodedText) => {
              try {
                const data = JSON.parse(decodedText);
                if (data.kodeTiket) {
                  handleSuccess(data.kodeTiket);
                }
              } catch (e) {
                // Jika bukan JSON, mungkin string biasa (kode tiket)
                handleSuccess(decodedText);
              }
            },
            (error) => {
              // ignore scan errors (they happen a lot while scanning)
            }
          );
          
          scannerRef.current = scanner;
        }

        // Auto focus on input for physical barcode scanner
        document.getElementById('manualResiInput')?.focus();
      }, 100);

      return () => {
        clearTimeout(timer);
        if (scannerRef.current) {
          scannerRef.current.clear().catch(console.error);
          scannerRef.current = null;
        }
      };
    }
  }, [isOpen]);

  const handleSuccess = (kode: string) => {
    // Bunyikan Web Audio API Beep
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // frequency in hertz
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // volume
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.15); // beep for 150ms
    } catch (e) {
      console.error("Audio beep failed", e);
    }

    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
      scannerRef.current = null;
    }
    
    onScanSuccess(kode);
    onClose();
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualResi.trim()) {
      handleSuccess(manualResi.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal show d-block"
      tabIndex={-1}
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1055 }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-2xl rounded-4 overflow-hidden">
          <div className="modal-header bg-[#0f172a] text-white p-4 border-b border-slate-800">
            <h5 className="modal-title fw-bold text-white tracking-tight">Pindai QR Tiket Fast-Track Warga</h5>
            <button
              type="button"
              className="btn-close btn-close-white opacity-70 hover:opacity-100"
              onClick={onClose}
            ></button>
          </div>
          
          <div className="modal-body p-4 bg-white text-center">
            <div id="reader" style={{ width: '100%', maxWidth: '450px' }} className="mx-auto rounded-3 overflow-hidden border border-slate-300 mb-4"></div>
            
            <hr className="my-4 border-slate-200" />
            
            <form onSubmit={handleManualSubmit}>
              <label className="form-label fw-semibold text-slate-700 text-xs text-uppercase tracking-wider">Atau Input Resi Manual / Scanner Fisik</label>
              <div className="input-group">
                <input
                  id="manualResiInput"
                  type="text"
                  className="form-control border-slate-300 text-slate-800 focus:border-blue-500"
                  placeholder="VRB-XXXX-XXXX"
                  value={manualResi}
                  onChange={(e) => setManualResi(e.target.value)}
                />
                <button type="submit" className="btn btn-outline-primary">
                  Cari Resi
                </button>
              </div>
            </form>
          </div>
          
          <div className="modal-footer bg-slate-50 d-flex justify-content-between align-items-center">
            <div className="text-xs text-emerald-600 font-semibold d-flex align-items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Kamera Aktif / Scanner Physical Ready
            </div>
            <button
              type="button"
              className="btn btn-light rounded-pill px-4 text-slate-600 border border-slate-200 hover:bg-slate-100 text-sm font-semibold"
              onClick={onClose}
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
