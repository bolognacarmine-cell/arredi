import { useEffect, useState } from 'react';

const COOKIE_CONSENT_KEY = 'cookie_consent_accepted';

export function resetCookieConsent(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(COOKIE_CONSENT_KEY);
}

export function acceptCookies(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
}

export function rejectCookies(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(COOKIE_CONSENT_KEY, 'false');
}

export function hasCookieConsent(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(COOKIE_CONSENT_KEY) === 'true';
}

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const hasConsent = localStorage.getItem('cookie_consent_accepted');
    // Mostra il banner solo se l'utente non ha ancora fatto una scelta
    if (hasConsent === null) {
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    acceptCookies();
    setShowBanner(false);
  };

  const handleReject = () => {
    rejectCookies();
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#0f172a',
        color: '#e2e8f0',
        padding: '18px 28px',
        borderRadius: 12,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        alignItems: 'center',
        maxWidth: 520,
        width: 'calc(100% - 48px)',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, textAlign: 'center', color: '#cbd5e1' }}>
        Questo sito utilizza i cookie per migliorare la tua esperienza.
        Continuando a navigare o cliccando su "Accetta", acconsenti all'uso dei cookie.
        {' '}
        <a href="/cookie" style={{ color: '#4fc3f7', textDecoration: 'none', borderBottom: '1px solid transparent' }}>
          Cookie Policy
        </a>
      </p>
      <div style={{ display: 'flex', gap: 12, width: '100%', justifyContent: 'center' }}>
        <button
          onClick={handleReject}
          style={{
            backgroundColor: 'transparent',
            color: '#cbd5e1',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '11px 24px',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          }}
        >
          Rifiuta
        </button>
        <button
          onClick={handleAccept}
          style={{
            backgroundColor: '#4fc3f7',
            color: '#0f172a',
            border: 'none',
            padding: '11px 32px',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(79, 195, 247, 0.35)',
          }}
        >
          Accetta
        </button>
      </div>
    </div>
  );
}
