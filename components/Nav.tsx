"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { NAV } from "./nav-data";
import styles from "./Nav.module.css";

export default function Nav() {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);

  const closeAll = useCallback(() => {
    setOpenKey(null);
    setMobileOpen(false);
  }, []);

  // Escape closes the menus; a pointer outside the nav closes them too.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeAll();
    }
    function onPointer(e: PointerEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        closeAll();
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [closeAll]);

  return (
    <header className={styles.header}>
      <nav className={styles.inner} ref={navRef} aria-label="Primary">
        {/* NAV-BODY */}
        <Link
          href="/"
          className={styles.brand}
          aria-label="PriorProof home"
          onClick={closeAll}
        >
          <svg
            className={styles.mark}
            viewBox="0 0 24 24"
            width="24"
            height="24"
            aria-hidden="true"
          >
            <path
              d="M12 2.2 4 5.4v6.1c0 4.6 3.2 7.9 8 10.3 4.8-2.4 8-5.7 8-10.3V5.4L12 2.2Z"
              fill="var(--acc)"
            />
            <path
              d="m8.4 12 2.6 2.6 4.6-5"
              fill="none"
              stroke="var(--acc-ink)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className={styles.word}>PriorProof</span>
        </Link>

        <ul className={styles.cats}>
          {NAV.map((cat) => {
            const open = openKey === cat.key;
            return (
              <li
                key={cat.key}
                className={styles.cat}
                onMouseEnter={() => setOpenKey(cat.key)}
                onMouseLeave={() => setOpenKey(null)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setOpenKey((k) => (k === cat.key ? null : k));
                  }
                }}
              >
                <button
                  type="button"
                  className={styles.trigger}
                  aria-haspopup="true"
                  aria-expanded={open}
                  aria-controls={`menu-${cat.key}`}
                  onClick={() => setOpenKey(open ? null : cat.key)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setOpenKey(cat.key);
                      e.currentTarget.parentElement
                        ?.querySelector<HTMLAnchorElement>(
                          `#menu-${cat.key} a`,
                        )
                        ?.focus();
                    }
                  }}
                >
                  {cat.label}
                  <svg
                    className={styles.caret}
                    viewBox="0 0 16 16"
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <path d="m4 6 4 4 4-4" strokeLinecap="round" />
                  </svg>
                </button>
                <div className={styles.panelWrap} data-open={open}>
                  <ul
                    className={styles.panel}
                    id={`menu-${cat.key}`}
                    role="menu"
                    aria-label={cat.label}
                  >
                    {cat.items.map((it) => (
                      <li key={it.href} role="none">
                        <Link
                          href={it.href}
                          role="menuitem"
                          className={styles.item}
                          onClick={closeAll}
                        >
                          <span className={styles.itemLabel}>{it.label}</span>
                          <span className={styles.itemDesc}>{it.desc}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          })}
        </ul>

        {/* NAV-ACTIONS */}
        <div className={styles.actions}>
          <Link
            href="/demo"
            className={`btn btn--primary btn--sm ${styles.run}`}
            onClick={closeAll}
          >
            Run the demo
          </Link>
          <ThemeToggle />
          <button
            type="button"
            className={styles.burger}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobileOpen((o) => !o)}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {mobileOpen ? (
                <path d="M6 6l12 12M18 6 6 18" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      <div className={styles.mobile} id="mobile-menu" hidden={!mobileOpen}>
        <div className={styles.mobileInner}>
          <Link href="/demo" className="btn btn--primary" onClick={closeAll}>
            Run the demo
          </Link>
          {NAV.map((cat) => (
            <div key={cat.key} className={styles.mgroup}>
              <p className={styles.mgroupTitle}>{cat.label}</p>
              <ul className={styles.mlist}>
                {cat.items.map((it) => (
                  <li key={it.href}>
                    <Link href={it.href} className={styles.mitem} onClick={closeAll}>
                      <span className={styles.itemLabel}>{it.label}</span>
                      <span className={styles.itemDesc}>{it.desc}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
