'use client';

import { useCallback, useRef, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { Users, Plane, Headphones, Globe } from 'lucide-react';

interface ServicesSectionProps {
  fadeInUpVariants: Variants;
  staggerFastVariants: Variants;
  staggerContainerVariants: Variants;
  scaleInVariants: Variants;
}

const services = [
  {
    icon: Users,
    title: 'Viajes grupales',
    desc: 'Ofrecemos viajes grupales cuidadosamente planificados, ideales para quienes disfrutan compartir experiencias sin resignar organizacion, seguridad y momentos unicos. Cada grupo esta pensado para vivir el destino con sentido y disfrute.',
  },
  {
    icon: Plane,
    title: 'Viajes personalizados',
    desc: 'Itinerarios 100 % a medida. Armamos tu viaje desde cero, adaptado a tus tiempos, intereses y preferencias. Cada detalle se diseña segun tus sueños, para que vivas una experiencia autentica, personal y memorable.',
  },
  {
    icon: Headphones,
    title: 'Asesoramiento integral',
    desc: 'Te acompañamos en cada etapa del viaje con asesoramiento profesional, informacion clara y respaldo permanente. Trabajamos con fuentes oficiales para que viajes informado, seguro y sin preocupaciones.',
  },
  {
    icon: Globe,
    title: 'Servicios independientes',
    desc: 'Ofrecemos la contratacion de servicios por separado: vuelos, hoteles, traslados, asistencia al viajero, excursiones y mas. Flexibilidad total para quienes ya tienen un plan y buscan soluciones.',
  },
];

export default function ServicesSection({
  fadeInUpVariants,
  staggerFastVariants,
  staggerContainerVariants,
  scaleInVariants,
}: ServicesSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback((itemCount: number) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const itemWidth = container.scrollWidth / itemCount;
    const index = Math.round(container.scrollLeft / itemWidth);
    setActiveIndex(Math.max(0, Math.min(index, itemCount - 1)));
  }, []);

  return (
    <section className="py-8 md:py-12 bg-[#F9FAFB] overflow-x-hidden">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          className="mb-10 md:mb-14 max-w-3xl"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-150px" }}
          variants={staggerFastVariants}
        >
          <motion.div className="inline-block mb-4" variants={fadeInUpVariants}>
            <span className="badge-pluma pluma-underline">Servicios</span>
          </motion.div>
          <motion.h2
            className="text-lg md:text-lg lg:text-lg font-bold leading-tight"
            variants={fadeInUpVariants}
          >
            Nuestros Servicios
          </motion.h2>
          <motion.p
            className="text-sm md:text-sm text-[#4B5563] leading-relaxed"
            variants={fadeInUpVariants}
          >
            Te acompañamos en cada etapa de tu viaje con servicios pensados para vos
          </motion.p>
        </motion.div>

        <div className="md:hidden relative">
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 px-4 -mx-4"
            onScroll={() => handleScroll(services.length)}
          >
            {services.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="shrink-0 w-[85vw] snap-center">
                  <div className="relative h-full bg-white border-2 border-secondary/40 rounded-3xl p-8 hover:border-secondary hover:shadow-2xl transition-all duration-500 overflow-hidden">
                    <div className="absolute inset-0 bg-[#F9FAFB] opacity-60"></div>
                    <div className="relative z-10">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-6 shadow-lg">
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-base md:text-lg lg:text-lg font-bold mb-4 text-primary">
                        {item.title}
                      </h3>
                      <p className="text-base md:text-lg text-[#4B5563] leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center gap-2 mt-6">
            {services.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === activeIndex ? 'bg-primary w-8' : 'bg-secondary/40'
                }`}
              />
            ))}
          </div>
        </div>

        <motion.div
          className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainerVariants}
        >
          {services.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div key={index} className="group relative" variants={scaleInVariants}>
                <div className="relative h-full bg-white border-2 border-secondary/40 rounded-3xl p-8 md:p-10 hover:border-secondary hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
                  <div className="absolute inset-0 bg-[#F9FAFB] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <motion.div
                      className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-6 shadow-lg group-hover:shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500"
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </motion.div>
                    <h3 className="text-base md:text-lg lg:text-lg font-bold mb-4 text-primary group-hover:text-primary transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-sm md:text-base text-[#4B5563] leading-relaxed group-hover:text-[#4B5563] transition-colors duration-300 mb-6">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
