import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/contexts/AppContext";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Settings() {
  const { user, t, lang, setLang } = useApp();
  const [s, setS] = useState<any>({ risk_percent: 1, enable_smc: true, enable_crt: true, enable_patterns: true, enable_multi_tf: true, notifications_enabled: true });

  useEffect(() => {
    if (!user) return;
    supabase.from("user_settings").select("*").eq("user_id", user.id).single().then(({ data }) => { if (data) setS(data); });
  }, [user]);

  const save = async () => {
    if (!user) return;
    const { error } = await supabase.from("user_settings").upsert({ ...s, user_id: user.id });
    if (error) toast.error(error.message); else toast.success("Saved");
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">{t("settings")}</h1>

      <Card className="p-6 space-y-4 bg-card/80 border-border/60">
        <div className="space-y-1.5"><Label>{t("language")}</Label>
          <div className="flex gap-2">
            <Button size="sm" variant={lang === "en" ? "default" : "outline"} onClick={() => setLang("en")}>English</Button>
            <Button size="sm" variant={lang === "ur" ? "default" : "outline"} onClick={() => setLang("ur")}>اردو</Button>
          </div>
        </div>
        <div className="space-y-1.5"><Label>{t("riskPercent")}</Label>
          <Input type="number" min={0.1} max={10} step={0.1} value={s.risk_percent}
            onChange={e => setS({ ...s, risk_percent: parseFloat(e.target.value) })} />
        </div>
      </Card>

      <Card className="p-6 space-y-4 bg-card/80 border-border/60">
        <h2 className="font-semibold">{t("strategies")}</h2>
        {[
          { k: "enable_smc", label: "Smart Money Concepts (SMC / ICT)" },
          { k: "enable_crt", label: "CRT setup detection" },
          { k: "enable_patterns", label: "Classical patterns (H&S, Triangles, Flags…)" },
          { k: "enable_multi_tf", label: "Multi-timeframe confirmation" },
          { k: "notifications_enabled", label: "Notifications" },
        ].map(o => (
          <div key={o.k} className="flex items-center justify-between">
            <Label className="text-sm">{o.label}</Label>
            <Switch checked={!!s[o.k]} onCheckedChange={(v) => setS({ ...s, [o.k]: v })} />
          </div>
        ))}
      </Card>

      <Button onClick={save} className="bg-primary text-primary-foreground hover:bg-primary/90">Save changes</Button>
    </div>
  );
}