"use client";

import { useEffect, useState } from "react";
import { Construction, TriangleAlert, X } from "lucide-react";
import { trackEvent } from "../lib/analytics";

export default function DemoModal() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("demo_banner_dismissed");
    if (dismissed) {
      setIsDismissed(true);
      return;
    }
    setIsVisible(true);
  }, []);

  function handleDismiss() {
    localStorage.setItem("demo_banner_dismissed", "true");
    setIsVisible(false);
    setIsDismissed(true);
    trackEvent("demo_banner_dismissed");
  }

  if (isDismissed) return null;

  if (!isVisible) return null;

  return (
    <div className="demo-banner" role="alert">
      <div className="demo-banner-content">
        <span className="demo-banner-icon" aria-hidden="true">
          <TriangleAlert size={16} />
        </span>
        <p>Estás viendo una versión de demostración del sitio.</p>
        <button
          className="demo-banner-close"
          onClick={handleDismiss}
          aria-label="Cerrar aviso"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

export function DemoGuard({ children, action }) {
  const [showModal, setShowModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const isDemoMode = typeof window !== "undefined" && 
    process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  if (!isDemoMode) {
    return children;
  }

  function handleIntercept(actionToGuard) {
    setPendingAction(actionToGuard);
    setShowModal(true);
    trackEvent("demo_action_intercepted", { action: actionToGuard });
  }

  function handleContinue() {
    setShowModal(false);
    if (pendingAction === "whatsapp") {
      trackEvent("demo_whatsapp_continue");
    } else if (pendingAction === "booking") {
      trackEvent("demo_booking_continue");
    }
  }

  function handleCancel() {
    setShowModal(false);
    setPendingAction(null);
    trackEvent("demo_action_cancelled");
  }

  return (
    <>
      {typeof window !== "undefined" && showModal && (
        <div className="demo-modal-overlay" onClick={handleCancel}>
          <div className="demo-modal" onClick={(e) => e.stopPropagation()}>
            <div className="demo-modal-header">
              <span className="demo-modal-icon" aria-hidden="true">
                <Construction size={24} />
              </span>
              <h3>Sitio de demostración</h3>
            </div>
            <div className="demo-modal-body">
              <p>
                Esta funcionalidad conecta con servicios externos (WhatsApp, base de datos).
                En el modo demo, estas acciones están deshabilitadas.
              </p>
              <p className="demo-modal-sub">
                Puedes explorar el sitio, ver los flujos y probar la interfaz. 
                Para una experiencia completa, contactá al equipo de desarrollo.
              </p>
            </div>
            <div className="demo-modal-actions">
              <a 
                href="https://github.com/muga-system/muga-barber" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                Ver código fuente
              </a>
              <button className="btn btn-primary" onClick={handleContinue}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
      {children}
    </>
  );
}
