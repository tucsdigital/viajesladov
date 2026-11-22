'use client';

import { motion } from 'framer-motion';

interface SectionBannerProps {
  text: string;
}

export default function SectionBanner({ text }: SectionBannerProps) {
  return (
    <section className="py-4 md:py-6 bg-white overflow-x-hidden" aria-hidden>
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          className="w-full py-0"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="w-full rounded-xl bg-primary px-6 py-2 text-center text-white shadow-lg">
            <span className="text-base md:text-lg font-semibold">{text}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
