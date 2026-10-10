import type { ReactNode } from "react";
import { headers } from "next/headers";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata = {
  title: {
    default: "PriorProof",
    template: "%s · PriorProof",
  },
  description:
    "Prove every prior-auth criterion against a cited span or return it as a named gap.",
};

// Set before first paint from storage, else the system preference. Runs during
// HTML parsing, so the theme is correct before anything is drawn (no FOUC).
const THEME_SCRIPT =
  "(function(){try{var t=localStorage.getItem('theme')||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t);}catch(e){}})();";

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }}
        />
      </head>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <Nav />
        <main id="main" className="site">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
