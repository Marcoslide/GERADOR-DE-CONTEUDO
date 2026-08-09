/* ============================================================
   VIRALIZA — Criar campanha com IA (conversacional)
   + Inteligência de Mercado opcional (links, avaliações,
     perguntas, concorrentes, palavra-chave).
   Pouca entrada, muita saída.
   ============================================================ */
window.CampaignWizard = (function () {
  const S = window.Store, U = window.UI, AI = window.AI, MR = window.MarketResearch, esc = U.esc;
  let w = null;

  const GOALS = ["Vender produto", "Campanha de afiliado", "Gerar vídeos com foto do produto", "Gravar vídeos com teleprompter", "Analisar vídeo já gravado", "Criar conteúdo orgânico", "Marketplace", "Live Shop"];
  const CHANNELS = ["Instagram", "TikTok", "YouTube Shorts", "Facebook", "WhatsApp", "Marketplace", "Anúncios"];
  const STYLES = ["Direto e vendedor", "Natural estilo UGC", "Antes e depois", "Review", "Demonstração", "Prova social", "Humor leve", "Premium", "Popular", "Educativo", "Urgência/oferta", "Storytelling"];
  const MATERIAL = ["Tenho foto do produto", "Tenho vídeo gravado", "Tenho link de referência", "Tenho link de afiliado", "Tenho só a ideia", "Quero gravar agora"];
  const QUANTITY = ["1 vídeo", "3 vídeos", "5 vídeos", "7 dias de conteúdo", "10 variações"];
  const LINK_TYPES = ["Meu anúncio", "Concorrente", "Produto referência", "Anúncio campeão", "Review", "Página de vendas", "Vídeo de referência", "Conteúdo de rede social"];
  const FREQ = ["1 post por dia", "2 posts por dia", "3 posts por dia", "Definir depois"];
  const PUBMODE = ["Manual", "Agendado com lembrete", "Automático com aprovação", "Automático liberado"];

  function open(prefill) {
    w = { text: (prefill && prefill.text) || "", goal: "Vender produto", channels: ["Instagram", "TikTok"], style: "Direto e vendedor", material: [], quantity: "3 vídeos", audience: "",
      frequency: "2 posts por dia", publishMode: "Automático com aprovação",
      showIntel: false, references: [{ url: "", type: "Concorrente" }], pasted: { reviews: "", questions: "", comments: "", description: "", keyword: "" }, research: null };
    renderForm();
  }

  function chips(list, key, multi) {
    const isSel = (v) => multi ? (w[key] || []).includes(v) : w[key] === v;
    return `<div class="chip-select">${list.map((v) => `<div class="chip ${isSel(v) ? "on" : ""}" data-wchip="${key}" data-val="${esc(v)}" data-multi="${multi ? 1 : 0}">${esc(v)}</div>`).join("")}</div>`;
  }

  function linkRows() {
    return w.references.map((r, i) => `
      <div class="flex gap-8" style="margin-bottom:8px">
        <input class="input" data-refurl="${i}" placeholder="Cole o link (Mercado Livre, Shopee, Amazon, Reels, TikTok…)" value="${esc(r.url)}" style="flex:2"/>
        <select class="select" data-reftype="${i}" style="flex:1">${LINK_TYPES.map((t) => `<option ${t === r.type ? "selected" : ""}>${esc(t)}</option>`).join("")}</select>
        ${w.references.length > 1 ? `<span class="x-btn" data-refdel="${i}">✕</span>` : ""}
      </div>`).join("");
  }

  function intelSection() {
    if (!w.showIntel) return `<button class="btn btn-sm" id="w-intel-toggle" style="margin-top:6px">🔎 + Inteligência de Mercado (opcional)</button>`;
    return `
      <div class="info-block" style="margin-top:10px"><h4>🔎 Inteligência de Mercado <span class="muted" style="font-weight:400">(opcional)</span></h4>
        <p class="muted" style="font-size:12px;margin-bottom:10px">Alimente a IA com referências para criar vídeos melhores. A IA extrai dúvidas, objeções e provas — <b>sem copiar concorrentes</b>.</p>
        <label style="font-size:12px;font-weight:600;color:var(--text-2)">Referências de mercado</label>
        <div style="margin:8px 0">${linkRows()}</div>
        <button class="btn btn-xs" id="w-addlink">+ Adicionar outro link</button>
        <div class="form-row" style="margin-top:12px">
          <div class="field mb-0"><label>Colar avaliações</label><textarea class="textarea" data-paste="reviews" style="min-height:60px" placeholder="Uma por linha…">${esc(w.pasted.reviews)}</textarea></div>
          <div class="field mb-0"><label>Colar perguntas de clientes</label><textarea class="textarea" data-paste="questions" style="min-height:60px" placeholder="Uma por linha…">${esc(w.pasted.questions)}</textarea></div>
        </div>
        <div class="field" style="margin-top:12px;margin-bottom:0"><label>Palavra-chave do produto/nicho</label><input class="input" data-paste="keyword" value="${esc(w.pasted.keyword)}" placeholder="Ex: quadro decorativo sala"/></div>
        <button class="btn btn-primary btn-sm mt-16" id="w-analyze">🤖 Analisar referências</button>
        <button class="btn btn-sm mt-16" id="w-intel-hide" style="margin-left:6px">Ocultar</button>
      </div>`;
  }

  function renderForm() {
    U.modal({
      title: "Criar campanha com IA", size: "wide",
      body: `
        <div class="msg ai" style="max-width:100%;margin-bottom:16px"><div class="m-ava">✦</div><div class="m-bubble">Me diga em poucas palavras o que você quer criar. Pode ser um produto, uma ideia, um link de afiliado ou uma campanha para gerar vendas.</div></div>
        <div class="field"><textarea class="textarea" id="w-text" placeholder="Ex: Quero vender um kit de quadros decorativos na Shopee e no Instagram.">${esc(w.text)}</textarea></div>
        <div class="field"><label>O que você quer criar?</label>${chips(GOALS, "goal", false)}</div>
        <div class="field"><label>Onde quer publicar?</label>${chips(CHANNELS, "channels", true)}</div>
        <div class="field"><label>Estilo do vídeo</label>${chips(STYLES, "style", false)}</div>
        <div class="form-row">
          <div class="field"><label>Material disponível</label>${chips(MATERIAL, "material", true)}</div>
          <div class="field"><label>Quantidade</label>${chips(QUANTITY, "quantity", false)}</div>
        </div>
        <div class="field"><label>Público (opcional)</label><input class="input" id="w-aud" value="${esc(w.audience)}" placeholder="Ex: mães que querem decorar a sala"/></div>
        <div class="form-row">
          <div class="field"><label>Frequência de publicação</label>${chips(FREQ, "frequency", false)}</div>
          <div class="field"><label>Modo de publicação</label>${chips(PUBMODE, "publishMode", false)}</div>
        </div>
        <p class="muted" style="font-size:11px;margin-top:-6px;margin-bottom:12px">Recomendado: <b>Automático com aprovação</b> (só publica o que você aprovar). “Automático liberado” fica desligado por padrão.</p>
        ${intelSection()}`,
      foot: `<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" id="w-preview">✦ Gerar prévia com IA</button>`,
      onMount: bindForm,
    });
  }

  function syncForm(o) {
    if (o.querySelector("#w-text")) w.text = o.querySelector("#w-text").value.trim();
    if (o.querySelector("#w-aud")) w.audience = o.querySelector("#w-aud").value.trim();
    o.querySelectorAll("[data-refurl]").forEach((el) => w.references[+el.dataset.refurl].url = el.value.trim());
    o.querySelectorAll("[data-reftype]").forEach((el) => w.references[+el.dataset.reftype].type = el.value);
    o.querySelectorAll("[data-paste]").forEach((el) => w.pasted[el.dataset.paste] = el.value);
  }

  function bindForm(o) {
    o.querySelectorAll("[data-wchip]").forEach((el) => el.onclick = () => {
      const key = el.dataset.wchip, val = el.dataset.val, multi = el.dataset.multi === "1";
      if (multi) { w[key] = w[key] || []; const i = w[key].indexOf(val); i >= 0 ? w[key].splice(i, 1) : w[key].push(val); el.classList.toggle("on"); }
      else { w[key] = val; o.querySelectorAll(`[data-wchip="${key}"]`).forEach((x) => x.classList.toggle("on", x.dataset.val === val)); }
    });
    const tog = o.querySelector("#w-intel-toggle"); if (tog) tog.onclick = () => { syncForm(o); w.showIntel = true; renderForm(); };
    const hide = o.querySelector("#w-intel-hide"); if (hide) hide.onclick = () => { syncForm(o); w.showIntel = false; renderForm(); };
    const addlink = o.querySelector("#w-addlink"); if (addlink) addlink.onclick = () => { syncForm(o); w.references.push({ url: "", type: "Concorrente" }); renderForm(); };
    o.querySelectorAll("[data-refdel]").forEach((el) => el.onclick = () => { syncForm(o); w.references.splice(+el.dataset.refdel, 1); renderForm(); });
    const analyze = o.querySelector("#w-analyze"); if (analyze) analyze.onclick = () => { syncForm(o); runAnalysis(); };
    o.querySelector("#w-preview").onclick = () => {
      syncForm(o);
      if (!w.text && !w.audience && !hasRefs()) return U.toast("Escreva em poucas palavras o que você quer criar", "warn");
      w.plan = AI.generateCampaignPlan(w);
      renderPreview();
    };
  }

  function hasRefs() { return w.references.some((r) => r.url) || Object.values(w.pasted).some((v) => v && v.trim()); }

  // ---------- Análise de mercado → Oportunidades ----------
  function runAnalysis() {
    if (!hasRefs()) return U.toast("Adicione ao menos um link ou cole avaliações/perguntas", "warn");
    w.plan = w.plan || AI.generateCampaignPlan(w);
    U.modal({ title: "Analisando referências", size: "", body: `<div class="vs-analyzing"><div class="vs-spinner"></div><h3 style="color:var(--text-0);margin-top:16px">Analisando anúncios, avaliações e perguntas…</h3><p class="muted" style="margin-top:6px">Extraindo dúvidas, objeções, provas sociais e oportunidades.</p></div>`, foot: "" });
    setTimeout(() => {
      w.research = MR.analyze({ product: w.plan.productName, niche: w.style, references: w.references.filter((r) => r.url), pasted: w.pasted, audience: w.audience || w.plan.audience });
      renderOpportunities();
    }, 1300);
  }

  function renderOpportunities() {
    const a = w.research, op = a.contentOpportunities;
    const block = (title, ico, arr, cls) => `<div class="info-block"><h4>${ico} ${title}</h4>${arr.length ? arr.map((t) => `<div class="analysis-row" style="padding:7px 0"><span class="ar-ico">•</span><div>${esc(t)}</div></div>`).join("") : '<p class="muted" style="font-size:12px">—</p>'}</div>`;
    U.modal({
      title: "Oportunidades encontradas", size: "wide",
      body: `
        <div class="flex gap-8 wrap" style="margin-bottom:14px"><span class="pill pill-accent">Confiança: ${esc(a.confidence)}</span><span class="pill pill-gray">${esc(a.sourceType)}</span><span class="pill pill-blue">${(a.suggestedCards || []).length} ideias de vídeo</span></div>
        <div class="alert good" style="margin-bottom:14px"><span class="al-ico">🛡️</span><div class="al-body" style="font-size:12px">A IA extrai inteligência (dúvidas, objeções, provas) e transforma em conteúdo <b>original</b> — nunca copia texto, imagem ou vídeo de concorrente. <span class="muted">Pesquisa simulada no MVP. Estrutura pronta para busca real.</span></div></div>
        <div class="grid grid-2" style="align-items:start">
          ${block("Dúvidas frequentes", "❓", op.duvidas)}
          ${block("Objeções", "🛡️", op.objecoes)}
          ${block("Elogios / provas sociais", "⭐", op.elogios)}
          ${block("Reclamações / alertas", "⚠️", op.reclamacoes)}
        </div>
        <div class="info-block mb-0"><h4>🎬 Ideias de vídeos</h4>
          ${(a.suggestedCards || []).map((sc) => `<div class="scene-card"><div class="scene-top"><span class="pill pill-accent">${esc(sc.origin)}</span><span class="pill pill-gray">${esc(sc.type)}</span><span class="pill ${sc.potential === "Alto" ? "pill-accent" : "pill-amber"}">Potencial: ${esc(sc.potential)}</span></div><div class="scene-reason"><b>${esc(sc.title)}</b> — ${esc(sc.potentialReason)}</div><div class="scene-screen"><span class="tp-label" style="color:var(--text-3)">Gancho</span>${esc(sc.hook)}</div></div>`).join("")}</div>`,
      foot: `<button class="btn btn-sm" id="op-more">+ Adicionar mais links</button>
        <button class="btn btn-sm" id="op-lib">📚 Salvar descobertas</button>
        <button class="btn btn-ghost btn-sm" id="op-skip">Pular</button>
        <button class="btn btn-primary" id="op-cards">✨ Gerar cards com base nessa análise</button>`,
      onMount: (o) => {
        o.querySelector("#op-more").onclick = () => renderForm();
        o.querySelector("#op-lib").onclick = () => { const n = MR.saveToLibrary(a); U.toast(n + " descobertas salvas na biblioteca ✓"); };
        o.querySelector("#op-skip").onclick = () => renderPreview();
        o.querySelector("#op-cards").onclick = () => createFromResearch();
      },
    });
  }

  // ---------- Prévia ----------
  function renderPreview() {
    const p = w.plan;
    const branches = (w.research && w.research.audienceBranches) || AI.generateAudienceBranches(p.audience);
    const willGen = [
      `${p.cardPlan.length} cards de vídeo prontos`, `${p.cardPlan.length} roteiros com gancho e cena de retenção`,
      `sequência de stories`, `checklist de gravação`, `direção de visual`, `legenda, hashtags e CTA`, `plano de publicação em ${p.channels.join(", ")}`,
    ];
    U.modal({
      title: "Prévia da campanha", size: "wide",
      body: `
        <div class="grid grid-2" style="align-items:start">
          <div class="info-block"><h4>🤖 A IA entendeu</h4>
            <div class="kv">
              <div class="k">Produto/oferta</div><div class="v">${esc(p.productName)} — ${esc(p.offer)}</div>
              <div class="k">Objetivo</div><div class="v">${esc(p.objective)}</div>
              <div class="k">Público</div><div class="v">${esc(p.audience)}</div>
              <div class="k">Canais</div><div class="v">${p.channels.join(", ")}</div>
              <div class="k">Estilo</div><div class="v">${esc(p.style)}</div>
              <div class="k">Quantidade</div><div class="v">${p.cardPlan.length} conteúdos</div>
              ${w.research ? `<div class="k">Inteligência</div><div class="v"><span class="pill pill-accent">${(w.research.suggestedCards || []).length} oportunidades de mercado</span></div>` : ""}
            </div>
          </div>
          <div class="info-block"><h4>✨ O Viraliza vai gerar</h4>
            ${willGen.map((g) => `<div class="analysis-row" style="padding:7px 0"><span class="ar-ico">✓</span><div>${esc(g)}</div></div>`).join("")}
          </div>
        </div>
        ${w.research ? `<div class="alert good"><span class="al-ico">🔎</span><div class="al-body" style="font-size:12px">Inteligência de mercado aplicada: os cards vão usar dúvidas e objeções reais encontradas na análise.</div></div>` : ""}
        <div class="info-block mb-0"><h4>👥 Subpúblicos sugeridos</h4>
          <div class="tag-row">${branches.slice(0, 6).map((b, i) => `<span class="chip" data-branch="${i}">${esc(b.name)}</span>`).join("")}</div>
          <div id="w-branch-detail"></div>
        </div>`,
      foot: `<button class="btn btn-ghost" data-close>Cancelar</button>
        <button class="btn btn-sm" id="w-back">← Ajustar</button>
        ${w.research ? "" : `<button class="btn btn-sm" id="w-intel2">🔎 Inteligência de mercado</button>`}
        <button class="btn btn-primary" id="w-create">✓ Criar campanha</button>`,
      onMount: (o) => {
        o.querySelector("#w-back").onclick = () => renderForm();
        o.querySelector("#w-create").onclick = () => create();
        const i2 = o.querySelector("#w-intel2"); if (i2) i2.onclick = () => { w.showIntel = true; renderForm(); };
        o.querySelectorAll("[data-branch]").forEach((el) => el.onclick = () => {
          const b = branches[+el.dataset.branch];
          o.querySelectorAll("[data-branch]").forEach((x) => x.classList.remove("on")); el.classList.add("on");
          o.querySelector("#w-branch-detail").innerHTML = `
            <div class="scene-card" style="margin-top:12px">
              <div class="scene-top"><span class="pill pill-accent">${esc(b.name)}</span><span class="pill pill-gray">${esc(b.videoType)}</span><span class="pill pill-blue">${esc(b.platform)}</span></div>
              <div class="kv" style="margin-top:6px"><div class="k">Dor</div><div class="v">${esc(b.pain)}</div><div class="k">Gancho</div><div class="v">${esc(b.hook)}</div><div class="k">CTA</div><div class="v">${esc(b.cta)}</div></div>
              <button class="btn btn-xs mt-16" data-blib="${el.dataset.branch}">Salvar na biblioteca</button>
            </div>`;
          o.querySelector(`[data-blib="${el.dataset.branch}"]`).onclick = () => { S.actions.addLibrary({ type: "Subpúblico", title: b.name, content: `Dor: ${b.pain}. Gancho: ${b.hook}. CTA: ${b.cta}. Plataforma: ${b.platform}.`, tags: ["público"] }); U.toast("Subpúblico salvo ✓"); };
        });
      },
    });
  }

  // ---------- Criação ----------
  function freqNum() { const m = { "1 post por dia": 1, "2 posts por dia": 2, "3 posts por dia": 3 }; return m[w.frequency] || 2; }

  function newCampaign() {
    const p = w.plan;
    const id = S.actions.addCampaign({
      title: p.title, type: p.type, objective: p.objective, productName: p.productName, offer: p.offer,
      audience: p.audience, promise: p.promise, emotion: p.emotion, cta: p.cta, channels: p.channels,
      style: p.style, videosPerDay: freqNum(), frequency: freqNum(), publishMode: w.publishMode,
      automationRules: Object.assign({}, window.PublishEngine.DEFAULT_RULES, { allowedChannels: p.channels }),
      automationPaused: false, smartAutomation: false, publishHistory: [],
      status: "Ativa", startDate: new Date().toISOString().slice(0, 10), endDate: "",
    });
    if (w.research) S.actions.updateCampaign(id, { research: w.research });
    return S.sel.campaign(id);
  }

  function finish(camp, ids) {
    window.PublishEngine.buildPlan(camp);
    U.closeModal(); U.toast(`Campanha criada com ${ids.length} cards + plano de publicação ✓`);
    location.hash = "#/campanha/" + camp.id;
  }

  function genCards(camp) {
    // quantidade em "variações" ou "dias" → Máquina de Variações (ângulos distintos)
    if (/varia/.test(w.quantity)) return window.VariationMachine.generate(camp, 10, { channels: camp.channels, styles: [w.style] });
    if (/dias/.test(w.quantity)) return window.VariationMachine.generate(camp, 14, { channels: camp.channels, styles: [w.style] });
    return AI.generateCardsForCampaign(camp, w.plan.cardPlan);
  }

  function create() {
    const camp = newCampaign();
    finish(camp, genCards(camp));
  }

  function createFromResearch() {
    w.plan = w.plan || AI.generateCampaignPlan(w);
    const camp = newCampaign();
    finish(camp, MR.generateCardsFromResearch(camp, w.research));
  }

  return { open };
})();
