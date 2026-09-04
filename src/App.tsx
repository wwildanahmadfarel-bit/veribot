import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ServiceCards } from './components/ServiceCards';
import { PreScreeningForm } from './components/PreScreeningForm';
import { AdminDashboard } from './components/AdminDashboard';
import { ChatbotWidget } from './components/ChatbotWidget';
import { LoginModal } from './components/LoginModal';
import { QuickTicketLookupModal } from './components/QuickTicketLookupModal';
import { DatabaseDocsModal } from './components/DatabaseDocsModal';
import { Footer } from './components/Footer';
import { Layanan, Petugas } from './types';

export default function App() {
  const [activeView, setActiveView] = useState<'home' | 'prescreening' | 'admin'>('home');
  const [layananList, setLayananList] = useState<Layanan[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number>(1);
  const [currentPetugas, setCurrentPetugas] = useState<Petugas | null>(null);

  // Modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isTicketLookupOpen, setIsTicketLookupOpen] = useState(false);
  const [lookupTicketCode, setLookupTicketCode] = useState('');

  // Initial Data Fetch
  useEffect(() => {
    fetch('/api/layanan')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setLayananList(data.data);
        }
      })
      .catch((err) => {
        console.error('Gagal memuat layanan:', err);
      });

    // Check stored officer session
    const savedOfficer = localStorage.getItem('veribot_officer');
    if (savedOfficer) {
      try {
        setCurrentPetugas(JSON.parse(savedOfficer));
      } catch (_) {}
    }
  }, []);

  const handleStartPreScreening = (serviceId?: number) => {
    if (serviceId) {
      setSelectedServiceId(serviceId);
    }
    setActiveView('prescreening');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickTicketSearch = (kodeTiket: string) => {
    setLookupTicketCode(kodeTiket);
    setIsTicketLookupOpen(true);
  };

  const handleLoginSuccess = (petugas: Petugas) => {
    setCurrentPetugas(petugas);
    localStorage.setItem('veribot_officer', JSON.stringify(petugas));
    setActiveView('admin');
  };

  const handleLogoutPetugas = () => {
    setCurrentPetugas(null);
    localStorage.removeItem('veribot_officer');
    setActiveView('home');
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* Top Navbar */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenDbModal={() => setIsDbModalOpen(true)}
        onOpenTicketLookup={() => {
          setLookupTicketCode('');
          setIsTicketLookupOpen(true);
        }}
        currentPetugas={currentPetugas}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onLogoutPetugas={handleLogoutPetugas}
      />

      {/* Main Content Area */}
      <main className="flex-grow-1">
        {/* ========================================================================= */}
        {/* VIEW 1: HOME (Landing Page Warga) */}
        {/* ========================================================================= */}
        {activeView === 'home' && (
          <div>
            <HeroSection
              onStartPreScreening={() => handleStartPreScreening()}
              onQuickTicketSearch={handleQuickTicketSearch}
              onExploreServices={() => {
                document.getElementById('layanan-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            <ServiceCards
              layananList={layananList}
              onSelectService={(serviceId) => handleStartPreScreening(serviceId)}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: PRE-SCREENING (Form Multi-Step Mandiri) */}
        {/* ========================================================================= */}
        {activeView === 'prescreening' && (
          <div>
            {/* Header Breadcrumb */}
            <div className="bg-white border-b border-slate-200/80 py-3 shadow-xs">
              <div className="container max-w-5xl mx-auto d-flex align-items-center justify-content-between px-3 px-md-4">
                <button
                  type="button"
                  className="btn btn-link text-decoration-none text-slate-600 hover:text-blue-600 p-0 d-flex align-items-center gap-1.5 text-xs font-semibold"
                  onClick={() => setActiveView('home')}
                >
                  <i className="bi bi-chevron-left text-xs"></i> Kembali ke Beranda
                </button>
                <span className="badge bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs font-semibold">
                  <i className="bi bi-shield-check me-1"></i> Mode Mandiri Warga
                </span>
              </div>
            </div>

            <PreScreeningForm
              layananList={layananList}
              selectedServiceId={selectedServiceId}
              onServiceChange={(id) => setSelectedServiceId(id)}
              onViewTicket={(ticketCode) => handleQuickTicketSearch(ticketCode)}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: ADMIN / LOKET PETUGAS */}
        {/* ========================================================================= */}
        {activeView === 'admin' && (
          <div>
            {currentPetugas ? (
              <AdminDashboard
                currentPetugas={currentPetugas}
                onLogout={handleLogoutPetugas}
              />
            ) : (
              <div className="container py-5 text-center">
                <div className="card border border-slate-200/80 shadow-lg rounded-3xl max-w-md mx-auto p-5 bg-white">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 border border-blue-200 rounded-2xl mx-auto d-flex align-items-center justify-content-center mb-3 shadow-xs">
                    <i className="bi bi-shield-lock-fill fs-2"></i>
                  </div>
                  <h4 className="fw-bold text-slate-900 mb-2 tracking-tight">Portal Petugas Loket</h4>
                  <p className="text-slate-500 text-xs mb-4 lh-relaxed">
                    Halaman ini khusus untuk verifikator berkas dan petugas loket Kelurahan Sukamaju. Silakan masuk dengan akun petugas Anda.
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary btn-lg rounded-pill fw-bold w-100 shadow-md shadow-blue-500/25 bg-blue-600 hover:bg-blue-700 border-0 text-sm py-2.5"
                    onClick={() => setIsLoginModalOpen(true)}
                  >
                    <i className="bi bi-box-arrow-in-right me-2"></i> Masuk Sekarang
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Chatbot Widget (VeriBot AI Assistant) */}
      <ChatbotWidget />

      {/* Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <QuickTicketLookupModal
        isOpen={isTicketLookupOpen}
        onClose={() => setIsTicketLookupOpen(false)}
        initialTicketCode={lookupTicketCode}
      />

      <DatabaseDocsModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
      />

      {/* Footer */}
      <Footer
        onOpenDbModal={() => setIsDbModalOpen(true)}
        onOpenTicketLookup={() => {
          setLookupTicketCode('');
          setIsTicketLookupOpen(true);
        }}
        onStartPreScreening={() => handleStartPreScreening()}
      />
    </div>
  );
}
