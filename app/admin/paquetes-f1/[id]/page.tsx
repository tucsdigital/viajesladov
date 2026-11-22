'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { uploadMultipleImages } from '@/lib/utils/upload';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import RichTextEditor from '@/components/admin/RichTextEditor';
import ImageUploader from '@/components/admin/ImageUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Trash2, Plus, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { slugify } from '@/lib/utils/slugify';
import type { Paquete, Salida, TicketPack } from '@/types';
import EditableList from '@/components/admin/EditableList';
import SalidasManager from '@/components/admin/SalidasManager';
import DragDropOrderManager from '@/components/admin/DragDropOrderManager';

const formSchema = z.object({
  titulo: z.string()
    .min(5, 'El título debe tener al menos 5 caracteres')
    .max(100, 'El título no puede exceder 100 caracteres')
    .transform(val => val.trim()),
  descripcion: z.string()
    .min(20, 'La descripción debe tener al menos 20 caracteres')
    .max(5000, 'La descripción no puede exceder 5000 caracteres')
    .transform(val => val.trim()),
  descripcionCorta: z.string()
    .max(160, 'La descripción corta no puede exceder 160 caracteres')
    .optional()
    .or(z.literal(''))
    .transform(val => val?.trim() || ''),
  etiqueta: z.string()
    .max(40, 'La etiqueta no puede exceder 40 caracteres')
    .optional()
    .or(z.literal(''))
    .transform(val => val?.trim() || ''),
  eventoLugar: z.string()
    .optional()
    .or(z.literal(''))
    .transform(val => val?.trim() || ''),
  eventoFecha: z.string()
    .optional()
    .or(z.literal(''))
    .transform(val => val?.trim() || ''),
  categoriaId: z.string().optional(),
  visible: z.boolean().transform(val => Boolean(val)),
  destacado: z.boolean().transform(val => Boolean(val)),
  ctaWhatsApp: z.boolean().transform(val => Boolean(val)),
});

type FormData = z.infer<typeof formSchema>;

type TicketFormItem = TicketPack & {
  imagenPreview: string[];
  imagenUrlInput: string;
};

export default function EditarPaqueteF1Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tickets, setTickets] = useState<TicketFormItem[]>([]);
  const [imagenTarjetaPreview, setImagenTarjetaPreview] = useState<string[]>([]);
  const [imagenPortadaPreview, setImagenPortadaPreview] = useState<string[]>([]);
  const [galeriaPreview, setGaleriaPreview] = useState<string[]>([]);
  const [imagenTarjetaOriginal, setImagenTarjetaOriginal] = useState<string>('');
  const [imagenPortadaOriginal, setImagenPortadaOriginal] = useState<string>('');
  const [galeriaOriginal, setGaleriaOriginal] = useState<string[]>([]);
  const [includeItems, setIncludeItems] = useState<string[]>([]);
  const [noIncludeItems, setNoIncludeItems] = useState<string[]>([]);
  const [salidas, setSalidas] = useState<Salida[]>([]);
  const [destacadosCount, setDestacadosCount] = useState(0);
  const [wasDestacado, setWasDestacado] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const visible = watch('visible');
  const destacado = watch('destacado');
  const ctaWhatsApp = watch('ctaWhatsApp');
  const descripcionCorta = watch('descripcionCorta');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Contar paquetes destacados actuales (excluyendo el actual)
        const paquetesQuery = query(collection(db, 'paquetes_f1'), where('destacado', '==', true));
        const paquetesSnapshot = await getDocs(paquetesQuery);
        const destacadosOtros = paquetesSnapshot.docs.filter(doc => doc.id !== id).length;
        setDestacadosCount(destacadosOtros);

        // Cargar paquete
        const docRef = doc(db, 'paquetes_f1', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as Paquete;
          setWasDestacado(data.destacado); // Guardar estado original
          setValue('titulo', data.titulo);
          setValue('descripcion', data.descripcion);
          setValue('descripcionCorta', data.descripcionCorta || '');
          setValue('etiqueta', data.etiqueta || '');
          setValue('eventoLugar', data.eventoLugar || '');
          setValue('eventoFecha', data.eventoFecha || '');
          setValue('visible', data.visible);
          setValue('destacado', data.destacado);
          setValue('ctaWhatsApp', data.ctaWhatsApp);
          
          // Cargar imágenes existentes
          const tarjeta = data.imagenTarjeta || data.imagenPrincipal || '';
          const portada = data.imagenPortada || data.imagenPrincipal || '';
          setImagenTarjetaOriginal(tarjeta);
          setImagenPortadaOriginal(portada);
          setGaleriaOriginal(data.galeria || []);
          setImagenTarjetaPreview(tarjeta ? [tarjeta] : []);
          setImagenPortadaPreview(portada ? [portada] : []);
          setGaleriaPreview(data.galeria || []);
          setIncludeItems(data.incluye || []);
          setNoIncludeItems(data.noIncluye || []);
          setSalidas(data.salidas || []);
          setTickets(
            (data.tickets || []).map((ticket) => ({
              ...ticket,
              imagenPreview: ticket.imagenUrl ? [ticket.imagenUrl] : [],
              imagenUrlInput: '',
            }))
          );
        } else {
          toast.error('Paquete F1 no encontrado');
          router.push('/admin/paquetes-f1');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router, setValue]);

  const dataURLtoFile = (dataUrl: string, filename: string): File => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const addTicket = () => {
    setTickets((prev) => [
      ...prev,
      {
        id: `ticket-${Date.now()}`,
        titulo: '',
        descripcion: '',
        moneda: 'USD',
        valor: 0,
        imagenUrl: '',
        imagenPreview: [],
        imagenUrlInput: '',
      },
    ]);
  };

  const updateTicket = (id: string, updates: Partial<TicketFormItem>) => {
    setTickets((prev) => prev.map((ticket) => (ticket.id === id ? { ...ticket, ...updates } : ticket)));
  };

  const removeTicket = (id: string) => {
    setTickets((prev) => prev.filter((ticket) => ticket.id !== id));
  };

  const onSubmit = async (data: FormData) => {
    if (imagenTarjetaPreview.length === 0 || imagenPortadaPreview.length === 0) {
      toast.error('Debes agregar imagen de tarjeta y de portada');
      return;
    }
    if (tickets.length === 0) {
      toast.error('Debes agregar al menos un ticket oficial');
      return;
    }

    setSaving(true);
    try {
      const isDataUrl = (value: string) => value.startsWith('data:');

      toast.info('Subiendo imágenes...', { id: 'upload' });
      const cardPreview = imagenTarjetaPreview[0];
      const coverPreview = imagenPortadaPreview[0];

      let imagenTarjetaUrl = cardPreview;
      let imagenPortadaUrl = coverPreview;

      if (isDataUrl(cardPreview)) {
        const [uploaded] = await uploadMultipleImages([
          dataURLtoFile(cardPreview, `paquete-f1-card-${Date.now()}.jpg`),
        ]);
        imagenTarjetaUrl = uploaded;
      }

      if (isDataUrl(coverPreview)) {
        const [uploaded] = await uploadMultipleImages([
          dataURLtoFile(coverPreview, `paquete-f1-cover-${Date.now()}.jpg`),
        ]);
        imagenPortadaUrl = uploaded;
      }

      const galleryDataUrls = galeriaPreview.filter(isDataUrl);
      const uploadedGalleryUrls =
        galleryDataUrls.length > 0
          ? await uploadMultipleImages(
              galleryDataUrls.map((preview, index) =>
                dataURLtoFile(preview, `paquete-f1-gallery-${Date.now()}-${index}.jpg`)
              )
            )
          : [];

      let galleryIndex = 0;
      const galeriaUrls = galeriaPreview.map((preview) => {
        if (!isDataUrl(preview)) return preview;
        const url = uploadedGalleryUrls[galleryIndex];
        galleryIndex += 1;
        return url;
      });

      toast.success('Imágenes subidas correctamente', { id: 'upload' });

      const slug = slugify(data.titulo);

      const nombreCategoria = 'F1';

      const resolveTicketImage = async (ticket: TicketFormItem, index: number) => {
        if (ticket.imagenUrlInput.trim()) {
          return ticket.imagenUrlInput.trim();
        }
        const preview = ticket.imagenPreview[0];
        if (!preview) return '';
        if (preview.startsWith('data:')) {
          const [uploaded] = await uploadMultipleImages([
            dataURLtoFile(preview, `ticket-f1-${Date.now()}-${index}.jpg`),
          ]);
          return uploaded;
        }
        return preview;
      };

      const sanitizedTickets = await Promise.all(
        tickets.map(async (ticket, index) => {
          if (!ticket.titulo.trim() || !ticket.descripcion.trim()) {
            throw new Error('Todos los tickets deben tener título y descripción');
          }
          if (!ticket.valor || ticket.valor <= 0) {
            throw new Error('Todos los tickets deben tener un valor válido');
          }
          const imagenUrl = await resolveTicketImage(ticket, index);
          if (!imagenUrl) {
            throw new Error('Todos los tickets deben tener imagen');
          }
          return {
            id: ticket.id,
            titulo: ticket.titulo.trim(),
            descripcion: ticket.descripcion.trim(),
            moneda: ticket.moneda,
            valor: Number(ticket.valor),
            imagenUrl,
          } as TicketPack;
        })
      );

      // Sanitizar datos antes de guardar
      const cheapestTicket =
        sanitizedTickets.length > 0
          ? sanitizedTickets.reduce((min, ticket) => (ticket.valor < min.valor ? ticket : min), sanitizedTickets[0])
          : undefined;
      const precioBase = cheapestTicket?.valor || 0;
      const monedaBase = cheapestTicket?.moneda || 'USD';
      const mostrarDesde = sanitizedTickets.length > 1;

      const sanitizedData = {
        titulo: data.titulo.trim(),
        slug,
        descripcion: data.descripcion.trim(),
        descripcionCorta: data.descripcionCorta?.trim() || '',
        etiqueta: data.etiqueta?.trim() || '',
        eventoLugar: data.eventoLugar?.trim() || '',
        eventoFecha: data.eventoFecha?.trim() || '',
        destino: nombreCategoria,
        categoriaId: '',
        tipo: 'individual',
        precio: precioBase,
        moneda: monedaBase,
        mostrarDesde,
        duracion: '',
        incluye: includeItems.filter(item => item.trim().length > 0),
        noIncluye: noIncludeItems.filter(item => item.trim().length > 0),
        salidas: salidas.map(salida => {
          const sanitizedSalida: Partial<Salida> = {
            ...salida,
            fecha: salida.fecha.trim(),
            fechaVuelta: salida.fechaVuelta?.trim() || '',
            ciudadSalida: salida.ciudadSalida.trim(),
            precio: Number(salida.precio) || 0,
            observaciones: salida.observaciones?.trim() || '',
          };
          
          // Solo agregar cupo si tiene un valor válido
          if (salida.cupo && salida.cupo > 0) {
            sanitizedSalida.cupo = Number(salida.cupo);
          }
          
          return sanitizedSalida as Salida;
        }),
        imagenPrincipal: imagenTarjetaUrl,
        imagenTarjeta: imagenTarjetaUrl,
        imagenPortada: imagenPortadaUrl,
        galeria: galeriaUrls,
        tickets: sanitizedTickets,
        visible: Boolean(data.visible),
        destacado: Boolean(data.destacado),
        ctaWhatsApp: Boolean(data.ctaWhatsApp),
      };

      await updateDoc(doc(db, 'paquetes_f1', id), sanitizedData);

      toast.success('Paquete F1 actualizado correctamente');
      router.push('/admin/paquetes-f1');
    } catch (error) {
      console.error('Error updating paquete F1:', error);
      const message = error instanceof Error ? error.message : 'Error al actualizar paquete F1';
      toast.error(message);
    } finally {
      setSaving(false);
    }
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
        <div className="max-w-5xl mx-auto space-y-6 pb-12">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/paquetes-f1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Link>
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 tracking-tight">Editar Paquete F1</h1>
              <p className="text-gray-600 mt-1">Modifica la información del paquete F1</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Información Principal */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle>Información Básica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <Label htmlFor="titulo">Título *</Label>
                  <Input
                    id="titulo"
                    {...register('titulo')}
                    placeholder="Ej: Gran Premio de Brasil - Experiencia VIP"
                    className="mt-1.5"
                  />
                  {errors.titulo && (
                    <p className="text-base text-red-500 mt-1">{errors.titulo.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="etiqueta">Etiqueta (opcional)</Label>
                  <Input
                    id="etiqueta"
                    {...register('etiqueta')}
                    placeholder="Ej: F1, VIP, Paddock"
                    className="mt-1.5"
                    maxLength={40}
                  />
                  {errors.etiqueta && (
                    <p className="text-base text-red-500 mt-1">{errors.etiqueta.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="descripcionCorta">Descripción corta (Recomendada)</Label>
                  <Input
                    id="descripcionCorta"
                    {...register('descripcionCorta')}
                    placeholder="Ej: Viví el GP con acceso premium, traslados y hospitality incluidos"
                    className="mt-1.5"
                    maxLength={160}
                  />
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-500">
                      Este texto se usa solo en la tarjeta del paquete
                    </p>
                    <p className={`text-sm ${(descripcionCorta?.length || 0) > 140 ? 'text-orange-500' : 'text-gray-500'}`}>
                      {descripcionCorta?.length || 0}/160 caracteres
                    </p>
                  </div>
                  {errors.descripcionCorta && (
                    <p className="text-base text-red-500 mt-1">{errors.descripcionCorta.message}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="eventoLugar">Lugar del GP (opcional)</Label>
                    <Input
                      id="eventoLugar"
                      {...register('eventoLugar')}
                      placeholder="Ej: Monza, Italia"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="eventoFecha">Fecha del GP (opcional)</Label>
                    <Input
                      id="eventoFecha"
                      type="date"
                      {...register('eventoFecha')}
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="descripcion">Descripción completa * (Usa el editor para dar formato)</Label>
                  <div className="mt-1.5">
                    <Controller
                      name="descripcion"
                      control={control}
                      render={({ field }) => (
                        <RichTextEditor
                          content={field.value}
                          onChange={field.onChange}
                          placeholder="Describe el paquete F1... Puedes usar negritas, listas y links."
                        />
                      )}
                    />
                  </div>
                  {errors.descripcion && (
                    <p className="text-base text-red-500 mt-1">{errors.descripcion.message}</p>
                  )}
                </div>

              </CardContent>
            </Card>

            {/* Configuración de Destacado y Orden */}
            <Card className="border-2">
              <CardHeader className="pb-4">
                <CardTitle>Paquete Destacado y Orden</CardTitle>
                <p className="text-base text-gray-500 mt-1.5">
                  Los paquetes destacados aparecen en la página de inicio (máximo 9)
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Switch de Destacado */}
                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                  <div className="space-y-0.5 flex-1">
                    <Label htmlFor="destacado" className="text-lg font-medium cursor-pointer">Marcar como destacado</Label>
                    <p className="text-sm text-gray-500 pr-4">
                      Aparecerá en la sección destacados de la homepage (máximo 9)
                    </p>
                    {destacadosCount >= 9 && destacado && !wasDestacado && (
                      <div className="flex items-center gap-2 mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <p className="text-sm text-amber-700">
                          <strong>Límite alcanzado:</strong> Ya hay {destacadosCount} paquetes destacados. Solo se mostrarán los primeros 9 en el inicio.
                        </p>
                      </div>
                    )}
                    {destacadosCount < 9 && destacado && (
                      <p className="text-sm text-green-600 mt-2">
                        {wasDestacado ? destacadosCount + 1 : destacadosCount + 1} de 9 destacados
                      </p>
                    )}
                  </div>
                  <Switch
                    id="destacado"
                    checked={destacado}
                    onCheckedChange={(checked) => {
                      if (checked && !wasDestacado && destacadosCount >= 9) {
                        toast.warning('Ya hay 9 paquetes destacados', {
                          description: 'Solo se mostrarán los primeros 9 en el inicio (ordenados por número de orden)',
                        });
                      }
                      setValue('destacado', checked);
                    }}
                    className="mt-0.5"
                  />
                </div>

                {/* Gestión de Orden Visual - Solo si está destacado */}
                {destacado ? (
                  <DragDropOrderManager
                    collectionName="paquetes_f1"
                    currentId={id}
                    maxItems={9}
                    onlyDestacados={true}
                  />
                ) : (
                  <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <p className="text-base text-blue-700 font-medium">
                      Marca el paquete como destacado para gestionar su orden de aparición en la homepage
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tickets oficiales */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle>Tickets oficiales disponibles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tickets.length === 0 && (
                  <p className="text-sm text-gray-500">Agrega al menos un ticket para mostrar en la página.</p>
                )}
                {tickets.map((ticket, index) => (
                  <div key={ticket.id} className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900">Ticket #{index + 1}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTicket(ticket.id)}
                        className="h-8 w-8 text-gray-500 hover:text-red-600"
                        aria-label="Eliminar ticket"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div>
                      <Label>Título *</Label>
                      <Input
                        value={ticket.titulo}
                        onChange={(e) => updateTicket(ticket.id, { titulo: e.target.value })}
                        className="mt-1.5"
                        placeholder="Ej: Pack Paddock Club"
                      />
                    </div>
                    <div>
                      <Label>Descripción *</Label>
                      <Textarea
                        value={ticket.descripcion}
                        onChange={(e) => updateTicket(ticket.id, { descripcion: e.target.value })}
                        className="mt-1.5"
                        placeholder="Incluye acceso, hospitality, etc."
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <Label>Moneda *</Label>
                        <Select
                          value={ticket.moneda}
                          onValueChange={(value) => updateTicket(ticket.id, { moneda: value as TicketPack['moneda'] })}
                        >
                          <SelectTrigger className="mt-1.5">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="ARS">ARS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Valor *</Label>
                        <Input
                          type="number"
                          value={ticket.valor}
                          onChange={(e) => updateTicket(ticket.id, { valor: Number(e.target.value) })}
                          className="mt-1.5"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Imagen (URL opcional)</Label>
                      <Input
                        value={ticket.imagenUrlInput}
                        onChange={(e) =>
                          updateTicket(ticket.id, {
                            imagenUrlInput: e.target.value,
                            imagenPreview: e.target.value.trim() ? [] : ticket.imagenPreview,
                          })
                        }
                        className="mt-1.5"
                        placeholder="https://..."
                      />
                      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                        <span>Usá URL o subí una imagen. Si cargás una, la otra se limpia.</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => updateTicket(ticket.id, { imagenUrlInput: '', imagenPreview: [] })}
                          className="h-7 px-2 text-red-500 hover:text-red-600"
                        >
                          Eliminar imagen
                        </Button>
                      </div>
                    </div>
                    <ImageUploader
                      images={ticket.imagenPreview}
                      onImagesChange={(images) =>
                        updateTicket(ticket.id, {
                          imagenPreview: images,
                          imagenUrlInput: images.length ? '' : ticket.imagenUrlInput,
                        })
                      }
                      maxImages={1}
                      label="Imagen del pack *"
                      description="Subí una imagen o usa un URL."
                    />
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addTicket} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar ticket
                </Button>
              </CardContent>
            </Card>

            {/* Layout de 2 Columnas para Incluye y No Incluye */}
            <div className="grid lg:grid-cols-2 gap-5">
              {/* ¿Qué Incluye? */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle>¿Qué Incluye?</CardTitle>
                </CardHeader>
                <CardContent>
                  <EditableList
                    items={includeItems}
                    onItemsChange={setIncludeItems}
                    placeholder="Ej: Vuelos ida y vuelta"
                    emptyMessage="No hay ítems en 'Incluye'"
                  />
                </CardContent>
              </Card>

              {/* ¿Qué NO Incluye? */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle>¿Qué NO Incluye?</CardTitle>
                </CardHeader>
                <CardContent>
                  <EditableList
                    items={noIncludeItems}
                    onItemsChange={setNoIncludeItems}
                    placeholder="Ej: Comidas no especificadas"
                    emptyMessage="No hay ítems en 'No Incluye'"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Fechas y Salidas */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle>Fechas y Salidas</CardTitle>
                <p className="text-base text-gray-600 mt-1">
                  Configura las fechas de salida con sus respectivos precios
                </p>
              </CardHeader>
              <CardContent>
                <SalidasManager
                  salidas={salidas}
                  onSalidasChange={setSalidas}
                />
              </CardContent>
            </Card>

            {/* Configuración y Visibilidad */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle>Configuración y Visibilidad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start justify-between py-3 border-b">
                  <div className="space-y-0.5">
                    <Label htmlFor="visible" className="text-lg font-medium cursor-pointer">Paquete F1 visible</Label>
                    <p className="text-sm text-gray-500 pr-4">Activar para que sea visible en el sitio web</p>
                  </div>
                  <Switch
                    id="visible"
                    checked={visible}
                    onCheckedChange={(checked) => setValue('visible', checked)}
                    className="mt-0.5"
                  />
                </div>

                <div className="flex items-start justify-between py-3">
                  <div className="space-y-0.5">
                    <Label htmlFor="ctaWhatsApp" className="text-lg font-medium cursor-pointer">Botón de WhatsApp</Label>
                    <p className="text-sm text-gray-500 pr-4">Mostrar botón de contacto directo por WhatsApp en el detalle</p>
                  </div>
                  <Switch
                    id="ctaWhatsApp"
                    checked={ctaWhatsApp}
                    onCheckedChange={(checked) => setValue('ctaWhatsApp', checked)}
                    className="mt-0.5"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Imágenes del Paquete - Full Width */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle>Imágenes del Paquete</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <ImageUploader
                  images={imagenTarjetaPreview}
                  onImagesChange={setImagenTarjetaPreview}
                  maxImages={1}
                  label="Imagen de tarjeta *"
                  description="Se usa en las cards del sitio."
                />
                <ImageUploader
                  images={imagenPortadaPreview}
                  onImagesChange={setImagenPortadaPreview}
                  maxImages={1}
                  label="Imagen de portada *"
                  description="Se usa en el banner principal del paquete."
                />
                <ImageUploader
                  images={galeriaPreview}
                  onImagesChange={setGaleriaPreview}
                  maxImages={8}
                  label="Galería de imágenes"
                  description="Imágenes adicionales para la galería del paquete."
                />
              </CardContent>
            </Card>

            {/* Botones de Acción */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" asChild size="lg">
                <Link href="/admin/paquetes-f1">Cancelar</Link>
              </Button>
              <Button
                type="submit"
                size="lg"
                className="bg-black hover:bg-gray-800 text-white min-w-[180px]"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </Button>
            </div>
          </form>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}

