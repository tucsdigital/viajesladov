'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import CategoriaCard from '@/components/CategoriaCard';
import { Categoria } from '@/types';

interface CategoriesSectionProps {
  categorias: Categoria[];
  badgeLabel?: string;
  title?: string;
  subtitle?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  showViewAll?: boolean;
  showAll?: boolean;
  fadeInUpVariants: Variants;
  staggerFastVariants: Variants;
}

export default function CategoriesSection({
  categorias,
  badgeLabel = 'Destinos',
  title = 'Nuestros Destinos',
  subtitle = 'Explorá nuestras categorías y encontrá el viaje perfecto para vos',
  viewAllHref,
  viewAllLabel = 'Ver todos',
  showViewAll = true,
  showAll = false,
  fadeInUpVariants,
  staggerFastVariants,
}: CategoriesSectionProps) {
  const categoriasVisibles = showAll ? categorias : categorias.slice(0, 8);

  return (
    <section id="categorias" className="bg-[#F9FAFB] py-10 md:py-16 overflow-x-hidden">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          className="mb-10 flex flex-col gap-5 md:mb-14 md:flex-row md:items-end md:justify-between"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-150px' }}
          variants={staggerFastVariants}
        >
          <div className="max-w-3xl">
            <motion.div className="inline-block mb-4" variants={fadeInUpVariants}>
              <span className="badge-pluma pluma-underline">{badgeLabel}</span>
            </motion.div>
            <motion.h2
              className="text-lg font-bold leading-tight md:text-lg lg:text-lg"
              variants={fadeInUpVariants}
            >
              {title}
            </motion.h2>
            {subtitle ? (
              <motion.p
                className="text-base leading-relaxed text-[#4B5563] md:text-lg"
                variants={fadeInUpVariants}
              >
                {subtitle}
              </motion.p>
            ) : null}
          </div>

          {viewAllHref && showViewAll ? (
            <motion.div className="shrink-0" variants={fadeInUpVariants}>
              <Link
                href={viewAllHref}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-black/10 bg-white px-4 text-sm font-semibold text-primary transition-all duration-300 hover:border-black/20 hover:bg-[#F3F4F6] hover:shadow-[0_10px_24px_rgba(0,0,0,0.08)]"
              >
                <span>{viewAllLabel}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          ) : null}
        </motion.div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-4 lg:gap-8">
          {categoriasVisibles.length > 0 ? (
            categoriasVisibles.map((categoria, index) => (
              <CategoriaCard key={categoria.id} categoria={categoria} index={index} />
            ))
          ) : (
            <motion.div
              className="col-span-full py-20 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-base text-gray-400 md:text-lg">
                No hay categorías destacadas disponibles
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
