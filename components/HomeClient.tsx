"use client";

import { useEffect, useState } from "react";
import { Variants } from "framer-motion";
import { BlogPost, Categoria, Paquete } from "@/types";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import WhatsAppButton from "@/components/WhatsAppButton";
import Newsletter from "@/components/Newsletter";
import ProductsSection from "@/components/sections/ProductsSection";
import CategoriesSection from "@/components/sections/CategoriesSection";
import ContactSectionBlock from "@/components/sections/ContactSectionBlock";
import BlogSection from "@/components/sections/BlogSection";
import InstagramSection from "@/components/sections/InstagramSection";
import WhiteLabelButton from "@/components/WhiteLabelButton";

const smoothRiseVariants: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1], // Easing más dramático
    },
  },
};

const elegantDropVariants: Variants = {
  hidden: { opacity: 0, y: -48 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.82,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const driftInLeftVariants: Variants = {
  hidden: { opacity: 0, x: -72, rotate: -1.5 },
  visible: {
    opacity: 1,
    x: 0,
    rotate: 0,
    transition: {
      duration: 0.88,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const driftInRightVariants: Variants = {
  hidden: { opacity: 0, x: 72, rotate: 1.5 },
  visible: {
    opacity: 1,
    x: 0,
    rotate: 0,
    transition: {
      duration: 0.88,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const staggerFastVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

const editorialLiftVariants: Variants = {
  hidden: { opacity: 0, y: 36, scale: 0.98, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.78,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const softScaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 24, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.85,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const spotlightUpVariants: Variants = {
  hidden: { opacity: 0, y: 42, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const compactStaggerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.14,
    },
  },
};

const energeticStaggerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.12,
    },
  },
};

interface HomeClientProps {
  paquetes: Paquete[];
  paquetesF1: Paquete[];
  categorias: Categoria[];
  productosOrdenados: Array<
    | { tipo: "paquete" | "f1"; paquete: Paquete }
    | { tipo: "subtitle"; titulo: string }
  >;
  banners: string[];
  blogPosts: BlogPost[];
}

export default function HomeClient({
  paquetes,
  paquetesF1,
  categorias,
  productosOrdenados,
  banners,
  blogPosts,
}: HomeClientProps) {
  const SHOW_INSTAGRAM_SECTION = false;
  const HOME_PACKAGES_LIMIT = 8;
  const HOME_CATEGORIES_LIMIT = 8;
  const HOME_F1_LIMIT = 8;
  const HOME_BLOG_LIMIT = 4;
  const [bannerIndex, setBannerIndex] = useState(0);
  const paquetesBase =
    paquetes.length > 0
      ? paquetes
      : productosOrdenados.filter(
          (item): item is { tipo: "paquete"; paquete: Paquete } => item.tipo === "paquete"
        ).map((item) => item.paquete);
  const f1Base =
    paquetesF1.length > 0
      ? paquetesF1
      : productosOrdenados.filter(
          (item): item is { tipo: "f1"; paquete: Paquete } => item.tipo === "f1"
        ).map((item) => item.paquete);
  const paqueteItems =
    paquetesBase.slice(0, HOME_PACKAGES_LIMIT).map((paquete) => ({ tipo: "paquete" as const, paquete }));
  const f1Items =
    f1Base.slice(0, HOME_F1_LIMIT).map((paquete) => ({ tipo: "f1" as const, paquete }));
  const categoriasItems = categorias.slice(0, HOME_CATEGORIES_LIMIT);
  const showAllPackages = paquetesBase.length > HOME_PACKAGES_LIMIT;
  const showAllCategories = categorias.length > HOME_CATEGORIES_LIMIT;
  const showAllF1 = f1Base.length > HOME_F1_LIMIT;
  const showAllBlog = blogPosts.length > HOME_BLOG_LIMIT;

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % banners.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [banners]);

  return (
    <div className="overflow-x-hidden">
      <Navbar transparent={true} />
      <WhatsAppButton />

      {/* Hero Section */}
      <Hero
        backgroundImage={banners[bannerIndex] || "/images/hero-placeholder.svg"}
        backgroundImageMobile={banners[bannerIndex] || "/images/hero-placeholder.svg"}
        backgroundImageDesktop={banners[bannerIndex] || "/images/hero-placeholder.svg"}
        bannerImages={banners}
        activeBannerIndex={bannerIndex}
        onBannerIndexChange={setBannerIndex}
        height="xl"
      />

      <ProductsSection
        items={paqueteItems}
        filterType="paquete"
        sectionBadge="Paquetes"
        sectionTitle="Tus próximas vacaciones"
        viewAllHref="/paquetes"
        showViewAll={showAllPackages}
        fadeInLeftVariants={driftInLeftVariants}
        fadeInRightVariants={driftInRightVariants}
        fadeInUpVariants={smoothRiseVariants}
        fadeInDownVariants={elegantDropVariants}
        fadeInScaleVariants={softScaleVariants}
        staggerFastVariants={compactStaggerVariants}
      />

      <section className="bg-white py-2 md:py-4">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex justify-center">
            <WhiteLabelButton className="rounded-full" />
          </div>
        </div>
      </section>

      <CategoriesSection
        categorias={categoriasItems}
        badgeLabel="Destinos"
        title="El destino que buscabas, está acá"
        subtitle=""
        viewAllHref="/destinos"
        showViewAll={showAllCategories}
        fadeInUpVariants={spotlightUpVariants}
        staggerFastVariants={staggerFastVariants}
      />

      <ProductsSection
        items={f1Items}
        filterType="f1"
        sectionBadge="F1"
        sectionTitle="Experiencias F1"
        sectionSubtitle="Paquetes premium, tickets oficiales y asesoramiento dedicado."
        viewAllHref="/f1"
        showViewAll={showAllF1}
        showDivider
        fadeInLeftVariants={driftInLeftVariants}
        fadeInRightVariants={driftInRightVariants}
        fadeInUpVariants={smoothRiseVariants}
        fadeInDownVariants={elegantDropVariants}
        fadeInScaleVariants={softScaleVariants}
        staggerFastVariants={energeticStaggerVariants}
      />

      <BlogSection
        posts={blogPosts}
        viewAllHref="/blog"
        showViewAll={showAllBlog}
        fadeInLeftVariants={driftInLeftVariants}
        fadeInRightVariants={smoothRiseVariants}
        fadeInUpVariants={editorialLiftVariants}
        fadeInDownVariants={elegantDropVariants}
        fadeInScaleVariants={softScaleVariants}
        staggerFastVariants={compactStaggerVariants}
      />

      {SHOW_INSTAGRAM_SECTION ? (
        <InstagramSection
          fadeInLeftVariants={driftInLeftVariants}
          fadeInRightVariants={driftInRightVariants}
          fadeInUpVariants={smoothRiseVariants}
          fadeInDownVariants={elegantDropVariants}
          fadeInScaleVariants={softScaleVariants}
          staggerFastVariants={staggerFastVariants}
        />
      ) : null}

      <ContactSectionBlock
        fadeInLeftVariants={driftInLeftVariants}
        fadeInRightVariants={driftInRightVariants}
        fadeInUpVariants={smoothRiseVariants}
        fadeInDownVariants={elegantDropVariants}
        fadeInScaleVariants={softScaleVariants}
        staggerFastVariants={staggerFastVariants}
      />

      {/* Newsletter */}
      <Newsletter />

      <Footer />
    </div>
  );
}
