import { collection, getDocs, limit, orderBy as firestoreOrderBy, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Paquete, Categoria } from '@/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import PaquetesClient from '@/components/PaquetesClient';
import type { Metadata } from 'next';
import { serializeFirestoreData } from '@/lib/utils/serialize';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://viajesladov.com.ar';

export const metadata: Metadata = {
  title: 'Paquetes Turísticos - Lado V',
  description: 'Explora nuestros paquetes turísticos nacionales e internacionales, viajes grupales y a medida con asesoramiento boutique.',
  alternates: {
    canonical: `${siteUrl}/paquetes`,
  },
  openGraph: {
    type: 'website',
    url: `${siteUrl}/paquetes`,
    title: 'Paquetes Turísticos - Lado V',
    description: 'Explora nuestros paquetes turísticos nacionales e internacionales, viajes grupales y a medida.',
    siteName: 'Lado V',
    locale: 'es_AR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Paquetes Turísticos - Lado V',
    description: 'Explora nuestros paquetes turísticos nacionales e internacionales.',
  },
  keywords: ['paquetes turísticos', 'viajes', 'destinos', 'turismo', 'vacaciones', 'Lado V'],
};

export const revalidate = 60;

async function getPaquetes(): Promise<Paquete[]> {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, 'paquetes'),
        where('visible', '==', true),
        firestoreOrderBy('orden', 'asc')
      )
    );

    return snapshot.docs.map((doc) => serializeFirestoreData<Paquete>({ id: doc.id, ...doc.data() }));
  } catch (error) {
    // Fallback sin índice compuesto
    const snapshot = await getDocs(query(collection(db, 'paquetes'), where('visible', '==', true)));
    return snapshot.docs
      .map((doc) => serializeFirestoreData<Paquete>({ id: doc.id, ...doc.data() }))
      .sort((a, b) => (a.orden || 0) - (b.orden || 0));
  }
}

async function getCategorias(): Promise<Categoria[]> {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, 'categorias'),
        where('activa', '==', true),
        firestoreOrderBy('orden', 'asc')
      )
    );

    return snapshot.docs.map((doc) => serializeFirestoreData<Categoria>({ id: doc.id, ...doc.data() }));
  } catch (error) {
    const snapshot = await getDocs(query(collection(db, 'categorias'), where('activa', '==', true)));
    return snapshot.docs
      .map((doc) => serializeFirestoreData<Categoria>({ id: doc.id, ...doc.data() }))
      .sort((a, b) => (a.orden || 0) - (b.orden || 0));
  }
}

export default async function PaquetesPage() {
  const [paquetes, categorias] = await Promise.all([
    getPaquetes(),
    getCategorias(),
  ]);

  return (
    <>
      <Navbar />
      <WhatsAppButton />

      {/* Hero Section - Optimizado para mobile y desktop */}
      <section className="relative bg-primary text-white pt-24 pb-12 md:pt-32 md:pb-16">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center md:text-left">
            <h1 className="text-[40px] leading-[50px] tracking-[1px] font-semibold mb-3 md:mb-4 font-triester-vector text-secondary">
              Paquetes
            </h1>
            <p className="text-base md:text-lg text-gray-300 font-body leading-relaxed">
              Descubre los mejores destinos turísticos con paquetes diseñados para ti
            </p>
          </div>
        </div>
      </section>

      {/* Paquetes con Filtros */}
      <PaquetesClient paquetes={paquetes} categorias={categorias} />

      <Footer />
    </>
  );
}

