'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { ClubMember, ClubPointsLedgerEntry, ClubSettings } from '@/types';
import { recalcLevel } from '@/lib/club/levels';
import { addDoc, collection, doc, getDoc, getDocs, limit, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Loader2,
  Search,
  Mail,
  Save,
  RefreshCw,
  UserPlus,
  Crown,
  Users,
  Wallet,
  SlidersHorizontal,
  X,
  EyeOff,
  Edit3,
} from 'lucide-react';
import { toast } from 'sonner';

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

const emptySettings: ClubSettings = {
  signupBonusPoints: 10,
  plusFromPoints: 100,
  eliteFromPoints: 300,
  autoLevelEnabled: true,
  autoApproveSignup: false,
  emailFromName: 'Club Lado V',
  replyTo: '',
  commercialMessage: '',
};

const emptyCreateMember = {
  nombre: '',
  email: '',
  telefono: '',
  status: 'active',
  puntos: 0,
  nivel: 'base',
  sendWelcomeEmail: true,
};

type CreateMemberForm = typeof emptyCreateMember;

const toTimestampLike = (value: unknown): ClubMember['createdAt'] => {
  if (value && typeof value === 'object') {
    return value as ClubMember['createdAt'];
  }
  return new Date();
};

const toOptionalTimestampLike = (value: unknown): ClubMember['acceptedAt'] => {
  if (value && typeof value === 'object') {
    return value as ClubMember['acceptedAt'];
  }
  return undefined;
};

const toClubMember = (id: string, data: Record<string, unknown>): ClubMember => ({
  id,
  nombre: (data.nombre as string) || '',
  email: (data.email as string) || '',
  telefono: (data.telefono as string) || '',
  status: (data.status as ClubMember['status']) || 'lead',
  nivel: (data.nivel as ClubMember['nivel']) || 'base',
  puntos: typeof data.puntos === 'number' ? data.puntos : 0,
  autoLevel: typeof data.autoLevel === 'boolean' ? data.autoLevel : true,
  notes: (data.notes as string) || '',
  tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
  source: (data.source as ClubMember['source']) || 'landing',
  createdAt: toTimestampLike(data.createdAt),
  acceptedAt: toOptionalTimestampLike(data.acceptedAt),
  lastActivityAt: toOptionalTimestampLike(data.lastActivityAt),
  welcomeEmailSentAt: toOptionalTimestampLike(data.welcomeEmailSentAt),
  emailLastError: (data.emailLastError as string) || '',
});

const toLedgerEntry = (id: string, data: Record<string, unknown>): ClubPointsLedgerEntry => ({
  id,
  memberId: (data.memberId as string) || '',
  delta: typeof data.delta === 'number' ? data.delta : 0,
  reason: (data.reason as ClubPointsLedgerEntry['reason']) || 'other',
  description: (data.description as string) || '',
  createdAt: toTimestampLike(data.createdAt),
  createdBy: (data.createdBy as string) || 'system',
});

const createLedgerEntry = async (payload: {
  memberId: string;
  delta: number;
  reason: ClubPointsLedgerEntry['reason'];
  description: string;
  createdBy: string;
}) => {
  await addDoc(collection(db, 'club_points_ledger'), {
    memberId: payload.memberId,
    memberRef: `club_lado_v/${payload.memberId}`,
    delta: payload.delta,
    reason: payload.reason,
    description: payload.description,
    createdAt: serverTimestamp(),
    createdBy: payload.createdBy,
  });
};

export default function ClubAdminPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [settings, setSettings] = useState<ClubSettings>(emptySettings);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<ClubMember | null>(null);
  const [ledger, setLedger] = useState<ClubPointsLedgerEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [newMember, setNewMember] = useState<CreateMemberForm>(emptyCreateMember);
  const [activeTab, setActiveTab] = useState('operacion');

  const fetchMembers = async () => {
    const snapshot = await getDocs(query(collection(db, 'club_lado_v'), orderBy('createdAt', 'desc')));
    const mapped = snapshot.docs.map((item) => toClubMember(item.id, item.data() as Record<string, unknown>));
    setMembers(mapped);
  };

  const fetchSettings = async () => {
    const snapshot = await getDoc(doc(db, 'club_settings', 'global'));
    if (!snapshot.exists()) {
      setSettings(emptySettings);
      return;
    }
    setSettings({
      ...emptySettings,
      ...(snapshot.data() as Partial<ClubSettings>),
    });
  };

  const fetchDetail = async (memberId: string) => {
    const memberSnapshot = await getDoc(doc(db, 'club_lado_v', memberId));
    if (!memberSnapshot.exists()) {
      setSelectedMember(null);
      setLedger([]);
      return;
    }

    const ledgerSnapshot = await getDocs(
      query(
        collection(db, 'club_points_ledger'),
        where('memberId', '==', memberId),
        orderBy('createdAt', 'desc'),
        limit(50)
      )
    );

    setSelectedMember(toClubMember(memberSnapshot.id, memberSnapshot.data() as Record<string, unknown>));
    setLedger(ledgerSnapshot.docs.map((item) => toLedgerEntry(item.id, item.data() as Record<string, unknown>)));
  };

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchMembers(), fetchSettings()]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No pudimos cargar Club Lado V');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    loadInitialData();
  }, [authLoading, user]);

  useEffect(() => {
    if (!selectedMemberId) {
      setSelectedMember(null);
      setLedger([]);
      return;
    }
    fetchDetail(selectedMemberId).catch((error) => {
      toast.error(error instanceof Error ? error.message : 'No pudimos cargar el detalle del miembro');
    });
  }, [selectedMemberId]);

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const search = searchTerm.trim().toLowerCase();
      const passesSearch =
        !search ||
        member.nombre.toLowerCase().includes(search) ||
        member.email.toLowerCase().includes(search) ||
        member.telefono.toLowerCase().includes(search);
      const passesStatus = statusFilter === 'all' || member.status === statusFilter;
      const passesLevel = levelFilter === 'all' || member.nivel === levelFilter;
      return passesSearch && passesStatus && passesLevel;
    });
  }, [members, searchTerm, statusFilter, levelFilter]);

  const stats = useMemo(() => {
    const total = members.length;
    const active = members.filter((member) => member.status === 'active').length;
    const pending = members.filter((member) => member.status === 'pending').length;
    const blocked = members.filter((member) => member.status === 'blocked').length;
    const points = members.reduce((acc, member) => acc + (member.puntos || 0), 0);
    return { total, active, pending, blocked, points };
  }, [members]);

  const handleCreateMember = async () => {
    setSaving(true);
    try {
      const actor = user?.email || user?.uid || 'admin';
      const emailLower = newMember.email.trim().toLowerCase();
      const existingSnapshot = await getDocs(
        query(collection(db, 'club_lado_v'), where('emailLower', '==', emailLower), limit(1))
      );
      const existingDoc = existingSnapshot.docs[0];
      const memberRef = existingDoc ? doc(db, 'club_lado_v', existingDoc.id) : doc(collection(db, 'club_lado_v'));

      if (!existingDoc) {
        await setDoc(memberRef, {
          nombre: newMember.nombre.trim(),
          email: newMember.email.trim(),
          emailLower,
          telefono: newMember.telefono.trim(),
          mensaje: '',
          status: 'pending',
          source: 'admin',
          createdAt: serverTimestamp(),
          fechaCreacion: serverTimestamp(),
          tipo: 'club',
          leida: false,
        });
      }

      await setDoc(
        memberRef,
        {
          nombre: newMember.nombre.trim(),
          email: newMember.email.trim(),
          emailLower,
          telefono: newMember.telefono.trim(),
          status: newMember.status,
          puntos: Number(newMember.puntos),
          nivel: newMember.nivel,
          source: 'admin',
          tipo: 'club',
          leida: false,
          acceptedAt: newMember.status === 'active' ? serverTimestamp() : null,
          lastActivityAt: serverTimestamp(),
        },
        { merge: true }
      );

      if (Number(newMember.puntos) !== 0) {
        await createLedgerEntry({
          memberId: memberRef.id,
          delta: Number(newMember.puntos),
          reason: 'admin_adjustment',
          description: existingDoc ? 'Actualización manual desde admin' : 'Alta manual desde admin',
          createdBy: actor,
        });
      }

      toast.success('Miembro creado correctamente');
      setNewMember(emptyCreateMember);
      await fetchMembers();
      setActiveTab('operacion');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No pudimos crear el miembro');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await setDoc(
        doc(db, 'club_settings', 'global'),
        {
          ...settings,
          signupBonusPoints: Number(settings.signupBonusPoints),
          plusFromPoints: Number(settings.plusFromPoints),
          eliteFromPoints: Number(settings.eliteFromPoints),
          updatedAt: serverTimestamp(),
          updatedBy: user?.email || user?.uid || 'admin',
        },
        { merge: true }
      );
      toast.success('Configuración guardada');
      await fetchSettings();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No pudimos guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setLevelFilter('all');
  };

  const handleCardDoubleClick = (memberId: string) => {
    if (selectedMemberId === memberId) {
      setSelectedMemberId(null);
      return;
    }
    setSelectedMemberId(memberId);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AdminLayout>
          <div className="flex items-center justify-center h-72">
            <Loader2 className="h-12 w-12 animate-spin text-gray-900" />
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6 pb-8">
          <Card className="border border-primary/10 bg-linear-to-r from-primary to-primary/90 text-white overflow-hidden">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide">
                    <Crown className="h-3.5 w-3.5 text-secondary" />
                    Club Lado V
                  </p>
                  <h1 className="mt-3 text-2xl font-bold">Panel de membresía</h1>
                  <p className="mt-1 text-sm text-white/80">
                    Gestión completa de socios, niveles, vueltas y comunicación.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                  onClick={loadInitialData}
                  disabled={saving}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Actualizar datos
                </Button>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <div className="rounded-xl bg-white/10 px-4 py-3">
                  <p className="text-xs text-white/70">Miembros totales</p>
                  <p className="text-xl font-semibold">{stats.total}</p>
                </div>
                <div className="rounded-xl bg-white/10 px-4 py-3">
                  <p className="text-xs text-white/70">Activos</p>
                  <p className="text-xl font-semibold">{stats.active}</p>
                </div>
                <div className="rounded-xl bg-white/10 px-4 py-3">
                  <p className="text-xs text-white/70">Pendientes</p>
                  <p className="text-xl font-semibold">{stats.pending}</p>
                </div>
                <div className="rounded-xl bg-white/10 px-4 py-3">
                  <p className="text-xs text-white/70">Bloqueados</p>
                  <p className="text-xl font-semibold">{stats.blocked}</p>
                </div>
                <div className="rounded-xl bg-white/10 px-4 py-3">
                  <p className="text-xs text-white/70">Vueltas acumuladas</p>
                  <p className="text-xl font-semibold">{stats.points}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-auto w-full justify-start rounded-xl bg-white border p-1.5">
              <TabsTrigger value="operacion" className="flex-1 md:flex-none">
                <Users className="h-4 w-4" />
                Operación
              </TabsTrigger>
              <TabsTrigger value="configuracion" className="flex-1 md:flex-none">
                <SlidersHorizontal className="h-4 w-4" />
                Configuración
              </TabsTrigger>
              <TabsTrigger value="alta" className="flex-1 md:flex-none">
                <UserPlus className="h-4 w-4" />
                Alta manual
              </TabsTrigger>
            </TabsList>

            <TabsContent value="operacion" className="mt-4">
              <div className="grid gap-5 xl:grid-cols-[1.05fr_1.35fr]">
                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader className="space-y-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Miembros</CardTitle>
                      <Badge variant="outline">{filteredMembers.length} resultados</Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      Doble click en una card para abrir el detalle y repetí doble click para cerrarlo.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                      <div className="relative md:col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          className="pl-9"
                          placeholder="Buscar por nombre, email o teléfono"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos estados</SelectItem>
                          <SelectItem value="lead">Lead</SelectItem>
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="active">Activo</SelectItem>
                          <SelectItem value="blocked">Bloqueado</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={levelFilter} onValueChange={setLevelFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Nivel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos niveles</SelectItem>
                          <SelectItem value="base">Base</SelectItem>
                          <SelectItem value="plus">Plus</SelectItem>
                          <SelectItem value="elite">Elite</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end">
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        Limpiar filtros
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 max-h-[680px] overflow-y-auto">
                    {filteredMembers.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
                        <p className="text-sm text-gray-600">No encontramos miembros con ese filtro.</p>
                      </div>
                    ) : (
                      filteredMembers.map((member) => (
                        <button
                          type="button"
                          key={member.id}
                          onClick={() => setSelectedMemberId(member.id)}
                          onDoubleClick={() => handleCardDoubleClick(member.id)}
                          className={`w-full text-left rounded-xl border px-3 py-3 transition ${
                            selectedMemberId === member.id
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium text-sm text-gray-900">{member.nombre || member.email}</p>
                            <Badge className={statusStyles[member.status]}>{statusLabels[member.status]}</Badge>
                          </div>
                          <div className="text-xs text-gray-600 mt-2 space-y-1">
                            <p className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {member.email}
                            </p>
                            <p>{member.telefono || 'Sin teléfono'}</p>
                            <div className="flex items-center gap-2 pt-1">
                              <Badge className={levelStyles[member.nivel]}>{levelLabels[member.nivel]}</Badge>
                              <span className="font-semibold">{member.puntos} Vueltas</span>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-sm">Detalle del miembro</CardTitle>
                      {selectedMember && (
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => router.push(`/admin/club/${selectedMember.id}`)}
                          >
                            <Edit3 className="mr-2 h-4 w-4" />
                            Editar
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedMemberId(null)}>
                            <EyeOff className="mr-2 h-4 w-4" />
                            Cerrar
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {!selectedMember ? (
                      <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center">
                        <p className="text-sm text-gray-600">Seleccioná un miembro para ver y editar su información.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-gray-900">{selectedMember.nombre || selectedMember.email}</p>
                            <Badge className={statusStyles[selectedMember.status]}>{statusLabels[selectedMember.status]}</Badge>
                            <Badge className={levelStyles[selectedMember.nivel]}>{levelLabels[selectedMember.nivel]}</Badge>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">{selectedMember.email}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label>Nombre</Label>
                            <Input
                              value={selectedMember.nombre || ''}
                              onChange={(e) =>
                                setSelectedMember((prev) => (prev ? { ...prev, nombre: e.target.value } : prev))
                              }
                            />
                          </div>
                          <div>
                            <Label>Teléfono</Label>
                            <Input
                              value={selectedMember.telefono || ''}
                              onChange={(e) =>
                                setSelectedMember((prev) => (prev ? { ...prev, telefono: e.target.value } : prev))
                              }
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <Label>Estado</Label>
                            <Select
                              value={selectedMember.status}
                              onValueChange={(value) =>
                                setSelectedMember((prev) =>
                                  prev ? { ...prev, status: value as ClubMember['status'] } : prev
                                )
                              }
                            >
                              <SelectTrigger>
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
                          <div>
                            <Label>Nivel</Label>
                            <Select
                              value={selectedMember.nivel}
                              onValueChange={(value) =>
                                setSelectedMember((prev) => (prev ? { ...prev, nivel: value as ClubMember['nivel'] } : prev))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="base">Base</SelectItem>
                                <SelectItem value="plus">Plus</SelectItem>
                                <SelectItem value="elite">Elite</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="rounded-md border px-3 py-2 text-sm flex items-center gap-2">
                            <Wallet className="h-4 w-4 text-primary" />
                            <div>
                              <p className="text-gray-500">Vueltas actuales</p>
                              <p className="font-semibold text-gray-900">{selectedMember.puntos}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Notas internas</Label>
                          <div className="min-h-[90px] rounded-md border border-gray-200 bg-gray-50/50 p-3 text-sm">
                            {selectedMember.notes || 'Sin notas'}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Tags</Label>
                          <div className="flex flex-wrap gap-1">
                            {(selectedMember.tags || []).length > 0 ? (
                              (selectedMember.tags || []).map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                                >
                                  {tag}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-gray-500">Sin tags</span>
                            )}
                          </div>
                        </div>

                        <div className="rounded-xl border p-3 bg-gray-50/50">
                          <p className="text-sm font-medium mb-2">Sistema de Vueltas</p>
                          <div className="text-sm text-gray-600">
                            Para ajustes de puntos y otras acciones, utilice la página de edición completa.
                          </div>
                        </div>

                        <div className="rounded-xl border p-3">
                          <p className="text-sm font-medium mb-2">Historial de puntos</p>
                          <div className="space-y-2 max-h-52 overflow-y-auto">
                            {ledger.length === 0 ? (
                              <p className="text-xs text-gray-500">Sin movimientos.</p>
                            ) : (
                              ledger.map((entry) => (
                                <div key={entry.id} className="text-xs border rounded-md p-2 bg-white">
                                  <p className="font-medium">
                                    {entry.delta > 0 ? '+' : ''}
                                    {entry.delta} · {entry.reason}
                                  </p>
                                  <p className="text-gray-600">{entry.description}</p>
                                  <p className="text-gray-500">
                                    {formatDate(entry.createdAt)} · {entry.createdBy}
                                  </p>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-500">
                          <p>Alta: {formatDate(selectedMember.createdAt)}</p>
                          <p>Última actividad: {formatDate(selectedMember.lastActivityAt)}</p>
                          <p>Aceptado: {formatDate(selectedMember.acceptedAt)}</p>
                          <p>Email enviado: {formatDate(selectedMember.welcomeEmailSentAt)}</p>
                          <p className="md:col-span-2">Error email: {selectedMember.emailLastError || '—'}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="configuracion" className="mt-4">
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm">Configuración de sistema</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  <div>
                    <Label>Bonus por registro</Label>
                    <Input
                      type="number"
                      value={settings.signupBonusPoints}
                      onChange={(e) => setSettings((prev) => ({ ...prev, signupBonusPoints: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label>Nivel Plus desde</Label>
                    <Input
                      type="number"
                      value={settings.plusFromPoints}
                      onChange={(e) => setSettings((prev) => ({ ...prev, plusFromPoints: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label>Nivel Elite desde</Label>
                    <Input
                      type="number"
                      value={settings.eliteFromPoints}
                      onChange={(e) => setSettings((prev) => ({ ...prev, eliteFromPoints: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border rounded-md px-3 py-2">
                      <Label htmlFor="autoLevelEnabled">Autonivel</Label>
                      <Switch
                        id="autoLevelEnabled"
                        checked={settings.autoLevelEnabled}
                        onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, autoLevelEnabled: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between border rounded-md px-3 py-2">
                      <Label htmlFor="autoApproveSignup">Auto aprobación</Label>
                      <Switch
                        id="autoApproveSignup"
                        checked={settings.autoApproveSignup}
                        onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, autoApproveSignup: checked }))}
                      />
                    </div>
                  </div>
                  <div className="lg:col-span-2">
                    <Label>Nombre remitente email</Label>
                    <Input
                      value={settings.emailFromName || ''}
                      onChange={(e) => setSettings((prev) => ({ ...prev, emailFromName: e.target.value }))}
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <Label>Reply-To</Label>
                    <Input
                      value={settings.replyTo || ''}
                      onChange={(e) => setSettings((prev) => ({ ...prev, replyTo: e.target.value }))}
                    />
                  </div>
                  <div className="lg:col-span-4">
                    <Label>Mensaje comercial</Label>
                    <Textarea
                      value={settings.commercialMessage || ''}
                      onChange={(e) => setSettings((prev) => ({ ...prev, commercialMessage: e.target.value }))}
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="lg:col-span-4">
                    <Button onClick={handleSaveSettings} disabled={saving}>
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Guardar configuración
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alta" className="mt-4">
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm">Agregar miembro manual</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 lg:grid-cols-6 gap-3">
                  <Input
                    placeholder="Nombre"
                    value={newMember.nombre}
                    onChange={(e) => setNewMember((prev) => ({ ...prev, nombre: e.target.value }))}
                  />
                  <Input
                    placeholder="Email"
                    value={newMember.email}
                    onChange={(e) => setNewMember((prev) => ({ ...prev, email: e.target.value }))}
                  />
                  <Input
                    placeholder="Teléfono"
                    value={newMember.telefono}
                    onChange={(e) => setNewMember((prev) => ({ ...prev, telefono: e.target.value }))}
                  />
                  <Input
                    type="number"
                    placeholder="Puntos iniciales"
                    value={newMember.puntos}
                    onChange={(e) => setNewMember((prev) => ({ ...prev, puntos: Number(e.target.value) }))}
                  />
                  <Select
                    value={newMember.status}
                    onValueChange={(value) => setNewMember((prev) => ({ ...prev, status: value as CreateMemberForm['status'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="blocked">Bloqueado</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={newMember.nivel}
                    onValueChange={(value) => setNewMember((prev) => ({ ...prev, nivel: value as CreateMemberForm['nivel'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="base">Base</SelectItem>
                      <SelectItem value="plus">Plus</SelectItem>
                      <SelectItem value="elite">Elite</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="lg:col-span-6 flex items-center gap-3">
                    <Switch
                      id="sendWelcomeEmail"
                      checked={newMember.sendWelcomeEmail}
                      onCheckedChange={(checked) => setNewMember((prev) => ({ ...prev, sendWelcomeEmail: checked }))}
                    />
                    <Label htmlFor="sendWelcomeEmail">Enviar email de bienvenida</Label>
                  </div>
                  <div className="lg:col-span-6">
                    <Button onClick={handleCreateMember} disabled={saving}>
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                      Crear miembro
                    </Button>
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
