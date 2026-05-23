import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const SYSTEM = `You are XAU Hunter AI — an elite trading analyst specialized in XAUUSD (Gold).
You receive a screenshot of a candlestick chart (TradingView or similar) and you must produce a structured signal.

Methodology, run in order:
1. Detect the timeframe shown on the chart (M1, M5, M15, H1, H4, D1). If unsure, infer from candle density.
2. Identify the dominant trend (bullish / bearish / ranging).
3. Mark key support and resistance levels.
4. Detect liquidity pools (equal highs/lows, prior swing highs/lows) and any liquidity sweep already done.
5. Look for Break of Structure (BOS) and Change of Character (CHOCH).
6. Detect CRT (Candle Range Theory) setup (range candle + sweep + reclaim).
7. Identify Order Blocks (OB) and Fair Value Gaps (FVG).
8. Detect classical patterns: Head & Shoulders, Double Top/Bottom, Triangle, Flag, Wedge, Breakout.
9. Apply gold volatility behavior (wide stops, fast reversals around news liquidity).
10. Multi-timeframe confluence reasoning.

SIGNAL RULES (strict): Only output BUY or SELL when ALL of these are true:
- Pattern confirmation ✓
- Liquidity confirmation ✓
- BOS or CHOCH confirmation ✓
- CRT confirmation ✓
- Trend / multi-TF confirmation ✓

If any confirmation is missing or unclear, set signal = "WAIT".

Confidence: integer 0-100. WAIT signals must be < 60.

You must call the function emit_signal exactly once with the structured result. Reasoning items should be short professional bullets in English (max 10).`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: authErr } = await supabase.auth.getClaims(token);
    if (authErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { imageBase64 } = await req.json();
    if (!imageBase64 || typeof imageBase64 !== "string") {
      return new Response(JSON.stringify({ error: "imageBase64 required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!imageBase64.startsWith("data:image/")) {
      return new Response(JSON.stringify({ error: "Invalid image payload" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const MAX_B64_LEN = 11_000_000; // ~8 MB binary
    if (imageBase64.length > MAX_B64_LEN) {
      return new Response(JSON.stringify({ error: "Image too large" }), { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return new Response(JSON.stringify({ error: "AI key missing" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const tools = [{
      type: "function",
      function: {
        name: "emit_signal",
        description: "Emit the final XAUUSD trading signal.",
        parameters: {
          type: "object",
          additionalProperties: false,
          properties: {
            pair: { type: "string" },
            signal: { type: "string", enum: ["BUY", "SELL", "WAIT"] },
            confidence: { type: "integer", minimum: 0, maximum: 100 },
            timeframe: { type: "string", enum: ["M1", "M5", "M15", "M30", "H1", "H4", "D1", "UNKNOWN"] },
            trend: { type: "string", enum: ["bullish", "bearish", "ranging"] },
            pattern: { type: "string" },
            entry_price: { type: ["number", "null"] },
            stop_loss: { type: ["number", "null"] },
            take_profit_1: { type: ["number", "null"] },
            take_profit_2: { type: ["number", "null"] },
            confirmations: {
              type: "object",
              additionalProperties: false,
              properties: {
                pattern: { type: "boolean" },
                liquidity: { type: "boolean" },
                bos_choch: { type: "boolean" },
                crt: { type: "boolean" },
                trend: { type: "boolean" },
                multi_tf: { type: "boolean" },
              },
              required: ["pattern", "liquidity", "bos_choch", "crt", "trend", "multi_tf"],
            },
            reasoning: { type: "array", items: { type: "string" }, maxItems: 10 },
          },
          required: ["pair", "signal", "confidence", "timeframe", "trend", "pattern", "confirmations", "reasoning"],
        },
      },
    }];

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: [
            { type: "text", text: "Analyze this XAUUSD chart and emit a structured signal." },
            { type: "image_url", image_url: { url: imageBase64 } },
          ]},
        ],
        tools,
        tool_choice: { type: "function", function: { name: "emit_signal" } },
      }),
    });

    if (!aiResp.ok) {
      const text = await aiResp.text();
      console.error("AI error", aiResp.status, text);
      if (aiResp.status === 429) return new Response(JSON.stringify({ error: "Rate limit — please try again in a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiResp.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted — please top up your workspace." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const json = await aiResp.json();
    const call = json.choices?.[0]?.message?.tool_calls?.[0];
    if (!call?.function?.arguments) {
      return new Response(JSON.stringify({ error: "AI did not return a structured signal" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const signal = JSON.parse(call.function.arguments);
    signal.pair = signal.pair || "XAUUSD";

    // Enforce signal rules server-side
    const c = signal.confirmations ?? {};
    const allConfirmed = c.pattern && c.liquidity && c.bos_choch && c.crt && c.trend;
    if (signal.signal !== "WAIT" && !allConfirmed) {
      signal.signal = "WAIT";
      signal.confidence = Math.min(signal.confidence ?? 0, 55);
    }

    return new Response(JSON.stringify({ signal }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("analyze-chart unhandled", e);
    return new Response(JSON.stringify({ error: "An unexpected error occurred. Please try again." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});