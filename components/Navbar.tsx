'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone, User, ChevronDown, LogOut, Home, Briefcase, MapPin, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WhiteLabelButton from '@/components/WhiteLabelButton';
import { getWhatsAppLink } from '@/lib/utils/whatsapp';
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import { getAuthInstance } from '@/lib/firebase';

interface NavbarProps {
  transparent?: boolean;
  forceTransparent?: boolean;
}

export default function Navbar({ transparent = false, forceTransparent = false }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const auth = getAuthInstance();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const original = document.body.style.overflow;
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = original;
    }
    return () => {
      document.body.style.overflow = original;
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    try {
      await signOut(getAuthInstance());
      setProfileOpen(false);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Si transparent=true, navbar transparente hasta hacer scroll
  // Si transparent=false, navbar siempre blanco
  const navbarClass = transparent
    ? forceTransparent
      ? mobileMenuOpen || isScrolled
        ? 'bg-primary backdrop-blur-md shadow-lg'
        : 'bg-transparent'
      : 'bg-primary backdrop-blur-md shadow-lg'
    : 'bg-primary backdrop-blur-md shadow-sm';

  const textClass = transparent && !isScrolled ? 'text-white' : 'text-white';

  const isTransparentTop = transparent && !isScrolled;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navbarClass}`}
      onClick={() => {
        if (mobileMenuOpen) setMobileMenuOpen(false);
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center transition-all duration-300">
              <Image
                src="/ladov_primary.png"
                alt="Lado V Logo"
                width={80}
                height={80}
                className="w-full h-full object-contain"
              />
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors ${textClass} hover:opacity-70`}
            >
              Inicio
            </Link>
            <Link
              href="/paquetes"
              className={`text-sm font-medium transition-colors ${textClass} hover:opacity-70`}
            >
              Paquetes
            </Link>
            <Link
              href="/f1"
              className={`text-sm font-medium transition-colors ${textClass} hover:opacity-70`}
            >
              F1
            </Link>
            <Link
              href="/blog"
              className={`text-sm font-medium transition-colors ${textClass} hover:opacity-70`}
            >
              Blog
            </Link>
            <Link
              href="/contacto"
              className={`text-sm font-medium transition-colors ${textClass} hover:opacity-70`}
            >
              Contacto
            </Link>
          </div>

          {/* CTA + Perfil */}
          <div className="hidden md:flex items-center gap-4">
            <WhiteLabelButton />

            <Button asChild className="bg-secondary hover:bg-secondary/90 text-primary">
              <Link href="/club-lado-v">
                Club Lado V
              </Link>
            </Button>

            <div ref={profileRef} className="relative">
              {authUser ? (
                <>
                  <button
                    onClick={() => setProfileOpen((prev) => !prev)}
                    className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-2 py-1.5 text-white hover:bg-white/15 transition"
                    aria-label="Abrir menú de perfil"
                  >
                    {authUser.photoURL ? (
                      <img
                        src={authUser.photoURL}
                        alt={authUser.displayName || 'Usuario'}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                    <ChevronDown className="h-4 w-4 text-white/80" />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden">
                      <Link
                        href="/user"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setProfileOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        Mi perfil
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center justify-center h-10 w-10 rounded-full border border-white/30 text-white hover:bg-white/10 transition"
                  aria-label="Ingresar"
                >
                  <User className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={(event) => {
              event.stopPropagation();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
          >
            {mobileMenuOpen ? (
              <X className={textClass} />
            ) : (
              <Menu className={textClass} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 md:hidden"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-0"
              style={{
                background: 'linear-gradient(to bottom, transparent 0px, transparent 80px, rgba(0,0,0,0.6) 80px)',
              }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: 24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 24, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-20 right-0 z-10 h-[calc(100dvh-5rem)] w-[86vw] max-w-xs bg-primary shadow-[0_24px_64px_rgba(0,0,0,0.4)] overflow-y-auto"
              style={{ backgroundColor: '#19123C' }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="relative h-full flex flex-col p-6 space-y-4">
                <div className="text-[10px] uppercase tracking-[0.24em] text-white/60">Menú</div>
                <nav className="space-y-2 text-left">
                  <Link
                    href="/"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/95 transition hover:bg-white/10"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Home className="h-4 w-4" />
                    Inicio
                  </Link>
                  <Link
                    href="/paquetes"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/95 transition hover:bg-white/10"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Briefcase className="h-4 w-4" />
                    Paquetes
                  </Link>
                  <Link
                    href="/f1"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/95 transition hover:bg-white/10"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <MapPin className="h-4 w-4" />
                    F1
                  </Link>
                  <Link
                    href="/blog"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/95 transition hover:bg-white/10"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Mail className="h-4 w-4" />
                    Blog
                  </Link>
                  <Link
                    href="/#categorias"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/95 transition hover:bg-white/10"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <MapPin className="h-4 w-4" />
                    Destinos
                  </Link>
                  <Link
                    href="/contacto"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/95 transition hover:bg-white/10"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Mail className="h-4 w-4" />
                    Contacto
                  </Link>
                </nav>

                <div className="border-t border-white/10 pt-4 space-y-2">
                  {authUser ? (
                    <>
                      <Link
                        href="/user"
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/95 transition hover:bg-white/10"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        Mi perfil
                      </Link>
                      <button
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/95 transition hover:bg-white/10"
                        onClick={async () => {
                          await handleLogout();
                          setMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="h-4 w-4" />
                        Cerrar sesión
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/95 transition hover:bg-white/10"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Ingresar
                    </Link>
                  )}
                </div>

                <div className="pt-2">
                  <WhiteLabelButton className="mb-2 w-full" />

                  <Button asChild className="w-full bg-secondary text-primary hover:bg-secondary/90">
                    <Link href="/club-lado-v">Club Lado V</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
