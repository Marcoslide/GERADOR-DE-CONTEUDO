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
      if (raw) { state = JSON.parse(raw); return; }
    } catch (e) { /* ignore */ }
    reset();
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
    addCorrection: (cardId, data) => update((s) => {
      const card = s.cards.find((c) => c.id === cardId);
      card.corrections.unshift(Object.assign({ id: uid("cor"), status: "Aberta", createdAt: today() }, data));
    }),
    addCreative: (cardId, data) => update((s) => {
      const card = s.cards.find((c) => c.id === cardId);
      card.content.creatives.unshift(Object.assign({ id: uid("cre"), status: "Gerado", creditsUsed: 0, createdAt: today() }, data));
    }),
    addFile: (cardId, data) => update((s) => { s.cards.find((c) => c.id === cardId).files.unshift(data); }),

    addLibrary: (data) => update((s) => { s.library.unshift(Object.assign({ id: uid("lib"), tags: [], source: "", createdAt: today() }, data)); }),
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
    deleteStatus: (name) => update((s) => { s.statuses = s.statuses.filter((x) => x.name !== name); }),
    reset,
  };

  function today() { return new Date().toISOString().slice(0, 10); }
  function emptyScript() { return { hook: "", hookAlt1: "", hookAlt2: "", opening: "", mainLine: "", scenes: [], screenText: [], cutPhrases: [], cta: "", caption: "", hashtags: "", title: "", cover: "", stories: "" }; }
  function emptyPub() { return { channel: "Instagram", date: "", time: "", captionFinal: "", hashtagsFinal: "", ctaFinal: "", link: "", status: "Não publicado", responsible: "Você", approved: false }; }
  function cloneChecklist() { return JSON.parse(JSON.stringify(window.SEED.cards[0].checklist)).map((g) => ({ group: g.group, items: g.items.map((i) => ({ t: i.t, done: false })) })); }

  return { load, get, subscribe, emit, update, sel, actions, uid, reset, persist };
})();
