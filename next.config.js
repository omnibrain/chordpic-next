/** @type {import('next').NextConfig} */

const { withSentryConfig } = require("@sentry/nextjs");
const { Language } = require("@magic-translate/react");

const moduleExports = {
  reactStrictMode: true,
  swcMinify: true,
  // geist ships ESM that breaks Node's resolver during prerendering
  transpilePackages: ["geist"],
  i18n: {
    locales: [
      Language.EN,
      Language.ZH,
      Language.HI,
      Language.ES,
      Language.FR,
      Language.AR,
      Language.RU,
      Language.PT,
      Language.IT,
      Language.UR,
      Language.DE,
      Language.FA,
      Language.NL,
    ],
    defaultLocale: Language.EN,
  },
  async rewrites() {
    return [
      // The handler lives under /api so that `i18n` neither locale-prefixes it
      // nor redirects it on Accept-Language.
      { source: "/sitemap.xml", destination: "/api/sitemap" },
    ];
  },
};

const sentryWebpackPluginOptions = {
  silent: true,
};

module.exports = withSentryConfig(moduleExports, sentryWebpackPluginOptions);
