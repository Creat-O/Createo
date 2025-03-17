import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  integrations: [Sentry.replayIntegration()],
  tracesSampleRate: 1.0,
  enabled: !!dsn,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
});
