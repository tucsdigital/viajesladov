'use client';

import { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, deleteDoc, doc, orderBy, query, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Categoria } from '@/types';
import { deleteMultipleImages, extractCategoryImageUrls } from '@/lib/utils/deleteImages';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPagination from '@/components/admin/AdminPagination';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Loader2, Search, X, Star } from 'lucide-react';
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

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCategorias = async () => {
    try {
      const q = query(collection(db, 'categorias'), orderBy('orden', 'asc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Categoria));
      setCategorias(data);
    } catch (error) {
      console.error('Error fetching categorias:', error);
      toast.error('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      // Primero obtener los datos de la categoría para acceder a las imágenes
      const categoriaDoc = await getDoc(doc(db, 'categorias', deleteId));
      
      if (categoriaDoc.exists()) {
        const categoriaData = categoriaDoc.data() as Categoria;
        
        // Extraer URLs de imágenes
        const imageUrls = extractCategoryImageUrls(categoriaData);
        
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
            toast.warning('Categoría eliminada, pero hubo errores al eliminar las imágenes', { id: 'delete-images' });
          });
        }
      }
      
      // Eliminar documento de Firestore
      await deleteDoc(doc(db, 'categorias', deleteId));
      toast.success('Categoría eliminada correctamente');
      fetchCategorias();
    } catch (error) {
      console.error('Error deleting categoria:', error);
      toast.error('Error al eliminar categoría');
    } finally {
      setDeleteId(null);
    }
  };

  // Filtrar categorías por búsqueda
  const categoriasFiltradas = useMemo(() => {
    if (!searchTerm.trim()) return categorias;
    
    const searchLower = searchTerm.toLowerCase().trim();
    return categorias.filter(categoria =>
      categoria.nombre.toLowerCase().includes(searchLower) ||
      categoria.slug.toLowerCase().includes(searchLower) ||
      categoria.descripcion.toLowerCase().includes(searchLower)
    );
  }, [categorias, searchTerm]);

  // Paginación
  const categoriasPaginadas = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return categoriasFiltradas.slice(startIndex, endIndex);
  }, [categoriasFiltradas, currentPage, itemsPerPage]);

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
              <h1 className="text-lg font-semibold text-gray-900 tracking-tight">Categorías</h1>
              <p className="text-gray-600 mt-1">Gestiona las categorías de viajes</p>
            </div>
            <Button asChild className="bg-black hover:bg-gray-800 text-white">
              <Link href="/admin/categorias/nueva">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Categoría
              </Link>
            </Button>
          </div>

          {/* Búsqueda */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por nombre, slug o descripción..."
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
            items={categoriasPaginadas}
            collectionName="categorias"
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
                key: 'nombre',
                label: 'Nombre',
                render: (item) => <span className="font-semibold text-gray-900">{item.nombre}</span>
              },
              {
                key: 'slug',
                label: 'Slug',
                render: (item) => <span className="text-gray-500 font-mono text-base">{item.slug}</span>
              },
              {
                key: 'estado',
                label: 'Estado',
                render: (item) => (
                  <Badge 
                    variant={item.activa ? 'default' : 'secondary'}
                    className={item.activa ? 'bg-green-100 text-green-800 hover:bg-green-100 font-medium' : 'font-medium'}
                  >
                    {item.activa ? 'Activa' : 'Inactiva'}
                  </Badge>
                )
              },
              {
                key: 'destacada',
                label: 'Destacada',
                render: (item) => item.destacada ? (
                  <Badge className="bg-black text-white hover:bg-black font-medium">
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3.5 w-3.5" />
                      Destacada
                    </span>
                  </Badge>
                ) : (
                  <span className="text-gray-400 text-base">-</span>
                )
              },
            ]}
            onItemsChange={(newItems) => {
              setCategorias(newItems);
              fetchCategorias(); // Recargar después de guardar
            }}
            onDelete={setDeleteId}
            editPath="/admin/categorias"
          />
          
          {/* Paginación */}
          {categoriasFiltradas.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <AdminPagination
                currentPage={currentPage}
                totalItems={categoriasFiltradas.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
                itemName="categorías"
              />
            </div>
          )}
        </div>

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent className="z-[101]">
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará la categoría permanentemente.
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
