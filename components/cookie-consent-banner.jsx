"use client";

import { useEffect, useState } from "react";
import {
  ANALYTICS_DENIED,
  ANALYTICS_GRANTED,
  getAnalyticsConsent,
  setAnalyticsConsent
} from "../lib/consent";

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const currentConsent = getAnalyticsConsent();
    setVisible(!currentConsent);
  }, []);

  function acceptAnalytics() {
    setAnalyticsConsent(ANALYTICS_GRANTED);
    setVisible(false);
    window.dispatchEvent(new Event("analytics-consent-granted"));
  }

  function rejectAnalytics() {
    setAnalyticsConsent(ANALYTICS_DENIED);
    setVisible(false);
    window.dispatchEvent(new Event("analytics-consent-denied"));
  }

  if (!visible) return null;

  return (
    <aside className="cookie-banner" role="dialog" aria-label="Consentimiento de cookies">
      <p>
        Usamos cookies de analitica para medir reservas y mejorar la experiencia.
        Puedes aceptar o rechazar su uso.
      </p>
      <div className="cookie-actions">
        <button type="button" className="btn btn-secondary" onClick={rejectAnalytics}>
          Rechazar
        </button>
        <button type="button" className="btn btn-primary" onClick={acceptAnalytics}>
          Aceptar cookies
        </button>
      </div>
      <a className="cookie-link" href="/privacidad-cookies">
        Ver politica de privacidad y cookies
      </a>
    </aside>
  );
}
