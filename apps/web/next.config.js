/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  // Redirects temporarios (307) para poder voltar atras sem cache. A query string e repassada pelo Next.
  async redirects() {
    return [
      { source: "/catalogo", destination: "/", permanent: false },
      { source: "/carrinho/detalhes", destination: "/carrinho", permanent: false },
      { source: "/checkout", destination: "/carrinho", permanent: false },
      { source: "/admin", destination: "/painel", permanent: false },
      { source: "/admin/login", destination: "/login?next=/painel", permanent: false }
    ];
  }
};

module.exports = nextConfig;
