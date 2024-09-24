// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://2eff873a5213021e358f14c536cc56f1@o4508007867613184.ingest.de.sentry.io/4508007869579344",

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 0.5,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
