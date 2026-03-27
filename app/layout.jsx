import { Cormorant_Garamond, Source_Sans_3 } from "next/font/google";
import AnalyticsLoader from "../components/analytics-loader";
import CookieConsentBanner from "../components/cookie-consent-banner";
import TrackingEvents from "../components/tracking-events";
import LayoutHeader from "../components/layout-header";
import ThemeInitializer from "../components/theme-initializer";
import { businessName, siteUrl } from "../lib/seo";
import "./globals.css";

const THEME_BOOTSTRAP_SCRIPT = `(() => {
  try {
    const key = "muga-theme-preference";
    const stored = localStorage.getItem(key) || "system";
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = stored === "dark" || (stored === "system" && prefersDark) ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
  } catch (_) {
    // noop
  }
})();`;

const fontBody = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap"
});

const fontDisplay = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap"
});

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Barberia Premium | Reserva tu turno",
    template: `%s | ${businessName}`
  },
  description:
    "Barberia premium con reservas en linea en menos de 1 minuto. Corte, barba y ritual completo con barberos expertos.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "Barberia Premium | Reserva tu turno",
    description:
      "Agenda tu turno en una barberia premium. Servicio puntual, experiencia cuidada y reserva inmediata.",
    url: "/",
    siteName: businessName,
    locale: "es_AR",
    type: "website"
  }
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f1ec" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1116" }
  ]
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
      </head>
      <body className={`${fontBody.variable} ${fontDisplay.variable}`}>
        <ThemeInitializer />
        <a className="skip-link" href="#contenido-principal">
          Ir al contenido principal
        </a>
        <AnalyticsLoader />
        <TrackingEvents />
        <LayoutHeader />
        {children}
        <CookieConsentBanner />
      </body>
    </html>
  );
}
