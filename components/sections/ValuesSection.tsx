'use client';

import { useCallback, useRef, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { Award, CheckCircle, Sparkles, Shield, Heart, Smile } from 'lucide-react';

interface ValuesSectionProps {
  fadeInUpVariants: Variants;
  staggerFastVariants: Variants;
  staggerContainerVariants: Variants;
  scaleInVariants: Variants;
}

const values = [
  {
    icon: Award,
    number: '01',
    title: 'Alianzas con proveedores de excelencia',
    desc: 'Trabajamos con operadores y prestadores confiables, garantizando experiencias bien organizadas y servicios de alto nivel.',
  },
  {
    icon: CheckCircle,
    number: '02',
    title: 'Mejor precio',
    desc: 'Buscamos las mejores tarifas disponibles y opciones de pago convenientes, combinando precio y calidad para que obtengas el mayor valor en cada viaje.',
  },
  {
    icon: Sparkles,
    number: '03',
    title: 'Conocimiento que marca la diferencia',
    desc: 'Asesoramos desde la experiencia real y el conocimiento profundo de cada destino. Recomendamos con criterio, honestidad y sensibilidad, para que vivas el viaje que mejor se adapta a vos.',
  },
  {
    icon: Shield,
    number: '04',
    title: 'Seguridad y bienestar',
    desc: 'Seleccionamos cuidadosamente cada proveedor y servicio, priorizando la calidad, la seguridad y la tranquilidad de quienes viajan con nosotros.',
  },
  {
    icon: Heart,
    number: '05',
    title: 'Honestidad y transparencia',
    desc: 'Creemos en un vinculo basado en la confianza. Brindamos informacion clara, condiciones reales y propuestas pensadas con responsabilidad y compromiso.',
  },
  {
    icon: Smile,
    number: '06',
    title: 'Atencion cercana, permanente y humana',
    desc: 'Cada viajero es unico. Nos involucramos en cada viaje como si fuera propio. Escuchamos tus necesidades y te acompañamos con dedicacion, calidez y profesionalismo en todo el proceso.',
  },
];

export default function ValuesSection({
  fadeInUpVariants,
  staggerFastVariants,
  staggerContainerVariants,
  scaleInVariants,
}: ValuesSectionProps) {
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
    <section className="py-8 md:py-12 bg-[#F9FAFB] border-t border-gray-200 overflow-x-hidden">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          className="mb-10 md:mb-14 max-w-3xl"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-150px" }}
          variants={staggerFastVariants}
        >
          <motion.div className="inline-block mb-4" variants={fadeInUpVariants}>
            <span className="badge-pluma pluma-underline">Valores</span>
          </motion.div>
          <motion.h2
            className="text-lg md:text-lg lg:text-lg font-bold leading-tight"
            variants={fadeInUpVariants}
          >
            ¿Por qué elegirnos?
          </motion.h2>
          <motion.p
            className="text-base md:text-lg text-[#4B5563] leading-relaxed"
            variants={fadeInUpVariants}
          >
            Creemos en una forma de viajar donde cada detalle cuenta
          </motion.p>
        </motion.div>

        <div className="md:hidden relative">
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 px-4 -mx-4"
            onScroll={() => handleScroll(values.length)}
          >
            {values.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="shrink-0 w-[85vw] snap-center">
                  <div className="relative h-full bg-white border-2 border-secondary/40 rounded-2xl p-8 hover:border-secondary hover:shadow-2xl transition-all duration-500 overflow-hidden">
                    <div className="absolute inset-0 bg-[#F9FAFB] opacity-60"></div>
                    <div className="absolute top-4 right-6 text-6xl font-bold text-secondary/30">
                      {item.number}
                    </div>
                    <div className="relative z-10">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-6">
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-base md:text-lg lg:text-lg font-bold mb-3 text-primary">
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
            {values.map((_, i) => (
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
          className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainerVariants}
        >
          {values.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div key={index} className="group relative" variants={scaleInVariants}>
                <div className="relative h-full bg-white border-2 border-secondary/40 rounded-2xl p-8 hover:border-secondary hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  <div className="absolute inset-0 bg-[#F9FAFB] opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                  <div className="absolute top-4 right-6 text-6xl font-bold text-secondary/30 group-hover:text-secondary/50 transition-colors duration-500">
                    {item.number}
                  </div>
                  <div className="relative z-10">
                    <motion.div
                      className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500"
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </motion.div>
                    <h3 className="text-base md:text-lg lg:text-lg font-bold mb-3 text-primary group-hover:text-primary transition-colors duration-300">
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
