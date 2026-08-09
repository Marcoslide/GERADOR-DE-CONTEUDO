/* ============================================================
   VIRALIZA — Máquina de Publicação
   Aprovar → Agendar → Publicar → Analisar → Corrigir → Repetir.
   Padrão seguro: "Automático com aprovação". Publicação em modo
   simulado no MVP; arquitetura pronta para API real (Meta/TikTok).
   ============================================================ */
window.PublishEngine = (function () {
  const S = window.Store, U = window.UI;

  const MODES = ["Manual", "Agendado com lembrete", "Automático com aprovação", "Automático liberado"];
  const SLOTS = ["09:00", "18:00", "12:00", "20:00", "15:00", "21:00"];

  const APPROVAL_ITEMS = ["Vídeo revisado", "Legenda aprovada", "Hashtags aprovadas", "CTA aprovado", "Canal definido", "Horário definido", "Capa aprovada", "Direitos de uso confirmados"];

  const DEFAULT_RULES = {
    approvedOnly: true, requireApproval: true, maxPerDay: 3,
    allowedHours: "09:00–21:00", allowedDays: "Seg–Dom",
    pauseOnError: true, pauseOnBadPerformance: true, noRepeat: true, requireMedia: true, requireCaption: true,
    maxVariationsPerWeek: 3,
  };

  function today() { return new Date().toISOString().slice(0, 10); }
  function addDays(base, n) { const d = new Date(base + "T00:00:00"); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }
  function nowTime() { const d = new Date(); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); }

  // ---------- Estado de publicação do card ----------
  function pubStatus(card) { return (card.publication && card.publication.pubStatus) || (card.script && (card.script.hook || card.script.mainLine) ? "Conteúdo gerado" : "Rascunho"); }
  function setPub(cardId, patch) { S.update((s) => { const c = s.cards.find((x) => x.id === cardId); c.publication = Object.assign({}, c.publication, patch); }); }
  function ensureApproval(card) {
    if (!card.publication) card.publication = {};
    if (!card.publication.approval) card.publication.approval = APPROVAL_ITEMS.map((t) => ({ t, done: false }));
    return card.publication.approval;
  }

  // ---------- Plano de postagem (distribui cards por dia/hora/canal) ----------
  function buildPlan(campaign) {
    const cards = S.sel.cardsByCampaign(campaign.id);
    const freq = campaign.frequency || 2;
    const channels = (campaign.channels && campaign.channels.length ? campaign.channels : ["Instagram"]);
    const startAuto = /Autom/.test(campaign.publishMode || "");
    cards.forEach((c, i) => {
      const dayIdx = Math.floor(i / freq);
      const slot = SLOTS[i % freq];
      const channel = channels[i % channels.length];
      const initial = campaign.publishMode === "Manual" ? "Conteúdo gerado"
        : campaign.publishMode === "Agendado com lembrete" ? "Agendado"
        : startAuto ? "Aguardando aprovação" : "Conteúdo gerado";
      setPub(c.id, { channel, date: addDays(today(), dayIdx), time: slot, mode: campaign.publishMode || "Automático com aprovação", pubStatus: initial });
    });
    return cards.length;
  }

  // ---------- Ações ----------
  function approve(cardId) {
    const c = S.sel.card(cardId);
    ensureApproval(c);
    // marca tudo como aprovado
    S.update((s) => { const cc = s.cards.find((x) => x.id === cardId); cc.publication.approval.forEach((i) => i.done = true); cc.publication.approved = true; cc.publication.pubStatus = "Aprovado"; });
    U.toast("Conteúdo aprovado ✓");
  }

  function schedule(cardId, date, time) {
    const c = S.sel.card(cardId);
    const patch = { pubStatus: "Agendado" };
    if (date) patch.date = date; if (time) patch.time = time;
    setPub(cardId, patch);
    U.toast("Publicação agendada ✓");
  }

  function mockLink(channel) {
    const id = Math.random().toString(36).slice(2, 10);
    const map = { "Instagram": "https://instagram.com/p/post_sim_" + id, "TikTok": "https://tiktok.com/@voce/video/" + id, "YouTube Shorts": "https://youtube.com/shorts/" + id, "Facebook": "https://facebook.com/watch/?v=" + id };
    return map[channel] || "https://viraliza.app/post_sim_" + id;
  }

  function integrationReady(channel) {
    const it = S.get().integrations || {};
    if (/Instagram|Facebook/.test(channel)) return (it.meta && it.meta.status === "conectado");
    if (/TikTok/.test(channel)) return (it.tiktok && it.tiktok.status === "conectado");
    return false;
  }

  // Publica agora (simulado): Publicando → Publicado, gera link, registra histórico
  function publishNow(cardId, onDone) {
    const c = S.sel.card(cardId);
    // roteia pelo PublicationProviderService (hoje: provider mock; preparado p/ Meta/TikTok real)
    if (window.PublicationProviderService) window.PublicationProviderService.publishNow({ cardId, channel: c.publication && c.publication.channel });
    const real = integrationReady(c.publication && c.publication.channel);
    setPub(cardId, { pubStatus: "Publicando" });
    S.actions.setCardStatus(cardId, "Publicado");
    U.toast(real ? "Publicando…" : "Publicando (modo simulado)…");
    setTimeout(() => {
      const link = mockLink(c.publication && c.publication.channel);
      setPub(cardId, { pubStatus: "Publicado", status: "Publicado", link, publishedAt: today() + " " + nowTime() });
      addHistory(c.campaignId, cardId, "Publicado" + (real ? "" : " (simulado)"));
      U.toast("Publicado ✓" + (real ? "" : " (simulado)"));
      if (onDone) onDone();
      else window.App.render();
    }, 1200);
  }

  function markPublished(cardId, link) {
    const c = S.sel.card(cardId);
    setPub(cardId, { pubStatus: "Publicado manualmente", status: "Publicado", link: link || (c.publication && c.publication.link) || "", publishedAt: today() + " " + nowTime() });
    S.actions.setCardStatus(cardId, "Publicado");
    addHistory(c.campaignId, cardId, "Publicado manualmente");
    U.toast("Marcado como publicado ✓");
  }

  function fail(cardId) { setPub(cardId, { pubStatus: "Falha na publicação" }); addHistory(S.sel.card(cardId).campaignId, cardId, "Falha na publicação"); }

  // Processa a fila (simulado): publica os agendados+aprovados respeitando o modo
  function processQueue(campaignId) {
    const camp = S.sel.campaign(campaignId);
    if (camp.automationPaused) return U.toast("Automação pausada", "warn");
    const q = queue(campaignId).filter((c) => ["Agendado", "Aprovado"].includes(pubStatus(c)));
    const eligible = q.filter((c) => {
      if (camp.publishMode === "Manual") return false;
      if (/aprova/i.test(camp.publishMode || "") && !(c.publication && c.publication.approved)) return false;
      return true;
    });
    if (!eligible.length) return U.toast("Nada elegível na fila (aprovar primeiro?)", "warn");
    let i = 0;
    const step = () => { if (i >= eligible.length) { U.toast(eligible.length + " publicações processadas ✓"); window.App.render(); return; } publishNow(eligible[i].id, () => { i++; step(); }); };
    step();
  }

  // ---------- Fila e histórico ----------
  function queue(campaignId) {
    return S.sel.cardsByCampaign(campaignId)
      .filter((c) => c.publication && c.publication.date && !["Publicado", "Publicado manualmente"].includes(pubStatus(c)))
      .sort((a, b) => ((a.publication.date + a.publication.time) > (b.publication.date + b.publication.time) ? 1 : -1));
  }
  function scheduledAll() {
    return S.get().cards.filter((c) => c.publication && c.publication.date && c.publication.pubStatus).sort((a, b) => ((a.publication.date + (a.publication.time || "")) > (b.publication.date + (b.publication.time || "")) ? 1 : -1));
  }
  function dueToday() {
    const t = today();
    return S.get().cards.filter((c) => c.publication && c.publication.date === t && !["Publicado", "Publicado manualmente"].includes(pubStatus(c)));
  }

  function addHistory(campaignId, cardId, action) {
    S.update((s) => {
      const camp = s.campaigns.find((x) => x.id === campaignId); if (!camp) return;
      camp.publishHistory = camp.publishHistory || [];
      const c = s.cards.find((x) => x.id === cardId);
      camp.publishHistory.unshift({ date: today(), time: nowTime(), cardId, cardTitle: c ? c.title : "", channel: c && c.publication ? c.publication.channel : "", status: action, link: c && c.publication ? c.publication.link : "", mode: c && c.publication ? c.publication.mode : "", approvedBy: c && c.publication && c.publication.approved ? (c.responsible || "Você") : "" });
    });
  }

  // ---------- Automação ----------
  function toggleAutomationPause(campaignId) {
    const camp = S.sel.campaign(campaignId);
    S.actions.updateCampaign(campaignId, { automationPaused: !camp.automationPaused });
    U.toast(camp.automationPaused ? "Automação retomada" : "Automação pausada");
  }
  function cancelQueue(campaignId) {
    queue(campaignId).forEach((c) => setPub(c.id, { pubStatus: "Conteúdo gerado", date: "", time: "" }));
    U.toast("Fila cancelada");
  }
  function rules(campaign) { return Object.assign({}, DEFAULT_RULES, campaign.automationRules || {}); }

  // ---------- Análise pós-publicação (simulada) ----------
  function collectMetrics(cardId) {
    const c = S.sel.card(cardId);
    const base = 4000 + Math.floor(Math.random() * 60000);
    const metrics = {
      views: base, reach: Math.round(base * 0.85), likes: Math.round(base * 0.06), comments: Math.round(base * 0.004),
      shares: Math.round(base * 0.01), saves: Math.round(base * 0.02), clicks: Math.round(base * 0.015),
      sales: Math.floor(Math.random() * 30), ctr: (1 + Math.random() * 3).toFixed(1) + "%", retention: (45 + Math.floor(Math.random() * 35)) + "%",
      cost: "R$ 0", link: c.publication ? c.publication.link : "",
    };
    const summary = {
      worked: "Gancho segurou os primeiros segundos e a prova social gerou salvamentos.",
      failed: metrics.clicks < base * 0.012 ? "CTA fraco — poucos cliques para o volume de views." : "Poderia reforçar o CTA no meio.",
      repeat: "Manter o formato e o horário de publicação.",
      fix: "Mostrar o produto mais cedo e repetir o CTA.",
      variation: "Testar variação de gancho para outro subpúblico.",
      goodTime: (c.publication && c.publication.time) ? "Horário " + c.publication.time + " respondeu bem." : "Testar 18h.",
    };
    S.update((s) => { const cc = s.cards.find((x) => x.id === cardId); cc.analysis = { metrics, done: true, summary }; cc.publication.pubStatus = "Em análise"; });
    S.actions.setCardStatus(cardId, "Analisando resultado");
    U.toast("Métricas coletadas (simuladas) ✓ — análise gerada");
  }

  // ---------- Integrações ----------
  function connect(platform, onDone) {
    S.update((s) => { s.integrations[platform].status = "conectando"; });
    window.App.render();
    setTimeout(() => {
      S.update((s) => {
        if (platform === "meta") { s.integrations.meta.status = "conectado"; s.integrations.meta.ig = "@sua_conta"; s.integrations.meta.fb = "Sua Página"; }
        else if (platform === "tiktok") { s.integrations.tiktok.status = "conectado"; s.integrations.tiktok.note = "Publicação via envio para revisão"; }
      });
      U.toast((platform === "meta" ? "Meta" : "TikTok") + " conectado (simulado) ✓");
      if (onDone) onDone(); else window.App.render();
    }, 1100);
  }
  function disconnect(platform) { S.update((s) => { s.integrations[platform].status = "desconectado"; }); U.toast("Desconectado"); }

  return {
    MODES, SLOTS, APPROVAL_ITEMS, DEFAULT_RULES,
    pubStatus, setPub, ensureApproval, buildPlan, approve, schedule, publishNow, markPublished, fail,
    processQueue, queue, scheduledAll, dueToday, addHistory, toggleAutomationPause, cancelQueue, rules,
    collectMetrics, connect, disconnect, mockLink, integrationReady,
  };
})();
