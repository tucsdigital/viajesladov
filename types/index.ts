import { Timestamp } from 'firebase/firestore';

export interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string;
  orden: number;
  destacada: boolean;
  activa: boolean;
  imagen?: string;
  fechaCreacion: Timestamp | Date;
}

export interface Salida {
  id: string;
  fecha: string; // YYYY-MM-DD (fecha de ida)
  fechaVuelta?: string; // YYYY-MM-DD (fecha de vuelta)
  ciudadSalida: string;
  precio: number;
  moneda: 'USD' | 'ARS' | 'EUR';
  cupo?: number;
  observaciones?: string;
}

export interface TicketPack {
  id: string;
  titulo: string;
  descripcion: string;
  moneda: 'USD' | 'ARS' | 'EUR';
  valor: number;
  imagenUrl?: string;
}

export interface Paquete {
  id: string;
  titulo: string;
  slug: string;
  descripcion: string;
  descripcionCorta?: string;
  etiqueta?: string;
  eventoLugar?: string;
  eventoFecha?: string; // YYYY-MM-DD
  destino?: string; // Se obtiene automáticamente del nombre de la categoría
  categoriaId?: string;
  tipo: 'individual' | 'grupal' | 'a-medida';
  precio: number;
  moneda: 'USD' | 'ARS' | 'EUR';
  mostrarDesde: boolean;
  duracion: string;
  incluye: string[];
  noIncluye: string[];
  salidas: Salida[];
  imagenPrincipal: string;
  imagenTarjeta?: string;
  imagenPortada?: string;
  galeria: string[];
  tickets?: TicketPack[];
  visible: boolean;
  destacado: boolean;
  fechaCreacion: Timestamp | Date;
  orden: number;
  ctaWhatsApp: boolean;
}

export interface BlogPost {
  id: string;
  titulo: string;
  slug: string;
  extracto: string;
  contenido: string;
  imagenPrincipal?: string;
  imagenTarjeta?: string;
  imagenPortada?: string;
  visible: boolean;
  destacado: boolean;
  orden: number;
  fechaPublicacion: Timestamp | Date;
  fechaCreacion: Timestamp | Date;
}

export interface Consulta {
  id?: string;
  nombre: string;
  email: string;
  telefono: string;
  mensaje: string;
  paquete?: string;
  paqueteId?: string; // Slug del paquete para construir la URL
  ticketId?: string;
  cantidadPersonas?: number;
  ciudad?: string;
  codigoPostal?: string;
  fechaCreacion: Timestamp | Date;
  leida: boolean;
}
export interface Cliente {
  id: string; // UID de Firebase Auth
  nombre?: string;
  apellido?: string;
  nombreCompleto?: string;
  email: string;
  telefono?: string;
  ciudad?: string;
  codigoPostal?: string;
  cantidadPersonas?: number;
  photoURL?: string;
  provider?: 'password' | 'google';
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

export type ClubStatus = 'lead' | 'pending' | 'active' | 'blocked';
export type ClubLevel = 'base' | 'plus' | 'elite';
export type ClubSource = 'landing' | 'admin' | 'import';
export type ClubPointsReason =
  | 'signup_bonus'
  | 'admin_adjustment'
  | 'purchase'
  | 'referral'
  | 'level_override'
  | 'manual_assign'
  | 'other';

export interface ClubMember {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  mensaje?: string;
  status: ClubStatus;
  puntos: number;
  nivel: ClubLevel;
  source: ClubSource;
  tags?: string[];
  notes?: string;
  memberId?: string;
  autoLevel?: boolean;
  createdAt: Timestamp | Date;
  lastActivityAt?: Timestamp | Date;
  acceptedAt?: Timestamp | Date;
  welcomeEmailSentAt?: Timestamp | Date;
  emailLastError?: string;
}

export interface ClubPointsLedgerEntry {
  id: string;
  memberId: string;
  memberRef?: string;
  delta: number;
  reason: ClubPointsReason;
  description: string;
  createdAt: Timestamp | Date;
  createdBy: string;
  metadata?: Record<string, unknown>;
}

export interface ClubSettings {
  id?: string;
  signupBonusPoints: number;
  plusFromPoints: number;
  eliteFromPoints: number;
  autoLevelEnabled: boolean;
  autoApproveSignup: boolean;
  emailFromName?: string;
  replyTo?: string;
  commercialMessage?: string;
  updatedAt?: Timestamp | Date;
  updatedBy?: string;
}
