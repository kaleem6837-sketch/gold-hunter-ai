import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(6, "At least 6 characters").max(72),
  displayName: z.string().trim().min(1).max(60).optional(),
});

export default function Auth() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState<"signin" | "signup">(params.get("mode") === "signup" ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password, displayName: mode === "signup" ? displayName : undefined });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/app`, data: { display_name: displayName } },
        });
        if (error) throw error;
        toast.success("Account created — check your email to confirm.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        nav("/app", { replace: true });
      }
    } catch (err: any) {
      toast.error(err.message ?? "Authentication failed");
    } finally { setLoading(false); }
  };

  const google = async () => {
    try {
      const { lovable } = await import("@/integrations/lovable/index");
      const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/app" });
      if (r.error) toast.error("Google sign-in failed");
    } catch {
      toast.error("Google sign-in not configured yet");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-card/80 backdrop-blur border-border/60">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center glow-gold">
            <TrendingUp className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">XAU Hunter <span className="text-gradient-gold">AI</span></span>
        </Link>
        <h1 className="text-2xl font-bold text-center">{mode === "signin" ? "Welcome back" : "Create account"}</h1>
        <p className="text-sm text-center text-muted-foreground mt-1 mb-6">Trade gold with AI confirmation</p>
        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-1.5"><Label>Display name</Label>
              <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" maxLength={60} required />
            </div>
          )}
          <div className="space-y-1.5"><Label>Email</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="trader@example.com" required />
          </div>
          <div className="space-y-1.5"><Label>Password</Label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>
        <Button variant="outline" onClick={google} className="w-full mt-3">Continue with Google</Button>
        <p className="text-sm text-center text-muted-foreground mt-6">
          {mode === "signin" ? "No account? " : "Already a member? "}
          <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-primary hover:underline">
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </Card>
    </div>
  );
}