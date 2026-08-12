import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

// The core sections staff use daily, per spec -- deliberately a flat list
// (no hamburger/overflow menu) so they're always one tap away.
const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: "\u{1F3E0}" },
  { to: "/products", label: "Products", icon: "\u{1F3F7}\u{FE0F}" },
  { to: "/sales", label: "Sales", icon: "\u{1F4B5}" },
  { to: "/stock", label: "Stock", icon: "\u{1F4E6}" },
  { to: "/expenses", label: "Expenses", icon: "\u{1F9FE}" },
  { to: "/reports", label: "Reports", icon: "\u{1F4CA}" },
];

// Single layout tree for both viewports, per spec ("One responsive layout
// ... not separate mobile/desktop code paths"). The same NAV_ITEMS list
// renders as a bottom tab bar below md (768px) and as a left sidebar at
// md and above -- CSS (Tailwind's `md:` variants) does the switching, not
// a JS viewport check, so there's no layout flash or duplicated markup.
//
// The nav surfaces (sidebar + bottom bar) are the one place this design
// commits to the dark "ink" surface -- everything else stays on the warm
// paper "canvas" background, so the nav reads as a distinct, permanent
// fixture (like a tool belt) rather than just another panel.
export function AppLayout() {
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-canvas md:flex-row">
      {/* Desktop sidebar */}
      <nav
        aria-label="Main navigation"
        className="hidden w-56 shrink-0 flex-col bg-ink p-4 md:flex"
      >
        <div className="mb-6 flex items-center gap-2 px-2">
          {/* Hang-tag logo mark: a brass tab with a punched hole, matching
              the motif reused in PageHeader on every screen. */}
          <span
            aria-hidden="true"
            className="relative inline-flex h-6 w-4 shrink-0 rounded-sm bg-brass before:absolute before:left-1/2 before:top-1.5 before:h-1 before:w-1 before:-translate-x-1/2 before:rounded-full before:bg-ink"
          />
          <p className="font-display text-base font-bold uppercase tracking-wide text-canvas">
            Stock &amp; HPP
          </p>
        </div>
        <ul className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                   focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass
                   ${isActive ? "bg-brass text-white" : "text-canvas/70 hover:bg-ink-soft hover:text-canvas"}`
                }
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={logout}
          className="min-h-[44px] rounded-lg px-3 py-2 text-left text-sm font-medium text-canvas/50 hover:bg-ink-soft hover:text-canvas/80"
        >
          Log out
        </button>
      </nav>

      {/* Main content -- bottom padding on mobile clears the fixed nav bar */}
      <main className="flex-1 px-4 pb-24 pt-6 md:px-8 md:pb-8 md:pt-8">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav
        aria-label="Main navigation"
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-ink-soft bg-ink md:hidden"
      >
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium transition-colors
               focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brass
               ${isActive ? "text-brass" : "text-canvas/60"}`
            }
          >
            <span aria-hidden="true" className="text-lg">
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
