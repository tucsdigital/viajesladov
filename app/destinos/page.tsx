import { collection, getDocs, orderBy as firestoreOrderBy, query, where } from 'firebase/firestore';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import CategoriesSection from '@/components/sections/CategoriesSection';
import { db } from '@/lib/firebase';
import { serializeFirestoreData } from '@/lib/utils/serialize';
import { Categoria } from '@/types';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://viajesladov.com.ar';

export const metadata: Metadata = {
  title: 'Destinos - Lado V',
  description: 'Explorá todos los destinos de Lado V y encontrá el viaje ideal para tus próximas vacaciones.',
  alternates: {
    canonical: `${siteUrl}/destinos`,
  },
  openGraph: {
    type: 'website',
    url: `${siteUrl}/destinos`,
    title: 'Destinos - Lado V',
    description: 'Explorá todos los destinos de Lado V y encontrá el viaje ideal para tus próximas vacaciones.',
    siteName: 'Lado V',
    locale: 'es_AR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Destinos - Lado V',
    description: 'Explorá todos los destinos disponibles en Lado V.',
  },
  keywords: ['destinos', 'viajes', 'turismo', 'vacaciones', 'categorías', 'Lado V'],
};

export const revalidate = 60;

const fadeInUpVariants = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const staggerFastVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.12,
    },
  },
};

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

export default async function DestinosPage() {
  const categorias = await getCategorias();

  return (
    <>
      <Navbar />
      <WhatsAppButton />

      <section className="relative bg-primary pb-12 pt-24 text-white md:pb-16 md:pt-32">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center md:text-left">
            <h1 className="mb-3 font-triester-vector text-[40px] font-semibold leading-[50px] tracking-[1px] text-secondary md:mb-4">
              Destinos
            </h1>
            <p className="font-body text-base leading-relaxed text-gray-300 md:text-lg">
              Elegí tu próximo viaje entre todos nuestros destinos disponibles.
            </p>
          </div>
        </div>
      </section>

      <CategoriesSection
        categorias={categorias}
        badgeLabel="Destinos"
        title="El destino que buscabas, está acá"
        subtitle="Explorá todas las opciones y encontrá la experiencia ideal para tu próximo viaje."
        showAll
        fadeInUpVariants={fadeInUpVariants}
        staggerFastVariants={staggerFastVariants}
      />

      <Footer />
    </>
  );
}
