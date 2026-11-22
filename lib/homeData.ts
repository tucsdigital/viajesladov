import { collection, getDocs, query, orderBy as firestoreOrderBy, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { serializeFirestoreData } from '@/lib/utils/serialize';
import { BlogPost, Categoria, Paquete } from '@/types';

async function fetchVisibleOrdered<T>(collectionName: string, maxItems: number) {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, collectionName),
        where('visible', '==', true),
        firestoreOrderBy('orden', 'asc'),
        limit(maxItems)
      )
    );

    return snapshot.docs.map((doc) => serializeFirestoreData<T>({ id: doc.id, ...doc.data() }));
  } catch (error) {
    // Fallback sin indice compuesto: filtramos y ordenamos en memoria
    const snapshot = await getDocs(query(collection(db, collectionName), where('visible', '==', true)));
    return snapshot.docs
      .map((doc) => serializeFirestoreData<T>({ id: doc.id, ...doc.data() }))
      .sort((a: any, b: any) => (a.orden || 0) - (b.orden || 0))
      .slice(0, maxItems);
  }
}

async function fetchActiveCategories(maxItems: number) {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, 'categorias'),
        where('activa', '==', true),
        firestoreOrderBy('orden', 'asc'),
        limit(maxItems)
      )
    );

    return snapshot.docs.map((doc) => serializeFirestoreData<Categoria>({ id: doc.id, ...doc.data() }));
  } catch (error) {
    const snapshot = await getDocs(query(collection(db, 'categorias'), where('activa', '==', true)));
    return snapshot.docs
      .map((doc) => serializeFirestoreData<Categoria>({ id: doc.id, ...doc.data() }))
      .sort((a, b) => (a.orden || 0) - (b.orden || 0))
      .slice(0, maxItems);
  }
}

export async function getHomeData() {
  const [
    paquetesData,
    paquetesF1Data,
    categoriasData,
    bannersSnapshot,
    blogData,
    seccionesSnapshot,
  ] = await Promise.all([
    fetchVisibleOrdered<Paquete>('paquetes', 12),
    fetchVisibleOrdered<Paquete>('paquetes_f1', 12),
    fetchActiveCategories(12),
    getDocs(query(collection(db, 'banners'), firestoreOrderBy('orden', 'asc'))),
    fetchVisibleOrdered<BlogPost>('blog', 4),
    getDocs(query(collection(db, 'secciones'), firestoreOrderBy('orden', 'asc'))),
  ]);

  const seccionesData = seccionesSnapshot.docs
    .map((doc) =>
      serializeFirestoreData<{
        paqueteId?: string;
        tipo: 'paquete' | 'f1' | 'subtitle';
        orden: number;
        titulo?: string;
      }>({
        id: doc.id,
        ...doc.data(),
      })
    )
    .sort((a, b) => (a.orden || 0) - (b.orden || 0));

  const paquetesMap = new Map(paquetesData.map((paq) => [paq.id, paq]));
  const paquetesF1Map = new Map(paquetesF1Data.map((paq) => [paq.id, paq]));

  const productosDesdeSecciones = seccionesData
    .map((item) => {
      if (item.tipo === 'subtitle') {
        return { tipo: 'subtitle' as const, titulo: item.titulo || 'Sección' };
      }
      const paquete =
        item.tipo === 'f1' ? paquetesF1Map.get(item.paqueteId || '') : paquetesMap.get(item.paqueteId || '');
      return paquete ? { paquete, tipo: item.tipo } : null;
    })
    .filter(
      (item): item is { tipo: 'paquete' | 'f1'; paquete: Paquete } | { tipo: 'subtitle'; titulo: string } =>
        Boolean(item)
    );

  const productosFinales =
    productosDesdeSecciones.length > 0
      ? productosDesdeSecciones
      : [
          ...paquetesData.map((paquete) => ({ paquete, tipo: 'paquete' as const })),
          ...paquetesF1Data.map((paquete) => ({ paquete, tipo: 'f1' as const })),
        ];

  const bannersData = bannersSnapshot.docs
    .map((doc) => doc.data() as { imageUrl?: string; activa?: boolean; target?: 'home' | 'blog' | 'both' })
    .filter((banner) => {
      if (banner.activa === false || !banner.imageUrl) return false;
      const target = banner.target || 'home';
      return target === 'home' || target === 'both';
    })
    .map((banner) => banner.imageUrl as string);

  return {
    paquetes: paquetesData,
    paquetesF1: paquetesF1Data,
    categorias: categoriasData,
    productosOrdenados: productosFinales,
    banners: bannersData,
    blogPosts: blogData,
  };
}
