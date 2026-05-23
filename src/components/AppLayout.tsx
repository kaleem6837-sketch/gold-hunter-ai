import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { LayoutDashboard, Upload, History, Settings, Crown, Bell, ShieldCheck, LogOut, Languages, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

type NavItem = { to: string; icon: typeof LayoutDashboard; key: any; end?: boolean };
const baseNav: NavItem[] = [
  { to: "/app", icon: LayoutDashboard, key: "dashboard", end: true },
  { to: "/app/upload", icon: Upload, key: "uploadChart" },
  { to: "/app/history", icon: History, key: "history" },
  { to: "/app/notifications", icon: Bell, key: "notifications" },
  { to: "/app/premium", icon: Crown, key: "premium" },
  { to: "/app/settings", icon: Settings, key: "settings" },
];

export default function AppLayout() {
  const { user, loading, isAdmin, t, lang, setLang, signOut } = useApp();
  const nav2 = useNavigate();
  const nav = isAdmin
    ? [...baseNav, { to: "/app/admin", icon: ShieldCheck, key: "admin" as const }]
    : baseNav;

  useEffect(() => {
    if (!loading && !user) nav2("/auth", { replace: true });
  }, [user, loading, nav2]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row" dir={lang === "ur" ? "rtl" : "ltr"}>
      {/* Sidebar */}
      <aside className="md:w-64 md:min-h-screen bg-sidebar border-b md:border-b-0 md:border-r border-sidebar-border flex md:flex-col">
        <div className="p-5 hidden md:flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center glow-gold">
            <TrendingUp className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-bold tracking-tight">{t("appName")}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest">XAUUSD · AI</div>
          </div>
        </div>
        <nav className="flex md:flex-col gap-1 p-2 md:p-3 overflow-x-auto md:overflow-visible w-full">
          {nav.map(({ to, icon: Icon, key, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition ${
                  isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`
              }>
              <Icon className="w-4 h-4" />
              <span className="hidden md:inline">{t(key)}</span>
            </NavLink>
          ))}
        </nav>
        <div className="hidden md:block mt-auto p-3 space-y-2">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={() => setLang(lang === "en" ? "ur" : "en")}>
            <Languages className="w-4 h-4" /> {lang === "en" ? "اردو" : "English"}
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-destructive" onClick={signOut}>
            <LogOut className="w-4 h-4" /> {t("logout")}
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        <Outlet />
        <p className="mt-12 text-xs text-muted-foreground text-center">{t("disclaimer")}</p>
      </main>
    </div>
  );
}