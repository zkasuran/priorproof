"use client";

// Route-level error boundary for the demo. In Next.js 16 the boundary receives a
// stable `retry` prop that re-renders the segment, so a transient failure can be
// recovered without a full reload.

import { useEffect } from "react";
import styles from "./page.module.css";

export default function DemoError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className={styles.errorPanel} role="alert">
      <span className={styles.errorTitle}>Something went wrong</span>
      <span className={styles.errorMsg}>
        The demo page hit an unexpected error. Your data is untouched. Try again. If it keeps
        failing, reload the page.
      </span>
      <button type="button" className={styles.run} onClick={() => retry()}>
        Try again
      </button>
    </div>
  );
}
