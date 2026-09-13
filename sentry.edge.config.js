// This file configures the initialization of Sentry in the edge runtime.
// Nothing runs there today — proxy.ts is nodejs — but the branch in
// instrumentation.ts used to load the browser config, which is wrong for any
// edge route somebody adds later.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN || 'https://e34c5fd2adc64d2a96fd7179e6564d21@o4504032663240704.ingest.sentry.io/4504032664223744',
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,
  // ...
  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps
});
