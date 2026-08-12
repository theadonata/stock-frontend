// Every screen's title is rendered as a small hang-tag: a brass tab with a
// punched "hole" sits to the left of an uppercase, tracked label -- the
// same shape as the string-tag on a bag, echoing the source spreadsheet's
// product names ("[Black] Croco Nocturne Bag") this app was built to
// replace. It's the one signature element repeated across every page,
// deliberately kept small and quiet everywhere else.
export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="relative inline-flex h-7 w-5 shrink-0 rounded-sm bg-brass shadow-card before:absolute before:left-1/2 before:top-1.5 before:h-1.5 before:w-1.5 before:-translate-x-1/2 before:rounded-full before:bg-canvas"
      />
      <div>
        <h1 className="font-display text-xl font-bold uppercase tracking-wide text-ink">{title}</h1>
        {subtitle && <p className="text-sm text-stone">{subtitle}</p>}
      </div>
    </div>
  );
}
