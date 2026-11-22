import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { SITE_NAME } from '@/lib/constants';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: `Club Lado V - ${SITE_NAME}`,
  description:
    'Club Lado V se encuentra temporalmente en desarrollo.',
};

export default function ClubLadoVPage() {
  return (
    <>
      <Navbar />
      <WhatsAppButton />
      <main className="min-h-[70vh] bg-[#19123C] px-4 py-20 md:px-6 md:py-28">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 px-6 py-12 text-center text-white shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-sm md:px-10 md:py-16">
          <span className="inline-flex items-center rounded-full bg-secondary px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Club Lado V
          </span>
          <h1 className="mt-5 text-2xl font-bold leading-tight md:text-4xl">
            Sección en desarrollo
          </h1>
          <p className="mt-3 max-w-xl text-sm text-white/75 md:text-base">
            Estamos preparando esta experiencia para que muy pronto puedas conocer todo sobre Club Lado V.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild className="bg-secondary text-primary hover:bg-secondary/90">
              <Link href="/">Volver al inicio</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
              <a href="https://wa.me/5493513154330" target="_blank" rel="noopener noreferrer">
                Consultar por WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
