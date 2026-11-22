import 'server-only';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { ClubMember, ClubPointsReason, ClubSettings, ClubStatus } from '@/types';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { recalcLevel } from '@/lib/club/levels';
import { getClubSettings } from '@/lib/club/settings';
import { sendClubWelcomeEmail } from '@/lib/club/email';

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const toClubMember = (id: string, data: FirebaseFirestore.DocumentData): ClubMember => ({
  id,
  nombre: data.nombre || '',
  email: data.email || '',
  telefono: data.telefono || '',
  mensaje: data.mensaje,
  status: data.status || 'lead',
  puntos: data.puntos || 0,
  nivel: data.nivel || 'base',
  source: data.source || 'landing',
  tags: data.tags || [],
  notes: data.notes,
  memberId: data.memberId,
  autoLevel: data.autoLevel,
  createdAt: data.createdAt || data.fechaCreacion || Timestamp.now(),
  lastActivityAt: data.lastActivityAt,
  acceptedAt: data.acceptedAt,
  welcomeEmailSentAt: data.welcomeEmailSentAt,
  emailLastError: data.emailLastError,
});

const getMembersCollection = () => getAdminDb().collection('club_lado_v');
const getLedgerCollection = () => getAdminDb().collection('club_points_ledger');

const resolveStatusOnSignup = (current: ClubStatus, settings: ClubSettings): ClubStatus => {
  if (current === 'blocked') return current;
  return settings.autoApproveSignup ? 'active' : 'pending';
};

const findMemberByEmail = async (email: string) => {
  const emailLower = normalizeEmail(email);
  const snapshot = await getMembersCollection()
    .where('emailLower', '==', emailLower)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return toClubMember(doc.id, doc.data());
};

const createLedgerEntry = async ({
  memberId,
  delta,
  reason,
  description,
  createdBy,
  metadata,
}: {
  memberId: string;
  delta: number;
  reason: ClubPointsReason;
  description: string;
  createdBy: string;
  metadata?: Record<string, unknown>;
}) => {
  await getLedgerCollection().add({
    memberId,
    memberRef: `club_lado_v/${memberId}`,
    delta,
    reason,
    description,
    createdAt: Timestamp.now(),
    createdBy,
    metadata: metadata || null,
  });
};

export const processClubSignup = async (input: {
  nombre: string;
  email: string;
  telefono: string;
  mensaje?: string;
  source?: 'landing' | 'admin' | 'import';
}) => {
  const settings = await getClubSettings();
  const source = input.source || 'landing';
  const now = Timestamp.now();
  const existing = await findMemberByEmail(input.email);

  if (existing?.status === 'active') {
    await getMembersCollection().doc(existing.id).set(
      {
        nombre: input.nombre,
        telefono: input.telefono,
        mensaje: input.mensaje || existing.mensaje || '',
        lastActivityAt: now,
      },
      { merge: true }
    );
    return { kind: 'already_active' as const, memberId: existing.id };
  }

  const initialStatus = existing ? resolveStatusOnSignup(existing.status, settings) : settings.autoApproveSignup ? 'active' : 'pending';
  const shouldGrantBonus = !existing?.welcomeEmailSentAt && !existing?.acceptedAt && !(existing?.puntos && existing.puntos > 0);
  const basePoints = existing?.puntos || 0;
  const finalPoints = shouldGrantBonus ? basePoints + settings.signupBonusPoints : basePoints;
  const autoLevelEnabled = existing?.autoLevel ?? settings.autoLevelEnabled;
  const level = autoLevelEnabled ? recalcLevel(finalPoints, settings) : (existing?.nivel || 'base');

  const payload = {
    nombre: input.nombre,
    email: input.email.trim(),
    emailLower: normalizeEmail(input.email),
    telefono: input.telefono.trim(),
    mensaje: input.mensaje || '',
    tipo: 'club',
    leida: false,
    fechaCreacion: existing?.createdAt || now,
    createdAt: existing?.createdAt || now,
    status: initialStatus,
    puntos: finalPoints,
    nivel: level,
    source: existing?.source || source,
    autoLevel: autoLevelEnabled,
    tags: existing?.tags || [],
    lastActivityAt: now,
  };

  const memberRef = existing ? getMembersCollection().doc(existing.id) : getMembersCollection().doc();
  await memberRef.set(payload, { merge: true });

  if (shouldGrantBonus && settings.signupBonusPoints > 0) {
    await createLedgerEntry({
      memberId: memberRef.id,
      delta: settings.signupBonusPoints,
      reason: 'signup_bonus',
      description: 'Bonus por registro al Club',
      createdBy: 'system',
    });
  }

  const shouldSendWelcome = !existing?.welcomeEmailSentAt;
  if (shouldSendWelcome) {
    try {
      await sendClubWelcomeEmail({
        nombre: input.nombre,
        email: input.email.trim(),
        nivel: level,
        puntos: finalPoints,
        settings,
      });
      await memberRef.set(
        {
          welcomeEmailSentAt: now,
          emailLastError: FieldValue.delete(),
        },
        { merge: true }
      );
    } catch (error) {
      await memberRef.set(
        {
          emailLastError: error instanceof Error ? error.message : 'Error enviando email',
        },
        { merge: true }
      );
    }
  }

  return { kind: existing ? 'updated' : 'created', memberId: memberRef.id };
};
