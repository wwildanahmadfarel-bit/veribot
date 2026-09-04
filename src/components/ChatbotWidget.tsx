import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import ReactMarkdown from 'react-markdown';

export const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Halo Bapak/Ibu Warga Sukamaju! 👋 Saya **VeriBot**, asisten AI Pre-Screening Kelurahan. Ada yang bisa saya bantu terkait syarat berkas, jam operasional, atau tiket Anda?',
      timestamp: 'Baru saja',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      const data = await response.json();
      const botReply = data.reply || 'Maaf, terjadi kendala teknis saat memproses jawaban.';

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: 'Maaf, sambungan ke asisten sedang terganggu. Jam buka kelurahan adalah Senin-Jumat 08:00-15:30 WIB.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    '⏰ Jam Buka Loket?',
    '🪪 Syarat KTP Hilang',
    '👨‍👩‍👧‍👦 Syarat KK Baru',
    '💰 Berapa Biayanya?',
    '🎫 Cara Kerja Tiket QR',
  ];

  if (!isVisible) return null;

  return (
    <>
      {/* Floating Action Button - Hidden when chat is open */}
      {!isOpen && (
        <div 
          className="veribot-floating-btn position-fixed d-flex flex-column align-items-end gap-2"
          style={{ bottom: '20px', right: '20px', zIndex: 1050 }}
        >
          <button
            type="button"
            className="bg-white hover:bg-slate-100 text-slate-500 rounded-full w-6 h-6 shadow-sm d-flex align-items-center justify-content-center border border-slate-200 transition-all cursor-pointer me-1"
            onClick={() => setIsVisible(false)}
            title="Tutup Widget"
            aria-label="Tutup Chatbot Widget"
            style={{ padding: 0 }}
          >
            <i className="bi bi-x" style={{ fontSize: '1.2rem', lineHeight: 1 }}></i>
          </button>
          <button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl w-14 h-14 shadow-xl shadow-blue-600/40 d-flex align-items-center justify-center border-2 border-white transition-all active:scale-95 cursor-pointer"
            onClick={() => setIsOpen(true)}
            aria-label="Buka Chatbot VeriBot"
          >
            <div className="position-relative d-flex align-items-center justify-center">
              <i className="bi bi-robot fs-4 text-white"></i>
              <span className="position-absolute top-0 end-0 translate-middle-y w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full"></span>
            </div>
          </button>
        </div>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div
          className="border border-slate-200 shadow-2xl rounded-3xl overflow-hidden position-fixed bg-white d-flex flex-column"
          style={{
            bottom: '20px',
            right: '20px',
            width: '92vw',
            maxWidth: '390px',
            height: '540px',
            zIndex: 1045,
          }}
        >
          {/* Sleek Dark Header */}
          <div className="bg-[#212529] text-white p-3.5 d-flex align-items-center justify-content-between border-b border-slate-800">
            <div className="d-flex align-items-center gap-2.5">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-sm shadow-blue-600/30 shrink-0">
                V
              </div>
              <div>
                <div className="font-bold text-xs leading-none text-white">VeriBot AI Assistant</div>
                <div className="d-flex align-items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[10px] text-slate-300 font-medium">Aktif Melayani Warga</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-sm text-slate-400 hover:text-white p-1"
              onClick={() => setIsOpen(false)}
            >
              <i className="bi bi-x-lg fs-5"></i>
            </button>
          </div>

          {/* Quick FAQ Chips */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-200 overflow-x-auto hide-scrollbar text-nowrap d-flex gap-1.5">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                className="bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors shrink-0 shadow-2xs cursor-pointer"
                onClick={() => handleSendMessage(q)}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Messages Body */}
          <div className="p-3.5 flex-grow-1 overflow-y-auto hide-scrollbar d-flex flex-column gap-3 bg-[#F8FAFC]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`d-flex flex-column ${
                  msg.sender === 'user' ? 'align-items-end' : 'align-items-start'
                }`}
              >
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                  }`}
                  style={{ maxWidth: '85%', wordBreak: 'break-word' }}
                >
                  {msg.sender === 'user' ? (
                    msg.text
                  ) : (
                    <div className="markdown-body">
                      <ReactMarkdown
                        components={{
                          p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc ms-4 mb-2 last:mb-0" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal ms-4 mb-2 last:mb-0" {...props} />,
                          li: ({node, ...props}) => <li className="mb-1" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-bold text-slate-900" {...props} />
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
                <span className="text-slate-400 mt-1 px-1 text-[10px]">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isLoading && (
              <div className="d-flex align-items-start gap-2">
                <div className="bg-white p-3 rounded-2xl rounded-bl-xs border border-slate-200 text-xs text-slate-500 d-flex align-items-center gap-2 shadow-2xs">
                  <span className="spinner-grow spinner-grow-sm text-blue-600" role="status"></span>
                  <span>VeriBot sedang berpikir...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="position-relative bg-slate-100 rounded-full d-flex align-items-center p-1 border border-slate-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all"
            >
              <input
                type="text"
                className="form-control border-0 bg-transparent shadow-none px-3 py-2 text-xs text-slate-800 focus:ring-0"
                placeholder="Ketik pesan Anda..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isLoading}
                style={{ boxShadow: 'none' }}
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-8 h-8 d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm transition-all border-0 cursor-pointer disabled:opacity-50 me-1"
                disabled={isLoading || !inputMessage.trim()}
              >
                <i className="bi bi-send-fill text-white text-[10px] ms-0.5"></i>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
