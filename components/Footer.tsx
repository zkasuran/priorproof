import Link from "next/link";
import { NAV } from "./nav-data";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.about}>
          <span className={styles.brand}>PriorProof</span>
          <p className={styles.tag}>
            Prove every prior-auth criterion against a cited span or return it as
            a named gap.
          </p>
          <p className={styles.trust}>
            No PHI. Real public policies. Synthetic charts only.
          </p>
        </div>
        <nav className={styles.cols} aria-label="Footer">
          {NAV.map((cat) => (
            <div key={cat.key} className={styles.col}>
              <p className={styles.colTitle}>{cat.label}</p>
              <ul>
                {cat.items.map((it) => (
                  <li key={it.href}>
                    <Link href={it.href} className={styles.link}>
                      {it.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className={`container ${styles.base}`}>
        <span>Built for neatHack 2026. A software demonstration, not medical advice.</span>
        <Link href="/demo" className={styles.link}>
          Run the demo
        </Link>
      </div>
    </footer>
  );
}
