"use client";

import { useEffect, useState } from "react";
import { TriangleAlert, X } from "lucide-react";

export default function DemoBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") return;
    
    const dismissed = localStorage.getItem("demo_banner_dismissed");
    if (dismissed) {
      setIsDismissed(true);
      return;
    }
    setIsDismissed(false);
    setIsVisible(true);
  }, []);

  function handleDismiss() {
    localStorage.setItem("demo_banner_dismissed", "true");
    setIsVisible(false);
    setIsDismissed(true);
  }

  if (isDismissed || !isVisible) return null;

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
