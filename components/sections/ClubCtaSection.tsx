'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface ClubCtaSectionProps {
  fadeInLeftVariants: Variants;
  fadeInRightVariants: Variants;
  fadeInUpVariants: Variants;
  fadeInDownVariants: Variants;
  fadeInScaleVariants: Variants;
  staggerFastVariants: Variants;
}

export default function ClubCtaSection({
  fadeInLeftVariants,
  fadeInRightVariants,
  fadeInUpVariants,
  fadeInDownVariants,
  fadeInScaleVariants,
  staggerFastVariants,
}: ClubCtaSectionProps) {
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

  return (
    <section className="py-8 md:py-12 bg-[#F9FAFB] border-t border-gray-200 overflow-x-hidden">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          className="relative overflow-hidden rounded-3xl bg-primary text-white px-6 py-10 md:px-10 md:py-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-150px" }}
          variants={staggerFastVariants}
          transition={{ staggerChildren: 0.2, delayChildren: 0.25 }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_80%_0%,rgba(178,244,50,0.35),transparent)] cta-glow" />
          <div className="absolute inset-0 bg-[radial-gradient(40%_40%_at_10%_90%,rgba(178,244,50,0.18),transparent)] cta-glow-slow" />
          <motion.div
            className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between"
            variants={fadeInScaleVariants}
            transition={{ duration: 1.05 }}
          >
            <div className="max-w-2xl">
              <motion.div className="inline-block mb-3 overflow-hidden" variants={fadeInDownVariants}>
                <motion.span
                  className="inline-flex items-center rounded-full bg-secondary text-primary px-3 py-1 text-xs font-semibold tracking-wide"
                  variants={lineRevealVariants}
                >
                  Club Lado V
                </motion.span>
              </motion.div>
              <motion.h2
                className="text-lg md:text-lg lg:text-lg font-bold leading-tight mb-3 text-secondary overflow-hidden"
                variants={fadeInRightVariants}
              >
                <motion.span className="block" variants={lineRevealVariants}>
                  Unite al Club y recibí beneficios exclusivos
                </motion.span>
              </motion.h2>
              <motion.p className="text-sm md:text-sm text-white/80 overflow-hidden" variants={fadeInUpVariants}>
                <motion.span className="block" variants={lineRevealVariants}>
                  Accedé antes que nadie a lanzamientos, cupos limitados y contenidos especiales.
                </motion.span>
              </motion.p>
            </div>
            <motion.div variants={fadeInUpVariants} transition={{ duration: 0.9, delay: 0.08 }}>
              <Link
                href="/club-lado-v"
                className="inline-flex items-center justify-center bg-secondary text-primary font-semibold px-6 py-3 rounded-xl shadow-lg transition-all hover:scale-[1.02]"
              >
                <motion.span
                  className="block overflow-hidden"
                  variants={lineRevealVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-120px' }}
                >
                  Quiero unirme
                </motion.span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
