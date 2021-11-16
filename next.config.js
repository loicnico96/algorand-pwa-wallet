const withPWA = require('next-pwa')

module.exports = withPWA({
  eslint: {
    ignoreDuringBuilds: true,
  },
  poweredByHeader: false,
  pwa: {
    dest: "public",
  },
  reactStrictMode: true,
})
