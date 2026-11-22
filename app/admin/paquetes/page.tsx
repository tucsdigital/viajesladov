'use client';

import { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, deleteDoc, doc, orderBy, query, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Paquete } from '@/types';
import { deleteMultipleImages, extractPackageImageUrls } from '@/lib/utils/deleteImages';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPagination from '@/components/admin/AdminPagination';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Loader2, Search, X, User, Users, Sparkles, CheckCircle2, XCircle, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import Link from 'next/link';
import DragDropTable from '@/components/admin/DragDropTable';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function PaquetesPage() {
  const [paquetes, setPaquetes] = useState<Paquete[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  // Contar paquetes destacados
  const destacadosCount = useMemo(() => {
    return paquetes.filter(p => p.destacado).length;
  }, [paquetes]);

  const fetchPaquetes = async () => {
    try {
      const q = query(collection(db, 'paquetes'), orderBy('orden', 'asc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Paquete));
      setPaquetes(data);
    } catch (error) {
      console.error('Error fetching paquetes:', error);
      toast.error('Error al cargar paquetes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaquetes();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      // Primero obtener los datos del paquete para acceder a las imágenes
      const paqueteDoc = await getDoc(doc(db, 'paquetes', deleteId));
      
      if (paqueteDoc.exists()) {
        const paqueteData = paqueteDoc.data() as Paquete;
        
        // Extraer URLs de imágenes
        const imageUrls = extractPackageImageUrls(paqueteData);
        
        // Eliminar imágenes del storage remoto (en paralelo con la eliminación del documento)
        if (imageUrls.length > 0) {
          toast.info('Eliminando imágenes...', { id: 'delete-images' });
          deleteMultipleImages(imageUrls).then((deletedCount) => {
            if (deletedCount > 0) {
              toast.success(`${deletedCount} imágenes eliminadas del storage`, { id: 'delete-images' });
            } else {
              toast.dismiss('delete-images');
            }
          }).catch((error) => {
            console.error('Error eliminando imágenes:', error);
            toast.warning('Paquete eliminado, pero hubo errores al eliminar las imágenes', { id: 'delete-images' });
          });
        }
      }
      
      // Eliminar documento de Firestore
      await deleteDoc(doc(db, 'paquetes', deleteId));
      toast.success('Paquete eliminado correctamente');
      fetchPaquetes();
    } catch (error) {
      console.error('Error deleting paquete:', error);
      toast.error('Error al eliminar paquete');
    } finally {
      setDeleteId(null);
    }
  };

  // Filtrar paquetes por búsqueda
  const paquetesFiltrados = useMemo(() => {
    if (!searchTerm.trim()) return paquetes;
    
    const searchLower = searchTerm.toLowerCase().trim();
    return paquetes.filter(paquete =>
      paquete.titulo.toLowerCase().includes(searchLower) ||
      (paquete.destino && paquete.destino.toLowerCase().includes(searchLower)) ||
      paquete.slug.toLowerCase().includes(searchLower) ||
      (paquete.descripcion && paquete.descripcion.toLowerCase().includes(searchLower))
    );
  }, [paquetes, searchTerm]);

  // Paginación
  const paquetesPaginados = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return paquetesFiltrados.slice(startIndex, endIndex);
  }, [paquetesFiltrados, currentPage, itemsPerPage]);

  // Resetear página cuando cambie la búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading) {
    return (
      <ProtectedRoute>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-gray-900" />
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-semibold text-gray-900 tracking-tight">Paquetes</h1>
                {destacadosCount > 0 && (
                  <Badge 
                    variant={destacadosCount >= 9 ? 'destructive' : 'secondary'}
                    className={destacadosCount >= 9 ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' : 'bg-blue-100 text-blue-800 hover:bg-blue-100'}
                  >
                    {destacadosCount}/9 destacados
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 mt-1">
                Gestiona los paquetes turísticos
                {destacadosCount >= 9 && (
                  <span className="text-amber-600 ml-2">
                    • Solo los primeros 9 destacados se muestran en el inicio
                  </span>
                )}
              </p>
            </div>
            <Button asChild className="bg-black hover:bg-gray-800 text-white">
              <Link href="/admin/paquetes/nuevo">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Paquete
              </Link>
            </Button>
          </div>

          {/* Búsqueda */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por título, destino o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm('')}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <DragDropTable
            items={paquetesPaginados}
            collectionName="paquetes"
            viewPath="/paquete"
            columns={[
              {
                key: 'orden',
                label: 'Orden',
                render: (item) => (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-base px-2.5 py-1">
                      #{item.orden}
                    </Badge>
                  </div>
                )
              },
              {
                key: 'titulo',
                label: 'Título',
                render: (item) => (
                  <div className="max-w-xs">
                    <span className="font-semibold text-gray-900 line-clamp-2">
                      {item.titulo}
                    </span>
                  </div>
                )
              },
              {
                key: 'destino',
                label: 'Destino',
                render: (item) => <span className="text-gray-700">{item.destino}</span>
              },
              {
                key: 'tipo',
                label: 'Tipo',
                render: (item) => (
                  <Badge variant="outline" className="font-medium">
                    {item.tipo === 'individual' ? (
                      <span className="inline-flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        Individual
                      </span>
                    ) : item.tipo === 'grupal' ? (
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        Grupal
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5" />
                        A medida
                      </span>
                    )}
                  </Badge>
                )
              },
              {
                key: 'precio',
                label: 'Precio',
                render: (item) => (
                  <span className="font-bold text-gray-900">
                    ${item.precio.toLocaleString('es-AR')}
                  </span>
                )
              },
              {
                key: 'estado',
                label: 'Estado',
                render: (item) => (
                  <div className="flex gap-2 flex-wrap">
                    <Badge 
                      variant={item.visible ? 'default' : 'secondary'}
                      className={item.visible ? 'bg-green-100 text-green-800 hover:bg-green-100 font-medium' : 'font-medium'}
                    >
                      <span className="inline-flex items-center gap-1">
                        {item.visible ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                        {item.visible ? 'Visible' : 'Oculto'}
                      </span>
                    </Badge>
                    {item.destacado && (
                      <Badge className="bg-black text-white hover:bg-black font-medium">
                        <span className="inline-flex items-center gap-1">
                          <Star className="h-3.5 w-3.5" />
                          Destacado
                        </span>
                      </Badge>
                    )}
                  </div>
                )
              },
            ]}
            onItemsChange={(newItems) => {
              setPaquetes(newItems);
              fetchPaquetes(); // Recargar después de guardar
            }}
            onDelete={setDeleteId}
            editPath="/admin/paquetes"
          />
          
          {/* Paginación */}
          {paquetesFiltrados.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <AdminPagination
                currentPage={currentPage}
                totalItems={paquetesFiltrados.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
                itemName="paquetes"
              />
            </div>
          )}
        </div>

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent className="z-[101]">
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará el paquete permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </ProtectedRoute>
  );
}
