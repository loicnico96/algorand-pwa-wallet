const withPWA = require('next-pwa')
const runtimeCaching = require("next-pwa/cache")

module.exports = withPWA({
  eslint: {
    ignoreDuringBuilds: true,
  },
  poweredByHeader: false,
  pwa: {
    buildExcludes: [/middleware-manifest\.json$/],
    dest: "public",
    disable: !process.env.ENABLE_DEV_PWA && process.env.NODE_ENV !== "production",
    runtimeCaching,
  },
  reactStrictMode: true,
})
