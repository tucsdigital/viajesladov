import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import ContactSection from '@/components/ContactSection';
import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://viajesladov.vercel.app';

export const metadata: Metadata = {
  title: 'Contacto - Lado V',
  description: 'Contactate con Lado V. Atencion con cita previa en Palermo (CABA) y Bolivar (Buenos Aires). Consultas por WhatsApp o email.',
  alternates: {
    canonical: `${siteUrl}/contacto`,
  },
  openGraph: {
    type: 'website',
    url: `${siteUrl}/contacto`,
    title: 'Contacto - Lado V',
    description: 'Contactate con Lado V. Atencion con cita previa en Palermo (CABA) y Bolivar (Buenos Aires).',
    siteName: 'Lado V',
    locale: 'es_AR',
  },
  twitter: {
    card: 'summary',
    title: 'Contacto - Lado V',
    description: 'Contactate con Lado V. Atencion con cita previa en Palermo (CABA) y Bolivar (Buenos Aires).',
  },
  keywords: ['contacto', 'agencia de viajes', 'Palermo', 'CABA', 'Bolivar', 'consultas viajes'],
};

export default function ContactoPage() {
  return (
    <>
      <Navbar />
      <WhatsAppButton />

      <div className="bg-white min-h-screen">
        {/* Hero minimalista */}
        <div className="pt-32 pb-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-lg md:text-lg lg:text-lg font-bold mb-6 leading-tight">Contactanos</h1>
              <p className="text-base md:text-lg text-gray-500 max-w-2xl leading-relaxed">
                Estamos para ayudarte a planificar tu viaje ideal. Dejanos tu consulta y te responderemos a la brevedad.
              </p>
            </div>
          </div>
        </div>

        {/* Sección de contacto */}
        <ContactSection showTitle={true} />
      </div>

      <Footer />
    </>
  );
}
