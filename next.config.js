/** @type {import('next').NextConfig} */

const { withSentryConfig } = require("@sentry/nextjs/config");

const moduleExports = {
  reactStrictMode: true,
  // Compile the ESM font and translation entry points for prerendering and Jest.
  // svgdom is ESM-only and ships no CommonJS build, so it needs the same.
  transpilePackages: ["geist", "@magic-translate/react", "svgdom"],
  // The fonts are opened by path at runtime, so nothing traces them on its own.
  outputFileTracingIncludes: {
    "/**": [
      "./assets/fonts/*.ttf",
      "./node_modules/svguitar/dist/svguitar.umd.js",
    ],
  },
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
