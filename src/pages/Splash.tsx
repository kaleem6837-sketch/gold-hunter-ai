import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TrendingUp, Sparkles, ShieldCheck, Zap } from "lucide-react";
import hero from "@/assets/hero-gold.jpg";

export default function Splash() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="relative max-w-6xl mx-auto px-6 pt-8 pb-24">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center glow-gold">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold tracking-tight">XAU Hunter <span className="text-gradient-gold">AI</span></span>
          </div>
          <Button asChild variant="ghost" size="sm"><Link to="/auth">Sign in</Link></Button>
        </header>

        <section className="grid md:grid-cols-2 gap-10 items-center mt-12 md:mt-20">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-primary border border-primary/30 rounded-full px-3 py-1 mb-6">
              <Sparkles className="w-3 h-3" /> AI Chart Analysis
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              Smart <span className="text-gradient-gold">Gold</span> signals from a single screenshot.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-lg">
              Upload a XAUUSD chart. Our AI detects SMC, ICT, CRT, liquidity sweeps and price-action confirmations — then returns a professional trade plan.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-gold">
                <Link to="/auth?mode=signup">Get started — it's free</Link>
              </Button>
              <Button asChild variant="outline" size="lg"><Link to="/auth">I have an account</Link></Button>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> Multi-timeframe (M1·M5·M15·H1)</div>
              <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> SMC · ICT · CRT</div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-8 bg-primary/10 blur-3xl rounded-full" />
            <img src={hero} alt="Glowing gold candlestick chart visualization" width={1536} height={896}
              className="relative rounded-2xl border border-border/60 shadow-[var(--shadow-card)]" />
          </div>
        </section>

        <p className="mt-16 text-xs text-center text-muted-foreground">Educational purpose only — not financial advice.</p>
      </div>
    </div>
  );
}