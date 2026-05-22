import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload as UploadIcon, ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function UploadChart() {
  const { user, t } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  const onPick = (f: File | null) => {
    if (!f) return;
    if (!/^image\/(png|jpe?g|webp)$/.test(f.type)) { toast.error("PNG, JPG or WEBP only"); return; }
    if (f.size > 8 * 1024 * 1024) { toast.error("Max 8 MB"); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    onPick(e.dataTransfer.files?.[0] ?? null);
  }, []);

  const analyze = async () => {
    if (!file || !user) return;
    setBusy(true);
    try {
      const path = `${user.id}/${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, "_")}`;
      const { error: upErr } = await supabase.storage.from("charts").upload(path, file, { upsert: false });
      if (upErr) throw upErr;

      // Read as base64 for AI vision
      const dataUrl = await new Promise<string>((res, rej) => {
        const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(file);
      });

      const { data, error } = await supabase.functions.invoke("analyze-chart", {
        body: { imageBase64: dataUrl, imagePath: path },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const signal = data.signal;
      const { data: inserted, error: insErr } = await supabase.from("signals").insert({
        user_id: user.id,
        pair: signal.pair ?? "XAUUSD",
        signal: signal.signal,
        confidence: signal.confidence ?? 0,
        timeframe: signal.timeframe,
        entry_price: signal.entry_price,
        stop_loss: signal.stop_loss,
        take_profit_1: signal.take_profit_1,
        take_profit_2: signal.take_profit_2,
        pattern: signal.pattern,
        reasoning: signal.reasoning ?? [],
        confirmations: signal.confirmations ?? {},
        chart_image_path: path,
        raw_analysis: signal,
      }).select().single();
      if (insErr) throw insErr;

      toast.success("Analysis complete");
      nav(`/app/result/${inserted.id}`);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message?.includes("Rate") ? "AI rate limit — try again shortly" : e.message ?? "Analysis failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("uploadChart")}</h1>
        <p className="text-muted-foreground mt-1">Drop your XAUUSD chart screenshot and let AI find the trade.</p>
      </div>

      <Card className="p-2 bg-card/80 backdrop-blur border-border/60">
        <label onDrop={onDrop} onDragOver={e => e.preventDefault()}
          className="block border-2 border-dashed border-border rounded-lg p-10 text-center cursor-pointer hover:border-primary/60 transition">
          {preview ? (
            <img src={preview} alt="chart preview" className="max-h-80 mx-auto rounded-md" />
          ) : (
            <>
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <ImageIcon className="w-8 h-8 text-primary" />
              </div>
              <p className="font-semibold">{t("dropChart")}</p>
              <p className="text-sm text-muted-foreground mt-1">{t("orClick")}</p>
            </>
          )}
          <input type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={e => onPick(e.target.files?.[0] ?? null)} />
        </label>
      </Card>

      <Button onClick={analyze} disabled={!file || busy} size="lg"
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-gold">
        {busy ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t("analyzing")}</> : <><UploadIcon className="w-4 h-4 mr-2" />{t("analyze")}</>}
      </Button>

      <Card className="p-4 bg-card/60 border-border/60">
        <p className="text-xs text-muted-foreground">
          AI runs through: timeframe detection → trend → support/resistance → liquidity zones → BOS / CHOCH → CRT → Order Blocks → FVG → pattern recognition → multi-TF confirmation. Signal only fires when confluences align.
        </p>
      </Card>
    </div>
  );
}