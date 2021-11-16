const withPWA = require('next-pwa')

module.exports = withPWA({
  eslint: {
    ignoreDuringBuilds: true,
  },
  poweredByHeader: false,
  pwa: {
    dest: "public",
    disable: !process.env.ENABLE_DEV_PWA && process.env.NODE_ENV !== "production",
    register: true,
  },
  reactStrictMode: true,
})
