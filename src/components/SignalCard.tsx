import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, CheckCircle2 } from "lucide-react";

export interface SignalData {
  pair: string;
  signal: "BUY" | "SELL" | "WAIT";
  confidence: number;
  timeframe?: string | null;
  entry_price?: number | null;
  stop_loss?: number | null;
  take_profit_1?: number | null;
  take_profit_2?: number | null;
  pattern?: string | null;
  reasoning?: string[];
  confirmations?: Record<string, boolean>;
  created_at?: string;
}

const fmt = (n?: number | null) => (n == null ? "—" : n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 3 }));

export function SignalCard({ data }: { data: SignalData }) {
  const isBuy = data.signal === "BUY";
  const isSell = data.signal === "SELL";
  const isWait = data.signal === "WAIT";
  const Icon = isBuy ? TrendingUp : isSell ? TrendingDown : Minus;
  const color = isBuy ? "bull" : isSell ? "bear" : "warning";

  return (
    <Card className="overflow-hidden border-border/60 bg-card/80 backdrop-blur shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between p-4 md:p-5 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-lg flex items-center justify-center bg-${color}/15 text-${color}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <div className="font-mono-num font-bold tracking-tight text-lg">{data.pair}</div>
            <div className="text-xs text-muted-foreground">{data.timeframe ?? "—"} · {data.pattern ?? "Price Action"}</div>
          </div>
        </div>
        <div className="text-right">
          <Badge className={`bg-${color} text-${color === "warning" ? "warning" : color}-foreground hover:bg-${color}`}>{data.signal}</Badge>
          <div className="mt-1 text-xs font-mono-num text-muted-foreground">{data.confidence}% conf.</div>
        </div>
      </div>

      {!isWait && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border/40">
          {[
            { label: "Entry", v: data.entry_price, c: "text-foreground" },
            { label: "SL", v: data.stop_loss, c: "text-bear" },
            { label: "TP1", v: data.take_profit_1, c: "text-bull" },
            { label: "TP2", v: data.take_profit_2, c: "text-bull" },
          ].map((x) => (
            <div key={x.label} className="bg-card p-3">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{x.label}</div>
              <div className={`font-mono-num font-semibold ${x.c}`}>{fmt(x.v)}</div>
            </div>
          ))}
        </div>
      )}

      <div className="p-4 md:p-5 space-y-3">
        {data.confirmations && Object.keys(data.confirmations).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(data.confirmations).map(([k, v]) => (
              <Badge key={k} variant="outline" className={v ? "border-bull/40 text-bull" : "border-muted text-muted-foreground line-through"}>
                {v && <CheckCircle2 className="w-3 h-3 mr-1" />}
                {k}
              </Badge>
            ))}
          </div>
        )}
        {data.reasoning && data.reasoning.length > 0 && (
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {data.reasoning.map((r, i) => (
              <li key={i} className="flex gap-2"><span className="text-primary">▸</span><span>{r}</span></li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}