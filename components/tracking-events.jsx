"use client";

import { useEffect } from "react";
import { trackEvent } from "../lib/analytics";

export default function TrackingEvents() {
  useEffect(() => {
    function handleClick(event) {
      const target = event.target.closest("[data-track]");
      if (!target) return;

      const eventName = target.getAttribute("data-track");
      const label = (target.textContent || "").trim();
      trackEvent(eventName, { label });
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
