'use client';

import { useState, useMemo, useEffect } from 'react';
import { Paquete, Categoria } from '@/types';
import PaqueteCard from '@/components/PaqueteCard';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, SlidersHorizontal, Search, Plane, Hotel, Bus, Utensils, Coffee, MapPin, ShieldCheck, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

interface PaquetesClientProps {
  paquetes: Paquete[];
  categorias: Categoria[];
  basePath?: string;
}

const SERVICIOS_BASE = [
  { id: 'aereos', label: 'Aéreos', icon: Plane, keywords: ['aéreo', 'aereo', 'pasaje', 'vuelo', 'avión', 'avion', 'flight'] },
  { id: 'alojamiento', label: 'Alojamiento', icon: Hotel, keywords: ['hotel', 'alojamiento', 'hospedaje', 'noche', 'noches', 'estadía', 'estadia', 'accommodation'] },
  { id: 'traslados', label: 'Traslados', icon: Bus, keywords: ['traslado', 'transfer', 'charter', 'aeropuerto', 'transporte', 'bus', 'colectivo'] },
  { id: 'desayuno', label: 'Desayuno', icon: Coffee, keywords: ['desayuno', 'breakfast', 'desayunos'] },
  { id: 'comidas', label: 'Comidas', icon: Utensils, keywords: ['comida', 'almuerzo', 'cena', 'media pensión', 'pension', 'pensión completa', 'meals', 'lunch', 'dinner'] },
  { id: 'excursiones', label: 'Excursiones', icon: MapPin, keywords: ['excursión', 'excursion', 'visita', 'tour', 'actividad', 'paseo'] },
  { id: 'asistencia', label: 'Asistencia', icon: ShieldCheck, keywords: ['asistencia', 'seguro', 'cobertura', 'insurance'] },
];

const TIPO_LABELS: Record<string, string> = { individual: 'Individual', grupal: 'Grupal', 'a-medida': 'A Medida' };

function truncateLabel(text: string, max = 18): string {
  if (!text || text.length <= max) return text;
  return text.slice(0, max).trim() + '…';
}

export default function PaquetesClient({ paquetes, categorias, basePath = '/paquete' }: PaquetesClientProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategorias, setSelectedCategorias] = useState<string[]>([]);
  const [selectedTipos, setSelectedTipos] = useState<string[]>([]);
  const [selectedServicios, setSelectedServicios] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [selectedDestinos, setSelectedDestinos] = useState<string[]>([]);

  const destinos = useMemo(() => {
    const unique = Array.from(new Set(paquetes.map(p => p.destino || p.eventoLugar).filter(Boolean))) as string[];
    return unique.sort();
  }, [paquetes]);

  const tiposDisponibles = useMemo(() => {
    const set = new Set(paquetes.map(p => p.tipo));
    return Array.from(set).sort().map(tipo => ({ value: tipo, label: TIPO_LABELS[tipo] ?? tipo }));
  }, [paquetes]);

  const serviciosDisponibles = useMemo(() => {
    return SERVICIOS_BASE.filter((serv) =>
      paquetes.some((p) => {
        const text = (p.incluye || []).join(' ').toLowerCase();
        return serv.keywords.some((k) => text.includes(k.toLowerCase()));
      })
    );
  }, [paquetes]);

  // Resetear página cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategorias, selectedTipos, selectedDestinos, selectedServicios]);

  const paquetesFiltrados = useMemo(() => {
    const filtered = paquetes.filter((paquete) => {
      // Búsqueda por texto (busca en título, destino y descripción)
      if (searchTerm && searchTerm.trim() !== '') {
        const searchLower = searchTerm.toLowerCase().trim();
        const matchesSearch =
          paquete.titulo.toLowerCase().includes(searchLower) ||
          (paquete.destino && paquete.destino.toLowerCase().includes(searchLower)) ||
          (paquete.eventoLugar && paquete.eventoLugar.toLowerCase().includes(searchLower)) ||
          (paquete.eventoFecha && paquete.eventoFecha.toLowerCase().includes(searchLower)) ||
          (paquete.descripcion && paquete.descripcion.toLowerCase().includes(searchLower)) ||
          (paquete.descripcionCorta && paquete.descripcionCorta.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) return false;
      }

      // Filtro por categoría (solo si hay categorías seleccionadas)
      if (selectedCategorias.length > 0) {
        if (!paquete.categoriaId || !selectedCategorias.includes(paquete.categoriaId)) return false;
      }

      // Filtro por tipo (solo si hay tipos seleccionados)
      if (selectedTipos.length > 0) {
        if (!selectedTipos.includes(paquete.tipo)) return false;
      }

      // Filtro por destino (solo si hay destinos seleccionados)
      if (selectedDestinos.length > 0) {
        const destinoValue = paquete.destino || paquete.eventoLugar;
        if (!destinoValue || !selectedDestinos.includes(destinoValue)) return false;
      }

      if (selectedServicios.length > 0) {
        const incluyeText = (paquete.incluye || []).join(' ').toLowerCase();
        const tieneServicios = selectedServicios.every((servicioId) => {
          const servicio = SERVICIOS_BASE.find((s) => s.id === servicioId);
          if (!servicio) return false;
          return servicio.keywords.some((k) => incluyeText.includes(k.toLowerCase()));
        });
        if (!tieneServicios) return false;
      }

      return true;
    });
    
    return filtered;
  }, [paquetes, searchTerm, selectedCategorias, selectedTipos, selectedDestinos, selectedServicios]);

  // Calcular paginación
  const totalPages = Math.ceil(paquetesFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  const paquetesPaginados = useMemo(() => {
    return paquetesFiltrados.slice(startIndex, endIndex);
  }, [paquetesFiltrados, startIndex, endIndex]);

  // Scroll al inicio al cambiar de página
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const toggleCategoria = (categoriaId: string) => {
    setSelectedCategorias(prev =>
      prev.includes(categoriaId)
        ? prev.filter(id => id !== categoriaId)
        : [...prev, categoriaId]
    );
  };

  const toggleTipo = (tipo: string) => {
    setSelectedTipos(prev =>
      prev.includes(tipo)
        ? prev.filter(t => t !== tipo)
        : [...prev, tipo]
    );
  };

  const toggleDestino = (destino: string) => {
    setSelectedDestinos(prev =>
      prev.includes(destino)
        ? prev.filter(d => d !== destino)
        : [...prev, destino]
    );
  };

  const toggleServicio = (servicioId: string) => {
    setSelectedServicios(prev =>
      prev.includes(servicioId)
        ? prev.filter(s => s !== servicioId)
        : [...prev, servicioId]
    );
  };

  const limpiarFiltros = () => {
    setSearchTerm('');
    setSelectedCategorias([]);
    setSelectedTipos([]);
    setSelectedDestinos([]);
    setSelectedServicios([]);
  };

  const hayFiltrosActivos = 
    searchTerm.trim() !== '' ||
    selectedCategorias.length > 0 ||
    selectedTipos.length > 0 ||
    selectedDestinos.length > 0 ||
    selectedServicios.length > 0;

  return (
    <section className="pt-6 pb-12 md:pt-10 md:pb-16 bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Sidebar de Filtros */}
          <aside className="lg:col-span-1">
            {/* Botón para móvil */}
            <div className="lg:hidden mb-4">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full bg-[#19123C] hover:bg-[#19123C]/90 text-white h-11 text-base font-semibold"
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
              </Button>
            </div>

            {/* Filtros */}
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4 sticky top-4`}>
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-bold text-gray-900">Filtros</h2>
                {hayFiltrosActivos && (
                  <Button onClick={limpiarFiltros} variant="ghost" size="sm" className="text-xs h-7 px-2 hover:bg-gray-200">
                    Limpiar
                  </Button>
                )}
              </div>

              <div>
                <Label className="text-sm font-semibold mb-1.5 block text-gray-900">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Destino, título..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 h-9 text-sm border-gray-300 focus:border-black focus:ring-black"
                  />
                </div>
              </div>

              {/* Categorías: solo si hay datos, labels cortos */}
              {categorias.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold mb-2 block text-gray-900">Categorías</Label>
                  <div className="space-y-1.5">
                    {categorias.map((categoria) => (
                      <div key={categoria.id} className="flex items-center gap-2 min-w-0">
                        <Checkbox
                          id={`cat-${categoria.id}`}
                          checked={selectedCategorias.includes(categoria.id)}
                          onCheckedChange={() => toggleCategoria(categoria.id)}
                          className="shrink-0"
                        />
                        <label
                          htmlFor={`cat-${categoria.id}`}
                          className="text-sm font-medium leading-tight cursor-pointer truncate min-w-0"
                          title={categoria.nombre}
                        >
                          {truncateLabel(categoria.nombre)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tipo de Paquete: solo tipos que existen en los datos */}
              {tiposDisponibles.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold mb-2 block text-gray-900">Tipo</Label>
                  <div className="space-y-1.5">
                    {tiposDisponibles.map((tipo) => (
                      <div key={tipo.value} className="flex items-center gap-2">
                        <Checkbox
                          id={`tipo-${tipo.value}`}
                          checked={selectedTipos.includes(tipo.value)}
                          onCheckedChange={() => toggleTipo(tipo.value)}
                        />
                        <label htmlFor={`tipo-${tipo.value}`} className="text-sm font-medium cursor-pointer">
                          {tipo.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Destinos: dinámicos, labels truncados */}
              {destinos.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold mb-2 block text-gray-900">
                    Destinos ({destinos.length})
                  </Label>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                    {destinos.map((destino) => (
                      <div key={destino} className="flex items-center gap-2 min-w-0">
                        <Checkbox
                          id={`dest-${destino}`}
                          checked={selectedDestinos.includes(destino)}
                          onCheckedChange={() => toggleDestino(destino)}
                          className="shrink-0"
                        />
                        <label
                          htmlFor={`dest-${destino}`}
                          className="text-sm font-medium leading-tight cursor-pointer truncate min-w-0"
                          title={destino}
                        >
                          {truncateLabel(destino)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Servicios: solo los que aparecen en al menos un paquete */}
              {serviciosDisponibles.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold mb-2 block text-gray-900">Incluidos</Label>
                  <div className="space-y-1.5">
                    {serviciosDisponibles.map((servicio) => {
                      const Icon = servicio.icon;
                      return (
                        <div key={servicio.id} className="flex items-center gap-2">
                          <Checkbox
                            id={`serv-${servicio.id}`}
                            checked={selectedServicios.includes(servicio.id)}
                            onCheckedChange={() => toggleServicio(servicio.id)}
                          />
                          <label
                            htmlFor={`serv-${servicio.id}`}
                            className="text-sm font-medium cursor-pointer flex items-center gap-1.5"
                          >
                            <Icon className="h-3.5 w-3.5 shrink-0 text-gray-500" />
                            <span>{servicio.label}</span>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Grid de Paquetes */}
          <div className="lg:col-span-3">
            {/* Resultados */}
            <div className="mb-6 md:mb-8">
              <h3 className="text-base md:text-lg lg:text-lg font-bold text-gray-900">
                {paquetesFiltrados.length} {paquetesFiltrados.length === 1 ? 'paquete encontrado' : 'paquetes encontrados'}
              </h3>
            </div>

            {/* Paquetes */}
            {paquetes.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-900 mb-6">
                  <X className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-base md:text-lg lg:text-lg font-bold text-gray-900 mb-3">No hay paquetes disponibles</h3>
                <p className="text-base md:text-lg text-gray-600 mb-6 max-w-md mx-auto">
                  Aún no hay paquetes turísticos cargados en el sistema.
                </p>
              </div>
            ) : paquetesFiltrados.length > 0 ? (
              <>
                {/* Info y controles de paginación superiores */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-5 pb-3 sm:pb-4 border-b">
                  <div className="text-sm sm:text-base text-gray-600">
                    Mostrando <span className="font-semibold text-gray-900">{startIndex + 1}</span> a{' '}
                    <span className="font-semibold text-gray-900">{Math.min(endIndex, paquetesFiltrados.length)}</span> de{' '}
                    <span className="font-semibold text-gray-900">{paquetesFiltrados.length}</span> resultados
                  </div>
                  <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger className="w-[140px] sm:w-[180px] text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12 por página</SelectItem>
                      <SelectItem value="24">24 por página</SelectItem>
                      <SelectItem value="48">48 por página</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPage}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                  >
                    {paquetesPaginados.map((paquete, index) => (
                      <PaqueteCard 
                        key={paquete.id} 
                        paquete={paquete} 
                        index={startIndex + index} 
                        basePath={basePath}
                      />
                    ))}
                  </motion.div>
                </AnimatePresence>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="mt-12 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2">
                      {/* Primera página */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="h-9 w-9 p-0"
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>

                      {/* Página anterior */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="h-9 w-9 p-0"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      {/* Números de página */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(page => {
                            // Mostrar: primera, última, actual, y 2 a cada lado de la actual
                            if (page === 1 || page === totalPages) return true;
                            if (Math.abs(page - currentPage) <= 2) return true;
                            return false;
                          })
                          .map((page, index, array) => {
                            // Agregar "..." entre números no consecutivos
                            const prevPage = index > 0 ? array[index - 1] : 0;
                            const showEllipsis = prevPage && page - prevPage > 1;

                            return (
                              <div key={page} className="flex items-center gap-1">
                                {showEllipsis && (
                                  <span className="px-2 text-gray-400">...</span>
                                )}
                                <Button
                                  variant={currentPage === page ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => setCurrentPage(page)}
                                  className={`h-9 w-9 p-0 ${
                                    currentPage === page
                                      ? 'bg-[#19123C] text-white hover:bg-[#19123C]/90'
                                      : ''
                                  }`}
                                >
                                  {page}
                                </Button>
                              </div>
                            );
                          })}
                      </div>

                      {/* Página siguiente */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="h-9 w-9 p-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>

                      {/* Última página */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="h-9 w-9 p-0"
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </div>

                    <p className="text-base text-gray-500">
                      Página {currentPage} de {totalPages}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-900 mb-6">
                  <X className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-base md:text-lg lg:text-lg font-bold text-gray-900 mb-3">No se encontraron paquetes</h3>
                <p className="text-base md:text-lg text-gray-600 mb-4 max-w-md mx-auto">
                  No hay paquetes que coincidan con los filtros seleccionados.
                </p>
                {hayFiltrosActivos && (
                  <p className="text-base text-gray-500 mb-6">
                    Filtros activos: 
                    {searchTerm && ` Búsqueda: "${searchTerm}"`}
                    {selectedCategorias.length > 0 && ` · ${selectedCategorias.length} categoría(s)`}
                    {selectedTipos.length > 0 && ` · ${selectedTipos.length} tipo(s)`}
                    {selectedDestinos.length > 0 && ` · ${selectedDestinos.length} destino(s)`}
                    {selectedServicios.length > 0 && ` · ${selectedServicios.length} servicio(s)`}
                  </p>
                )}
                <Button
                  onClick={limpiarFiltros}
                  className="bg-[#19123C] hover:bg-[#19123C]/90 text-white"
                >
                  Limpiar todos los filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
