import { Link, useLocation } from "wouter";
import { Home, Dribbble, BarChart3, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileLayoutProps {
  children: React.ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/predictions", icon: Dribbble, label: "Matches" },
    { href: "/standings", icon: BarChart3, label: "Standings" },
    { href: "/league", icon: Trophy, label: "League" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center">
      <div className="w-full max-w-sm bg-background shadow-xl flex flex-col relative overflow-hidden h-[100dvh]">
        <main className="flex-1 overflow-y-auto pb-20 scrollbar-hide">
          {children}
        </main>
        
        {/* Bottom Navigation */}
        <nav className="absolute bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2 pb-6 safe-area-bottom">
          <div className="flex justify-between items-center">
            {navItems.map((item) => {
              const isActive = location === item.href || (location.startsWith(item.href) && item.href !== "/");
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className={cn(
                    "p-2 rounded-xl transition-all duration-200 group-active:scale-95",
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-slate-50"
                  )}>
                    <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className={cn(
                    "text-[10px] font-medium transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
