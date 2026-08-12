import type { ReactNode } from "react";

// Plain content container reused for dashboard summary tiles, ledger cards,
// and the mobile stacked-card rendering of ResponsiveTable rows -- one
// visual definition of "a card" (border, radius, padding, shadow) everywhere.
//
// The dashed brass top edge is a deliberate, restrained nod to stitching on
// a bag panel -- the app's one recurring material detail, kept subtle
// enough not to fight with the data inside the card.
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl border border-stone-light border-t-2 border-t-brass/40 bg-white p-4 shadow-card ${className}`}
    >
      {children}
    </div>
  );
}
