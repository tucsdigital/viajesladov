'use client';

import { motion, Variants } from 'framer-motion';
import ContactSection from '@/components/ContactSection';

interface ContactSectionBlockProps {
  fadeInLeftVariants: Variants;
  fadeInRightVariants: Variants;
  fadeInUpVariants: Variants;
  fadeInDownVariants: Variants;
  fadeInScaleVariants: Variants;
  staggerFastVariants: Variants;
}

export default function ContactSectionBlock({
  fadeInLeftVariants,
  fadeInRightVariants,
  fadeInUpVariants,
  fadeInDownVariants,
  fadeInScaleVariants,
  staggerFastVariants,
}: ContactSectionBlockProps) {
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
    <section className="pt-8 pb-4 md:py-12 bg-white border-t border-gray-200 overflow-x-hidden">
      <motion.div
        className="container mx-auto px-4 md:px-6 lg:px-8 mb-8 md:mb-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-150px" }}
        variants={staggerFastVariants}
        transition={{ staggerChildren: 0.2, delayChildren: 0.25 }}
      >
        <motion.div className="inline-block mb-4" variants={fadeInDownVariants}>
          <span className="badge-pluma pluma-underline block">Hablemos</span>
        </motion.div>
        <motion.h2
          className="text-lg md:text-lg lg:text-lg font-bold leading-tight overflow-hidden"
          variants={fadeInRightVariants}
        >
          <motion.span className="block" variants={lineRevealVariants}>
            Contáctanos
          </motion.span>
        </motion.h2>
        <motion.p
          className="text-sm md:text-sm text-[#4B5563] max-w-2xl leading-relaxed overflow-hidden"
          variants={fadeInUpVariants}
        >
          <motion.span className="block" variants={lineRevealVariants}>
            ¿Tenés alguna consulta? Envianos un mensaje y te respondemos a la brevedad
          </motion.span>
        </motion.p>
      </motion.div>
      <motion.div variants={fadeInScaleVariants} transition={{ duration: 0.95, delay: 0.1 }}>
        <ContactSection showTitle={false} />
      </motion.div>
    </section>
  );
}
