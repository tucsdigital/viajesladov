import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/lib/constants';
import { getBlogListData } from '@/lib/blogListData';
import BlogListClient from '@/components/BlogListClient';

export const revalidate = 60;

const siteUrl = SITE_URL || 'https://viajesladov.com.ar';

export const metadata: Metadata = {
  title: `Blog - ${SITE_NAME}`,
  description: 'Novedades, lanzamientos y tips para viajar mejor.',
  alternates: { canonical: `${siteUrl}/blog` },
  openGraph: {
    type: 'website',
    url: `${siteUrl}/blog`,
    title: `Blog - ${SITE_NAME}`,
    description: 'Novedades, lanzamientos y tips para viajar mejor.',
    siteName: SITE_NAME,
    locale: 'es_AR',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Blog - ${SITE_NAME}`,
    description: 'Novedades, lanzamientos y tips para viajar mejor.',
  },
};

export default async function BlogPage() {
  const data = await getBlogListData();

  return <BlogListClient posts={data.posts} banners={data.banners} />;
}
