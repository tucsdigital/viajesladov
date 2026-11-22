'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { Categoria } from '@/types';

interface CategoriaCardProps {
  categoria: Categoria;
  index?: number;
}

export default function CategoriaCard({ categoria, index = 0 }: CategoriaCardProps) {
  const descripcion =
    categoria.descripcion?.trim() || 'Descubrí experiencias únicas en este destino.';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/categoria/${categoria.slug}`}>
        <Card className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[rgba(0,0,0,0.1)] bg-white py-0 shadow-[0_12px_28px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,0,0,0.22)] gap-0">
          <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[4/3]">
            <Image
              src={categoria.imagen || '/images/placeholder-category.jpg'}
              alt={categoria.nombre}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              loading={index < 3 ? 'eager' : 'lazy'}
              priority={index < 3}
              quality={85}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#000000]/90 via-[#000000]/50 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_70%_20%,rgba(0,0,0,0.18),transparent)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="absolute left-2.5 top-2.5 sm:left-4 sm:top-4">
              <span className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold tracking-wide text-primary shadow-md sm:px-3 sm:text-xs">
                Destinos
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-2.5 text-white sm:p-4 md:p-5">
              <div className="rounded-xl p-2.5 sm:p-3 md:p-4">
                <h3 className="mb-1 text-sm font-bold leading-tight text-white drop-shadow-sm sm:mb-2 sm:text-base md:text-xl">
                  {categoria.nombre}
                </h3>
                <p className="hidden text-sm text-white/80 md:line-clamp-2 md:text-base">
                  {descripcion}
                </p>
                <div className="mt-2 inline-flex items-center rounded-full bg-white/95 px-2.5 py-1.5 text-xs font-semibold text-primary shadow-md transition-all duration-300 group-hover:bg-white sm:mt-3 sm:px-3 sm:text-sm md:mt-4">
                  <span className="hidden sm:inline">Explorar destino</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 sm:ml-2" />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
