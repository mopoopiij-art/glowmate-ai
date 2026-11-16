import express from "express";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json({ limit: "40kb" }));
app.use("/api/", rateLimit({ windowMs: 60_000, limit: 12, standardHeaders: true, legacyHeaders: false }));
app.use(express.static(__dirname));

const SYSTEM_PROMPT = `
You are GlowMate AI, a friendly, careful assistant focused on hair care, skin care,
cosmetic product literacy, grooming, healthy self-improvement, posture, and general
age-appropriate fitness habits. Answer naturally in the language the user uses.
If the user writes Moroccan Darija, reply in clear Moroccan Darija.
You may answer general questions only when they help explain these topics; politely
redirect unrelated requests to GlowMate's focus.
Give practical, balanced explanations. Ask follow-up questions when important details
are missing. Do not diagnose medical conditions, prescribe medicines, promise results,
or claim you can identify a skin/hair disease from a photo. For persistent symptoms,
pain, severe irritation, infection signs, or sudden hair loss, recommend a qualified
health professional. Avoid harsh routines, restrictive diets, overtraining, appearance
shaming, or claims that exercises can reshape facial bones. Do not compare users to
beauty ideals. Mention patch testing for new topical products and sunscreen where
relevant. Never invent product prices, ingredients, or availability.
Do not request sensitive personal data. Keep replies clear and useful.
`;

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, configured: Boolean(process.env.AI_API_KEY && process.env.AI_BASE_URL && process.env.AI_MODEL) });
});

app.post("/api/chat", async (req, res) => {
  const { messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 16) {
    return res.status(400).json({ error: "المحادثة غير صالحة. عاود المحاولة." });
  }

  const { AI_API_KEY, AI_BASE_URL, AI_MODEL } = process.env;
  if (!AI_API_KEY || !AI_BASE_URL || !AI_MODEL) {
    return res.status(503).json({
      error: "خاص مسؤول الموقع يكمّل إعداد مزوّد الذكاء الاصطناعي ومفتاح API فإعدادات الخادم."
    });
  }

  const safeMessages = messages.map(m => ({
    role: m?.role === "assistant" ? "assistant" : "user",
    content: String(m?.content || "").slice(0, 5000)
  })).filter(m => m.content.trim());

  try {
    const endpoint = AI_BASE_URL.replace(/\/+$/, "") + "/chat/completions";
    const upstream = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${AI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...safeMessages],
        temperature: 0.7,
        max_tokens: 900
      }),
      signal: AbortSignal.timeout(45000)
    });

    const result = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      console.error("AI provider error:", upstream.status, result?.error?.message || "unknown");
      return res.status(502).json({ error: "خدمة الذكاء الاصطناعي ما جاوباتش دابا. جرّب من بعد." });
    }

    const reply = result?.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) {
      return res.status(502).json({ error: "وصل جواب غير مفهوم من خدمة الذكاء الاصطناعي." });
    }
    res.json({ reply: reply.trim() });
  } catch (err) {
    console.error("Chat request failed:", err.message);
    res.status(502).json({ error: "تعذر الاتصال بخدمة الذكاء الاصطناعي." });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`GlowMate AI running on port ${port}`));
