export const ANALYTICS_CONSENT_KEY = "muga_analytics_consent";
export const ANALYTICS_GRANTED = "granted";
export const ANALYTICS_DENIED = "denied";

function hasWindow() {
  return typeof window !== "undefined";
}

export function getAnalyticsConsent() {
  if (!hasWindow()) return null;
  return window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
}

export function hasAnalyticsConsent() {
  return getAnalyticsConsent() === ANALYTICS_GRANTED;
}

export function setAnalyticsConsent(value) {
  if (!hasWindow()) return;
  window.localStorage.setItem(ANALYTICS_CONSENT_KEY, value);
}
