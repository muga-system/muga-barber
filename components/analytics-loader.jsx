"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import AnalyticsPageView from "./analytics-pageview";
import { ANALYTICS_GRANTED, hasAnalyticsConsent } from "../lib/consent";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function AnalyticsLoader() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(hasAnalyticsConsent());

    function handleConsentGranted() {
      setEnabled(true);
    }

    function handleConsentDenied() {
      setEnabled(false);
    }

    window.addEventListener("analytics-consent-granted", handleConsentGranted);
    window.addEventListener("analytics-consent-denied", handleConsentDenied);

    return () => {
      window.removeEventListener("analytics-consent-granted", handleConsentGranted);
      window.removeEventListener("analytics-consent-denied", handleConsentDenied);
    };
  }, []);

  if (!GA_MEASUREMENT_ID || !enabled) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = window.gtag || gtag;
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
          localStorage.setItem('muga_analytics_consent', '${ANALYTICS_GRANTED}');
        `}
      </Script>
      <AnalyticsPageView />
    </>
  );
}
