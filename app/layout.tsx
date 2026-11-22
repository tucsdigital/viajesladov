import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { SITE_NAME, CONTACT_INFO, SITE_URL, SITE_DESCRIPTION } from '@/lib/constants';
import SchemaOrg from '@/components/SchemaOrg';
import PageTransition from '@/components/PageTransition';

const normsProBold = localFont({
  src: './fonts/tt-norms-pro-bold/tt-norms-pro-bold.woff2',
  weight: '700',
  style: 'normal',
  variable: '--font-norms-pro-bold',
  display: 'swap',
});

const triesterVector = localFont({
  src: './fonts/triester-vector/triester-vector.otf',
  weight: '400',
  style: 'normal',
  variable: '--font-triester-vector',
  display: 'swap',
});

const siteUrl = SITE_URL;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE_NAME} - La verdad de viajar`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'viajes',
    'turismo',
    'experiencias',
    'aventuras',
    'viajes personalizados',
    'viajes grupales',
    'destinos',
    'Lado V',
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: siteUrl,
    siteName: SITE_NAME,
    title: `${SITE_NAME} - ${SITE_DESCRIPTION}`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: `${siteUrl}/og.png`,
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} - ${SITE_DESCRIPTION}`,
    description: SITE_DESCRIPTION,
    images: [`${siteUrl}/og.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    // Agregar cuando tengas Google Search Console
    // google: 'tu-codigo-de-verificacion',
  },
  category: 'travel',
  classification: 'Travel Agency',
  other: {
    'contact:phone_number': CONTACT_INFO.telefono,
    'contact:email': CONTACT_INFO.email,
    'contact:address': CONTACT_INFO.direccion,
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { url: '/web-app-manifest-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/web-app-manifest-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
};

export const viewport = {
  themeColor: '#19123C',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const r2PublicUrl =
    process.env.R2_PUBLIC_BASE ||
    process.env.NEXT_PUBLIC_R2_PUBLIC_BASE ||
    process.env.R2_PUBLIC_URL ||
    process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  const r2Origin = (() => {
    if (!r2PublicUrl) return undefined;
    try {
      return new URL(r2PublicUrl).origin;
    } catch {
      return undefined;
    }
  })();

  return (
    <html
      lang="es"
      className={`${normsProBold.variable} ${triesterVector.variable}`}
      data-scroll-behavior="smooth"
    >
      <head>
        {/* Preconnect para orígenes críticos - ordenados por prioridad */}
        {/* Firebase - crítico para páginas admin, diferido para páginas públicas */}
        <link rel="preconnect" href="https://firestore.googleapis.com" />
        <link rel="preconnect" href="https://identitytoolkit.googleapis.com" />
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
        <link rel="dns-prefetch" href="https://identitytoolkit.googleapis.com" />
        
        {/* Cloudflare R2 - para imágenes */}
        {r2Origin ? <link rel="preconnect" href={r2Origin} /> : null}
        {r2Origin ? <link rel="dns-prefetch" href={r2Origin} /> : null}
        
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" href="/favicon-96x96.png" sizes="96x96" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="font-body antialiased">
        <SchemaOrg />
        <main id="main-content">
          <PageTransition>{children}</PageTransition>
        </main>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: { 
              zIndex: 99999,
            },
            className: 'bg-white border border-gray-200 shadow-lg',
          }}
          style={{
            zIndex: 99999,
          }}
        />
      </body>
    </html>
  );
}
