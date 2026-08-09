/* ============================================================
   R.E.A.L. OS — Store (estado + persistência localStorage)
   ============================================================ */
window.Store = (function () {
  const KEY = "viraliza_state_v1";
  let state = null;
  const listeners = [];

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { state = JSON.parse(raw); migrate(); return; }
    } catch (e) { /* ignore */ }
    reset();
  }

  // migração leve: garante campos novos em estados salvos antigos
  function migrate() {
    if (!state.integrations) state.integrations = JSON.parse(JSON.stringify(window.SEED.integrations));
    if (!state.learning) state.learning = { approvals: [], performance: [], preferences: { approvedHooks: [], rejectedHooks: [], approvedCTAs: [], rejectedReasons: [], preferredTone: "", winningFormats: [], losingFormats: [] } };
    if (!state.ai) state.ai = { provider: "Modo Simulado", apiKey: "", model: "claude-sonnet-5", temperature: 0.7, maxTokens: 2000, status: "simulado" };
  }

  function reset() {
    // deep clone seed so mutations don't touch the template
    state = JSON.parse(JSON.stringify(window.SEED));
    persist();
  }

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* quota */ }
  }

  function get() { return state; }

  function subscribe(fn) { listeners.push(fn); }
  function emit() { listeners.forEach((fn) => fn()); }

  // Generic update wrapper: mutate then persist + notify
  function update(fn) { fn(state); persist(); emit(); }

  const uid = (p) => p + "_" + Math.random().toString(36).slice(2, 9);

  // ---------- Selectors ----------
  const sel = {
    cardsByCampaign: (cid) => state.cards.filter((c) => c.campaignId === cid),
    campaign: (id) => state.campaigns.find((c) => c.id === id),
    card: (id) => state.cards.find((c) => c.id === id),
    idea: (id) => state.ideas.find((i) => i.id === id),
    cardProgress: (card) => {
      const all = card.checklist.flatMap((g) => g.items);
      const done = all.filter((i) => i.done).length;
      return all.length ? Math.round((done / all.length) * 100) : 0;
    },
  };

  // ---------- Mutations ----------
  const actions = {
    addIdea: (data) => { let id; update((s) => { id = uid("idea"); s.ideas.unshift(Object.assign({ id, status: "Nova", tags: [], aiClass: "", aiNotes: "", createdAt: today() }, data)); }); return id; },
    updateIdea: (id, patch) => update((s) => { Object.assign(s.ideas.find((i) => i.id === id), patch); }),
    deleteIdea: (id) => update((s) => { s.ideas = s.ideas.filter((i) => i.id !== id); }),

    addCampaign: (data) => { let id; update((s) => { id = uid("camp"); s.campaigns.unshift(Object.assign({ id, status: "Planejamento", channels: [], metrics: { views: 0, sales: 0, revenue: "R$ 0", conversion: "—" }, createdAt: today() }, data)); }); return id; },
    updateCampaign: (id, patch) => update((s) => { Object.assign(s.campaigns.find((c) => c.id === id), patch); }),
    deleteCampaign: (id) => update((s) => { s.campaigns = s.campaigns.filter((c) => c.id !== id); s.cards = s.cards.filter((c) => c.campaignId !== id); }),

    addCard: (data) => {
      let id;
      update((s) => {
        id = uid("card");
        const base = {
          id, title: "Novo card", type: "Conteúdo orgânico", objective: "", channel: "Instagram",
          status: "Ideia", priority: "Média", responsible: "Você", date: today(), time: "", deadline: "", progress: 0, nextAction: "Gerar roteiro",
          methods: [], strategy: {}, script: emptyScript(), checklist: window.SEED.cards[0].checklist ? cloneChecklist() : [],
          content: { path: null, creatives: [] }, publication: emptyPub(), analysis: { metrics: {}, done: false }, corrections: [], files: [], createdAt: today(),
        };
        s.cards.unshift(Object.assign(base, data));
      });
      return id;
    },
    updateCard: (id, patch) => update((s) => { Object.assign(s.cards.find((c) => c.id === id), patch); }),
    patchCard: (id, path, value) => update((s) => {
      const card = s.cards.find((c) => c.id === id);
      const keys = path.split("."); let obj = card;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      card.progress = sel.cardProgress(card);
    }),
    setCardStatus: (id, status) => update((s) => { s.cards.find((c) => c.id === id).status = status; }),
    deleteCard: (id) => update((s) => { s.cards = s.cards.filter((c) => c.id !== id); }),
    // Vídeo do Card: mutator recebe (video, card). Inicializa a estrutura se faltar.
    withVideo: (id, mutator) => update((s) => {
      const card = s.cards.find((c) => c.id === id);
      if (!card.video) card.video = { original: null, versions: [], retention: null, chosenVersionId: null };
      mutator(card.video, card);
    }),
    toggleChecklist: (cardId, gi, ii) => update((s) => {
      const card = s.cards.find((c) => c.id === cardId);
      card.checklist[gi].items[ii].done = !card.checklist[gi].items[ii].done;
      card.progress = sel.cardProgress(card);
    }),
    chkAddItem: (cardId, gi, text) => update((s) => { const c = s.cards.find((x) => x.id === cardId); c.checklist[gi].items.push({ t: text, done: false }); c.progress = sel.cardProgress(c); }),
    chkDelItem: (cardId, gi, ii) => update((s) => { const c = s.cards.find((x) => x.id === cardId); c.checklist[gi].items.splice(ii, 1); c.progress = sel.cardProgress(c); }),
    chkEditItem: (cardId, gi, ii, text) => update((s) => { s.cards.find((x) => x.id === cardId).checklist[gi].items[ii].t = text; }),
    chkAddGroup: (cardId, name) => update((s) => { s.cards.find((x) => x.id === cardId).checklist.push({ group: name, items: [] }); }),
    chkDelGroup: (cardId, gi) => update((s) => { const c = s.cards.find((x) => x.id === cardId); c.checklist.splice(gi, 1); c.progress = sel.cardProgress(c); }),
    chkRenameGroup: (cardId, gi, name) => update((s) => { s.cards.find((x) => x.id === cardId).checklist[gi].group = name; }),
    setChecklist: (cardId, checklist) => update((s) => { const c = s.cards.find((x) => x.id === cardId); c.checklist = checklist; c.progress = sel.cardProgress(c); }),
    duplicateCard: (id) => { let nid; update((s) => { const c = s.cards.find((x) => x.id === id); const copy = JSON.parse(JSON.stringify(c)); nid = uid("card"); copy.id = nid; copy.title = c.title + " (cópia)"; copy.video = { original: null, versions: [], retention: null, chosenVersionId: null }; copy.corrections = []; copy.analysis = { metrics: {}, done: false }; copy.createdAt = today(); s.cards.unshift(copy); }); return nid; },
    addCorrection: (cardId, data) => update((s) => {
      const card = s.cards.find((c) => c.id === cardId);
      card.corrections.unshift(Object.assign({ id: uid("cor"), status: "Aberta", createdAt: today() }, data));
    }),
    addCreative: (cardId, data) => update((s) => {
      const card = s.cards.find((c) => c.id === cardId);
      card.content.creatives.unshift(Object.assign({ id: uid("cre"), status: "Gerado", creditsUsed: 0, createdAt: today() }, data));
    }),
    addFile: (cardId, data) => update((s) => { s.cards.find((c) => c.id === cardId).files.unshift(data); }),
    addProductImage: (cardId, img) => update((s) => { const c = s.cards.find((x) => x.id === cardId); if (!c.content) c.content = { path: null, creatives: [] }; if (!c.content.media) c.content.media = { productImages: [] }; if (!c.content.media.productImages) c.content.media.productImages = []; const first = c.content.media.productImages.length === 0; c.content.media.productImages.push(Object.assign({ id: uid("img"), isPrimary: first, createdAt: today() }, img)); }),
    removeProductImage: (cardId, imgId) => update((s) => { const c = s.cards.find((x) => x.id === cardId); c.content.media.productImages = (c.content.media.productImages || []).filter((i) => i.id !== imgId); if (c.content.media.productImages.length && !c.content.media.productImages.some((i) => i.isPrimary)) c.content.media.productImages[0].isPrimary = true; }),
    setPrimaryImage: (cardId, imgId) => update((s) => { const c = s.cards.find((x) => x.id === cardId); (c.content.media.productImages || []).forEach((i) => i.isPrimary = i.id === imgId); }),

    addLibrary: (data) => update((s) => { s.library.unshift(Object.assign({ id: uid("lib"), tags: [], source: "", createdAt: today() }, data)); }),
    updateLibrary: (id, patch) => update((s) => { Object.assign(s.library.find((l) => l.id === id), patch); }),
    deleteLibrary: (id) => update((s) => { s.library = s.library.filter((l) => l.id !== id); }),

    updatePersona: (patch) => update((s) => { Object.assign(s.persona, patch); }),

    togglePriority: (id) => update((s) => { const p = s.today.priorities.find((x) => x.id === id); p.done = !p.done; }),
    addPriority: (text, meta) => update((s) => { s.today.priorities.push({ id: uid("p"), text, meta: meta || "", done: false }); }),

    spendCredits: (amount, desc) => update((s) => {
      s.credits.available -= amount; s.credits.used += amount;
      s.credits.history.unshift({ desc, amount: -amount, date: today() });
    }),
    addCredits: (amount) => update((s) => {
      s.credits.available += amount; s.credits.total += amount;
      s.credits.history.unshift({ desc: "Compra de créditos", amount: +amount, date: today() });
    }),

    addStatus: (name, color) => update((s) => { s.statuses.push({ name, color }); }),
    deleteStatus: (name) => update((s) => {
      const fallback = (s.statuses.find((x) => x.name !== name) || { name: "Ideia" }).name;
      s.cards.forEach((c) => { if (c.status === name) c.status = fallback; });
      s.statuses = s.statuses.filter((x) => x.name !== name);
    }),
    renameStatus: (oldName, newName, color) => update((s) => {
      const st = s.statuses.find((x) => x.name === oldName); if (!st) return;
      if (newName) { s.cards.forEach((c) => { if (c.status === oldName) c.status = newName; }); st.name = newName; }
      if (color) st.color = color;
    }),
    reset,
  };

  function today() { return new Date().toISOString().slice(0, 10); }
  function emptyScript() { return { hook: "", hookAlt1: "", hookAlt2: "", opening: "", mainLine: "", scenes: [], screenText: [], cutPhrases: [], cta: "", caption: "", hashtags: "", title: "", cover: "", stories: "" }; }
  function emptyPub() { return { channel: "Instagram", date: "", time: "", captionFinal: "", hashtagsFinal: "", ctaFinal: "", link: "", status: "Não publicado", responsible: "Você", approved: false }; }
  function cloneChecklist() { return JSON.parse(JSON.stringify(window.SEED.cards[0].checklist)).map((g) => ({ group: g.group, items: g.items.map((i) => ({ t: i.t, done: false })) })); }

  function importState(obj) { state = obj; migrate(); persist(); emit(); }
  return { load, get, subscribe, emit, update, sel, actions, uid, reset, persist, importState };
})();
