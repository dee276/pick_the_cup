import { Link, useLocation } from "wouter";
import { Home, Dribbble, BarChart3, Trophy, User, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Show, useUser } from "@clerk/react";

interface AppLayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Accueil" },
  { href: "/predictions", icon: Dribbble, label: "Pronostics" },
  { href: "/standings", icon: BarChart3, label: "Classements" },
  { href: "/league", icon: Trophy, label: "Ma Ligue" },
  { href: "/profile", icon: User, label: "Profil" },
];

function useActiveNav(location: string) {
  return (href: string) =>
    href === "/" ? location === "/" : location.startsWith(href);
}

/* ─── Sidebar (md+) ─────────────────────────────────────────── */
function Sidebar({ collapsed }: { collapsed: boolean }) {
  const [location] = useLocation();
  const isActive = useActiveNav(location);
  const { user } = useUser();

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen sticky top-0 bg-white border-r border-[#E2E8F0] transition-all duration-300 flex-shrink-0",
        collapsed ? "w-16" : "w-56",
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center gap-2.5 px-4 py-5 border-b border-[#F1F5F9]", collapsed && "justify-center px-0")}>
        <div className="w-8 h-8 rounded-xl bg-[#2563EB] flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-black">🏆</span>
        </div>
        {!collapsed && (
          <span className="text-[#1E293B] font-black text-base tracking-tight">PickTheCup</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 cursor-pointer",
                  active
                    ? "bg-[#EFF6FF] text-[#2563EB]"
                    : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]",
                  collapsed && "justify-center px-0",
                )}
                title={collapsed ? label : undefined}
              >
                <Icon
                  className={cn("w-5 h-5 flex-shrink-0", active ? "text-[#2563EB]" : "text-[#64748B]")}
                  strokeWidth={active ? 2.5 : 2}
                />
                {!collapsed && (
                  <span className={cn("text-sm font-semibold", active ? "text-[#2563EB]" : "text-[#64748B]")}>
                    {label}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User avatar at bottom */}
      <div className={cn("border-t border-[#F1F5F9] px-3 py-4", collapsed && "flex justify-center px-0")}>
        <Show when="signed-in">
          <Link href="/profile">
            <div className={cn("flex items-center gap-2.5 cursor-pointer group", collapsed && "justify-center")}>
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt="" className="w-8 h-8 rounded-full object-cover border border-[#E2E8F0]" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">
                    {(user?.firstName?.[0] ?? user?.emailAddresses?.[0]?.emailAddress?.[0] ?? "U").toUpperCase()}
                  </span>
                </div>
              )}
              {!collapsed && (
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#1E293B] truncate group-hover:text-[#2563EB] transition-colors">
                    {user?.firstName || user?.username || "Fan"}
                  </p>
                  <p className="text-[10px] text-[#94A3B8] truncate">Mon profil</p>
                </div>
              )}
            </div>
          </Link>
        </Show>
        <Show when="signed-out">
          <Link href="/sign-in">
            <div className={cn("flex items-center gap-2 cursor-pointer group", collapsed && "justify-center")}>
              <div className="w-8 h-8 rounded-full bg-[#F1F5F9] flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-[#94A3B8]" />
              </div>
              {!collapsed && (
                <span className="text-xs font-semibold text-[#64748B] group-hover:text-[#2563EB] transition-colors">
                  Se connecter
                </span>
              )}
            </div>
          </Link>
        </Show>
      </div>
    </aside>
  );
}

/* ─── Bottom Tab Bar (mobile only) ──────────────────────────── */
function BottomNav() {
  const [location] = useLocation();
  const isActive = useActiveNav(location);

  return (
    <nav className="md:hidden absolute bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2 pb-6 safe-area-bottom">
      <div className="flex justify-between items-center">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} className="flex-1 flex flex-col items-center gap-1 group">
              <div
                className={cn(
                  "p-2 rounded-xl transition-all duration-200 group-active:scale-95",
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-slate-50",
                )}
              >
                <Icon className="w-6 h-6" strokeWidth={active ? 2.5 : 2} />
              </div>
              <span className={cn("text-[10px] font-medium transition-colors", active ? "text-primary" : "text-muted-foreground")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/* ─── Top bar for tablet/desktop ────────────────────────────── */
function Topbar({ onToggle, collapsed }: { onToggle: () => void; collapsed: boolean }) {
  return (
    <div className="hidden md:flex items-center h-14 px-4 border-b border-[#F1F5F9] bg-white sticky top-0 z-10">
      <button
        onClick={onToggle}
        className="p-1.5 rounded-lg hover:bg-[#F1F5F9] transition-colors text-[#64748B]"
        title={collapsed ? "Ouvrir le menu" : "Réduire le menu"}
      >
        {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
      </button>
      <span className="ml-3 text-sm font-semibold text-[#64748B]">Coupe du Monde 2026 · Données officielles</span>
    </div>
  );
}

/* ─── Main Layout ────────────────────────────────────────────── */
export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <>
      {/* ── Mobile shell (< md) ── */}
      <div className="md:hidden min-h-screen bg-slate-100 flex justify-center">
        <div className="w-full max-w-sm bg-background shadow-xl flex flex-col relative overflow-hidden h-[100dvh]">
          <main className="flex-1 overflow-y-auto pb-20 scrollbar-hide">{children}</main>
          <BottomNav />
        </div>
      </div>

      {/* ── Desktop/Tablet shell (md+) ── */}
      <div className="hidden md:flex h-screen overflow-hidden bg-slate-50">
        <Sidebar collapsed={sidebarCollapsed} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar onToggle={() => setSidebarCollapsed((v) => !v)} collapsed={sidebarCollapsed} />
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-6xl mx-auto px-6 py-6">{children}</div>
          </main>
        </div>
      </div>
    </>
  );
}
