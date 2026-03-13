import { Cormorant_Garamond, Source_Sans_3 } from "next/font/google";
import AnalyticsLoader from "../components/analytics-loader";
import CookieConsentBanner from "../components/cookie-consent-banner";
import TrackingEvents from "../components/tracking-events";
import { businessName, siteUrl } from "../lib/seo";
import "./globals.css";

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
  themeColor: "#f3f1ec"
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${fontBody.variable} ${fontDisplay.variable}`}>
        <a className="skip-link" href="#contenido-principal">
          Ir al contenido principal
        </a>
        <AnalyticsLoader />
        <TrackingEvents />
        {children}
        <CookieConsentBanner />
      </body>
    </html>
  );
}
