'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { getAuthInstance } from '@/lib/firebase';
import { upsertClienteProfile } from '@/lib/utils/clientes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';

const getAuthErrorMessage = (error: unknown) => {
  if (!error || typeof error !== 'object' || !('code' in error)) {
    return 'No se pudo iniciar sesión. Intentá nuevamente.';
  }
  const code = String((error as { code?: string }).code);
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Email o contraseña incorrectos.';
    case 'auth/invalid-email':
      return 'El email no es válido.';
    case 'auth/network-request-failed':
      return 'Sin conexión. Revisá tu internet y reintentá.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Esperá unos minutos y reintentá.';
    case 'auth/popup-closed-by-user':
      return 'Cerraste la ventana de Google. Intentá nuevamente.';
    case 'auth/popup-blocked':
      return 'Tu navegador bloqueó el popup. Habilitá popups y reintentá.';
    case 'auth/cancelled-popup-request':
      return 'La solicitud fue cancelada. Intentá nuevamente.';
    default:
      return 'No se pudo iniciar sesión. Intentá nuevamente.';
  }
};

function LoginContent() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const redirectTo =
    redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('//') ? redirectParam : '/user';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const auth = getAuthInstance();
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      await upsertClienteProfile({
        uid: credential.user.uid,
        email: credential.user.email || email.trim(),
        nombre: credential.user.displayName?.split(' ')[0],
        apellido: credential.user.displayName?.split(' ').slice(1).join(' '),
        phoneNumber: credential.user.phoneNumber || undefined,
        photoURL: credential.user.photoURL || undefined,
        provider: 'password',
      });
      toast.success('Sesión iniciada');
      router.push(redirectTo);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      toast.error(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const auth = getAuthInstance();
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(auth, provider);
      const displayName = credential.user.displayName || '';
      const [firstName, ...rest] = displayName.split(' ').filter(Boolean);
      const lastName = rest.join(' ');

      await upsertClienteProfile({
        uid: credential.user.uid,
        email: credential.user.email || '',
        nombre: firstName,
        apellido: lastName,
        phoneNumber: credential.user.phoneNumber || undefined,
        photoURL: credential.user.photoURL || undefined,
        provider: 'google',
      });

      toast.success('Sesión iniciada con Google');
      router.push(redirectTo);
    } catch (error) {
      console.error('Error con Google:', error);
      toast.error(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#19123C] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-32 h-80 w-80 rounded-full bg-secondary/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      </div>

      <Card className="w-full max-w-md border border-white/40 shadow-[0_20px_60px_rgba(0,0,0,0.35)] bg-white/95 backdrop-blur-sm rounded-3xl relative z-10">
        <CardHeader className="space-y-3 pb-3">
          <div className="w-full flex items-center justify-center">
            <div className="h-20 w-20 rounded-3xl bg-[#19123C] flex items-center justify-center shadow-lg">
              <img src="/favicon.svg" alt="Lado V" className="h-10 w-10" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <CardTitle className="text-lg font-bold text-gray-900">Bienvenido</CardTitle>
            <p className="text-xs text-gray-500">Ingresá para gestionar tu perfil</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <Label htmlFor="email" className="text-xs font-semibold text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="juan@ejemplo.com"
                className="h-9 rounded-xl border-gray-200 bg-gray-50/70 text-xs focus:border-primary focus:ring-primary/30"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-xs font-semibold text-gray-700">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-9 rounded-xl border-gray-200 bg-gray-50/70 text-xs focus:border-primary focus:ring-primary/30"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-9 rounded-xl bg-secondary text-primary text-sm font-semibold hover:bg-secondary/90 transition-all"
              disabled={loading}
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400 uppercase tracking-widest">o</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <div>
            <Button
              type="button"
              variant="outline"
              className="w-full h-9 rounded-xl border-gray-200 bg-white text-gray-900 hover:bg-gray-50 flex items-center justify-center gap-2"
              onClick={handleGoogle}
              disabled={loading}
            >
              <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.47 1.22 8.66 3.23l6.47-6.47C35.08 2.63 30.02 0 24 0 14.6 0 6.62 5.38 2.68 13.22l7.53 5.84C12 12.3 17.6 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.5 24c0-1.65-.15-3.24-.42-4.78H24v9.06h12.7c-.55 2.9-2.2 5.36-4.7 7.02l7.2 5.58C43.18 37.3 46.5 31.09 46.5 24z"/>
                <path fill="#FBBC05" d="M10.21 28.6a14.5 14.5 0 0 1 0-9.2l-7.53-5.84a24 24 0 0 0 0 20.88l7.53-5.84z"/>
                <path fill="#34A853" d="M24 48c6.02 0 11.08-1.99 14.77-5.42l-7.2-5.58c-2 1.35-4.57 2.15-7.57 2.15-6.4 0-12-2.8-13.79-6.94l-7.53 5.84C6.62 42.62 14.6 48 24 48z"/>
              </svg>
              Continuar con Google
            </Button>
          </div>

          <p className="text-xs text-gray-600 mt-3 text-center">
            ¿No tenés cuenta?{' '}
            <Link href={`/registro?redirect=${encodeURIComponent(redirectTo)}`} className="text-primary underline">
              Creala
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
