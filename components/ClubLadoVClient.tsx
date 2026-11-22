"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  Crown,
  Gift,
  Sparkles,
  Star,
  Ticket,
  Users,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ClubJoinModal from "@/components/ClubJoinModal";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, getAuthInstance } from "@/lib/firebase";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const benefits = [
  {
    title: "Preventas y cupos exclusivos",
    description: "Accedé antes que nadie a lanzamientos y experiencias con cupos limitados.",
    icon: Ticket,
  },
  {
    title: "Beneficios y upgrades",
    description: "Mejoras y perks en experiencias seleccionadas durante todo el año.",
    icon: Gift,
  },
  {
    title: "Comunidad premium",
    description: "Viajá con personas que priorizan calidad, detalle y experiencias reales.",
    icon: Users,
  },
  {
    title: "Atención prioritaria",
    description: "Asesoramiento dedicado para resolver cada detalle de tu viaje.",
    icon: ShieldCheck,
  },
];

const tiers = [
  {
    name: "Base",
    points: "0 - 999 puntos",
    perks: ["Preventas seleccionadas", "Acceso a beneficios estacionales"],
    icon: Star,
  },
  {
    name: "Plus",
    points: "1000 - 2499 puntos",
    perks: ["Upgrades en experiencias", "Atención prioritaria"],
    icon: BadgeCheck,
  },
  {
    name: "Elite",
    points: "2500+ puntos",
    perks: ["Experiencias exclusivas", "Concierge dedicado"],
    icon: Crown,
  },
];

const steps = [
  {
    title: "Sumate al Club",
    description: "Completá tu solicitud y te confirmamos el acceso.",
  },
  {
    title: "Acumulá puntos",
    description: "Sumá puntos por cada experiencia y desbloqueá niveles.",
  },
  {
    title: "Viví Lado V",
    description: "Reservá con prioridad y disfrutá beneficios exclusivos.",
  },
];

const faqs = [
  {
    question: "¿Cómo se acumulan puntos?",
    answer: "Se acreditan automáticamente con cada experiencia confirmada.",
  },
  {
    question: "¿Los beneficios son acumulables?",
    answer: "Depende de cada experiencia. Te informamos qué aplica en cada caso.",
  },
  {
    question: "¿Puedo invitar a alguien?",
    answer: "Sí, podés sumar acompañantes según la experiencia disponible.",
  },
];

const highlights = [
  { label: "Miembros activos", value: "300+" },
  { label: "Beneficios anuales", value: "25+" },
  { label: "Atención prioritaria", value: "24/7" },
];

export default function ClubLadoVClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [joinOpen, setJoinOpen] = useState(false);
  const [clubLoading, setClubLoading] = useState(true);
  const [clubStatus, setClubStatus] = useState<"none" | "pending" | "active" | "blocked">("none");

  useEffect(() => {
    const auth = getAuthInstance();
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user?.email) {
        setClubLoading(false);
        setClubStatus("none");
        return;
      }
      try {
        const emailLower = user.email.trim().toLowerCase();
        const snap = await getDocs(
          query(collection(db, "club_lado_v"), where("emailLower", "==", emailLower), limit(1))
        );
        if (snap.empty) {
          setClubStatus("none");
        } else {
          const data = snap.docs[0].data() as { status?: "lead" | "pending" | "active" | "blocked" };
          if (data.status === "active") setClubStatus("active");
          else if (data.status === "blocked") setClubStatus("blocked");
          else setClubStatus("pending");
        }
      } finally {
        setClubLoading(false);
      }
    });
    return () => unsub();
  }, []);
  return (
    <>
      <section className="relative overflow-hidden bg-primary pt-20 pb-10 md:pt-24 md:pb-14 text-white">
        <div className="absolute inset-0">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-secondary/25 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative z-10 container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <motion.span
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70"
                variants={itemVariants}
              >
                <Sparkles className="h-4 w-4 text-secondary" />
                Club Lado V
              </motion.span>
              <motion.h1
                className="mt-4 text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-white"
                variants={itemVariants}
              >
                Una membresía diseñada para vivir viajes con otro nivel
              </motion.h1>
              <motion.p
                className="mt-2 text-sm md:text-base text-white/80 max-w-2xl"
                variants={itemVariants}
              >
                Beneficios reales, puntos acumulables y experiencias exclusivas. El Club Lado V
                es el nuevo estándar para viajar con atención premium.
              </motion.p>
              <motion.div className="mt-5 flex flex-wrap gap-3" variants={itemVariants}>
                {clubStatus === "active" ? (
                  <>
                    <Button asChild className="bg-secondary text-primary hover:bg-secondary/90">
                      <Link href="/user">Ir a mi panel</Link>
                    </Button>
                    <Button asChild variant="outline" className="border-white/30 text-white hover:bg-white/10">
                      <a href="https://wa.me/5493513154330" target="_blank" rel="noopener noreferrer">
                        Hablar con un asesor
                      </a>
                    </Button>
                  </>
                ) : clubStatus === "pending" ? (
                  <>
                    <Button asChild className="bg-secondary text-primary hover:bg-secondary/90">
                      <Link href="/user">Ver estado de mi solicitud</Link>
                    </Button>
                    <Button asChild variant="outline" className="border-white/30 text-white hover:bg-white/10">
                      <a href="https://wa.me/5493513154330" target="_blank" rel="noopener noreferrer">
                        Consultar por WhatsApp
                      </a>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      className="bg-secondary text-primary hover:bg-secondary/90"
                      onClick={() => setJoinOpen(true)}
                    >
                      Quiero unirme
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      <a href="https://wa.me/5493513154330" target="_blank" rel="noopener noreferrer">
                        Hablar con un asesor
                      </a>
                    </Button>
                  </>
                )}
              </motion.div>
            </motion.div>
            <motion.div
              className="rounded-2xl bg-white/5 border border-white/10 p-4 md:p-5 backdrop-blur-sm"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div className="flex items-center gap-4" variants={itemVariants}>
                <div className="h-9 w-9 rounded-xl bg-secondary/20 flex items-center justify-center">
                  <BadgeCheck className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-[11px] text-white/70">Puntos Lado V</p>
                  <p className="text-sm font-semibold">Programa 2026</p>
                </div>
              </motion.div>
              <motion.div className="mt-3 space-y-1.5 text-[11px] text-white/80" variants={itemVariants}>
                <p>• Sumá puntos con cada experiencia</p>
                <p>• Desbloqueá niveles y beneficios</p>
                <p>• Comunicaciones exclusivas</p>
              </motion.div>
              <motion.div className="mt-5" variants={itemVariants}>
                {clubStatus === "active" ? (
                  <Button asChild className="w-full bg-secondary text-primary hover:bg-secondary/90">
                    <Link href="/user">Ir a mi panel</Link>
                  </Button>
                ) : clubStatus === "pending" ? (
                  <Button asChild className="w-full bg-secondary text-primary hover:bg-secondary/90">
                    <Link href="/user">Ver estado de mi solicitud</Link>
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-secondary text-primary hover:bg-secondary/90"
                    onClick={() => setJoinOpen(true)}
                  >
                    Solicitar membresía
                  </Button>
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-5 md:py-7 bg-primary border-t border-white/10">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid gap-2 sm:grid-cols-3">
            {highlights.map((item) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45 }}
                className="rounded-2xl border border-white/15 bg-white/5 px-3 py-3 backdrop-blur-sm"
              >
                <p className="text-sm md:text-base font-semibold text-secondary">{item.value}</p>
                <p className="text-[11px] md:text-xs text-white/75 mt-1">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-7 md:py-10 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <motion.div
            className="max-w-2xl"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-120px" }}
          >
            <motion.h2 className="text-xl md:text-2xl font-bold text-gray-900" variants={itemVariants}>
              Beneficios del Club
            </motion.h2>
            <motion.p className="mt-1.5 text-sm text-gray-600" variants={itemVariants}>
              Todo lo que necesitás para viajar con prioridad, comodidad y experiencias únicas.
            </motion.p>
          </motion.div>
          <div className="mt-5 grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <motion.div
                key={benefit.title}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-120px" }}
                whileHover={{ y: -4 }}
              >
                <benefit.icon className="h-6 w-6 text-secondary mb-2" />
                <h3 className="text-sm font-semibold text-gray-900 mb-0.5">{benefit.title}</h3>
                <p className="text-[11px] md:text-xs text-gray-600 leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-7 md:py-10 bg-[#F9FAFB] border-t border-gray-200">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <motion.div
            className="space-y-2 mb-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-120px" }}
          >
            <motion.h2 className="text-xl md:text-2xl font-bold text-gray-900" variants={itemVariants}>
              Niveles y puntos
            </motion.h2>
            <motion.p className="text-sm text-gray-600" variants={itemVariants}>
              Cuanto más viajás, más beneficios desbloqueás. Tres niveles con ventajas reales.
            </motion.p>
          </motion.div>
          <motion.div
            className=""
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-120px" }}
          >
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-[1fr_1fr] lg:items-stretch">
              <div className="space-y-4">
                <div className="grid gap-4">
                  {tiers.map((tier) => (
                    <motion.div
                      key={tier.name}
                      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                      variants={itemVariants}
                      whileHover={{ y: -3 }}
                    >
                      <div className="flex items-center gap-3">
                      <tier.icon className="h-6 w-6 text-secondary" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{tier.name}</p>
                          <p className="text-[11px] text-gray-500">{tier.points}</p>
                        </div>
                      </div>
                      <ul className="mt-2 space-y-0.5 text-[11px] text-gray-600">
                        {tier.perks.map((perk) => (
                          <li key={perk}>• {perk}</li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              </div>
              <motion.div
                className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col"
                variants={itemVariants}
              >
                <div className="relative flex-1 min-h-[180px] md:min-h-[240px]">
                  <Image
                    src="/images/pexels-wanderer-731217.jpg"
                    alt="Club Lado V"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4 md:p-5 mt-auto">
                  <p className="text-[11px] md:text-xs text-gray-600 leading-relaxed">
                    Una membresía para quienes buscan experiencias premium: acceso anticipado,
                    upgrades y una comunidad que valora cada detalle.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-7 md:py-10 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
            <motion.div
              className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm"
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-120px" }}
            >
              <div className="relative h-48 md:h-60">
                <Image
                  src="/images/pexels-igor-fedoriv-315288-1260991.jpg"
                  alt="Experiencias Lado V"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>
            <motion.div
              className="space-y-3"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-120px" }}
            >
              <motion.h2 className="text-xl md:text-2xl font-bold text-gray-900" variants={itemVariants}>
                Cómo funciona
              </motion.h2>
              <motion.p className="text-sm text-gray-600" variants={itemVariants}>
                Un proceso simple y transparente para entrar al Club y empezar a sumar puntos.
              </motion.p>
              <motion.div className="grid grid-cols-2 md:grid-cols-3 gap-3" variants={itemVariants}>
                {steps.map((step, index) => (
                  <div key={step.title} className="rounded-2xl border border-gray-200 bg-white p-3">
                    <div className="h-7 w-7 rounded-full bg-primary text-white flex items-center justify-center text-[11px] font-semibold mb-2">
                      {index + 1}
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{step.title}</p>
                    <p className="text-[11px] text-gray-600 mt-0.5">{step.description}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-7 md:py-10 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Preguntas frecuentes</h2>
              <p className="text-sm text-gray-600">Todo lo que necesitás saber antes de sumarte.</p>
            </div>
            <Button asChild variant="outline" className="border-gray-300 h-9 text-xs">
              <a href="https://wa.me/5493513154330" target="_blank" rel="noopener noreferrer">
                Hacer una consulta
              </a>
            </Button>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {faqs.map((faq, index) => (
              <div key={faq.question} className="rounded-2xl border border-gray-200 bg-white/70 p-4">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex w-full items-center justify-between gap-3 text-left"
                  aria-expanded={openFaq === index}
                  aria-controls={`faq-${index}`}
                >
                  <span className="text-sm font-semibold text-gray-900">{faq.question}</span>
                  <span className="text-xl text-gray-500">{openFaq === index ? "−" : "+"}</span>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === index && (
                    <motion.div
                      id={`faq-${index}`}
                      key={`faq-${index}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="mt-2 overflow-hidden"
                    >
                      <p className="text-[11px] md:text-xs text-gray-600 leading-relaxed">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-7 md:py-10 bg-[#F9FAFB] border-t border-gray-200">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="rounded-2xl bg-primary text-white p-5 md:p-7 flex flex-col md:flex-row md:items-center md:justify-between gap-5 shadow-md">
            <div>
              {clubStatus === "active" ? (
                <>
                  <h2 className="text-lg md:text-xl font-bold mb-2 text-secondary">Ya sos parte del Club</h2>
                  <p className="text-sm text-white/85">Accedé a tu panel para ver vueltas, niveles y beneficios.</p>
                </>
              ) : clubStatus === "pending" ? (
                <>
                  <h2 className="text-lg md:text-xl font-bold mb-2 text-secondary">Solicitud en revisión</h2>
                  <p className="text-sm text-white/85">Podés ver el estado desde tu panel. Te avisamos por email.</p>
                </>
              ) : (
                <>
                  <h2 className="text-lg md:text-xl font-bold mb-2 text-secondary">¿Listo para ser parte?</h2>
                  <p className="text-sm text-white/85">Sumate al Club Lado V y accedé a beneficios exclusivos.</p>
                </>
              )}
            </div>
            {clubStatus === "active" ? (
              <Button asChild className="bg-secondary text-primary hover:bg-secondary/90">
                <Link href="/user">Ir a mi panel</Link>
              </Button>
            ) : clubStatus === "pending" ? (
              <Button asChild className="bg-secondary text-primary hover:bg-secondary/90">
                <Link href="/user">Ver estado</Link>
              </Button>
            ) : (
              <Button className="bg-secondary text-primary hover:bg-secondary/90" onClick={() => setJoinOpen(true)}>
                Solicitar membresía
              </Button>
            )}
          </div>
        </div>
      </section>

      <ClubJoinModal isOpen={joinOpen} onClose={() => setJoinOpen(false)} />
    </>
  );
}
