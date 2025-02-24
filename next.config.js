/** @type {import('next').NextConfig} */

const { withSentryConfig } = require("@sentry/nextjs");
const { Language } = require("@magic-translate/react");

const moduleExports = {
  reactStrictMode: true,
  swcMinify: true,
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
};

const sentryWebpackPluginOptions = {
  silent: true,
};

module.exports = withSentryConfig(moduleExports, sentryWebpackPluginOptions);
