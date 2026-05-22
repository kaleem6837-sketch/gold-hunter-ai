import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/contexts/AppContext";
import { Card } from "@/components/ui/card";
import { ShieldCheck, Users, Activity, Target } from "lucide-react";

export default function Admin() {
  const { user } = useApp();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [stats, setStats] = useState({ signals: 0, avg: 0 });

  useEffect(() => {
    if (!user) return;
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
    supabase.from("signals").select("confidence").then(({ data }) => {
      if (!data) return;
      const avg = data.length ? Math.round(data.reduce((s, r) => s + (r.confidence || 0), 0) / data.length) : 0;
      setStats({ signals: data.length, avg });
    });
  }, [user]);

  if (isAdmin === null) return <p className="text-muted-foreground">Checking permissions…</p>;
  if (!isAdmin) return (
    <Card className="p-10 text-center border-border/60 bg-card/60">
      <ShieldCheck className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
      <h1 className="text-xl font-semibold">Admin access required</h1>
      <p className="text-sm text-muted-foreground mt-1">Your account doesn't have admin privileges.</p>
    </Card>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "Users", v: "—" },
          { icon: Activity, label: "Signals", v: stats.signals },
          { icon: Target, label: "Avg confidence", v: stats.avg + "%" },
          { icon: ShieldCheck, label: "Subscriptions", v: "—" },
        ].map((x, i) => (
          <Card key={i} className="p-4 bg-card/80 border-border/60">
            <x.icon className="w-5 h-5 text-primary mb-2" />
            <div className="text-2xl font-bold font-mono-num">{x.v}</div>
            <div className="text-xs text-muted-foreground">{x.label}</div>
          </Card>
        ))}
      </div>
      <Card className="p-6 bg-card/60 border-border/60 space-y-2 text-sm text-muted-foreground">
        <p>· User management, manual signal override and AI training settings are scaffolded for V2.</p>
        <p>· Promote a user to admin by inserting a row in <code className="text-primary">user_roles</code> with role = 'admin'.</p>
      </Card>
    </div>
  );
}