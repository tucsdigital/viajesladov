'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import BlogCard from '@/components/BlogCard';
import { BlogPost } from '@/types';

interface BlogSectionProps {
  posts: BlogPost[];
  fadeInLeftVariants: Variants;
  fadeInRightVariants: Variants;
  fadeInUpVariants: Variants;
  fadeInDownVariants: Variants;
  fadeInScaleVariants: Variants;
  staggerFastVariants: Variants;
  viewAllHref?: string;
  viewAllLabel?: string;
  showViewAll?: boolean;
}

export default function BlogSection({
  posts,
  fadeInLeftVariants,
  fadeInRightVariants,
  fadeInUpVariants,
  fadeInDownVariants,
  fadeInScaleVariants,
  staggerFastVariants,
  viewAllHref,
  viewAllLabel = 'Ver todos',
  showViewAll = true,
}: BlogSectionProps) {
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

  if (posts.length === 0) return null;

  return (
    <section className="py-8 md:py-12 bg-white border-t border-gray-200 overflow-x-hidden">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          className="mb-10 flex flex-col gap-5 md:mb-14 md:flex-row md:items-end md:justify-between"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-150px" }}
          variants={staggerFastVariants}
          transition={{ staggerChildren: 0.16, delayChildren: 0.2 }}
        >
          <div className="max-w-3xl">
            <motion.div className="inline-block mb-4" variants={fadeInDownVariants}>
              <span className="badge-pluma pluma-underline block">Blog</span>
            </motion.div>
            <motion.h2
              className="text-lg md:text-lg lg:text-lg font-bold leading-tight overflow-hidden"
              variants={fadeInRightVariants}
              transition={{ duration: 0.7 }}
            >
              <motion.span className="block" variants={lineRevealVariants}>
                Últimas noticias
              </motion.span>
            </motion.h2>
            <motion.p
              className="text-sm md:text-sm text-[#4B5563] overflow-hidden"
              variants={fadeInUpVariants}
              transition={{ duration: 0.65 }}
            >
              <motion.span className="block" variants={lineRevealVariants}>
                Novedades, lanzamientos y tips para viajar mejor.
              </motion.span>
            </motion.p>
          </div>

          {viewAllHref && showViewAll ? (
            <motion.div className="shrink-0" variants={fadeInLeftVariants}>
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

        <motion.div
          className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
          variants={fadeInScaleVariants}
          transition={{ duration: 0.65, delay: 0.05 }}
        >
          {posts.slice(0, 4).map((post, index) => (
            <BlogCard key={post.id} post={post} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
