import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const [ddOpen, setDdOpen] = useState(false);
  const ddRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e) {
      if (ddRef.current && !ddRef.current.contains(e.target)) {
        setDdOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = user?.name
    ? user.name
        .split(" ")
        .filter(Boolean)
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "??";

  const navItem =
    "flex items-center h-[54px] text-[12px] text-[#9a9488] px-4 " +
    "border-b-2 border-transparent tracking-[.03em] cursor-pointer " +
    "transition-colors hover:text-cream";
  const activeNav = navItem + " !text-cream !border-b-cream";

  return (
    <header className="bg-ink h-[54px] flex items-center justify-between px-8 relative z-50 shadow-md">
      {/* Logo */}
      <button
        onClick={() => navigate("/dashboard")}
        className="font-serif text-[19px] font-semibold text-cream tracking-[.01em] hover:opacity-90 transition-opacity"
      >
        Fin<em className="not-italic font-normal">sight</em>
      </button>

      {/* Nav */}
      <nav className="flex h-[54px]">
        {[
          { to: "/dashboard",    label: "Dashboard"    },
          { to: "/transactions", label: "Transactions" },
          { to: "/budgets",      label: "Budgets"      },
          { to: "/analytics",    label: "Analytics"    },
        ].map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => (isActive ? activeNav : navItem)}
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Avatar + Dropdown */}
      <div className="relative" ref={ddRef}>
        <button
          onClick={() => setDdOpen((o) => !o)}
          className="w-8 h-8 rounded-full bg-[#2e2c28] border border-[#555]
                     flex items-center justify-center font-serif text-[12px]
                     text-cream font-semibold select-none hover:bg-ink-2
                     transition-colors"
          title={user?.name}
        >
          {initials}
        </button>

        {ddOpen && (
          <div className="absolute right-0 top-[46px] bg-white border border-border
                          rounded-[4px] min-w-[190px] z-[200] overflow-hidden shadow-xl animate-in">
            {/* Header */}
            <div className="px-4 py-3 bg-cream-2 border-b border-border">
              <div className="font-serif text-[14px] font-semibold text-ink">
                {user?.name}
              </div>
              <div className="text-[11px] text-ink-3 mt-0.5 truncate max-w-[160px]">{user?.email}</div>
            </div>

            {[
              { icon: "ti-user-circle", label: "Profile",       to: "/profile"  },
              { icon: "ti-settings",    label: "Settings",      to: "/settings" },
            ].map(({ icon, label, to }) => (
              <button
                key={to}
                onClick={() => { setDdOpen(false); navigate(to); }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-[12px]
                           text-ink-2 hover:bg-cream-2 transition-colors text-left"
              >
                <i className={`${icon} text-ink-3 text-[15px] w-4`} />
                {label}
              </button>
            ))}

            <div className="h-px bg-border" />

            <button
              onClick={() => { setDdOpen(false); navigate("/notifications"); }}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-[12px]
                         text-ink-2 hover:bg-cream-2 transition-colors text-left"
            >
              <i className="ti-bell text-ink-3 text-[15px] w-4" />
              Notifications
            </button>

            <div className="h-px bg-border" />

            <button
              onClick={() => { logout(); navigate("/login"); }}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-[12px]
                         text-fred hover:bg-cream-2 transition-colors text-left"
            >
              <i className="ti-logout text-fred text-[15px] w-4" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
