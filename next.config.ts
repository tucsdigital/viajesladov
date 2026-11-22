import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

const r2PublicUrl =
  process.env.R2_PUBLIC_BASE ||
  process.env.NEXT_PUBLIC_R2_PUBLIC_BASE ||
  process.env.R2_PUBLIC_URL ||
  process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

const getRemoteHostname = (value?: string) => {
  if (!value) return undefined;
  try {
    return new URL(value).hostname;
  } catch {
    return undefined;
  }
};

const r2Hostname = getRemoteHostname(r2PublicUrl);
const legacyBlobHostPattern = '**.public.blob.vercel-storage.com';
const remotePatterns: RemotePattern[] = [
  {
    protocol: 'https',
    hostname: legacyBlobHostPattern,
  },
  ...(r2Hostname
    ? [
        {
          protocol: 'https' as const,
          hostname: r2Hostname,
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 año
  },
  // Configuración para uploads grandes
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    // Optimizar compilación para navegadores modernos
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  // Configuración de transpilación para reducir JavaScript antiguo
  transpilePackages: [],
  // Optimización de compilación - reducir transpilación para navegadores modernos
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Configuración de webpack para optimizar polyfills
  webpack: (config, { isServer }) => {
    // Reducir polyfills innecesarios
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
