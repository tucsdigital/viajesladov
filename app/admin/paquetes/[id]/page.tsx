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
import { toast } from 'sonner';
import { ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { slugify } from '@/lib/utils/slugify';
import type { Paquete, Categoria, Salida } from '@/types';
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
  categoriaId: z.string().min(1, 'Debes seleccionar una categoría'),
  tipo: z.enum(['individual', 'grupal', 'a-medida']),
  precio: z.number()
    .min(0, 'El precio debe ser mayor o igual a 0')
    .max(999999999, 'El precio es demasiado alto')
    .transform(val => Number(val) || 0),
  moneda: z.enum(['USD', 'ARS', 'EUR']),
  mostrarDesde: z.boolean().transform(val => Boolean(val)),
  duracion: z.string()
    .min(1, 'La duración es requerida')
    .max(50, 'La duración no puede exceder 50 caracteres')
    .transform(val => val.trim()),
  visible: z.boolean().transform(val => Boolean(val)),
  destacado: z.boolean().transform(val => Boolean(val)),
  ctaWhatsApp: z.boolean().transform(val => Boolean(val)),
});

type FormData = z.infer<typeof formSchema>;

export default function EditarPaquetePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
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
  const mostrarDesde = watch('mostrarDesde');
  const descripcionCorta = watch('descripcionCorta');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar categorías
        const catQuery = query(collection(db, 'categorias'), where('activa', '==', true));
        const catSnapshot = await getDocs(catQuery);
        const catData = catSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Categoria));
        setCategorias(catData);

        // Contar paquetes destacados actuales (excluyendo el actual)
        const paquetesQuery = query(collection(db, 'paquetes'), where('destacado', '==', true));
        const paquetesSnapshot = await getDocs(paquetesQuery);
        const destacadosOtros = paquetesSnapshot.docs.filter(doc => doc.id !== id).length;
        setDestacadosCount(destacadosOtros);

        // Cargar paquete
        const docRef = doc(db, 'paquetes', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as Paquete;
          setWasDestacado(data.destacado); // Guardar estado original
          setValue('titulo', data.titulo);
          setValue('descripcion', data.descripcion);
          setValue('descripcionCorta', data.descripcionCorta || '');
          setValue('etiqueta', data.etiqueta || '');
          setValue('categoriaId', data.categoriaId || '');
          setValue('tipo', data.tipo);
          setValue('precio', data.precio);
          setValue('moneda', data.moneda || 'ARS'); // Default ARS para retrocompatibilidad
          setValue('mostrarDesde', data.mostrarDesde ?? true); // Default true para retrocompatibilidad
          setValue('duracion', data.duracion);
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
        } else {
          toast.error('Paquete no encontrado');
          router.push('/admin/paquetes');
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

  const onSubmit = async (data: FormData) => {
    if (imagenTarjetaPreview.length === 0 || imagenPortadaPreview.length === 0) {
      toast.error('Debes agregar imagen de tarjeta y de portada');
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
          dataURLtoFile(cardPreview, `paquete-card-${Date.now()}.jpg`),
        ]);
        imagenTarjetaUrl = uploaded;
      }

      if (isDataUrl(coverPreview)) {
        const [uploaded] = await uploadMultipleImages([
          dataURLtoFile(coverPreview, `paquete-cover-${Date.now()}.jpg`),
        ]);
        imagenPortadaUrl = uploaded;
      }

      const galleryDataUrls = galeriaPreview.filter(isDataUrl);
      const uploadedGalleryUrls =
        galleryDataUrls.length > 0
          ? await uploadMultipleImages(
              galleryDataUrls.map((preview, index) =>
                dataURLtoFile(preview, `paquete-gallery-${Date.now()}-${index}.jpg`)
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

      // Obtener el nombre de la categoría seleccionada
      const categoriaSeleccionada = categorias.find(cat => cat.id === data.categoriaId);
      const nombreCategoria = categoriaSeleccionada?.nombre || 'Destino';

      // Sanitizar datos antes de guardar
      const sanitizedData = {
        titulo: data.titulo.trim(),
        slug,
        descripcion: data.descripcion.trim(),
        descripcionCorta: data.descripcionCorta?.trim() || '',
        etiqueta: data.etiqueta?.trim() || '',
        destino: nombreCategoria,
        categoriaId: data.categoriaId,
        tipo: data.tipo,
        precio: Number(data.precio) || 0,
        moneda: data.moneda,
        mostrarDesde: Boolean(data.mostrarDesde),
        duracion: data.duracion.trim(),
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
        visible: Boolean(data.visible),
        destacado: Boolean(data.destacado),
        ctaWhatsApp: Boolean(data.ctaWhatsApp),
      };

      await updateDoc(doc(db, 'paquetes', id), sanitizedData);

      toast.success('Paquete actualizado correctamente');
      router.push('/admin/paquetes');
    } catch (error) {
      console.error('Error updating paquete:', error);
      toast.error('Error al actualizar paquete');
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
              <Link href="/admin/paquetes">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Link>
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 tracking-tight">Editar Paquete</h1>
              <p className="text-gray-600 mt-1">Modifica la información del paquete</p>
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
                    placeholder="Ej: Europa Mágica - 15 días"
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
                    placeholder="Ej: Premium, Nuevo, F1"
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
                    placeholder="Ej: Descubre Europa en 15 días inolvidables con todo incluido"
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
                          placeholder="Describe el paquete turístico... Puedes usar negritas, listas y links."
                        />
                      )}
                    />
                  </div>
                  {errors.descripcion && (
                    <p className="text-base text-red-500 mt-1">{errors.descripcion.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="duracion">Duración *</Label>
                  <Input
                    id="duracion"
                    {...register('duracion')}
                    placeholder="Ej: 15 días / 14 noches"
                    className="mt-1.5"
                  />
                  {errors.duracion && (
                    <p className="text-base text-red-500 mt-1">{errors.duracion.message}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <Label htmlFor="categoriaId">Categoría *</Label>
                    <Controller
                      name="categoriaId"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="mt-1.5">
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {categorias.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.categoriaId && (
                      <p className="text-base text-red-500 mt-1">{errors.categoriaId.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="tipo">Tipo *</Label>
                    <Controller
                      name="tipo"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="mt-1.5">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="individual">Individual</SelectItem>
                            <SelectItem value="grupal">Grupal</SelectItem>
                            <SelectItem value="a-medida">A Medida</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.tipo && (
                      <p className="text-base text-red-500 mt-1">{errors.tipo.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="precio">Precio *</Label>
                        <Input
                          id="precio"
                          type="number"
                          {...register('precio', { valueAsNumber: true })}
                          placeholder="0"
                          className="mt-1.5"
                        />
                        {errors.precio && (
                          <p className="text-base text-red-500 mt-1">{errors.precio.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="moneda">Moneda *</Label>
                        <Controller
                          name="moneda"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="mt-1.5">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ARS">ARS</SelectItem>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="EUR">EUR</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <div className="space-y-0.5">
                        <Label htmlFor="mostrarDesde" className="text-base font-medium cursor-pointer">Mostrar &quot;Desde&quot;</Label>
                        <p className="text-sm text-gray-500">Se mostrará &quot;Desde $XXX&quot; en la tarjeta</p>
                      </div>
                      <Switch
                        id="mostrarDesde"
                        checked={mostrarDesde}
                        onCheckedChange={(checked) => setValue('mostrarDesde', checked)}
                      />
                    </div>
                  </div>

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
                    collectionName="paquetes"
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
                    <Label htmlFor="visible" className="text-lg font-medium cursor-pointer">Paquete visible</Label>
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
                <Link href="/admin/paquetes">Cancelar</Link>
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

