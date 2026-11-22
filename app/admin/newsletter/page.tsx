'use client';

import { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, deleteDoc, doc, orderBy, query, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { NewsletterSubscriber } from '@/types/newsletter';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPagination from '@/components/admin/AdminPagination';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Search, X, Download, Mail, Trash2, UserCheck, UserX } from 'lucide-react';
import { toast } from 'sonner';
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

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [exporting, setExporting] = useState(false);

  const fetchSubscribers = async () => {
    try {
      const q = query(collection(db, 'newsletter'), orderBy('fechaSuscripcion', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ 
        id: doc.id, 
        ...doc.data(),
        activo: doc.data().activo !== false // Default true si no existe el campo
      } as NewsletterSubscriber));
      setSubscribers(data);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      toast.error('Error al cargar suscriptores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteDoc(doc(db, 'newsletter', deleteId));
      toast.success('Suscriptor eliminado correctamente');
      fetchSubscribers();
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      toast.error('Error al eliminar suscriptor');
    } finally {
      setDeleteId(null);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'newsletter', id), {
        activo: !currentStatus
      });
      toast.success(`Suscriptor ${!currentStatus ? 'activado' : 'desactivado'} correctamente`);
      fetchSubscribers();
    } catch (error) {
      console.error('Error updating subscriber:', error);
      toast.error('Error al actualizar suscriptor');
    }
  };

  // Filtrar suscriptores por búsqueda
  const subscribersFiltrados = useMemo(() => {
    if (!searchTerm.trim()) return subscribers;
    
    const searchLower = searchTerm.toLowerCase().trim();
    return subscribers.filter(subscriber =>
      subscriber.email.toLowerCase().includes(searchLower)
    );
  }, [subscribers, searchTerm]);

  // Paginación
  const subscribersPaginados = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return subscribersFiltrados.slice(startIndex, endIndex);
  }, [subscribersFiltrados, currentPage, itemsPerPage]);

  // Resetear página cuando cambie la búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Función para exportar CSV
  const exportToCSV = async () => {
    setExporting(true);
    try {
      // Preparar datos para CSV
      const csvData = subscribers.map(subscriber => ({
        Email: subscriber.email,
        'Fecha de Suscripción': subscriber.fechaSuscripcion instanceof Date 
          ? subscriber.fechaSuscripcion.toLocaleDateString('es-AR')
          : new Date(subscriber.fechaSuscripcion.seconds * 1000).toLocaleDateString('es-AR'),
        Estado: subscriber.activo ? 'Activo' : 'Inactivo'
      }));

      // Crear CSV
      const headers = Object.keys(csvData[0] || {});
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => 
          headers.map(header => `"${row[header as keyof typeof row] || ''}"`).join(',')
        )
      ].join('\n');

      // Descargar archivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `newsletter-suscriptores-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('CSV exportado correctamente');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Error al exportar CSV');
    } finally {
      setExporting(false);
    }
  };

  const formatDate = (date: Timestamp | Date | { seconds: number; nanoseconds?: number }) => {
    if (date instanceof Date) {
      return date.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    if (date && date.seconds) {
      return new Date(date.seconds * 1000).toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return 'Fecha inválida';
  };

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
              <h1 className="text-lg font-semibold text-gray-900 tracking-tight">Newsletter</h1>
              <p className="text-gray-600 mt-1">
                Gestiona los suscriptores del newsletter ({subscribers.length} total)
              </p>
            </div>
            <Button 
              onClick={exportToCSV}
              disabled={exporting || subscribers.length === 0}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {exporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar CSV
                </>
              )}
            </Button>
          </div>

          {/* Búsqueda */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por email..."
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

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center gap-3">
                <Mail className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-lg font-bold">{subscribers.length}</p>
                  <p className="text-base text-gray-600">Total suscriptores</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center gap-3">
                <UserCheck className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-lg font-bold">{subscribers.filter(s => s.activo).length}</p>
                  <p className="text-base text-gray-600">Activos</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center gap-3">
                <UserX className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-lg font-bold">{subscribers.filter(s => !s.activo).length}</p>
                  <p className="text-base text-gray-600">Inactivos</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de suscriptores */}
          {subscribersFiltrados.length > 0 ? (
            <>
              <div className="bg-white rounded-lg shadow border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Fecha de Suscripción
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {subscribersPaginados.map((subscriber) => (
                        <tr key={subscriber.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-base font-medium text-gray-900">
                                {subscriber.email}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                            {formatDate(subscriber.fechaSuscripcion)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge 
                              variant={subscriber.activo ? 'default' : 'secondary'}
                              className={subscriber.activo ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                            >
                              {subscriber.activo ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-base font-medium space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleActive(subscriber.id, subscriber.activo || false)}
                              className={`hover:bg-${subscriber.activo ? 'orange' : 'green'}-50 hover:border-${subscriber.activo ? 'orange' : 'green'}-200 text-${subscriber.activo ? 'orange' : 'green'}-600 hover:text-${subscriber.activo ? 'orange' : 'green'}-700`}
                            >
                              {subscriber.activo ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteId(subscriber.id)}
                              className="hover:bg-red-50 hover:border-red-200 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Paginación */}
              {subscribersFiltrados.length > 0 && (
                <div className="bg-white rounded-lg shadow">
                  <AdminPagination
                    currentPage={currentPage}
                    totalItems={subscribersFiltrados.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setItemsPerPage}
                    itemName="suscriptores"
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No se encontraron suscriptores' : 'No hay suscriptores'}
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Intenta con otro término de búsqueda'
                  : 'Los suscriptores del newsletter aparecerán aquí'
                }
              </p>
            </div>
          )}
        </div>

        {/* Modal de confirmación de eliminación */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent className="z-[101]">
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará el suscriptor permanentemente.
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
