/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  // CSS crítico embutido no HTML: elimina as folhas de estilo que bloqueiam a renderização.
  experimental: { inlineCss: true },
};
export default nextConfig;
