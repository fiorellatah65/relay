// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   eslint: {
//     ignoreDuringBuilds: true,
//   },
//   typescript: {
//     ignoreBuildErrors: true, // Agrega esta línea también
//   },
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: '*.supabase.co',
//         port: '',
//         pathname: '/storage/v1/object/public/**',
//       },
//     ],
//   },
// };

// module.exports = nextConfig;

// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
}

module.exports = nextConfig