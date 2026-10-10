"use client";

import Link from "next/link";

// Route-level error boundary. It replaces only the page content, so the header,
// the nav and the footer in the root layout stay rendered. One broken page never
// blanks the site.
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="container section">
      <div className="pagehead">
        <span className="eyebrow">Something went wrong</span>
        <h1>This page hit an error</h1>
        <p className="lead">
          The rest of the site still works. Try again or head back to the
          overview.
        </p>
      </div>
      <div className="btnrow">
        <button type="button" className="btn btn--primary" onClick={reset}>
          Try again
        </button>
        <Link className="btn" href="/">
          Back to overview
        </Link>
      </div>
    </section>
  );
}
