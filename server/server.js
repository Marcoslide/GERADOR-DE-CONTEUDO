/* ============================================================
   VIRALIZA backend — Express
   - Serve o frontend (mesma origem → sem CORS/CSP no fetch).
   - Endpoints de IA: /api/ai/status, /api/ai/test, /api/ai/claude.
   - A ANTHROPIC_API_KEY fica NO BACKEND (env), nunca no frontend.

   Rodar:
     cd server && npm install && cp .env.example .env
     # edite .env com sua ANTHROPIC_API_KEY
     npm start
   Abra: http://localhost:3000
   ============================================================ */
"use strict";

try { require("dotenv").config(); } catch (e) { /* dotenv opcional */ }

const path = require("path");
const express = require("express");
const cors = require("cors");
const { TASKS, callClaude } = require("./claude");

let Anthropic = null;
try { Anthropic = require("@anthropic-ai/sdk"); } catch (e) { Anthropic = null; }

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const ROOT = path.join(__dirname, "..");
const PORT = process.env.PORT || 3000;
const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-5";

function keyPresent() { return !!(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.trim()); }
function sdkPresent() { return !!Anthropic; }

// ---- Status ----
app.get("/api/ai/status", (req, res) => {
  res.json({
    success: true,
    provider: keyPresent() && sdkPresent() ? "claude" : "mock",
    configured: keyPresent(),
    sdkInstalled: sdkPresent(),
    model: MODEL,
    message: !sdkPresent() ? "SDK @anthropic-ai/sdk não instalada (rode npm install)."
      : !keyPresent() ? "ANTHROPIC_API_KEY ausente — rodando em modo simulado."
      : "Claude configurado e pronto.",
  });
});

// ---- Testar conexão ----
app.post("/api/ai/test", async (req, res) => {
  if (!sdkPresent()) return res.json({ success: false, error: { type: "backend_error", message: "SDK não instalada." } });
  if (!keyPresent()) return res.json({ success: false, error: { type: "api_key_missing", message: "ANTHROPIC_API_KEY ausente no backend." } });
  const r = await callClaude(Anthropic, process.env.ANTHROPIC_API_KEY, {
    task: "assistant_action", context: {}, input: { message: 'Responda apenas: {"reply":"ok","actions":[],"data":{},"learningUsed":[]}' },
    model: MODEL, temperature: 0, maxTokens: 100,
  });
  if (!r.ok) return res.json({ success: false, error: r.error });
  res.json({ success: true, message: "Conexão com a Claude API OK.", sample: r.data });
});

// ---- Endpoint principal ----
app.post("/api/ai/claude", async (req, res) => {
  const { task, context, input, schema, model, temperature, maxTokens } = req.body || {};
  if (!task || TASKS.indexOf(task) < 0) {
    return res.json({ success: false, task, error: { type: "backend_error", message: "task inválida. Use uma de: " + TASKS.join(", ") } });
  }
  if (!keyPresent() || !sdkPresent()) {
    // Contrato de erro claro — o frontend cai para o MockAIEngine.
    return res.json({ success: false, task, reply: "", actions: [], data: {}, learningUsed: [],
      error: { type: keyPresent() ? "backend_error" : "api_key_missing", message: keyPresent() ? "SDK ausente." : "ANTHROPIC_API_KEY ausente no backend — use o modo simulado." } });
  }
  const r = await callClaude(Anthropic, process.env.ANTHROPIC_API_KEY, { task, context, input, schema, model: model || MODEL, temperature, maxTokens });
  if (!r.ok) return res.json({ success: false, task, reply: "", actions: [], data: {}, learningUsed: [], error: r.error });
  const d = r.data || {};
  res.json({ success: true, task, reply: d.reply || "", actions: Array.isArray(d.actions) ? d.actions : [], data: d.data || {}, learningUsed: Array.isArray(d.learningUsed) ? d.learningUsed : [], error: null });
});

// ---- Frontend (mesma origem) ----
app.use(express.static(ROOT, { extensions: ["html"] }));
app.get("/", (req, res) => res.sendFile(path.join(ROOT, "index.html")));

app.listen(PORT, () => {
  console.log(`VIRALIZA backend em http://localhost:${PORT}`);
  console.log(`  IA: ${keyPresent() && sdkPresent() ? "Claude REAL" : "modo simulado (sem ANTHROPIC_API_KEY ou SDK)"}`);
});
