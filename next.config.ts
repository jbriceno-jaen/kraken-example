import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  typescript: {
    ignoreBuildErrors: false,
  },
  // Optimize package imports for faster compilation with Turbopack
  experimental: {
    // Enable file system cache for Turbopack (faster subsequent builds)
    // This caches compilation results between dev server restarts
    turbopackFileSystemCacheForDev: true,
    // Optimize tree-shaking for large packages
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-avatar",
      "@radix-ui/react-navigation-menu",
    ],
  },
};

export default nextConfig;
