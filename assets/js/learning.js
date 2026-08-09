/* ============================================================
   VIRALIZA — Memória Operacional (aprendizado da operação)
   Guarda aprovações, rejeições, edições e performance para o
   sistema gerar cada vez mais "no seu estilo".
   ============================================================ */
window.Learning = (function () {
  const S = window.Store;
  const uid = (p) => p + "_" + Math.random().toString(36).slice(2, 9);
  const today = () => new Date().toISOString().slice(0, 10);
  function mem() { const s = S.get(); if (!s.learning) s.learning = { approvals: [], performance: [], preferences: { approvedHooks: [], rejectedHooks: [], approvedCTAs: [], rejectedReasons: [], preferredTone: "", winningFormats: [], losingFormats: [] } }; return s.learning; }

  function saveApproval(item) {
    S.update((s) => {
      const m = s.learning; const e = Object.assign({ id: uid("appr"), status: "approved", createdAt: today(), active: true }, item);
      m.approvals.unshift(e);
      if (item.type === "hook" && item.finalContent) m.preferences.approvedHooks.unshift(item.finalContent);
      if (item.type === "cta" && item.finalContent) m.preferences.approvedCTAs.unshift(item.finalContent);
      if (item.type === "script" && item.tone) m.preferences.preferredTone = item.tone;
    });
  }
  function saveRejection(item) {
    S.update((s) => {
      const m = s.learning; m.approvals.unshift(Object.assign({ id: uid("rej"), status: "rejected", createdAt: today(), active: true }, item));
      if (item.type === "hook" && item.originalContent) m.preferences.rejectedHooks.unshift(item.originalContent);
      if (item.reason) m.preferences.rejectedReasons.unshift(item.reason);
    });
  }
  function saveEdit(before, after, field, ctx) {
    ctx = ctx || {};
    const insight = insightFromEdit(field, before, after);
    S.update((s) => {
      const m = s.learning;
      m.approvals.unshift({ id: uid("edit"), status: "edited", type: field, originalContent: before, finalContent: after, insight, cardId: ctx.cardId, campaignId: ctx.campaignId, createdAt: today(), active: true });
      if (field === "hook" && after) m.preferences.approvedHooks.unshift(after);
    });
    return insight;
  }
  function savePerformanceInsight(item) {
    S.update((s) => {
      const m = s.learning; m.performance.unshift(Object.assign({ id: uid("perf"), createdAt: today(), active: true }, item));
      if (item.type === "winner" && item.format) m.preferences.winningFormats.unshift(item.format);
      if (item.type === "loser" && item.format) m.preferences.losingFormats.unshift(item.format);
    });
  }

  function insightFromEdit(field, before, after) {
    if (field !== "hook") return "Usuário ajustou o " + field + " — vou seguir esse estilo.";
    const b = (before || "").length, a = (after || "").length;
    if (a < b) return "Usuário prefere ganchos mais curtos e diretos.";
    if (/\?/.test(after) && !/\?/.test(before || "")) return "Usuário prefere abrir com pergunta / dor visual.";
    return "Usuário prefere ganchos mais específicos, evitando frases genéricas.";
  }

  // Leitura para orientar a geração (operationLearningContext)
  function getApprovedPatterns() { const p = mem().preferences; return { hooks: (p.approvedHooks || []).filter(Boolean).slice(0, 5), ctas: (p.approvedCTAs || []).slice(0, 5), tone: p.preferredTone, formats: p.winningFormats || [] }; }
  function getRejectedPatterns() { const p = mem().preferences; return { hooks: (p.rejectedHooks || []).slice(0, 5), reasons: (p.rejectedReasons || []).slice(0, 5), formats: p.losingFormats || [] }; }
  function getWinningPatterns() { return mem().performance.filter((x) => x.type === "winner" && x.active); }
  function getRelevantMemory(task, ctx) {
    return { task, approvedStyle: getApprovedPatterns(), rejectedStyle: getRejectedPatterns(), performanceInsights: getWinningPatterns(), preferredTone: mem().preferences.preferredTone };
  }

  // Aplica a memória num roteiro recém-gerado (reusa gancho aprovado, evita rejeitado)
  function applyToScript(script) {
    if (!script) return script;
    const ap = getApprovedPatterns(), rj = getRejectedPatterns();
    if (ap.hooks.length) { script.hookAlt1 = ap.hooks[0]; script._memoryUsed = true; }
    if (rj.hooks.length && rj.hooks.indexOf(script.hook) >= 0) { script.hook = "Não role antes de ver isso 👀 " + (script.mainLine || "").split(".")[0]; script._memoryUsed = true; }
    return script;
  }

  // Controle do usuário
  function forget(id) { S.update((s) => { s.learning.approvals = s.learning.approvals.filter((x) => x.id !== id); s.learning.performance = s.learning.performance.filter((x) => x.id !== id); }); }
  function toggle(id) { S.update((s) => { const all = s.learning.approvals.concat(s.learning.performance); const it = all.find((x) => x.id === id); if (it) it.active = !it.active; }); }
  function all() { const m = mem(); return { approvals: m.approvals, performance: m.performance, preferences: m.preferences }; }

  return { mem, saveApproval, saveRejection, saveEdit, savePerformanceInsight, getApprovedPatterns, getRejectedPatterns, getWinningPatterns, getRelevantMemory, applyToScript, forget, toggle, all };
})();
