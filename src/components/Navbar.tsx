import React, { useState, useRef, useEffect } from 'react';
import { Petugas } from '../types';

interface NavbarProps {
  activeView: 'home' | 'prescreening' | 'admin';
  setActiveView: (view: 'home' | 'prescreening' | 'admin') => void;
  onOpenDbModal: () => void;
  onOpenTicketLookup: () => void;
  currentPetugas: Petugas | null;
  onOpenLoginModal: () => void;
  onLogoutPetugas: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  onOpenDbModal,
  onOpenTicketLookup,
  currentPetugas,
  onOpenLoginModal,
  onLogoutPetugas,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const todayFormatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (action: () => void) => {
    action();
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky-top z-40 bg-[#212529] border-b border-slate-800 shadow-md">
      {/* Top micro-bar on desktop */}
      <div className="border-b border-slate-800/80 py-1.5 px-4 bg-[#1a1e21] text-slate-400 text-xs d-none d-md-block">
        <div className="container d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <span className="d-flex align-items-center gap-1.5 text-slate-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Portal Resmi Kelurahan Sukamaju
            </span>
            <div className="h-3 w-px bg-slate-700"></div>
            <span className="text-slate-400">
              {activeView === 'admin' ? 'Portal Petugas Loket' : 'Dashboard Layanan Warga'}
            </span>
          </div>
          <div className="d-flex align-items-center gap-3">
            <span className="text-slate-400 font-medium">
              <i className="bi bi-calendar3 me-1 text-slate-500"></i> {todayFormatted}
            </span>
            <div className="h-3 w-px bg-slate-700"></div>
            <span className="badge bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">
              VeriBot AI v1.0
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="navbar navbar-expand-md navbar-dark py-2.5">
        <div className="container">
          {/* Brand Logo */}
          <a
            href="#home"
            className="navbar-brand d-flex align-items-center gap-3 text-decoration-none me-4"
            onClick={(e) => {
              e.preventDefault();
              setActiveView('home');
            }}
          >
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl text-white shadow-md shadow-blue-600/30 shrink-0">
              V
            </div>
            <div>
              <div className="text-lg font-bold leading-none text-white tracking-tight">
                AIPEX
              </div>
              <p className="text-[10px] text-slate-400 tracking-widest uppercase font-semibold m-0 mt-0.5">
                VeriBot AI
              </p>
            </div>
          </a>

          {/* Mobile Toggle & Officer Section */}
          <div className="d-flex align-items-center gap-2 order-md-last">
            <div>
              {currentPetugas ? (
                <div className="dropdown position-relative" ref={dropdownRef}>
                  <button
                    className={`btn btn-outline-light border-slate-700 bg-slate-800/80 hover:bg-slate-700 dropdown-toggle d-flex align-items-center gap-2 py-1.5 px-2 px-sm-3 rounded-xl transition-all ${isDropdownOpen ? 'show' : ''}`}
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    aria-expanded={isDropdownOpen}
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs shrink-0">
                      {currentPetugas.nama_petugas ? currentPetugas.nama_petugas.charAt(0).toUpperCase() : 'P'}
                    </div>
                    <div className="text-start d-none d-sm-block">
                      <div className="text-xs font-semibold text-white leading-tight">
                        {currentPetugas.nama_petugas}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {currentPetugas.jabatan || 'Verifikator'}
                      </div>
                    </div>
                  </button>
                  <ul className={`dropdown-menu dropdown-menu-end shadow-xl border border-slate-200 rounded-2xl p-2 mt-2 position-absolute ${isDropdownOpen ? 'show' : ''}`} style={{ right: 0, top: '100%' }}>
                    <li>
                      <h6 className="dropdown-header text-[10px] text-slate-400 text-uppercase font-bold tracking-wider">
                        Portal Petugas Kelurahan
                      </h6>
                    </li>
                    <li>
                      <button
                        className="dropdown-item rounded-xl d-flex align-items-center gap-2 py-2 text-sm text-slate-700 font-medium hover:bg-blue-50 hover:text-blue-600"
                        onClick={() => {
                          handleNavClick(() => setActiveView('admin'));
                          setIsDropdownOpen(false);
                        }}
                      >
                        <i className="bi bi-speedometer2 text-blue-600"></i>
                        <span>Dashboard Verifikator</span>
                      </button>
                    </li>
                    <li>
                      <hr className="dropdown-divider border-slate-100 my-1" />
                    </li>
                    <li>
                      <button
                        className="dropdown-item rounded-xl text-danger d-flex align-items-center gap-2 py-2 text-sm font-medium hover:bg-red-50"
                        onClick={() => {
                          handleNavClick(onLogoutPetugas);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <i className="bi bi-box-arrow-right"></i>
                        <span>Keluar (Logout)</span>
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <button
                  className={`btn py-1.5 px-2 px-sm-3.5 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${
                    activeView === 'admin'
                      ? 'bg-amber-500 text-slate-900 shadow-sm shadow-amber-500/30 border-0'
                      : 'bg-amber-500/10 hover:bg-amber-500 hover:text-slate-900 text-amber-400 border border-amber-500/50 shadow-sm'
                  }`}
                  onClick={() => handleNavClick(onOpenLoginModal)}
                >
                  <i className={`bi bi-shield-lock ${activeView === 'admin' ? 'text-slate-900' : ''}`}></i>
                  <span className="d-none d-sm-inline">Login Petugas</span>
                  <span className="d-inline d-sm-none">Login</span>
                </button>
              )}
            </div>

            <button
              className="navbar-toggler border-slate-700 text-slate-300 shadow-none p-1.5 ms-1"
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-controls="navbarContent"
              aria-expanded={isMenuOpen}
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon" style={{ width: '1.2em', height: '1.2em' }}></span>
            </button>
          </div>

          {/* Navigation Items */}
          <div className={`collapse navbar-collapse ${isMenuOpen ? 'show d-block mt-3 mt-md-0' : ''}`} id="navbarContent">
            <ul className="navbar-nav mx-auto mb-2 mb-md-0 gap-2 py-2 py-md-0 bg-slate-800/95 md:bg-transparent rounded-2xl p-3 md:p-0 border border-slate-700/50 md:border-0 shadow-xl md:shadow-none">
              <li className="nav-item">
                <button
                  className={`nav-link btn btn-link text-decoration-none px-3 py-2 rounded-lg text-sm font-medium d-flex align-items-center gap-2 transition-all ${
                    activeView === 'home'
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                  onClick={() => handleNavClick(() => setActiveView('home'))}
                >
                  <span className="opacity-90">🏠</span>
                  <span>Beranda Portal</span>
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link btn btn-link text-decoration-none px-3 py-2 rounded-lg text-sm font-medium d-flex align-items-center gap-2 transition-all ${
                    activeView === 'prescreening'
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                  onClick={() => handleNavClick(() => setActiveView('prescreening'))}
                >
                  <span className="opacity-90">📄</span>
                  <span>Pre-Screening Mandiri</span>
                </button>
              </li>
              <li className="nav-item">
                <button
                  className="nav-link btn btn-link text-decoration-none px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 d-flex align-items-center gap-2 transition-all"
                  onClick={() => handleNavClick(onOpenTicketLookup)}
                >
                  <span className="opacity-90">🕒</span>
                  <span>Status Pengajuan</span>
                </button>
              </li>
              <li className="nav-item">
                <button
                  className="nav-link btn btn-link text-decoration-none px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 d-flex align-items-center gap-2 transition-all"
                  onClick={() => handleNavClick(() => {
                    setActiveView('home');
                    setTimeout(() => {
                      document.getElementById('layanan-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  })}
                >
                  <span className="opacity-90">🏢</span>
                  <span>Layanan Kelurahan</span>
                </button>
              </li>
              <li className="nav-item">
                <button
                  className="nav-link btn btn-link text-decoration-none px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-amber-300 hover:bg-slate-800/80 d-flex align-items-center gap-2 transition-all"
                  onClick={() => handleNavClick(onOpenDbModal)}
                  title="Lihat Database MySQL & koneksi.php"
                >
                  <i className="bi bi-database text-amber-400"></i>
                  <span>DB & PHP</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};
