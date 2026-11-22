import Link from "next/link";
import Image from "next/image";
import { SITE_NAME, SOCIAL_MEDIA } from "@/lib/constants";

export default function DevelopmentNotice() {
  return (
    <section className="bg-[#F9FAFB] py-12">
      <div className="container mx-auto px-4">
        <div className="bg-white border border-secondary/40 rounded-3xl shadow-xl p-8 md:p-12 text-center space-y-6">
          <div className="mx-auto w-20 h-20 flex items-center justify-center bg-white border border-secondary/40 rounded-2xl shadow-sm">
            <Image
              src="/logo-lado-v.png"
              alt={`${SITE_NAME} Logo`}
              width={64}
              height={64}
              className="w-12 h-12 object-contain"
            />
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold tracking-[0.25em] uppercase text-[#4B5563]">
              Sitio en desarrollo
            </p>
            <h1 className="text-lg md:text-lg font-bold text-primary">
              {SITE_NAME}
            </h1>
            <p className="text-base md:text-lg text-[#4B5563] max-w-xl mx-auto leading-relaxed">
              Muy pronto lanzamos nuestro nuevo sitio. Para novedades,
              inspiracion y atencion directa, encontranos en nuestras redes
              sociales.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-base">
            {SOCIAL_MEDIA.instagram && (
              <Link
                href={SOCIAL_MEDIA.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Seguinos en Instagram"
                className="inline-flex items-center justify-center rounded-full border border-[#B2F432] text-[#19123C] px-5 py-2 font-semibold hover:bg-[#B2F432]/10 transition-colors"
              >
                Instagram
              </Link>
            )}
            {SOCIAL_MEDIA.threads && (
              <Link
                href={SOCIAL_MEDIA.threads}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Seguinos en Threads"
                className="inline-flex items-center justify-center rounded-full border border-[#B2F432] text-[#19123C] px-5 py-2 font-semibold hover:bg-[#B2F432]/10 transition-colors"
              >
                Threads
              </Link>
            )}
            {SOCIAL_MEDIA.whatsapp && (
              <Link
                href={SOCIAL_MEDIA.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contactanos por WhatsApp"
                className="inline-flex items-center justify-center rounded-full border border-[#B2F432] text-[#19123C] px-5 py-2 font-semibold hover:bg-[#B2F432]/10 transition-colors"
              >
                WhatsApp
              </Link>
            )}
            {SOCIAL_MEDIA.email && (
              <Link
                href={SOCIAL_MEDIA.email}
                aria-label="Enviar email"
                className="inline-flex items-center justify-center rounded-full border border-[#B2F432] text-[#19123C] px-5 py-2 font-semibold hover:bg-[#B2F432]/10 transition-colors"
              >
                Email
              </Link>
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-[#4B5563] space-y-3">
          <p>Desarrollado por Tucs Digital</p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="https://tucsdigital.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Sitio web de Tucs Digital"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-secondary/40 text-[#4B5563] hover:text-primary hover:border-secondary transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                aria-hidden="true"
                fill="currentColor"
              >
                <path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3z" />
                <path d="M19 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6v2H5v12h12v-6h2z" />
              </svg>
            </Link>
            <Link
              href="https://www.instagram.com/tucsdigital"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram de Tucs Digital"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-secondary/40 text-[#4B5563] hover:text-primary hover:border-secondary transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                aria-hidden="true"
                fill="currentColor"
              >
                <path d="M7 2.5A4.5 4.5 0 002.5 7v10A4.5 4.5 0 007 21.5h10A4.5 4.5 0 0021.5 17V7A4.5 4.5 0 0017 2.5H7zm10 2a2.5 2.5 0 012.5 2.5v10A2.5 2.5 0 0117 19.5H7A2.5 2.5 0 014.5 17V7A2.5 2.5 0 017 4.5h10zm-5 3a4.5 4.5 0 100 9 4.5 4.5 0 000-9zm0 2a2.5 2.5 0 110 5 2.5 2.5 0 010-5zm5.25-2.25a1 1 0 100 2 1 1 0 000-2z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
