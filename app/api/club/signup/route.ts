import { NextResponse } from 'next/server';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { processClubSignup } from '@/lib/club/membership';

const signupSchema = z.object({
  nombre: z.string().min(2),
  email: z.string().email(),
  telefono: z.string().min(8),
  mensaje: z.string().max(1000).optional(),
});

const hasMissingAdminVarsError = (error: unknown) =>
  error instanceof Error && error.message.startsWith('Faltan variables Firebase Admin');

const saveSignupFallback = async (input: z.infer<typeof signupSchema>) => {
  const nombre = input.nombre.trim();
  const email = input.email.trim();
  const telefono = input.telefono.trim();

  await addDoc(collection(db, 'club_lado_v'), {
    nombre,
    email,
    telefono,
    mensaje: input.mensaje?.trim() || '',
    status: 'pending',
    source: 'landing',
    createdAt: serverTimestamp(),
    fechaCreacion: serverTimestamp(),
    tipo: 'club',
    leida: false,
    emailLower: email.toLowerCase(),
  });
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsedResult = signupSchema.safeParse(body);
  if (!parsedResult.success) {
    return NextResponse.json({ ok: false, error: 'Datos inválidos' }, { status: 400 });
  }
  const parsed = parsedResult.data;

  try {
    const result = await processClubSignup(parsed);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    if (hasMissingAdminVarsError(error)) {
      try {
        await saveSignupFallback(parsed);
        return NextResponse.json({ ok: true, result: { kind: 'created' } });
      } catch (fallbackError) {
        console.error('Error fallback registro Club:', fallbackError);
      }
    }
    console.error('Error en registro Club:', error);
    return NextResponse.json({ ok: false, error: 'No pudimos procesar la solicitud' }, { status: 500 });
  }
}
