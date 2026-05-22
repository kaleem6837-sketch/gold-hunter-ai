import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Crown } from "lucide-react";
import { toast } from "sonner";

const plans = [
  { name: "Free", price: "$0", period: "forever", features: ["5 AI scans / day", "Single timeframe", "Basic patterns"], cta: "Current plan", disabled: true },
  { name: "Pro Monthly", price: "$19", period: "/ month", features: ["Unlimited scans", "Multi-timeframe confirmation", "Advanced SMC + CRT", "Priority AI engine"], highlight: true },
  { name: "VIP Yearly", price: "$149", period: "/ year", features: ["Everything in Pro", "VIP signals channel", "High-accuracy mode", "1-on-1 strategy review"] },
];

const methods = ["Visa / Mastercard", "JazzCash", "Easypaisa"];

export default function Premium() {
  return (
    <div className="space-y-8">
      <div className="text-center max-w-xl mx-auto">
        <Crown className="w-10 h-10 text-primary mx-auto mb-3" />
        <h1 className="text-3xl font-bold tracking-tight">Upgrade to <span className="text-gradient-gold">Premium</span></h1>
        <p className="text-muted-foreground mt-2">Unlock unlimited scans, multi-timeframe confluence and VIP signals.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {plans.map(p => (
          <Card key={p.name} className={`p-6 bg-card/80 border-border/60 ${p.highlight ? "border-primary glow-gold" : ""}`}>
            <div className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">{p.name}</div>
            <div className="mt-2"><span className="text-4xl font-bold font-mono-num">{p.price}</span> <span className="text-muted-foreground text-sm">{p.period}</span></div>
            <ul className="mt-5 space-y-2 text-sm">
              {p.features.map(f => <li key={f} className="flex gap-2"><Check className="w-4 h-4 text-bull mt-0.5 shrink-0" />{f}</li>)}
            </ul>
            <Button disabled={p.disabled} onClick={() => toast.info("Payments coming soon")}
              className={`w-full mt-6 ${p.highlight ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`}
              variant={p.highlight ? "default" : "outline"}>
              {p.cta ?? "Choose plan"}
            </Button>
          </Card>
        ))}
      </div>
      <Card className="p-5 bg-card/60 border-border/60">
        <p className="text-sm font-semibold mb-2">Accepted payment methods</p>
        <div className="flex flex-wrap gap-2">
          {methods.map(m => <span key={m} className="text-xs px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground">{m}</span>)}
        </div>
      </Card>
    </div>
  );
}