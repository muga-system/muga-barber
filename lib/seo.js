const FALLBACK_SITE_URL = "https://www.mugabarber.com";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_SITE_URL).replace(/\/$/, "");

export const businessName = "Muga Barber";

export function getLocalBusinessSchema(pathname = "/") {
  const pageUrl = `${siteUrl}${pathname}`;

  return {
    "@context": "https://schema.org",
    "@type": "BarberShop",
    name: businessName,
    url: pageUrl,
    image: `${siteUrl}/og-image.jpg`,
    telephone: "+54 11 1234 5678",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Av. Central 123",
      addressLocality: "Buenos Aires",
      addressCountry: "AR"
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday"
        ],
        opens: "09:00",
        closes: "21:00"
      }
    ],
    priceRange: "$$",
    areaServed: "Buenos Aires",
    sameAs: [
      "https://www.instagram.com/mugabarber",
      "https://wa.me/5491112345678"
    ]
  };
}
