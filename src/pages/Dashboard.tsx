import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/contexts/AppContext";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SignalCard, type SignalData } from "@/components/SignalCard";
import { Upload, TrendingUp, Target, Activity } from "lucide-react";

export default function Dashboard() {
  const { user, t } = useApp();
  const [signals, setSignals] = useState<SignalData[]>([]);
  const [stats, setStats] = useState({ total: 0, avg: 0, bestTf: "—" });

  useEffect(() => {
    if (!user) return;
    supabase.from("signals").select("*").order("created_at", { ascending: false }).limit(5)
      .then(({ data }) => {
        if (!data) return;
        setSignals(data as any);
      });
    supabase.from("signals").select("confidence, timeframe").then(({ data }) => {
      if (!data?.length) return;
      const avg = Math.round(data.reduce((s, r) => s + (r.confidence || 0), 0) / data.length);
      const tfMap: Record<string, number> = {};
      data.forEach(r => { if (r.timeframe) tfMap[r.timeframe] = (tfMap[r.timeframe] || 0) + 1; });
      const bestTf = Object.entries(tfMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
      setStats({ total: data.length, avg, bestTf });
    });
  }, [user]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("dashboard")}</h1>
          <p className="text-muted-foreground mt-1">Welcome — let's hunt some gold.</p>
        </div>
        <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-gold">
          <Link to="/app/upload"><Upload className="w-4 h-4 mr-2" />{t("uploadChart")}</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Activity, label: t("totalSignals"), v: stats.total, c: "text-primary" },
          { icon: Target, label: t("avgConfidence"), v: stats.avg + "%", c: "text-bull" },
          { icon: TrendingUp, label: t("bestTf"), v: stats.bestTf, c: "text-foreground" },
          { icon: TrendingUp, label: t("winRate"), v: "—", c: "text-muted-foreground" },
        ].map((s, i) => (
          <Card key={i} className="p-4 bg-card/80 backdrop-blur border-border/60">
            <s.icon className={`w-5 h-5 ${s.c} mb-2`} />
            <div className="text-2xl font-bold font-mono-num">{s.v}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">{t("recentSignals")}</h2>
        {signals.length === 0 ? (
          <Card className="p-12 text-center bg-card/60 border-dashed border-border/60">
            <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No signals yet — upload your first chart.</p>
            <Button asChild className="mt-4"><Link to="/app/upload">Get my first signal</Link></Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {signals.map((s: any) => <SignalCard key={s.id} data={s} />)}
          </div>
        )}
      </div>
    </div>
  );
}