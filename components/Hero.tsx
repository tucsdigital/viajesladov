'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

interface HeroProps {
  title?: string;
  subtitle?: string;
  backgroundImage?: string; // Fallback para compatibilidad
  backgroundImageMobile?: string;
  backgroundImageDesktop?: string;
  ctaText?: string;
  ctaLink?: string;
  bannerImages?: string[];
  activeBannerIndex?: number;
  onBannerIndexChange?: (nextIndex: number) => void;
  height?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Hero({
  title,
  subtitle,
  backgroundImage,
  backgroundImageMobile,
  backgroundImageDesktop,
  ctaText,
  ctaLink,
  bannerImages,
  activeBannerIndex,
  onBannerIndexChange,
  height = 'lg',
}: HeroProps) {
  const heightClasses = {
    sm: 'md:h-[400px]',
    md: 'md:h-[500px]',
    lg: 'md:h-[600px]',
    xl: 'md:h-[700px]',
  };

  // Determinar qué imágenes usar
  const fallbackMobileImage = backgroundImageMobile || backgroundImage || '/images/hero-default.jpg';
  const fallbackDesktopImage = backgroundImageDesktop || backgroundImage || '/images/hero-default.jpg';
  const banners = (bannerImages && bannerImages.length > 0 ? bannerImages : [fallbackDesktopImage]).filter(
    Boolean
  );
  const resolvedIndex =
    typeof activeBannerIndex === 'number' && banners.length > 0
      ? ((activeBannerIndex % banners.length) + banners.length) % banners.length
      : 0;
  const desktopImage = banners[resolvedIndex] || fallbackDesktopImage;
  const mobileImage = banners[resolvedIndex] || fallbackMobileImage;
  const showIndicators = banners.length > 1;

  const handleBannerChange = (nextIndex: number) => {
    if (!onBannerIndexChange || banners.length <= 1) return;
    const normalized = ((nextIndex % banners.length) + banners.length) % banners.length;
    onBannerIndexChange(normalized);
  };

  const trimmedTitle = title?.trim();
  const trimmedSubtitle = subtitle?.trim();
  const hasContent = Boolean(trimmedTitle || trimmedSubtitle || (ctaText && ctaLink));
  const lineRevealVariants = {
    hidden: { y: '100%' },
    visible: {
      y: '0%',
      transition: {
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <div
      className={`relative h-[70vw] ${heightClasses[height]} flex items-center justify-center overflow-hidden pt-20 bg-[#f4f4f4]`}
    >
      {/* Background Image Mobile - Optimizado con Next.js Image */}
      <div className="absolute inset-x-0 top-20 bottom-0 md:hidden">
        <div className="relative h-full w-full">
          <Image
            src={mobileImage}
            alt=""
            fill
            priority
            fetchPriority="high"
            className="object-cover object-center"
            quality={92}
            sizes="(max-width: 768px) 100vw, 100vw"
          />
        </div>
        {/* Degradado estilo Mercado Libre */}
        <div className="gradient pointer-events-none" />
      </div>
      {/* Background Image Desktop - Optimizado con Next.js Image */}
      <div className="hidden md:block absolute inset-x-0 top-20 bottom-0">
        <div className="relative h-full w-full">
          <Image
            src={desktopImage}
            alt=""
            fill
            priority
            fetchPriority="high"
            className="object-cover object-center"
            quality={85}
            sizes="100vw"
          />
        </div>
        {/* Degradado estilo Mercado Libre */}
        <div className="gradient pointer-events-none" />
      </div>

      {showIndicators && (
        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/40 px-3 py-2 text-xs text-white backdrop-blur-sm">
          <span className="text-white/80">
            {resolvedIndex + 1}/{banners.length}
          </span>
          <div className="flex items-center gap-1.5">
            {banners.map((_, index) => (
              <button
                key={`hero-dot-${index}`}
                type="button"
                aria-label={`Ir al banner ${index + 1}`}
                className={`h-2 w-2 rounded-full transition ${
                  index === resolvedIndex ? 'bg-secondary' : 'bg-white/40 hover:bg-white/70'
                }`}
                onClick={() => handleBannerChange(index)}
              />
            ))}
          </div>
        </div>
      )}

      {hasContent && (
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            {trimmedTitle && (
              <h1 className="text-lg md:text-lg lg:text-lg font-bold leading-tight overflow-hidden">
                <motion.span
                  className="block"
                  variants={lineRevealVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {trimmedTitle}
                </motion.span>
              </h1>
            )}
            {trimmedSubtitle && (
              <p className="text-base md:text-lg text-gray-200 max-w-3xl mx-auto overflow-hidden">
                <motion.span
                  className="block"
                  variants={lineRevealVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {trimmedSubtitle}
                </motion.span>
              </p>
            )}
            {ctaText && ctaLink && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-gray-900 hover:bg-gray-100 text-base px-8 py-6"
                >
                  <a href={ctaLink}>
                    {ctaText}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}

      {/* Scroll Indicator */}
      {!showIndicators && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white rounded-full flex items-start justify-center p-2"
          >
            <div className="w-1 h-3 bg-white rounded-full" />
          </motion.div>
        </motion.div>
      )}

      {showIndicators && (
        <motion.div
          className="absolute inset-0 z-0 md:hidden"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (!onBannerIndexChange) return;
            const swipe = info.offset.x;
            if (swipe < -60) handleBannerChange(resolvedIndex + 1);
            if (swipe > 60) handleBannerChange(resolvedIndex - 1);
          }}
        />
      )}
    </div>
  );
}

