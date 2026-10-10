// Site taxonomy. One source of truth for the category menu and the footer, so the
// information architecture stays consistent across the nav, the mobile panel and
// the footer sitemap.

export interface NavItem {
  label: string;
  href: string;
  desc: string;
}

export interface NavCategory {
  label: string;
  key: string;
  items: NavItem[];
}

export const NAV: NavCategory[] = [
  {
    label: "Product",
    key: "product",
    items: [
      { label: "Overview", href: "/", desc: "What PriorProof does" },
      {
        label: "Coverage matrix",
        href: "/product/matrix",
        desc: "Every criterion, proven or a named gap",
      },
      {
        label: "The packet",
        href: "/product/packet",
        desc: "The submission-ready output",
      },
      {
        label: "Refusal by design",
        href: "/product/refusal",
        desc: "Why a green always cites",
      },
    ],
  },
  {
    label: "Policies",
    key: "policies",
    items: [
      {
        label: "Policy library",
        href: "/policies",
        desc: "Real public payer policies",
      },
      {
        label: "Synthetic charts",
        href: "/charts",
        desc: "No-PHI patient records",
      },
      {
        label: "Coverage map",
        href: "/policies#coverage",
        desc: "Which criteria the demo chart proves",
      },
    ],
  },
  {
    label: "Reports",
    key: "reports",
    items: [
      {
        label: "Metrics",
        href: "/reports/metrics",
        desc: "Counts measured on the demo case",
      },
      {
        label: "Methodology",
        href: "/reports/methodology",
        desc: "How the two passes work",
      },
      {
        label: "Validation",
        href: "/reports/validation",
        desc: "The labelled test oracle",
      },
      {
        label: "Honesty and limits",
        href: "/reports/limits",
        desc: "What this is not",
      },
    ],
  },
  {
    label: "Developers",
    key: "developers",
    items: [
      {
        label: "Integration",
        href: "/developers/integration",
        desc: "Drive the engine from code",
      },
      {
        label: "API",
        href: "/developers/api",
        desc: "The streamed event protocol",
      },
      {
        label: "Engine",
        href: "/developers/engine",
        desc: "The shared type contract",
      },
      { label: "Docs", href: "/developers/docs", desc: "Run it locally" },
    ],
  },
];
