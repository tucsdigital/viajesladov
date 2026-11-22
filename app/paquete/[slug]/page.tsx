import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Paquete } from '@/types';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import ImageGallery from '@/components/ImageGallery';
import PaqueteSidebar from '@/components/PaqueteSidebar';
import PaqueteHero from '@/components/PaqueteHero';
import PaqueteSchema from '@/components/PaqueteSchema';
import { CheckCircle, XCircle } from 'lucide-react';
import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/lib/constants';
import { serializeFirestoreData } from '@/lib/utils/serialize';

export const revalidate = 60;

async function getPaquete(slug: string): Promise<Paquete | null> {
  try {
    // Query simplificada
    const q = query(collection(db, 'paquetes'), where('slug', '==', slug), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    
    const paquete = serializeFirestoreData<Paquete>({ 
      id: snapshot.docs[0].id, 
      ...snapshot.docs[0].data() 
    });
    
    // Verificar que esté visible
    if (!paquete.visible) return null;
    
    return paquete;
  } catch (error) {
    console.error('Error fetching paquete:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const paquete = await getPaquete(slug);
  
  if (!paquete) {
    return {
      title: 'Paquete no encontrado',
    };
  }

  const siteUrl = SITE_URL;
  const url = `${siteUrl}/paquete/${slug}`;
  
  // Limpiar HTML de la descripción para metadatos
  const cleanDescription = paquete.descripcionCorta || 
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
      images: coverImage ? [
        {
          url: coverImage,
          width: 1200,
          height: 630,
          alt: paquete.titulo,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${paquete.titulo} - ${SITE_NAME}`,
      description: cleanDescription,
      images: coverImage ? [coverImage] : [],
    },
    keywords: [
      paquete.titulo,
      paquete.destino || 'destino',
      'paquete turístico',
      'viajes',
      'turismo',
      SITE_NAME,
    ],
  };
}

export default async function PaquetePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const paquete = await getPaquete(slug);

  if (!paquete) {
    notFound();
  }

  const shareUrl = `${SITE_URL}/paquete/${paquete.slug}`;

  return (
    <>
      <PaqueteSchema paquete={paquete} />
      <Navbar transparent forceTransparent />
      <WhatsAppButton />

      {/* Hero Image con Botón Compartir */}
      <PaqueteHero paquete={paquete} shareUrl={shareUrl} />

      {/* Contenido */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
            {/* Columna principal */}
            <div className="lg:col-span-2 space-y-10 md:space-y-12 overflow-hidden">
              <div>
                <h2 className="text-lg md:text-lg lg:text-lg font-semibold mb-6">Descripción</h2>
                <div 
                  className="text-base md:text-lg text-gray-700 leading-relaxed prose prose-lg max-w-none wrap-break-word overflow-wrap-anywhere"
                  dangerouslySetInnerHTML={{ __html: paquete.descripcion }}
                />
              </div>

              {/* Fechas y Salidas */}
              {paquete.salidas && paquete.salidas.length > 0 && (
                <div>
                  <h2 className="text-lg md:text-lg lg:text-lg font-semibold mb-6">Fechas y Salidas Disponibles</h2>
                  
                  {/* Vista Mobile - Tarjetas */}
                  <div className="md:hidden space-y-4">
                    {[...paquete.salidas]
                      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
                      .map((salida) => {
                        const esPasada = new Date(salida.fecha + 'T00:00:00') < new Date();
                        return (
                          <div 
                            key={salida.id}
                            className={`bg-white border-2 rounded-xl p-4 ${esPasada ? 'opacity-50 border-gray-200' : 'border-gray-300'}`}
                          >
                            {/* Fecha */}
                            <div className="mb-3 pb-3 border-b">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Fecha de Salida</p>
                                  <p className="font-bold text-gray-900 text-lg">
                                    {new Date(salida.fecha + 'T00:00:00').toLocaleDateString('es-AR', { 
                                      weekday: 'short',
                                      year: 'numeric', 
                                      month: 'short', 
                                      day: 'numeric' 
                                    })}
                                  </p>
                                  {salida.fechaVuelta && (
                                    <p className="text-sm text-gray-600 mt-1">
                                      Vuelta: {new Date(salida.fechaVuelta + 'T00:00:00').toLocaleDateString('es-AR', { 
                                        month: 'short', 
                                        day: 'numeric' 
                                      })}
                                    </p>
                                  )}
                                </div>
                                {esPasada && (
                                  <span className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded">Pasada</span>
                                )}
                              </div>
                            </div>

                            {/* Información en grid */}
                            <div className="space-y-3">
                              {/* Ciudad */}
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500 uppercase tracking-wide">Ciudad</span>
                                <span className="font-medium text-gray-900">{salida.ciudadSalida || '-'}</span>
                              </div>

                              {/* Precio */}
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500 uppercase tracking-wide">Precio</span>
                                <span className="font-bold text-base text-gray-900">
                                  {salida.moneda} ${salida.precio.toLocaleString('es-AR')}
                                </span>
                              </div>

                              {/* Cupo */}
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500 uppercase tracking-wide">Cupo</span>
                                <span className="inline-flex items-center gap-2">
                                  {salida.cupo ? (
                                    <>
                                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                                      <span className="font-medium text-gray-900">{salida.cupo} {salida.cupo === 1 ? 'lugar' : 'lugares'}</span>
                                    </>
                                  ) : (
                                    <>
                                      <span className="inline-block w-2 h-2 bg-gray-400 rounded-full"></span>
                                      <span className="font-medium text-gray-600">Consultar</span>
                                    </>
                                  )}
                                </span>
                              </div>

                              {/* Observaciones */}
                              {salida.observaciones && salida.observaciones.trim() && (
                                <div className="pt-3 mt-3 border-t border-gray-200">
                                  <span className="text-sm text-gray-500 uppercase tracking-wide block mb-1">Observaciones</span>
                                  <p className="text-base text-gray-700 leading-relaxed wrap-break-word">{salida.observaciones}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Vista Desktop - Tabla */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-black text-white">
                          <th className="p-3 text-left font-semibold text-base">Fecha de Salida</th>
                          <th className="p-3 text-left font-semibold text-base">Ciudad</th>
                          <th className="p-3 text-left font-semibold text-base">Precio</th>
                          <th className="p-3 text-left font-semibold text-base">Cupo</th>
                          <th className="p-3 text-left font-semibold text-base">Observaciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...paquete.salidas]
                          .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
                          .map((salida, index) => {
                            const esPasada = new Date(salida.fecha + 'T00:00:00') < new Date();
                            return (
                              <tr 
                                key={salida.id} 
                                className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${esPasada ? 'opacity-50' : ''} hover:bg-gray-100 transition-colors`}
                              >
                                <td className="p-3">
                                  <div className="font-semibold text-gray-900 text-base">
                                    {new Date(salida.fecha + 'T00:00:00').toLocaleDateString('es-AR', { 
                                      weekday: 'short',
                                      year: 'numeric', 
                                      month: 'short', 
                                      day: 'numeric' 
                                    })}
                                  </div>
                                  {salida.fechaVuelta && (
                                    <div className="text-sm text-gray-600 mt-0.5">
                                      Vuelta: {new Date(salida.fechaVuelta + 'T00:00:00').toLocaleDateString('es-AR', { 
                                        month: 'short', 
                                        day: 'numeric' 
                                      })}
                                    </div>
                                  )}
                                  {esPasada && (
                                    <span className="inline-block mt-1 text-sm bg-red-100 text-red-700 px-2 py-1 rounded">Pasada</span>
                                  )}
                                </td>
                                <td className="p-3 text-gray-700 text-base">
                                  {salida.ciudadSalida || '-'}
                                </td>
                                <td className="p-3">
                                  <span className="font-bold text-lg text-gray-900">
                                    {salida.moneda} ${salida.precio.toLocaleString('es-AR')}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span className="inline-flex items-center gap-2 text-gray-700 text-base">
                                    {salida.cupo ? (
                                      <>
                                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                                        {salida.cupo} {salida.cupo === 1 ? 'lugar' : 'lugares'}
                                      </>
                                    ) : (
                                      <>
                                        <span className="inline-block w-2 h-2 bg-gray-400 rounded-full"></span>
                                        Consultar
                                      </>
                                    )}
                                  </span>
                                </td>
                                <td className="p-3 text-gray-700 text-base">
                                  {salida.observaciones && salida.observaciones.trim() ? (
                                    <span className="wrap-break-word">{salida.observaciones}</span>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>

                  <p className="text-sm md:text-base text-gray-600 mt-4">
                    💡 Los precios pueden variar según disponibilidad. Consultá por otras fechas disponibles.
                  </p>
                </div>
              )}

              {(paquete.incluye.length > 0 || (paquete.noIncluye && paquete.noIncluye.length > 0)) && (
                <div className="bg-gray-50 rounded-lg p-6 md:p-8">
                  <h2 className="text-lg md:text-lg lg:text-lg font-semibold mb-6 md:mb-8 text-gray-900">Incluye y No Incluye</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                    {/* ¿Qué Incluye? */}
                    {paquete.incluye.length > 0 && (
                      <div>
                        <h3 className="text-base md:text-lg lg:text-lg font-semibold mb-4 text-gray-800">¿Qué Incluye?</h3>
                        <ul className="space-y-3">
                          {paquete.incluye.map((item, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle className="h-5 w-5 text-green-500 mr-3 shrink-0 mt-0.5" />
                              <span className="text-gray-700 text-lg leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* ¿Qué NO Incluye? */}
                    {paquete.noIncluye && paquete.noIncluye.length > 0 && (
                      <div>
                        <h3 className="text-base md:text-lg lg:text-lg font-semibold mb-4 text-gray-800">¿Qué NO Incluye?</h3>
                        <ul className="space-y-3">
                          {paquete.noIncluye.map((item, index) => (
                            <li key={index} className="flex items-start">
                              <XCircle className="h-5 w-5 text-red-500 mr-3 shrink-0 mt-0.5" />
                              <span className="text-gray-700 text-lg leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Sidebar Mobile - Información de reserva (solo visible en mobile, antes de la galería) */}
              <div className="lg:hidden">
                <PaqueteSidebar paquete={paquete} />
              </div>

              {paquete.galeria.length > 0 && (
                <div>
                  <h2 className="text-lg md:text-lg lg:text-lg font-semibold mb-6">Galería</h2>
                  <ImageGallery images={paquete.galeria} title={paquete.titulo} />
                </div>
              )}
            </div>

            {/* Sidebar Desktop - Información de reserva (solo visible en desktop) */}
            <div className="hidden lg:block lg:col-span-1">
              <PaqueteSidebar paquete={paquete} />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

