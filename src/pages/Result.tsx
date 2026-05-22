import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SignalCard, type SignalData } from "@/components/SignalCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, RefreshCw } from "lucide-react";

export default function Result() {
  const { id } = useParams();
  const [signal, setSignal] = useState<SignalData | null>(null);
  const [chartUrl, setChartUrl] = useState<string>("");

  useEffect(() => {
    if (!id) return;
    supabase.from("signals").select("*").eq("id", id).single().then(async ({ data }) => {
      if (!data) return;
      setSignal(data as any);
      if (data.chart_image_path) {
        const { data: signed } = await supabase.storage.from("charts").createSignedUrl(data.chart_image_path, 3600);
        if (signed) setChartUrl(signed.signedUrl);
      }
    });
  }, [id]);

  if (!signal) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm"><Link to="/app"><ArrowLeft className="w-4 h-4 mr-2" />Dashboard</Link></Button>
        <Button asChild size="sm" className="bg-primary text-primary-foreground"><Link to="/app/upload"><RefreshCw className="w-4 h-4 mr-2" />New scan</Link></Button>
      </div>

      <h1 className="text-3xl font-bold tracking-tight">AI Analysis Result</h1>

      {chartUrl && (
        <Card className="p-2 bg-card/80 border-border/60 overflow-hidden">
          <img src={chartUrl} alt="Analyzed chart" className="w-full rounded-md" />
        </Card>
      )}

      <SignalCard data={signal} />
    </div>
  );
}