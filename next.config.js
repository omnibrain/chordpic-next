/** @type {import('next').NextConfig} */

const { withSentryConfig } = require("@sentry/nextjs/config");
const { Language } = require("@magic-translate/core");

const moduleExports = {
  reactStrictMode: true,
  // geist ships ESM that breaks Node's resolver during prerendering
  transpilePackages: ["geist"],
  // No `i18n` block: it is Pages-Router only, and with an app/ directory
  // present Next fails the static export outright ("provided export path
  // '/x' doesn't match the '/[locale]/x' page"). Locale routing now lives in
  // app/[locale] plus the rewrite in proxy.ts.
};

const sentryWebpackPluginOptions = {
  silent: true,
};

module.exports = withSentryConfig(moduleExports, sentryWebpackPluginOptions);
