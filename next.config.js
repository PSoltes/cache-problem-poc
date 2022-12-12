/* eslint-disable no-process-env */
/* eslint-disable import/no-extraneous-dependencies */
const withBundleAnalyzer = require('@next/bundle-analyzer')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const webpack = require('webpack')

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  webpack(config, { nextRuntime }) {
    config.plugins.push(
      new CaseSensitivePathsPlugin(),
      // new DuplicatePackageCheckerPlugin(),
      new webpack.EnvironmentPlugin(process.env)
    )

    if (typeof nextRuntime === 'undefined') {
      // eslint-disable-next-line no-param-reassign
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false, // do not bring node:crypto fallback to client
      }
    }

    return config
  },
  async redirects() {
    return [
      {
        source: '/api-tokens',
        destination: '/api-keys',
        permanent: true,
      },
    ]
  },
  productionBrowserSourceMaps: process.env.ANALYZE === 'true',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    deviceSizes: [384, 640, 750, 828, 1080, 1200],
  },
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
}

const plugins = [bundleAnalyzer]

module.exports = () => plugins.reduce((acc, next) => next(acc), nextConfig)
