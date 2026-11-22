import { collection, getDocs, limit, orderBy as firestoreOrderBy, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Paquete } from '@/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import PaquetesClient from '@/components/PaquetesClient';
import type { Metadata } from 'next';
import { serializeFirestoreData } from '@/lib/utils/serialize';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://viajesladov.com.ar';

export const metadata: Metadata = {
  title: 'Experiencias F1 - Lado V',
  description: 'Viví la Fórmula 1 con experiencias premium, tickets oficiales y asesoramiento personalizado.',
  alternates: {
    canonical: `${siteUrl}/f1`,
  },
  openGraph: {
    type: 'website',
    url: `${siteUrl}/f1`,
    title: 'Experiencias F1 - Lado V',
    description: 'Viví la Fórmula 1 con experiencias premium, tickets oficiales y asesoramiento personalizado.',
    siteName: 'Lado V',
    locale: 'es_AR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Experiencias F1 - Lado V',
    description: 'Experiencias premium para Fórmula 1.',
  },
  keywords: ['f1', 'formula 1', 'viajes', 'tickets', 'experiencias', 'Lado V'],
};

export const revalidate = 60;

async function getPaquetesF1(): Promise<Paquete[]> {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, 'paquetes_f1'),
        where('visible', '==', true),
        firestoreOrderBy('orden', 'asc'),
        limit(60)
      )
    );

    return snapshot.docs.map((doc) => serializeFirestoreData<Paquete>({ id: doc.id, ...doc.data() }));
  } catch (error) {
    const snapshot = await getDocs(query(collection(db, 'paquetes_f1'), where('visible', '==', true)));
    return snapshot.docs
      .map((doc) => serializeFirestoreData<Paquete>({ id: doc.id, ...doc.data() }))
      .sort((a, b) => (a.orden || 0) - (b.orden || 0));
  }
}

export default async function F1Page() {
  const paquetesF1 = await getPaquetesF1();
  const paquetesConDestino = paquetesF1.map((paquete) => ({
    ...paquete,
    destino: paquete.destino || paquete.eventoLugar,
  }));

  return (
    <>
      <Navbar />
      <WhatsAppButton />

      <section className="relative bg-primary text-white pt-24 pb-12 md:pt-32 md:pb-16">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center md:text-left">
            <h1 className="text-[40px] leading-[50px] tracking-[1px] font-semibold mb-3 md:mb-4 font-triester-vector text-secondary">
              Experiencias F1
            </h1>
            <p className="text-base md:text-lg text-gray-300 font-body leading-relaxed">
              Viví la Fórmula 1 con paquetes premium, tickets oficiales y asesoramiento personalizado.
            </p>
          </div>
        </div>
      </section>

      <PaquetesClient paquetes={paquetesConDestino} categorias={[]} basePath="/f1" />

      <Footer />
    </>
  );
}
