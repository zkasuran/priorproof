import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "PriorProof",
  description: "Prove every prior-auth criterion or return it as a named gap.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
