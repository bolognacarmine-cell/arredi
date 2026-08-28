import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";

const nav = [
  { to: "/admin", label: "Dashboard", icon: "▦" },
  { to: "/admin/progetti", label: "Progetti", icon: "◫" },
  { to: "/admin/preventivi", label: "Preventivi", icon: "◱" },
  { to: "/admin/media", label: "Media", icon: "◧" },
  { to: "/admin/impostazioni", label: "Impostazioni", icon: "⚙" },
];

export default function AdminLayout() {
  const location = useLocation();
  const [sideOpen, setSideOpen] = useState(true);

  return (
    <div className="min-h-screen flex bg-[#F0EDE6]">
      {/* SIDEBAR */}
      <aside
        className={`${sideOpen ? "w-56" : "w-14"} flex-shrink-0 bg-[#1A1A18] flex flex-col transition-all duration-200 fixed h-full z-40`}
      >
        <div className="h-14 flex items-center gap-3 px-4 border-b border-white/10">
          <span className="w-5 h-5 bg-[#B5965A] rounded-sm flex-shrink-0" />
          {sideOpen && (
            <span className="font-display text-sm font-medium text-white truncate">
              ArtigianaLegno
            </span>
          )}
        </div>

        <nav className="flex-1 py-6 space-y-1 px-2">
          {nav.map((item) => {
            const active = location.pathname === item.to || (item.to !== "/admin" && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-[#1B4332] text-white"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="text-base flex-shrink-0">{item.icon}</span>
                {sideOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="px-2 pb-4 border-t border-white/10 pt-4">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            <span className="flex-shrink-0">←</span>
            {sideOpen && <span>Vai al sito</span>}
          </Link>
        </div>
      </aside>

      {/* MAIN */}
      <div className={`${sideOpen ? "ml-56" : "ml-14"} flex-1 flex flex-col transition-all duration-200`}>
        {/* Header */}
        <header className="h-14 bg-white border-b border-[#DDD9D0] flex items-center justify-between px-6 sticky top-0 z-30">
          <button
            onClick={() => setSideOpen(!sideOpen)}
            className="text-[#888580] hover:text-[#1A1A18] transition-colors"
          >
            ☰
          </button>
          <div className="flex items-center gap-4">
            <span className="text-xs text-[#888580]">Marco Ferretti</span>
            <div className="w-8 h-8 bg-[#1B4332] rounded-full flex items-center justify-center text-white text-xs font-medium">
              MF
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
