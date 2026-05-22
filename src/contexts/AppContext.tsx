import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import { dict, type Lang, type DictKey } from "@/lib/i18n";

interface AppCtx {
  user: User | null;
  session: Session | null;
  loading: boolean;
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: DictKey) => string;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AppCtx | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem("xau-lang") as Lang) || "en");

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("xau-lang", l);
  };

  const t = (k: DictKey) => dict[lang][k] ?? dict.en[k];
  const signOut = async () => { await supabase.auth.signOut(); };

  return <Ctx.Provider value={{ user, session, loading, lang, setLang, t, signOut }}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be inside AppProvider");
  return v;
}