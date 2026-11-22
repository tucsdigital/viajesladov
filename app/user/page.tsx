'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, limit, orderBy, query, setDoc, Timestamp, where } from 'firebase/firestore';
import { getAuthInstance, db } from '@/lib/firebase';
import { Cliente, ClubMember, ClubPointsLedgerEntry, ClubSettings } from '@/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Crown, Flag, Gauge, Mail, MapPin, Phone, ShieldCheck, User, Users } from 'lucide-react';
import { RaceProgressCard } from '@/components/RaceProgressCard';

export const dynamic = 'force-dynamic';

const defaultClubSettings: ClubSettings = {
  signupBonusPoints: 10,
  plusFromPoints: 100,
  eliteFromPoints: 300,
  autoLevelEnabled: true,
  autoApproveSignup: false,
  emailFromName: 'Club Lado V',
  replyTo: '',
  commercialMessage: '',
};

const levelLabels: Record<ClubMember['nivel'], string> = {
  base: 'Base',
  plus: 'Plus',
  elite: 'Elite',
};

const statusLabels: Record<ClubMember['status'], string> = {
  lead: 'Lead',
  pending: 'Pendiente',
  active: 'Activo',
  blocked: 'Bloqueado',
};

const levelBadgeStyles: Record<ClubMember['nivel'], string> = {
  base: 'bg-amber-50 text-amber-700 border-amber-200',
  plus: 'bg-sky-50 text-sky-700 border-sky-200',
  elite: 'bg-violet-50 text-violet-700 border-violet-200',
};

const statusBadgeStyles: Record<ClubMember['status'], string> = {
  lead: 'bg-gray-50 text-gray-700 border-gray-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  blocked: 'bg-rose-50 text-rose-700 border-rose-200',
};

const reasonLabels: Record<string, string> = {
  signup_bonus: 'Bono por registro',
  manual_adjustment: 'Ajuste manual',
  purchase_trip: 'Compra de viaje',
  referral_bonus: 'Bono por referido',
  other: 'Movimiento',
};

const humanize = (s: string) => s.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

const normalizeText = (s?: string) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const dedupeTitle = (label: string, description?: string) => {
  if (!description) return { title: label, subtitle: undefined as string | undefined };
  const nLabel = normalizeText(label);
  const nDesc = normalizeText(description);
  if (!nDesc) return { title: label, subtitle: undefined as string | undefined };
  // Si son iguales o uno contiene al otro, mostramos solo el más descriptivo (description)
  if (nLabel === nDesc || nDesc.startsWith(nLabel) || nLabel.startsWith(nDesc)) {
    return { title: description, subtitle: undefined as string | undefined };
  }
  return { title: label, subtitle: description };
};

const formatDateShort = (value?: unknown) => {
  if (!value) return '—';
  const toDate = () => {
    if (typeof value === 'object' && value !== null && 'seconds' in value) {
      const ts = value as { seconds: number };
      return new Date(ts.seconds * 1000);
    }
    if (typeof value === 'object' && value !== null && 'toDate' in value) {
      return (value as { toDate: () => Date }).toDate();
    }
    return new Date(value as string);
  };
  const d = toDate();
  const day = `${d.getDate()}`.padStart(2, '0');
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const mon = months[d.getMonth()];
  const year = d.getFullYear();
  const hh = `${d.getHours()}`.padStart(2, '0');
  const mm = `${d.getMinutes()}`.padStart(2, '0');
  return `${day} ${mon} ${year} · ${hh}:${mm}`;
};

const formatDate = (value?: unknown) => {
  if (!value) return '—';
  if (typeof value === 'object' && value !== null && 'seconds' in value) {
    const ts = value as { seconds: number };
    return new Date(ts.seconds * 1000).toLocaleString('es-AR');
  }
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    return (value as { toDate: () => Date }).toDate().toLocaleString('es-AR');
  }
  return new Date(value as string).toLocaleString('es-AR');
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
  createdAt: (data.createdAt as ClubMember['createdAt']) || new Date(),
  acceptedAt: data.acceptedAt as ClubMember['acceptedAt'],
  lastActivityAt: data.lastActivityAt as ClubMember['lastActivityAt'],
  welcomeEmailSentAt: data.welcomeEmailSentAt as ClubMember['welcomeEmailSentAt'],
  emailLastError: (data.emailLastError as string) || '',
});

const toLedgerEntry = (id: string, data: Record<string, unknown>): ClubPointsLedgerEntry => ({
  id,
  memberId: (data.memberId as string) || '',
  delta: typeof data.delta === 'number' ? data.delta : 0,
  reason: (data.reason as ClubPointsLedgerEntry['reason']) || 'other',
  description: (data.description as string) || '',
  createdAt: (data.createdAt as ClubPointsLedgerEntry['createdAt']) || new Date(),
  createdBy: (data.createdBy as string) || 'system',
});

export default function UserProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cliente, setCliente] = useState<Partial<Cliente>>({});
  const [clubLoading, setClubLoading] = useState(true);
  const [clubMember, setClubMember] = useState<ClubMember | null>(null);
  const [clubLedger, setClubLedger] = useState<ClubPointsLedgerEntry[]>([]);
  const [clubSettings, setClubSettings] = useState<ClubSettings>(defaultClubSettings);
  const router = useRouter();

  const loadClubData = async (email: string) => {
    setClubLoading(true);
    try {
      const emailLower = email.trim().toLowerCase();
      const memberSnapshot = await getDocs(
        query(collection(db, 'club_lado_v'), where('emailLower', '==', emailLower), limit(1))
      );
      if (memberSnapshot.empty) {
        setClubMember(null);
        setClubLedger([]);
        return;
      }

      const memberDoc = memberSnapshot.docs[0];
      const member = toClubMember(memberDoc.id, memberDoc.data() as Record<string, unknown>);
      setClubMember(member);

      const [settingsSnapshot, ledgerSnapshot] = await Promise.all([
        getDoc(doc(db, 'club_settings', 'global')),
        getDocs(
          query(
            collection(db, 'club_points_ledger'),
            where('memberId', '==', memberDoc.id),
            orderBy('createdAt', 'desc'),
            limit(5)
          )
        ),
      ]);

      if (settingsSnapshot.exists()) {
        setClubSettings({
          ...defaultClubSettings,
          ...(settingsSnapshot.data() as Partial<ClubSettings>),
        });
      } else {
        setClubSettings(defaultClubSettings);
      }

      setClubLedger(ledgerSnapshot.docs.map((item) => toLedgerEntry(item.id, item.data() as Record<string, unknown>)));
    } catch (error) {
      setClubMember(null);
      setClubLedger([]);
      toast.error(error instanceof Error ? error.message : 'No se pudo cargar tu información de Club');
    } finally {
      setClubLoading(false);
    }
  };

  useEffect(() => {
    const auth = getAuthInstance();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace('/login');
        return;
      }
      try {
        const ref = doc(db, 'clientes', user.uid);
        const snapshot = await getDoc(ref);
        if (snapshot.exists()) {
          const data = snapshot.data() as Cliente;
          setCliente({ ...data, id: user.uid });
        } else {
          setCliente({
            id: user.uid,
            email: user.email || '',
            nombre: user.displayName?.split(' ')[0],
            apellido: user.displayName?.split(' ').slice(1).join(' '),
          });
        }
        if (user.email) {
          await loadClubData(user.email);
        } else {
          setClubLoading(false);
        }
      } catch (error) {
        console.error('Error fetching cliente:', error);
        toast.error('No se pudo cargar tu perfil');
        setClubLoading(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente.id || !cliente.email) return;
    setSaving(true);
    try {
      const ref = doc(db, 'clientes', cliente.id);
      const nombreCompleto = [cliente.nombre, cliente.apellido].filter(Boolean).join(' ').trim();
      await setDoc(
        ref,
        {
          ...cliente,
          nombreCompleto: nombreCompleto || cliente.nombreCompleto,
          updatedAt: Timestamp.now(),
          createdAt: cliente.createdAt || Timestamp.now(),
        },
        { merge: true }
      );
      toast.success('Perfil actualizado');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(getAuthInstance());
      router.replace('/login');
    } catch (error) {
      console.error('Error logout:', error);
    }
  };

  const raceProgress = useMemo(() => {
    if (!clubMember) return 0;
    const maxPoints = Math.max(Number(clubSettings.eliteFromPoints) || 1, 1);
    return Math.min(100, Math.max(0, (clubMember.puntos / maxPoints) * 100));
  }, [clubMember, clubSettings.eliteFromPoints]);

  const carPosition = useMemo(() => {
    return Math.max(4, Math.min(94, raceProgress));
  }, [raceProgress]);

  const nextObjective = useMemo(() => {
    if (!clubMember) return null;
    if (clubMember.nivel === 'base') {
      const goal = Number(clubSettings.plusFromPoints) || 0;
      const laps = Math.max(0, goal - clubMember.puntos);
      return {
        text: `Te faltan ${laps} vueltas para llegar a Plus`,
        laps,
      };
    }
    if (clubMember.nivel === 'plus') {
      const goal = Number(clubSettings.eliteFromPoints) || 0;
      const laps = Math.max(0, goal - clubMember.puntos);
      return {
        text: `Te faltan ${laps} vueltas para llegar a Elite`,
        laps,
      };
    }
    return {
      text: 'Ya llegaste a Elite, estás en la vuelta final',
      laps: 0,
    };
  }, [clubMember, clubSettings.plusFromPoints, clubSettings.eliteFromPoints]);

  if (loading) {
    return (
      <>
        <Navbar transparent />
        <WhatsAppButton />
        <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
          <div className="text-gray-600">Cargando...</div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <WhatsAppButton />
      <section className="min-h-screen bg-[#F9FAFB] pt-24 pb-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-r from-primary/5 via-transparent to-secondary/10" />
              <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg">
                    {cliente.photoURL ? (
                      <img src={cliente.photoURL} alt="Usuario" className="h-14 w-14 rounded-2xl object-cover" />
                    ) : (
                      <User className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <h1 className="text-lg md:text-xl font-bold text-gray-900">Mi perfil</h1>
                    <p className="text-xs text-gray-600">Actualizá tus datos para consultas más rápidas.</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-xs">
                    <ShieldCheck className="h-4 w-4 mr-1" />
                    Datos protegidos
                  </Badge>
                  {cliente.cantidadPersonas && (
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-xs">
                      <Users className="h-4 w-4 mr-1" />
                      {cliente.cantidadPersonas} persona{cliente.cantidadPersonas > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <Card className="relative overflow-hidden border border-yellow-400/20 rounded-3xl shadow-[0_0_40px_rgba(250,204,21,0.18)] bg-gradient-to-br from-gray-950 via-gray-900 to-black">
                <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle className="text-sm md:text-base text-white">Club Lado V</CardTitle>
                    <p className="mt-1 text-[11px] text-white/70">
                      Tu panel de telemetría F1 dentro del club.
                    </p>
                  </div>
                  {clubMember && (
                    <div className="flex flex-wrap items-center gap-2 justify-end">
                      <Badge className={statusBadgeStyles[clubMember.status]}>{statusLabels[clubMember.status]}</Badge>
                      <Badge className={levelBadgeStyles[clubMember.nivel]}>{levelLabels[clubMember.nivel]}</Badge>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="text-xs text-white/80 space-y-4">
                  {clubLoading ? (
                    <p>Cargando estado de tu membresía...</p>
                  ) : !clubMember ? (
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-1 max-w-md">
                        <p className="text-[13px] text-white/90">
                          Sumate al Club Lado V y llevá el control de tus vueltas, beneficios y nivel.
                        </p>
                        <p className="text-[11px] text-white/70">
                          Ideal para fanáticos de la F1 y viajeros frecuentes.
                        </p>
                      </div>
                      <Button asChild className="w-full md:w-auto h-9 text-xs bg-secondary text-primary hover:bg-secondary/90">
                        <a href="/club-ladov">Quiero sumarme al Club</a>
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
                      <div className="space-y-3">
                        <RaceProgressCard 
                          progress={raceProgress} 
                          currentLevel={clubMember.nivel}
                          lapsToNext={nextObjective?.laps}
                        />
                      </div>
                      <div className="space-y-3">
                        <div className="rounded-2xl border border-white/20 bg-white/5 p-3">
                          <div className="flex items-center justify-between text-white">
                            <p className="flex items-center gap-1 text-xs">
                              <Gauge className="h-3.5 w-3.5" />
                              Vueltas acumuladas
                            </p>
                            <p className="font-semibold text-sm">{clubMember.puntos}</p>
                          </div>
                          <p className="mt-1 text-[11px] text-white/80">{nextObjective?.text}</p>
                        </div>
                        <div className="rounded-2xl border border-white/15 bg-white/5 p-3">
                          <p className="text-xs font-medium text-white">Últimos movimientos</p>
                          <div className="mt-2 space-y-2 max-h-44 overflow-y-auto pr-1">
                            {clubLedger.length === 0 ? (
                              <p className="text-[11px] text-white/70">Todavía no hay movimientos de vueltas.</p>
                            ) : (
                              clubLedger.map((entry) => {
                                const positive = entry.delta > 0;
                                const deltaText = `${positive ? '+' : ''}${entry.delta} vueltas`;
                                const label = reasonLabels[entry.reason] || humanize(entry.reason);
                                const rawDescription = entry.description || '';
                                const { title, subtitle } = dedupeTitle(label, rawDescription);
                                return (
                                  <div
                                    key={entry.id}
                                    className="rounded-xl border border-white/12 bg-black/10 px-3 py-2.5"
                                  >
                                    <div className="grid grid-cols-[auto,1fr,auto] items-center gap-3 md:gap-4">
                                      <span
                                        className={`inline-flex h-6 items-center rounded-full px-2 text-[11px] font-semibold whitespace-nowrap ${
                                          positive
                                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30'
                                            : 'bg-rose-500/15 text-rose-300 border border-rose-400/30'
                                        }`}
                                      >
                                        {deltaText}
                                      </span>
                                      <div className="min-w-0">
                                        <p className="text-xs font-semibold text-white leading-snug truncate md:whitespace-normal">
                                          {title}
                                        </p>
                                        {subtitle && (
                                          <p className="mt-0.5 text-[11px] text-white/70 leading-snug truncate md:whitespace-normal">
                                            {subtitle}
                                          </p>
                                        )}
                                      </div>
                                      <span className="hidden sm:block ml-3 shrink-0 text-[11px] text-white/60 whitespace-nowrap">
                                        {formatDateShort(entry.createdAt)}
                                      </span>
                                    </div>
                                    <div className="sm:hidden mt-1.5 text-[11px] text-white/60">
                                      {formatDateShort(entry.createdAt)}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)] gap-6">
                <Card className="border border-gray-200/80 rounded-3xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-sm md:text-base">Datos personales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSave} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="nombre" className="text-xs">Nombre</Label>
                          <Input
                            id="nombre"
                            value={cliente.nombre || ''}
                            onChange={(e) => setCliente((prev) => ({ ...prev, nombre: e.target.value }))}
                            placeholder="Ej: Juan"
                            className="h-9 rounded-xl border-gray-200 bg-gray-50/70 text-xs"
                          />
                        </div>
                        <div>
                          <Label htmlFor="apellido" className="text-xs">Apellido</Label>
                          <Input
                            id="apellido"
                            value={cliente.apellido || ''}
                            onChange={(e) => setCliente((prev) => ({ ...prev, apellido: e.target.value }))}
                            placeholder="Ej: Pérez"
                            className="h-9 rounded-xl border-gray-200 bg-gray-50/70 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="email" className="text-xs">Email</Label>
                          <Input id="email" value={cliente.email || ''} disabled className="h-9 rounded-xl text-xs" />
                        </div>
                        <div>
                          <Label htmlFor="telefono" className="text-xs">Teléfono</Label>
                          <Input
                            id="telefono"
                            value={cliente.telefono || ''}
                            onChange={(e) => setCliente((prev) => ({ ...prev, telefono: e.target.value }))}
                            placeholder="+54 9 351 1234567"
                            className="h-9 rounded-xl border-gray-200 bg-gray-50/70 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="ciudad" className="text-xs">Ciudad</Label>
                          <Input
                            id="ciudad"
                            value={cliente.ciudad || ''}
                            onChange={(e) => setCliente((prev) => ({ ...prev, ciudad: e.target.value }))}
                            placeholder="Córdoba"
                            className="h-9 rounded-xl border-gray-200 bg-gray-50/70 text-xs"
                          />
                        </div>
                        <div>
                          <Label htmlFor="codigoPostal" className="text-xs">Código postal</Label>
                          <Input
                            id="codigoPostal"
                            value={cliente.codigoPostal || ''}
                            onChange={(e) => setCliente((prev) => ({ ...prev, codigoPostal: e.target.value }))}
                            placeholder="X5000"
                            className="h-9 rounded-xl border-gray-200 bg-gray-50/70 text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="cantidadPersonas" className="text-xs">Cantidad de personas</Label>
                        <Input
                          id="cantidadPersonas"
                          type="number"
                          value={cliente.cantidadPersonas ?? ''}
                          onChange={(e) =>
                            setCliente((prev) => ({
                              ...prev,
                              cantidadPersonas: e.target.value ? Number(e.target.value) : undefined,
                            }))
                          }
                          placeholder="1"
                          min={1}
                          max={10}
                          className="h-9 rounded-xl border-gray-200 bg-gray-50/70 text-xs"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button type="submit" disabled={saving} className="sm:flex-1 h-9 text-xs bg-secondary text-primary hover:bg-secondary/90">
                          {saving ? 'Guardando...' : 'Guardar cambios'}
                        </Button>
                        <Button type="button" variant="outline" onClick={handleLogout} className="sm:flex-1 h-9 text-xs">
                          Cerrar sesión
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <Card className="border border-gray-200/80 rounded-3xl shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-sm md:text-base">Resumen</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{cliente.email || 'Sin email'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{cliente.telefono || 'Sin teléfono'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{[cliente.ciudad, cliente.codigoPostal].filter(Boolean).join(' · ') || 'Sin ubicación'}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
