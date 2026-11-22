'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import PaqueteCard from '@/components/PaqueteCard';
import { Paquete } from '@/types';

interface ProductsSectionProps {
  items: Array<
    | { tipo: 'paquete' | 'f1'; paquete: Paquete }
    | { tipo: 'subtitle'; titulo: string }
  >;
  filterType?: 'paquete' | 'f1' | 'all';
  sectionBadge: string;
  sectionTitle: string;
  sectionSubtitle?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  showViewAll?: boolean;
  showDivider?: boolean;
  /** Texto del banner (mismo estilo que el div principal). Si no se pasa y showDivider es true, se muestra la imagen F1. */
  dividerText?: string;
  fadeInLeftVariants: Variants;
  fadeInRightVariants: Variants;
  fadeInUpVariants: Variants;
  fadeInDownVariants: Variants;
  fadeInScaleVariants: Variants;
  staggerFastVariants: Variants;
}

export default function ProductsSection({
  items,
  filterType = 'all',
  sectionBadge,
  sectionTitle,
  sectionSubtitle,
  viewAllHref,
  viewAllLabel = 'Ver todos',
  showViewAll = true,
  showDivider = false,
  dividerText,
  fadeInLeftVariants,
  fadeInRightVariants,
  fadeInUpVariants,
  fadeInDownVariants,
  fadeInScaleVariants,
  staggerFastVariants,
}: ProductsSectionProps) {
  const lineRevealVariants: Variants = {
    hidden: { y: '100%' },
    visible: {
      y: '0%',
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const filteredItems =
    filterType === 'all'
      ? items.filter((item): item is { tipo: 'paquete' | 'f1'; paquete: Paquete } => item.tipo !== 'subtitle')
      : items.filter(
          (item): item is { tipo: 'paquete' | 'f1'; paquete: Paquete } => item.tipo === filterType
        );

  const hasProductos = filteredItems.length > 0;
  if (!hasProductos) return null;

  return (
    <section id="productos" className="py-8 md:py-12 bg-white overflow-x-hidden">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          className={`flex flex-col gap-5 md:flex-row md:items-end md:justify-between ${filterType === 'paquete' ? 'pb-4 md:pb-6' : ''}`}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-150px" }}
          variants={staggerFastVariants}
          transition={{ staggerChildren: 0.18, delayChildren: 0.22 }}
        >
          <div className="max-w-3xl">
            <motion.div className="inline-block mb-4" variants={fadeInDownVariants}>
              <span className="badge-pluma pluma-underline block">{sectionBadge}</span>
            </motion.div>
            <motion.h2
              className="text-lg md:text-lg lg:text-lg font-bold leading-tight overflow-hidden"
              variants={fadeInRightVariants}
            >
              <motion.span className="block" variants={lineRevealVariants}>
                {sectionTitle}
              </motion.span>
            </motion.h2>
            {sectionSubtitle ? (
              <motion.p
                className="text-sm md:text-sm text-[#4B5563] leading-relaxed overflow-hidden"
                variants={fadeInUpVariants}
              >
                <motion.span className="block" variants={lineRevealVariants}>
                  {sectionSubtitle}
                </motion.span>
              </motion.p>
            ) : null}
          </div>

          {viewAllHref && showViewAll ? (
            <motion.div
              className="shrink-0"
              variants={fadeInLeftVariants}
            >
              <Link
                href={viewAllHref}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-black/10 bg-[#F6F7F8] px-4 text-sm font-semibold text-primary transition-all duration-300 hover:border-black/20 hover:bg-white hover:shadow-[0_10px_24px_rgba(0,0,0,0.08)]"
              >
                <span>{viewAllLabel}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          ) : null}
        </motion.div>

        {showDivider && (
          <motion.div
            className="w-full py-4 md:py-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="w-full rounded-xl bg-primary px-6 py-2 text-center text-white shadow-lg">
              {dividerText ? (
                <span className="text-base md:text-lg font-semibold">
                  {dividerText}
                </span>
              ) : (
                <div className="mx-auto flex flex-col items-center gap-3">
                  <div className="relative h-7 w-full max-w-[220px]">
                    <Image
                      src="/images/f1.png"
                      alt="F1"
                      fill
                      className="object-contain"
                      sizes="220px"
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        <motion.div
          variants={fadeInScaleVariants}
          transition={{ duration: 0.75 }}
          className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
        >
          {filteredItems.map((item, index) => (
            <PaqueteCard
              key={`${item.tipo}-${item.paquete.id}`}
              paquete={item.paquete}
              index={index}
              basePath={item.tipo === 'f1' ? '/f1' : undefined}
              badgeLabel={item.tipo === 'f1' ? 'F1' : undefined}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
