import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Paquete } from '@/types';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import PaqueteHero from '@/components/PaqueteHero';
import PaqueteSchema from '@/components/PaqueteSchema';
import F1PaqueteContent from '@/components/F1PaqueteContent';
import type { Metadata } from 'next';
import { serializeFirestoreData } from '@/lib/utils/serialize';
import { SITE_NAME, SITE_URL } from '@/lib/constants';

export const revalidate = 60;

async function getPaqueteF1(slug: string): Promise<Paquete | null> {
  try {
    const q = query(collection(db, 'paquetes_f1'), where('slug', '==', slug), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const paquete = serializeFirestoreData<Paquete>({
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data(),
    });

    if (!paquete.visible) return null;
    return paquete;
  } catch (error) {
    console.error('Error fetching paquete F1:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const paquete = await getPaqueteF1(slug);

  if (!paquete) {
    return {
      title: 'Paquete F1 no encontrado',
    };
  }

  const siteUrl = SITE_URL;
  const url = `${siteUrl}/f1/${slug}`;
  const cleanDescription =
    paquete.descripcionCorta ||
    paquete.descripcion.replace(/<[^>]*>/g, '').substring(0, 160).trim() + '...';

  const coverImage = paquete.imagenPortada || paquete.imagenTarjeta || paquete.imagenPrincipal;

  return {
    title: `${paquete.titulo} - ${SITE_NAME}`,
    description: cleanDescription,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'website',
      url,
      title: `${paquete.titulo} - ${SITE_NAME}`,
      description: cleanDescription,
      siteName: SITE_NAME,
      locale: 'es_AR',
      images: coverImage
        ? [
            {
              url: coverImage,
              width: 1200,
              height: 630,
              alt: paquete.titulo,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${paquete.titulo} - ${SITE_NAME}`,
      description: cleanDescription,
      images: coverImage ? [coverImage] : [],
    },
    keywords: [paquete.titulo, paquete.destino || 'F1', 'formula 1', 'f1', 'viajes', SITE_NAME],
  };
}

export default async function PaqueteF1Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const paquete = await getPaqueteF1(slug);

  if (!paquete) {
    notFound();
  }

  const shareUrl = `${SITE_URL}/f1/${paquete.slug}`;

  return (
    <>
      <PaqueteSchema paquete={paquete} basePath="/f1" />
      <Navbar transparent forceTransparent />
      <WhatsAppButton />

      <PaqueteHero paquete={paquete} shareUrl={shareUrl} hideFeatures hideBadges />

      <F1PaqueteContent paquete={paquete} />

      <Footer />
    </>
  );
}
