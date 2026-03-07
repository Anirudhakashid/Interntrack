export const COLORS = {
  blue: "#2563eb",
  green: "#16a34a",
  amber: "#d97706",
  violet: "#7c3aed",
  red: "#dc2626",
  cyan: "#0891b2",
  pink: "#db2777",
  orange: "#ea580c",
  teal: "#0d9488",
  indigo: "#4f46e5",
};

export const PALETTE = Object.values(COLORS);

export const BRANCH_COLORS: Record<string, string> = {
  "Computer Science": COLORS.blue,
  Mechanical: COLORS.red,
  Electrical: COLORS.green,
  Civil: COLORS.amber,
  Electronics: COLORS.violet,
  Chemical: COLORS.pink,
  Aerospace: COLORS.cyan,
  Biomedical: COLORS.teal,
  "Not Specified": "#9ca3af",
};

export const STIPEND_COLORS: Record<string, string> = {
  Paid: COLORS.green,
  Unpaid: COLORS.red,
  Unknown: "#9ca3af",
};

export const MODE_COLORS: Record<string, string> = {
  Online: COLORS.blue,
  Offline: COLORS.green,
  Hybrid: COLORS.amber,
  Unknown: "#9ca3af",
};

export const STATUS_FILTERS = [
  { key: "all" as const, label: "All Students" },
  { key: "ongoing" as const, label: "Ongoing" },
  { key: "completed" as const, label: "Completed" },
];

export const MODE_FILTERS = [
  { key: "onsite" as const, label: "On-site" },
  { key: "remote" as const, label: "Remote" },
  { key: "hybrid" as const, label: "Hybrid" },
];
