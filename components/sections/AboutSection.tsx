'use client';

import { motion, Variants } from 'framer-motion';
import Image from 'next/image';

interface AboutSectionProps {
  fadeInLeftVariants: Variants;
  fadeInRightVariants: Variants;
  staggerFastVariants: Variants;
  staggerContainerVariants: Variants;
}

export default function AboutSection({
  fadeInLeftVariants,
  fadeInRightVariants,
  staggerFastVariants,
  staggerContainerVariants,
}: AboutSectionProps) {
  return (
    <section className="py-8 md:py-12 bg-[#F9FAFB] border-t border-gray-200 overflow-x-hidden">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 lg:gap-20 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-150px" }}
            variants={staggerFastVariants}
          >
            <motion.div className="inline-block mb-4 md:mb-6" variants={fadeInLeftVariants}>
              <span className="badge-pluma pluma-underline">Quiénes Somos</span>
            </motion.div>
            <motion.h2
              className="text-lg md:text-lg lg:text-lg font-bold mb-8 md:mb-10 leading-tight"
              variants={fadeInLeftVariants}
            >
              Sobre Nosotros
            </motion.h2>
            <motion.div
              className="space-y-5 md:space-y-6 text-xs md:text-sm text-[#4B5563] leading-relaxed"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainerVariants}
            >
              <motion.p variants={fadeInLeftVariants}>
                Somos una agencia boutique, actualmente nos encontramos en Palermo (CABA) y
                Bolivar (Prov. de BS.AS) que es mi ciudad natal. Atendemos al publico con cita
                previa. Legajo RNAV N° 20.227.
              </motion.p>
              <motion.div
                className="flex flex-col sm:flex-row items-start gap-6 pt-2"
                variants={fadeInLeftVariants}
              >
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <p className="text-base font-semibold text-primary">Legajo RNAV N° 20.227</p>
                  <p className="text-base text-[#4B5563]">
                    Escanea el QR para ver la habilitacion en RNAV.
                  </p>
                </div>
                <div className="w-32 h-32 bg-white border border-gray-200 rounded-xl p-2 shadow-sm">
                  <Image
                    src="/images/rnav-qr.svg"
                    alt="QR RNAV - Lado V"
                    width={128}
                    height={128}
                    className="w-full h-full object-contain"
                  />
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            className="relative h-[400px] md:h-[450px] lg:h-[450px] rounded-2xl overflow-hidden group"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-150px" }}
            variants={fadeInRightVariants}
          >
            <div className="absolute inset-0 bg-white"></div>
            <motion.div className="absolute inset-0" whileHover={{ scale: 1.05 }} transition={{ duration: 0.7 }}>
              <Image
                src="/images/"
                alt="Lado V - Equipo"
                fill
                className="object-contain"
                placeholder="blur"
                blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%231C1C1E' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' font-weight='bold' fill='%23ffffff'%3ELado V%3C/text%3E%3C/svg%3E"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
