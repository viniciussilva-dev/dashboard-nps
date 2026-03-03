import { useState, useEffect } from 'react';

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('cookies_accepted');
    if (!accepted) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem('cookies_accepted', 'true');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem('cookies_accepted', 'false');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner">
      <div className="cookie-content">
        <span className="cookie-icon">🍪</span>
        <p>
          Utilizamos cookies essenciais para manter sua sessão ativa e garantir o funcionamento seguro do dashboard.
        </p>
        <div className="cookie-actions">
          <button className="cookie-btn-decline" onClick={decline}>Recusar</button>
          <button className="cookie-btn-accept" onClick={accept}>Aceitar</button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;