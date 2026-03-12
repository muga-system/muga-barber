import { hasAnalyticsConsent } from "./consent";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

function hasWindow() {
  return typeof window !== "undefined";
}

function hasGtag() {
  return hasWindow() && typeof window.gtag === "function" && Boolean(GA_MEASUREMENT_ID);
}

export function trackEvent(eventName, params = {}) {
  if (!hasWindow() || !hasAnalyticsConsent()) return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...params });

  if (hasGtag()) {
    window.gtag("event", eventName, params);
  }
}

export function trackPageView(urlPath) {
  if (!hasGtag() || !hasAnalyticsConsent()) return;

  const pagePath = urlPath || window.location.pathname;
  window.gtag("event", "page_view", {
    page_path: pagePath,
    page_location: `${window.location.origin}${pagePath}`,
    page_title: document.title
  });
}

export function getGaMeasurementId() {
  return GA_MEASUREMENT_ID;
}
