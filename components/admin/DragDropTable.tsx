'use client';

import { useState, useEffect } from 'react';
import { writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  GripVertical, 
  Pencil, 
  Trash2,
  Save,
  RotateCcw,
  ArrowUpDown,
  Loader2,
  Eye,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';

interface TableColumn<T> {
  key: string;
  label: string;
  render: (item: T) => React.ReactNode;
}

interface DragDropTableProps<T extends { id: string }> {
  items: T[];
  collectionName: 'categorias' | 'paquetes' | 'paquetes_f1' | 'blog';
  columns: TableColumn<T>[];
  onItemsChange: (items: T[]) => void;
  onDelete: (id: string) => void;
  editPath: string;
  viewPath?: string; // Ruta para ver el detalle del elemento
}

interface SortableRowProps<T> {
  item: T;
  columns: TableColumn<T>[];
  editPath: string;
  viewPath?: string;
  onDelete: (id: string) => void;
  isDragDisabled: boolean;
}

function SortableRow<T extends { id: string }>({ 
  item, 
  columns,
  editPath,
  viewPath,
  onDelete,
  isDragDisabled 
}: SortableRowProps<T>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: isDragDisabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow 
      ref={setNodeRef} 
      style={style} 
      className={`
        border-b border-gray-100 transition-colors
        ${isDragging ? 'bg-gray-100 shadow-lg' : 'hover:bg-gray-50'}
      `}
    >
      <TableCell className="w-12 py-4">
        <div 
          {...attributes} 
          {...listeners}
          className={`
            p-2 rounded-lg transition-all
            ${isDragDisabled 
              ? 'opacity-30 cursor-not-allowed' 
              : 'cursor-grab active:cursor-grabbing hover:bg-gray-100'
            }
          `}
        >
          <GripVertical className="h-5 w-5 text-gray-400" />
        </div>
      </TableCell>
      {columns.map((column) => (
        <TableCell key={column.key} className="py-4">
          {column.render(item)}
        </TableCell>
      ))}
      <TableCell className="text-right space-x-2 py-4">
        {viewPath && (
          <Button asChild variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-200 text-blue-600 hover:text-blue-700" title="Ver paquete">
            <Link href={`${viewPath}/${('slug' in item ? item.slug : item.id) || item.id}`} target="_blank" rel="noopener noreferrer">
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
        )}
        <Button asChild variant="outline" size="sm" className="hover:bg-gray-100">
          <Link href={`${editPath}/${item.id}`}>
            <Pencil className="h-4 w-4" />
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(item.id)}
          className="hover:bg-red-50 hover:border-red-200 text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

export default function DragDropTable<T extends { id: string }>({
  items: initialItems,
  collectionName,
  columns,
  onItemsChange,
  onDelete,
  editPath,
  viewPath,
}: DragDropTableProps<T>) {
  const [items, setItems] = useState(initialItems);
  const [originalItems, setOriginalItems] = useState(initialItems);
  const [saving, setSaving] = useState(false);
  const [dragMode, setDragMode] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Actualizar items cuando cambie el prop
  useEffect(() => {
    setItems(initialItems);
    setOriginalItems(initialItems);
  }, [initialItems]);

  const hasChanges = JSON.stringify(items.map(i => i.id)) !== JSON.stringify(originalItems.map(i => i.id));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = async () => {
    // Verificar si realmente hay cambios
    if (!hasChanges) {
      toast.info('No hay cambios para guardar', {
        description: 'El orden ya está actualizado',
      });
      return;
    }

    setSaving(true);
    try {
      const batch = writeBatch(db);
      
      items.forEach((item, index) => {
        const itemRef = doc(db, collectionName, item.id);
        batch.update(itemRef, { orden: index + 1 });
      });

      await batch.commit();
      
      toast.success('Orden guardado correctamente', {
        description: `${items.length} elementos actualizados`,
      });
      
      setOriginalItems(items);
      onItemsChange(items);
      setDragMode(false);
    } catch (error) {
      console.error('Error saving order:', error);
      toast.error('Error al guardar orden');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setItems(originalItems);
    toast.info('Orden restaurado');
  };

  return (
    <div className="space-y-4">
      {/* Control de modo drag - Diseño mejorado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-xl">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant={dragMode ? 'default' : 'outline'}
            size="default"
            onClick={() => setDragMode(!dragMode)}
            className={`
              font-semibold transition-all
              ${dragMode 
                ? 'bg-black hover:bg-gray-800 text-white shadow-md' 
                : 'border-2 border-gray-300 hover:border-black hover:bg-gray-50'
              }
            `}
          >
            <ArrowUpDown className="mr-2 h-5 w-5" />
            {dragMode ? 'Modo reordenar activo' : 'Reordenar elementos'}
          </Button>
          
          {dragMode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <GripVertical className="h-4 w-4 text-blue-600" />
              <span className="text-base font-medium text-blue-700">
                Arrastra las filas para reordenar
              </span>
            </motion.div>
          )}
        </div>
        
        <AnimatePresence>
          {dragMode && hasChanges && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-2"
            >
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 font-medium px-3 py-1">
                <AlertTriangle className="mr-1 h-3.5 w-3.5" />
                Cambios sin guardar
              </Badge>
              <Button
                variant="outline"
                size="default"
                onClick={handleReset}
                disabled={saving}
                className="border-2 hover:bg-gray-50"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Deshacer
              </Button>
              <Button
                size="default"
                onClick={handleSave}
                disabled={saving}
                className="bg-black hover:bg-gray-800 text-white shadow-md"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar orden
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tabla con Drag & Drop - Diseño Profesional */}
      <div className="bg-white rounded-2xl shadow-[0_18px_45px_rgba(15,23,42,0.06)] overflow-hidden border border-gray-200/80">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map(item => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-900 hover:to-gray-800 border-b border-gray-700">
                  <TableHead className="w-12 text-white/80 text-xs uppercase tracking-widest">
                    {dragMode && <ArrowUpDown className="h-4 w-4 text-white" />}
                  </TableHead>
                  {columns.map((column) => (
                    <TableHead key={column.key} className="text-white/90 font-semibold text-xs uppercase tracking-widest">
                      {column.label}
                    </TableHead>
                  ))}
                  <TableHead className="text-right text-white/90 font-semibold text-xs uppercase tracking-widest">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length + 2} className="text-center py-8 text-gray-500">
                      No hay elementos
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <SortableRow<T>
                      key={item.id}
                      item={item}
                      columns={columns}
                      editPath={editPath}
                      viewPath={viewPath}
                      onDelete={onDelete}
                      isDragDisabled={!dragMode}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

