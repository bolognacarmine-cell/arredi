import { useEffect, useState } from 'react';

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const hasAccepted = localStorage.getItem('cookie_consent_accepted');
    if (!hasAccepted) {
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent_accepted', 'true');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, animation: 'slideUp 0.5s ease-out' }}>
      <div style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '20px 24px', width: '420px', maxWidth: 'calc(100vw - 48px)', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)', color: '#e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🍪</div>
          <span style={{ fontWeight: 600, fontSize: '15px', color: '#e2e8f0' }}>Privacy</span>
        </div>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 600, color: '#e2e8f0' }}>La tua privacy è importante</h3>
        <p style={{ margin: '0 0 16px 0', fontSize: '14px', lineHeight: 1.6, color: '#cbd5e1' }}>Questo sito utilizza i cookie per migliorare la tua esperienza. Continuando a navigare o cliccando su "Accetta", acconsenti all'uso dei cookie.</p>
        <a href="/cookie" style={{ display: 'inline-block', marginBottom: '16px', fontSize: '13px', color: '#4fc3f7', textDecoration: 'none', borderBottom: '1px solid transparent', transition: 'border-color 200ms' }} onMouseOver={(e) => (e.currentTarget.style.borderColor = '#4fc3f7')} onMouseOut={(e) => (e.currentTarget.style.borderColor = 'transparent')} onClick={(e) => { e.preventDefault(); window.location.href = '/cookie'; }}>Leggi la Cookie Policy →</a>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleAccept} style={{ flex: 1, background: 'linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%)', color: '#0f172a', border: 'none', padding: '12px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'transform 200ms, box-shadow 200ms', boxShadow: '0 4px 14px rgba(79, 195, 247, 0.35)' }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(79, 195, 247, 0.45)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(79, 195, 247, 0.35)'; }}>Accetta tutti</button>
          <button style={{ flex: 1, background: 'transparent', color: '#94a3b8', border: '1px solid rgba(148, 163, 184, 0.3)', padding: '12px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', transition: 'border-color 200ms, color 200ms' }} onMouseOver={(e) => { e.currentTarget.style.borderColor = '#4fc3f7'; e.currentTarget.style.color = '#e2e8f0'; }} onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.3)'; e.currentTarget.style.color = '#94a3b8'; }}>Rifiuta</button>
        </div>
      </div>
      <style>{`@keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
