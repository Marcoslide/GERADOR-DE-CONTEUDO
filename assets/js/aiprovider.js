/* ============================================================
   VIRALIZA — AIProviderService (frontend)
   Ponto único de IA. Se "Claude Real" estiver configurado e o
   backend responder, usa Claude via /api/ai/claude; senão cai
   para o MockAIEngine (window.AI / Assistant) e avisa.
   ============================================================ */
window.AIProvider = (function () {
  const S = window.Store, U = window.UI;
  function cfg() { return S.get().ai || {}; }
  function isReal() { return cfg().provider === "Claude Real"; }
  function base() { return (cfg().backendUrl || "").replace(/\/+$/, ""); } // "" = mesma origem
  function urlOf(p) { return base() + p; }

  async function status() {
    try { const r = await fetch(urlOf("/api/ai/status")); return await r.json(); }
    catch (e) { return { success: false, error: { type: "backend_error", message: String(e) } }; }
  }
  async function testConnection() {
    try { const r = await fetch(urlOf("/api/ai/test"), { method: "POST" }); return await r.json(); }
    catch (e) { return { success: false, error: { type: "backend_error", message: "Backend offline em " + (base() || "mesma origem") } }; }
  }

  function learningContext() {
    if (!window.Learning) return {};
    const m = window.Learning.getRelevantMemory("generate", {});
    return {
      approvedStyle: m.approvedStyle, rejectedStyle: m.rejectedStyle, preferredTone: m.preferredTone,
      preferredHooks: (m.approvedStyle && m.approvedStyle.hooks) || [], rejectedHooks: (m.rejectedStyle && m.rejectedStyle.hooks) || [],
      performanceInsights: m.performanceInsights,
    };
  }
  function slim(ctx) {
    ctx = ctx || {};
    const out = { view: ctx.view };
    if (ctx.campaign) out.campaign = { id: ctx.campaign.id, title: ctx.campaign.title, product: ctx.campaign.productName, objective: ctx.campaign.objective, audience: ctx.campaign.audience, channels: ctx.campaign.channels, cards: S.sel.cardsByCampaign(ctx.campaign.id).length };
    if (ctx.card) out.card = { id: ctx.card.id, title: ctx.card.title, type: ctx.card.type, status: ctx.card.status, script: ctx.card.script, hasVideo: !!(ctx.card.video && ctx.card.video.versions && ctx.card.video.versions.length), analysis: ctx.card.analysis && ctx.card.analysis.done };
    return out;
  }

  let lastError = null;
  function notifyErr(err) { lastError = err; const t = err && err.type; const msg = t === "api_key_missing" ? "Claude sem chave no backend — usando modo simulado" : t === "backend_error" ? "Backend offline — usando modo simulado" : t === "invalid_json" ? "Claude respondeu fora do formato — usando simulado" : "Erro na IA — usando modo simulado"; U.toast(msg, "warn"); }

  async function call(task, ctx, input, schema) {
    const a = cfg();
    const body = { task, context: Object.assign({ operationLearningContext: learningContext() }, slim(ctx)), input: input || {}, schema: schema || null, model: a.model, temperature: a.temperature, maxTokens: a.maxTokens };
    const r = await fetch(urlOf("/api/ai/claude"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    return await r.json();
  }

  // Tenta Claude; se falhar/indisponível, executa o fallback (mock) e marca a origem.
  async function withClaude(task, ctx, input, mockFn) {
    if (isReal()) {
      try {
        const r = await call(task, ctx, input);
        if (r && r.success) return { source: "claude", ...r };
        notifyErr((r && r.error) || { type: "backend_error" });
      } catch (e) { notifyErr({ type: "backend_error", message: String(e) }); }
    }
    return { source: "mock", ...mockFn() };
  }

  // ---- API de alto nível (todas retornam Promise) ----
  async function assistantReply(message, ctx) {
    return withClaude("assistant_action", ctx, { message }, () => {
      const m = window.Assistant.reply(message, ctx);
      return { reply: m.text, actions: (m.actions || []).map((a) => ({ type: "assistant_op", payload: { act: a.act, label: a.label, payload: a.payload } })), learningUsed: [] };
    });
  }
  async function generateScript(card, ctx) { return withClaude("generate_script", ctx, { cardId: card && card.id }, () => ({ data: { script: window.AI.generateScriptForCard(card, ctx && ctx.campaign || {}) }, reply: "Roteiro gerado (simulado).", actions: [], learningUsed: [] })); }
  async function generateVariations(input, ctx) { return withClaude("generate_variations", ctx, input, () => ({ reply: "Variações geradas (simulado).", actions: [], learningUsed: [] })); }
  async function generateCampaign(input, ctx) { return withClaude("generate_campaign", ctx, input, () => ({ data: { plan: window.AI.generateCampaignPlan(input) }, reply: "Campanha planejada (simulado).", actions: [], learningUsed: [] })); }
  async function analyzeContent(card, ctx) { return withClaude("analyze_content", ctx, { cardId: card && card.id }, () => ({ data: { analysis: window.AI.analyzeUploadedVideoMock({ duration: 22 }, card) }, reply: "Análise (simulada).", actions: [], learningUsed: [] })); }
  async function createPublicationPlan(campaign, ctx) { return withClaude("create_publication_plan", ctx, { campaignId: campaign && campaign.id }, () => { window.PublishEngine.buildPlan(campaign); return { reply: "Plano montado (simulado).", actions: [], learningUsed: [] }; }); }

  // Executa actions[] que o Claude retornar (Frontend executa ação real)
  function executeActions(actions, ctx) {
    let done = 0;
    (actions || []).forEach((a) => {
      const p = a.payload || {};
      try {
        if (a.type === "assistant_op") { window.Assistant.exec(p.act, ctx, p.payload); done++; }
        else if (a.type === "create_campaign") { const plan = window.AI.generateCampaignPlan(p); const id = S.actions.addCampaign(plan); window.AI.generateCardsForCampaign(S.sel.campaign(id), plan.cardPlan); done++; }
        else if (a.type === "create_cards" && ctx.campaign) { window.AI.generateCardsForCampaign(ctx.campaign, (p.cards || [])); done++; }
        else if (a.type === "create_variations" && ctx.campaign) { window.VariationMachine.generate(ctx.campaign, p.count || 10, { channels: p.channels, styles: p.styles }); done++; }
        else if (a.type === "generate_script" && ctx.card) { if (p.script) S.actions.updateCard(ctx.card.id, { script: p.script }); done++; }
        else if (a.type === "create_publication_plan" && ctx.campaign) { window.PublishEngine.buildPlan(ctx.campaign); done++; }
        else if (a.type === "move_status" && ctx.card && p.status) { S.actions.setCardStatus(ctx.card.id, p.status); done++; }
        else if (a.type === "save_to_library") { S.actions.addLibrary({ type: p.libType || "Aprendizado", title: p.title || "Item", content: p.content || "" }); done++; }
      } catch (e) { /* ignora action inválida */ }
    });
    return done;
  }

  function lastErr() { return lastError; }
  return { isReal, base, status, testConnection, call, withClaude, assistantReply, generateScript, generateVariations, generateCampaign, analyzeContent, createPublicationPlan, executeActions, learningContext, lastErr };
})();
