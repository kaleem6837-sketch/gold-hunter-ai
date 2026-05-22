import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SignalCard, type SignalData } from "@/components/SignalCard";
import { Card } from "@/components/ui/card";

export default function History() {
  const [signals, setSignals] = useState<SignalData[]>([]);
  useEffect(() => {
    supabase.from("signals").select("*").order("created_at", { descending: true }).then(({ data }) => setSignals((data as any) ?? []));
  }, []);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Signal History</h1>
      {signals.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground border-dashed">No past signals.</Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {signals.map((s: any) => <SignalCard key={s.id} data={s} />)}
        </div>
      )}
    </div>
  );
}