/** @type {import('next').NextConfig} */

const { withSentryConfig } = require("@sentry/nextjs/config");

const moduleExports = {
  reactStrictMode: true,
  // Compile the ESM font and translation entry points for prerendering and Jest.
  transpilePackages: ["geist", "@magic-translate/react"],
  async rewrites() {
    return [
      // Keep the existing XML endpoint while page routes live in app/.
      { source: "/sitemap.xml", destination: "/api/sitemap" },
    ];
  },
};

const sentryWebpackPluginOptions = {
  silent: true,
};

module.exports = withSentryConfig(moduleExports, sentryWebpackPluginOptions);
