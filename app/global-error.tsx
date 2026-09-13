"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

/**
 * Replaces pages/_error.js. The App Router equivalent is an error boundary
 * rather than a page, so the reporting that `captureUnderscoreErrorException`
 * did from getInitialProps happens in an effect here.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="mx-auto mt-24 max-w-content px-4 text-center">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Something went wrong
          </h1>
          <p className="mt-3 text-muted-foreground">
            The error has been reported. Try again, or head back to the chord
            editor.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 font-medium underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
