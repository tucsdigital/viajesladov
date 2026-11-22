'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import { db } from '@/lib/firebase';
import { ClubMember, ClubPointsLedgerEntry } from '@/types';
import { collection, doc, getDoc, getDocs, orderBy, query, updateDoc, serverTimestamp, where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Clock,
  User,
  Crown,
  Wallet,
  Activity,
  Edit3,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  Shield,
  Send,
  Ban,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

const statusLabels = {
  lead: 'Lead',
  pending: 'Pendiente',
  active: 'Activo',
  blocked: 'Bloqueado',
};

const levelLabels = {
  base: 'Base',
  plus: 'Plus',
  elite: 'Elite',
};

const statusStyles: Record<ClubMember['status'], string> = {
  lead: 'bg-gray-100 text-gray-700 border-gray-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  blocked: 'bg-rose-50 text-rose-700 border-rose-200',
};

const levelStyles: Record<ClubMember['nivel'], string> = {
  base: 'bg-slate-100 text-slate-700 border-slate-200',
  plus: 'bg-sky-50 text-sky-700 border-sky-200',
  elite: 'bg-violet-50 text-violet-700 border-violet-200',
};

const formatDate = (value?: unknown) => {
  if (!value) return '—';
  if (typeof value === 'object' && value !== null && 'seconds' in value) {
    const ts = value as { seconds: number };
    return new Date(ts.seconds * 1000).toLocaleString('es-AR');
  }
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    const d = (value as { toDate: () => Date }).toDate();
    return d.toLocaleString('es-AR');
  }
  return new Date(value as string).toLocaleString('es-AR');
};

export default function ClubMemberDetailPage(props: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const params = use(props.params);
  const [member, setMember] = useState<ClubMember | null>(null);
  const [ledger, setLedger] = useState<ClubPointsLedgerEntry[]>([]);
  const [allMembers, setAllMembers] = useState<ClubMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('perfil');

  const fetchMemberDetail = async () => {
    try {
      const [memberSnapshot, ledgerSnapshot, allMembersSnapshot] = await Promise.all([
        getDoc(doc(db, 'club_lado_v', params.id)),
        getDocs(query(
          collection(db, 'club_points_ledger'),
          where('memberId', '==', params.id),
          orderBy('createdAt', 'desc'),
        )),
        getDocs(query(collection(db, 'club_lado_v'), orderBy('createdAt', 'desc'))),
      ]);

      if (memberSnapshot.exists()) {
        const data = memberSnapshot.data();
        setMember({
          id: memberSnapshot.id,
          nombre: data.nombre || '',
          email: data.email || '',
          telefono: data.telefono || '',
          status: data.status || 'pending',
          nivel: data.nivel || 'base',
          puntos: data.puntos || 0,
          autoLevel: data.autoLevel ?? true,
          notes: data.notes || '',
          tags: data.tags || [],
          source: data.source || 'landing',
          createdAt: data.createdAt,
          acceptedAt: data.acceptedAt,
          lastActivityAt: data.lastActivityAt,
          welcomeEmailSentAt: data.welcomeEmailSentAt,
          emailLastError: data.emailLastError || '',
        });
      }

      setLedger(ledgerSnapshot.docs.map(doc => ({
        id: doc.id,
        memberId: doc.data().memberId,
        delta: doc.data().delta,
        reason: doc.data().reason,
        description: doc.data().description,
        createdAt: doc.data().createdAt,
        createdBy: doc.data().createdBy,
      })));

      setAllMembers(allMembersSnapshot.docs.map(doc => ({
        id: doc.id,
        nombre: doc.data().nombre || '',
        email: doc.data().email || '',
        telefono: doc.data().telefono || '',
        status: doc.data().status || 'pending',
        nivel: doc.data().nivel || 'base',
        puntos: doc.data().puntos || 0,
        autoLevel: doc.data().autoLevel ?? true,
        notes: doc.data().notes || '',
        tags: doc.data().tags || [],
        source: doc.data().source || 'landing',
        createdAt: doc.data().createdAt,
        acceptedAt: doc.data().acceptedAt,
        lastActivityAt: doc.data().lastActivityAt,
        welcomeEmailSentAt: doc.data().welcomeEmailSentAt,
        emailLastError: doc.data().emailLastError || '',
      })));

    } catch (error) {
      toast.error('Error al cargar el miembro');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberDetail();
  }, [params.id]);

  const currentIndex = allMembers.findIndex(m => m.id === params.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allMembers.length - 1;

  const navigateToMember = (id: string) => {
    router.push(`/admin/club/${id}`);
  };

  const handleSave = async () => {
    if (!member) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'club_lado_v', params.id), {
        nombre: member.nombre,
        telefono: member.telefono,
        notes: member.notes,
        tags: member.tags,
        status: member.status,
        nivel: member.nivel,
        autoLevel: member.autoLevel,
        lastActivityAt: serverTimestamp(),
      });
      toast.success('Cambios guardados');
    } catch (error) {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: ClubMember['status']) => {
    if (!member) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'club_lado_v', params.id), {
        status: newStatus,
        acceptedAt: newStatus === 'active' ? serverTimestamp() : null,
        lastActivityAt: serverTimestamp(),
      });
      setMember(prev => prev ? { ...prev, status: newStatus } : null);
      toast.success(`Estado cambiado a ${statusLabels[newStatus]}`);
    } catch (error) {
      toast.error('Error al cambiar estado');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AdminLayout>
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  if (!member) {
    return (
      <ProtectedRoute>
        <AdminLayout>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Miembro no encontrado</h3>
              <p className="text-gray-500 mt-2">El miembro solicitado no existe o fue eliminado.</p>
              <Button onClick={() => router.push('/admin/club')} className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al listado
              </Button>
            </div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header con navegación */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.push('/admin/club')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => hasPrevious && navigateToMember(allMembers[currentIndex - 1].id)}
                  disabled={!hasPrevious}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <span className="text-sm text-gray-500">
                  {currentIndex + 1} de {allMembers.length}
                </span>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => hasNext && navigateToMember(allMembers[currentIndex + 1].id)}
                  disabled={!hasNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={fetchMemberDetail}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </div>

          {/* Tarjeta de resumen */}
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{member.nombre || 'Sin nombre'}</h1>
                    <p className="text-gray-600">{member.email}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={statusStyles[member.status]}>
                      {statusLabels[member.status]}
                    </Badge>
                    <Badge className={levelStyles[member.nivel]}>
                      {levelLabels[member.nivel]}
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      <Wallet className="h-3 w-3 mr-1" />
                      {member.puntos} vueltas
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{member.telefono || 'Sin teléfono'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>Registro: {formatDate(member.createdAt)}</span>
                    </div>
                    {member.acceptedAt && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span>Aceptado: {formatDate(member.acceptedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Acciones rápidas</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={member.status === 'active' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleStatusChange('active')}
                      disabled={saving || member.status === 'active'}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Activar
                    </Button>
                    <Button
                      variant={member.status === 'pending' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleStatusChange('pending')}
                      disabled={saving || member.status === 'pending'}
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      Pendiente
                    </Button>
                    <Button
                      variant={member.status === 'blocked' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleStatusChange('blocked')}
                      disabled={saving || member.status === 'blocked'}
                    >
                      <Ban className="h-4 w-4 mr-1" />
                      Bloquear
                    </Button>
                  </div>

                  <div className="pt-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Fuente</h3>
                    <Badge variant="outline">{member.source}</Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Estadísticas</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{ledger.length}</div>
                      <div className="text-gray-600">Movimientos</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{member.puntos}</div>
                      <div className="text-gray-600">Vueltas totales</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs de detalle */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="perfil">
                <User className="h-4 w-4 mr-2" />
                Perfil
              </TabsTrigger>
              <TabsTrigger value="puntos">
                <Activity className="h-4 w-4 mr-2" />
                Movimientos
              </TabsTrigger>
              <TabsTrigger value="configuracion">
                <Shield className="h-4 w-4 mr-2" />
                Configuración
              </TabsTrigger>
              <TabsTrigger value="historial">
                <Clock className="h-4 w-4 mr-2" />
                Historial
              </TabsTrigger>
            </TabsList>

            <TabsContent value="perfil" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Información personal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Nombre completo</Label>
                      <Input
                        value={member.nombre}
                        onChange={(e) => setMember({ ...member, nombre: e.target.value })}
                        placeholder="Nombre del miembro"
                      />
                    </div>
                    <div>
                      <Label>Teléfono</Label>
                      <Input
                        value={member.telefono}
                        onChange={(e) => setMember({ ...member, telefono: e.target.value })}
                        placeholder="+54 11 1234-5678"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Email</Label>
                    <Input value={member.email} disabled className="bg-gray-50" />
                  </div>

                  <div>
                    <Label>Notas internas</Label>
                    <Textarea
                      value={member.notes}
                      onChange={(e) => setMember({ ...member, notes: e.target.value })}
                      placeholder="Notas adicionales sobre este miembro..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="puntos">
              <Card>
                <CardHeader>
                  <CardTitle>Historial de vueltas</CardTitle>
                </CardHeader>
                <CardContent>
                  {ledger.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No hay movimientos registrados</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {ledger.map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{entry.description}</p>
                            <p className="text-sm text-gray-500">{formatDate(entry.createdAt)}</p>
                            <p className="text-xs text-gray-400">Por: {entry.createdBy}</p>
                          </div>
                          <Badge variant={entry.delta >= 0 ? 'default' : 'destructive'}>
                            {entry.delta >= 0 ? '+' : ''}{entry.delta}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="configuracion">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración avanzada</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Nivel actual</Label>
                      <p className="text-sm text-gray-500">Define el nivel de membresía manualmente</p>
                    </div>
                    <Select
                      value={member.nivel}
                      onValueChange={(value: ClubMember['nivel']) => setMember({ ...member, nivel: value })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="base">Base</SelectItem>
                        <SelectItem value="plus">Plus</SelectItem>
                        <SelectItem value="elite">Elite</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-nivelación</Label>
                      <p className="text-sm text-gray-500">Actualizar nivel automáticamente según vueltas</p>
                    </div>
                    <Switch
                      checked={member.autoLevel}
                      onCheckedChange={(checked) => setMember({ ...member, autoLevel: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Estado</Label>
                      <p className="text-sm text-gray-500">Estado actual de la membresía</p>
                    </div>
                    <Select
                      value={member.status}
                      onValueChange={(value: ClubMember['status']) => setMember({ ...member, status: value })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="active">Activo</SelectItem>
                        <SelectItem value="blocked">Bloqueado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="historial">
              <Card>
                <CardHeader>
                  <CardTitle>Historial completo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label>Fecha de registro</Label>
                        <p className="font-medium">{formatDate(member.createdAt)}</p>
                      </div>
                      <div>
                        <Label>Última actividad</Label>
                        <p className="font-medium">{formatDate(member.lastActivityAt) || 'Nunca'}</p>
                      </div>
                    </div>

                    {member.acceptedAt && (
                      <div>
                        <Label>Fecha de aceptación</Label>
                        <p className="font-medium">{formatDate(member.acceptedAt)}</p>
                      </div>
                    )}

                    {member.welcomeEmailSentAt && (
                      <div>
                        <Label>Email de bienvenida enviado</Label>
                        <p className="font-medium">{formatDate(member.welcomeEmailSentAt)}</p>
                      </div>
                    )}

                    {member.emailLastError && (
                      <div>
                        <Label>Último error de email</Label>
                        <p className="font-medium text-red-600">{member.emailLastError}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}