/* ============================================================
   R.E.A.L. OS — App (router, layout, formulários, init)
   ============================================================ */
window.App = (function () {
  const S = window.Store, U = window.UI, V = window.Views, esc = U.esc;

  const NAV = [
    { key: "hoje", label: "Hoje", ico: "☀️" },
    { key: "ideias", label: "Ideias", ico: "💡" },
    { key: "campanhas", label: "Campanhas", ico: "🎯" },
    { key: "board", label: "Board", ico: "📋" },
    { key: "analise", label: "Análise", ico: "📈" },
    { key: "biblioteca", label: "Biblioteca", ico: "📚" },
    { key: "persona", label: "Persona", ico: "🎭" },
    { key: "config", label: "Configurações", ico: "⚙️" },
  ];

  function currentRoute() {
    const h = (location.hash || "#/hoje").replace(/^#\//, "");
    const parts = h.split("/");
    return { view: parts[0] || "hoje", param: parts[1] };
  }

  // ---------- Layout ----------
  function renderNav() {
    const st = S.get();
    const { view } = currentRoute();
    const counts = { ideias: st.ideas.length, campanhas: st.campaigns.length, board: st.cards.length, biblioteca: st.library.length };
    const items = NAV.map((n) => `
      <div class="nav-item ${view === n.key || (view === "campanha" && n.key === "campanhas") ? "active" : ""}" data-nav="${n.key}">
        <span class="ico">${n.ico}</span><span>${n.label}</span>${counts[n.key] != null ? `<span class="badge">${counts[n.key]}</span>` : ""}
      </div>`).join("");
    const pct = Math.round((st.credits.available / st.credits.total) * 100);
    document.getElementById("sidebar").innerHTML = `
      <div class="brand" data-nav="hoje">
        <div class="brand-logo">R</div>
        <div><div class="brand-name">R.E.A.L. OS</div><div class="brand-sub">Execução de conteúdo</div></div>
      </div>
      <div class="nav">
        <div class="nav-label">Operação</div>${items}
      </div>
      <div class="sidebar-foot">
        <div class="credits-mini" data-nav="config" data-settab="Créditos de IA">
          <div class="cm-top"><span>✨ Créditos IA</span><span class="cm-val">${st.credits.available}/${st.credits.total}</span></div>
          <div class="bar"><span style="width:${pct}%"></span></div>
        </div>
      </div>`;
    document.querySelectorAll("#sidebar [data-nav]").forEach((el) => el.onclick = () => { location.hash = "#/" + el.dataset.nav; document.getElementById("sidebar").classList.remove("open"); });
  }

  function renderHeader() {
    const { view, param } = currentRoute();
    const titles = { hoje: ["Hoje", "sua central de execução"], ideias: ["Ideias", "capture e transforme"], campanhas: ["Campanhas", "estratégia → execução"], campanha: ["Campanha", ""], board: ["Board", "produção de conteúdo"], analise: ["Análise", "performance e correção"], biblioteca: ["Biblioteca", "acervo reutilizável"], persona: ["Persona", "identidade da marca"], config: ["Configurações", ""] };
    const [t, sub] = titles[view] || ["R.E.A.L. OS", ""];
    document.getElementById("header").innerHTML = `
      <div class="menu-toggle" id="menu-toggle">☰</div>
      <div><h1>${esc(t)}</h1></div><span class="sub">${esc(sub)}</span>
      <div class="header-spacer"></div>
      <div class="header-search">🔍<input placeholder="Buscar ideias, campanhas, cards…" id="global-search"/></div>
      <button class="btn btn-primary btn-sm" id="header-new">+ Criar</button>`;
    document.getElementById("menu-toggle").onclick = () => document.getElementById("sidebar").classList.toggle("open");
    document.getElementById("header-new").onclick = () => openCreateMenu();
    const gs = document.getElementById("global-search");
    gs.onkeydown = (e) => { if (e.key === "Enter" && gs.value.trim()) globalSearch(gs.value.trim()); };
  }

  // ---------- Main render ----------
  function render() {
    renderNav(); renderHeader();
    const { view, param } = currentRoute();
    const content = document.getElementById("content");
    let html, binder;
    switch (view) {
      case "hoje": html = V.hoje(); binder = V.bindHoje; break;
      case "ideias": html = V.ideias(); binder = V.bindIdeias; break;
      case "campanhas": html = V.campanhas(); binder = V.bindCampanhas; break;
      case "campanha": html = V.campanha(param); binder = V.bindCampanha; break;
      case "board": html = V.board(); binder = V.bindBoard; break;
      case "analise": html = V.analise(); binder = V.bindAnalise; break;
      case "biblioteca": html = V.biblioteca(); binder = V.bindBiblioteca; break;
      case "persona": html = V.persona(); binder = V.bindPersona; break;
      case "config": html = V.config(); binder = V.bindConfig; break;
      default: location.hash = "#/hoje"; return;
    }
    content.innerHTML = html;
    if (binder) binder(content);
    content.scrollTop = 0;
    U.renderChat();
  }

  // ---------- Openers ----------
  function openCard(id) { window.CardView.open(id); }
  function openIdea(id) {
    const i = S.sel.idea(id);
    U.modal({
      title: i.title, size: "",
      body: `
        <div class="flex gap-8 wrap" style="margin-bottom:14px">${U.statusPill(i.status)} ${i.aiClass ? `<span class="pill pill-accent">🏷️ ${esc(i.aiClass)}</span>` : ""} <span class="muted">${esc(i.source)}</span></div>
        <div class="field"><label>Descrição</label><textarea class="textarea" id="idea-desc">${esc(i.description)}</textarea></div>
        <div class="info-block"><h4>🤖 Classificação da IA</h4><p class="muted">${esc(i.aiNotes || "A IA pode classificar como venda, autoridade, prova social, review, comparação, afiliado e mais.")}</p></div>
        <div class="field mb-0"><label>Tags</label><div class="tag-row">${(i.tags || []).map((t) => `<span class="pill pill-gray">#${esc(t)}</span>`).join("") || '<span class="muted">—</span>'}</div></div>`,
      foot: `
        <button class="btn btn-ghost btn-sm" data-ia="delete">Excluir</button>
        <button class="btn btn-sm" data-ia="card">→ Virar card</button>
        <button class="btn btn-sm" data-ia="lib">→ Biblioteca</button>
        <button class="btn btn-primary btn-sm" data-ia="camp">→ Virar campanha</button>`,
      onMount: (o) => {
        o.querySelector("#idea-desc").onchange = (e) => S.actions.updateIdea(id, { description: e.target.value });
        o.querySelector("[data-ia='delete']").onclick = () => U.confirm("Excluir ideia?", () => { S.actions.deleteIdea(id); U.closeModal(); U.toast("Ideia excluída"); render(); }, { danger: true, yes: "Excluir" });
        o.querySelector("[data-ia='card']").onclick = () => { const cid = S.actions.addCard({ title: i.title, objective: i.description.slice(0, 60), nextAction: "Gerar roteiro" }); S.actions.updateIdea(id, { status: "Virou card" }); U.closeModal(); U.toast("Ideia virou card ✓"); openCard(cid); };
        o.querySelector("[data-ia='lib']").onclick = () => { S.actions.addLibrary({ type: "Aprendizado", title: i.title, content: i.description, tags: i.tags }); U.toast("Salvo na biblioteca ✓"); };
        o.querySelector("[data-ia='camp']").onclick = () => { U.closeModal(); openCampaignForm(null, { title: i.title, objective: i.description.slice(0, 80) }); };
      },
    });
  }

  // ---------- Forms ----------
  function field(label, id, val, ph, type) { return `<div class="field"><label>${esc(label)}</label><input class="input" id="${id}" value="${esc(val || "")}" placeholder="${esc(ph || "")}" ${type ? `type="${type}"` : ""}/></div>`; }
  function textField(label, id, val, ph) { return `<div class="field"><label>${esc(label)}</label><textarea class="textarea" id="${id}" placeholder="${esc(ph || "")}">${esc(val || "")}</textarea></div>`; }
  function selField(label, id, opts, val) { return `<div class="field"><label>${esc(label)}</label><select class="select" id="${id}">${opts.map((o) => `<option ${o === val ? "selected" : ""}>${esc(o)}</option>`).join("")}</select></div>`; }

  function openIdeaForm() {
    U.modal({
      title: "Nova ideia", size: "",
      body: `${field("Título", "if-title", "", "Ex: Cliente reclamou que perde tampa de pote")}
        ${textField("Descrição", "if-desc", "", "Descreva a ideia, comentário, tendência…")}
        ${selField("Origem", "if-source", ["Comentário", "Bastidor", "Tendência", "Pergunta de cliente", "Ideia de oferta", "Ideia de roteiro", "Referência", "Produto", "Chat IA"], "Comentário")}
        ${field("Tags (separadas por vírgula)", "if-tags", "", "dor, cozinha, afiliado")}`,
      foot: `<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" id="if-save">Criar ideia</button>`,
      onMount: (o) => o.querySelector("#if-save").onclick = () => {
        const title = o.querySelector("#if-title").value.trim(); if (!title) return U.toast("Digite um título", "warn");
        S.actions.addIdea({ title, description: o.querySelector("#if-desc").value, source: o.querySelector("#if-source").value, tags: o.querySelector("#if-tags").value.split(",").map((t) => t.trim()).filter(Boolean), aiClass: "venda", aiNotes: "A IA sugere trabalhar o gancho de retenção nos primeiros segundos." });
        U.closeModal(); U.toast("Ideia criada ✓"); render();
      },
    });
  }

  const CAMPAIGN_TYPES = ["Conteúdo orgânico", "Afiliado", "Produto físico", "Infoproduto", "Marketplace", "Live Shop", "Lançamento", "Prova social", "Antes e depois", "Review", "Comparação", "Oferta", "Autoridade", "Comunidade", "Anúncio pago"];
  const ALL_CHANNELS = ["Instagram", "TikTok", "YouTube Shorts", "Facebook", "WhatsApp", "Marketplace", "Live Shop", "Anúncios"];

  function openCampaignForm(id, prefill) {
    const c = id ? S.sel.campaign(id) : Object.assign({ channels: [], type: "Afiliado" }, prefill || {});
    U.modal({
      title: id ? "Editar campanha" : "Nova campanha", size: "wide",
      body: `<div class="grid grid-2" style="align-items:start">
        <div>
          ${field("Nome da campanha", "cf-title", c.title, "Ex: Afiliado — Potes Herméticos")}
          ${selField("Tipo de campanha", "cf-type", CAMPAIGN_TYPES, c.type)}
          ${field("Objetivo principal", "cf-objective", c.objective, "Ex: Gerar vendas pelo link de afiliado")}
          ${field("Produto / oferta", "cf-product", c.productName, "Ex: Kit 10 Potes Herméticos")}
          ${field("Oferta", "cf-offer", c.offer, "Ex: Kit por R$ 89,90 frete grátis")}
          ${field("Público", "cf-audience", c.audience, "Quem vai comprar")}
          ${field("Promessa central", "cf-promise", c.promise, "O que você promete")}
          ${field("Emoção principal", "cf-emotion", c.emotion, "Ex: Alívio, urgência")}
          ${field("CTA principal", "cf-cta", c.cta, "Ex: Compra pelo link da bio")}
        </div>
        <div>
          <div id="cf-aff" style="${c.type === "Afiliado" ? "" : "display:none"}">
            <div class="info-block"><h4>🔗 Dados de afiliado</h4>
              ${field("Link de afiliado", "cf-link", c.affiliateLink, "https://…")}
              <div class="form-row">${field("Comissão", "cf-commission", c.commission, "18%")}${field("Preço", "cf-price", c.price, "R$ 89,90")}</div>
              ${field("Plataforma", "cf-platform", c.platform, "Marketplace X")}
              ${field("Dor principal", "cf-dor", c.dor, "")}
              ${field("Objeções", "cf-objections", c.objections, "É caro? Funciona?")}
              ${field("Provas disponíveis", "cf-proofs", c.proofs, "Antes/depois, uso real")}
              ${field("Bônus", "cf-bonus", c.bonus, "")}
            </div>
          </div>
          <div class="field"><label>Canais</label><div class="chip-select" id="cf-channels">${ALL_CHANNELS.map((ch) => `<div class="chip ${(c.channels || []).includes(ch) ? "on" : ""}" data-ch="${esc(ch)}">${esc(ch)}</div>`).join("")}</div></div>
          <div class="form-row">${field("Início", "cf-start", c.startDate, "", "date")}${field("Fim", "cf-end", c.endDate, "", "date")}</div>
          ${field("Vídeos por dia", "cf-videos", c.videosPerDay || 2, "2", "number")}
        </div>
      </div>`,
      foot: `<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" id="cf-save">${id ? "Salvar" : "Criar campanha"}</button>`,
      onMount: (o) => {
        const chips = []; o.querySelectorAll("#cf-channels .chip").forEach((ch) => ch.onclick = () => ch.classList.toggle("on"));
        o.querySelector("#cf-type").onchange = (e) => { o.querySelector("#cf-aff").style.display = e.target.value === "Afiliado" ? "" : "none"; };
        o.querySelector("#cf-save").onclick = () => {
          const g = (x) => { const el = o.querySelector("#cf-" + x); return el ? el.value : ""; };
          const channels = Array.from(o.querySelectorAll("#cf-channels .chip.on")).map((ch) => ch.dataset.ch);
          const data = { title: g("title") || "Nova campanha", type: g("type"), objective: g("objective"), productName: g("product"), offer: g("offer"), audience: g("audience"), promise: g("promise"), emotion: g("emotion"), cta: g("cta"), affiliateLink: g("link"), commission: g("commission"), price: g("price"), platform: g("platform"), dor: g("dor"), objections: g("objections"), proofs: g("proofs"), bonus: g("bonus"), channels, startDate: g("start"), endDate: g("end"), videosPerDay: Number(g("videos")) || 2 };
          if (id) { S.actions.updateCampaign(id, data); U.closeModal(); U.toast("Campanha atualizada ✓"); render(); }
          else { const nid = S.actions.addCampaign(data); U.closeModal(); U.toast("Campanha criada ✓"); location.hash = "#/campanha/" + nid; }
        };
      },
    });
  }

  const CARD_TYPES = ["Dor e Solução", "Review", "Comparação", "Demonstração", "Antes e depois", "Unboxing", "Prova social", "Resposta a objeção", "Oferta", "UGC", "Stories de venda", "Remarketing", "Conteúdo orgânico"];

  function openCardForm(campaignId) {
    const camps = S.get().campaigns;
    U.modal({
      title: "Novo card", size: "",
      body: `${field("Título", "kf-title", "", "Ex: Vídeo 1 — Dor e Solução")}
        <div class="form-row">
          ${selField("Campanha", "kf-camp", camps.map((c) => c.title), (campaignId && S.sel.campaign(campaignId)) ? S.sel.campaign(campaignId).title : (camps[0] && camps[0].title))}
          ${selField("Tipo", "kf-type", CARD_TYPES, "Dor e Solução")}
        </div>
        <div class="form-row">
          ${selField("Canal", "kf-channel", ALL_CHANNELS, "Instagram")}
          ${selField("Prioridade", "kf-prio", ["Alta", "Média", "Baixa"], "Média")}
        </div>
        ${field("Objetivo", "kf-obj", "", "Ex: Gerar clique no link de afiliado")}`,
      foot: `<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" id="kf-save">Criar card</button>`,
      onMount: (o) => o.querySelector("#kf-save").onclick = () => {
        const title = o.querySelector("#kf-title").value.trim(); if (!title) return U.toast("Digite um título", "warn");
        const campTitle = o.querySelector("#kf-camp").value; const camp = camps.find((c) => c.title === campTitle);
        const nid = S.actions.addCard({ title, campaignId: camp ? camp.id : (camps[0] && camps[0].id), type: o.querySelector("#kf-type").value, channel: o.querySelector("#kf-channel").value, priority: o.querySelector("#kf-prio").value, objective: o.querySelector("#kf-obj").value, status: "Ideia", nextAction: "Gerar roteiro" });
        U.closeModal(); U.toast("Card criado ✓"); openCard(nid);
      },
    });
  }

  function openPersonaForm() {
    const p = S.get().persona;
    const TONES = ["direto", "popular", "técnico", "emocional", "premium", "simples", "provocativo", "educativo", "vendedor", "humorado", "autoridade", "próximo"];
    const TYPES = ["criador", "afiliado", "seller", "loja", "e-commerce", "infoprodutor", "social media", "agência", "empresa", "especialista", "live shop"];
    U.modal({
      title: "Editar persona", size: "wide",
      body: `<div class="grid grid-2" style="align-items:start"><div>
        ${field("Nome da marca", "pf-brand", p.brandName)}
        ${selField("Tipo de usuário", "pf-type", TYPES, p.userType)}
        ${field("Nicho", "pf-niche", p.niche)}
        ${textField("Público", "pf-audience", p.audience)}
        ${textField("Linguagem", "pf-language", p.language)}
        ${field("Objetivo principal", "pf-objective", p.objective)}
        <div class="field mb-0"><label>Tom de voz</label><div class="chip-select" id="pf-tones">${TONES.map((t) => `<div class="chip ${(p.tone || []).includes(t) ? "on" : ""}" data-tone="${esc(t)}">${esc(t)}</div>`).join("")}</div></div>
      </div><div>
        ${field("Promessa central", "pf-promise", p.promise)}
        ${textField("Produtos principais", "pf-products", p.products)}
        ${textField("Estilo visual", "pf-visual", p.visualStyle)}
        ${field("Posicionamento", "pf-positioning", p.positioning)}
        ${textField("Limites", "pf-limits", p.limits)}
        ${field("Temas proibidos", "pf-forbidden", p.forbidden)}
      </div></div>`,
      foot: `<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" id="pf-save">Salvar persona</button>`,
      onMount: (o) => { o.querySelectorAll("#pf-tones .chip").forEach((ch) => ch.onclick = () => ch.classList.toggle("on"));
        o.querySelector("#pf-save").onclick = () => {
          const g = (x) => o.querySelector("#pf-" + x).value;
          S.actions.updatePersona({ brandName: g("brand"), userType: g("type"), niche: g("niche"), audience: g("audience"), language: g("language"), objective: g("objective"), promise: g("promise"), products: g("products"), visualStyle: g("visual"), positioning: g("positioning"), limits: g("limits"), forbidden: g("forbidden"), tone: Array.from(o.querySelectorAll("#pf-tones .chip.on")).map((c) => c.dataset.tone) });
          U.closeModal(); U.toast("Persona atualizada ✓"); render();
        }; },
    });
  }

  function openLibForm() {
    const TYPES = ["Gancho vencedor", "Roteiro vencedor", "Criativo vencedor", "Legenda", "CTA", "Promessa", "Objeção", "Prova", "Template", "Aprendizado"];
    U.modal({
      title: "Adicionar à biblioteca", size: "",
      body: `${selField("Tipo", "lf-type", TYPES, "Gancho vencedor")}${field("Título", "lf-title", "")}${textField("Conteúdo", "lf-content", "")}${field("Tags", "lf-tags", "", "dor, retenção")}`,
      foot: `<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" id="lf-save">Salvar</button>`,
      onMount: (o) => o.querySelector("#lf-save").onclick = () => {
        const title = o.querySelector("#lf-title").value.trim(); if (!title) return U.toast("Digite um título", "warn");
        S.actions.addLibrary({ type: o.querySelector("#lf-type").value, title, content: o.querySelector("#lf-content").value, tags: o.querySelector("#lf-tags").value.split(",").map((t) => t.trim()).filter(Boolean) });
        U.closeModal(); U.toast("Salvo na biblioteca ✓"); render();
      },
    });
  }

  function openCreateMenu() {
    U.modal({
      title: "Criar", size: "narrow",
      body: `<div class="quick-actions" style="grid-template-columns:1fr 1fr">
        <div class="qa" data-c="idea"><div class="qa-ico">💡</div><div class="qa-label">Nova ideia</div></div>
        <div class="qa" data-c="campaign"><div class="qa-ico">🎯</div><div class="qa-label">Nova campanha</div></div>
        <div class="qa" data-c="card"><div class="qa-ico">🃏</div><div class="qa-label">Novo card</div></div>
        <div class="qa" data-c="lib"><div class="qa-ico">📚</div><div class="qa-label">Item na biblioteca</div></div>
      </div>`,
      onMount: (o) => {
        o.querySelector("[data-c='idea']").onclick = () => { U.closeModal(); openIdeaForm(); };
        o.querySelector("[data-c='campaign']").onclick = () => { U.closeModal(); openCampaignForm(); };
        o.querySelector("[data-c='card']").onclick = () => { U.closeModal(); openCardForm(); };
        o.querySelector("[data-c='lib']").onclick = () => { U.closeModal(); openLibForm(); };
      },
    });
  }

  // ---------- Quick actions (from Hoje) ----------
  function quickAction(a) {
    switch (a) {
      case "new-idea": openIdeaForm(); break;
      case "new-campaign": openCampaignForm(); break;
      case "new-card": openCardForm(); break;
      case "add-priority": U.modal({ title: "Nova prioridade", size: "narrow", body: field("O que fazer hoje?", "pr-text", "") + field("Detalhe", "pr-meta", ""), foot: `<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" id="pr-save">Adicionar</button>`, onMount: (o) => o.querySelector("#pr-save").onclick = () => { const t = o.querySelector("#pr-text").value.trim(); if (!t) return; S.actions.addPriority(t, o.querySelector("#pr-meta").value); U.closeModal(); U.toast("Prioridade adicionada ✓"); } }); break;
      case "send-video": case "record": case "gen-ai": case "analyze": case "script": {
        // open first active card on the relevant tab
        const card = S.get().cards.find((c) => !["Concluído", "Publicado"].includes(c.status)) || S.get().cards[0];
        if (!card) return openCardForm();
        openCard(card.id);
        U.toast("Escolha o caminho dentro da aba Conteúdo do card");
        break;
      }
      case "corrections": {
        const card = S.get().cards.find((c) => c.corrections && c.corrections.length) || S.get().cards.find((c) => c.status === "Precisa corrigir");
        if (card) openCard(card.id); else U.toast("Nenhuma correção no momento");
        break;
      }
      default: openCreateMenu();
    }
  }

  function generateCards(campaignId) {
    const camp = S.sel.campaign(campaignId);
    U.confirm(`A IA vai gerar cards de conteúdo para "${camp.title}" (dor e solução, review, comparação, demonstração, prova social). Continuar?`, () => {
      const types = camp.type === "Afiliado"
        ? ["Dor e Solução", "Review", "Comparação", "Demonstração", "Prova social"]
        : ["Dor e Solução", "Demonstração", "Oferta"];
      types.forEach((t, i) => S.actions.addCard({ title: `${t} — ${camp.productName || camp.title}`, campaignId, type: t, channel: (camp.channels && camp.channels[i % camp.channels.length]) || "Instagram", status: "Ideia", priority: i === 0 ? "Alta" : "Média", objective: camp.objective, nextAction: "Gerar roteiro", strategy: { promise: camp.promise, cta: camp.cta, offer: camp.offer, audience: camp.audience, pain: camp.dor, emotion: camp.emotion } }));
      U.toast(`${types.length} cards gerados pela IA ✓`); render();
    }, { yes: "Gerar cards" });
  }

  function buyCredits() {
    U.modal({
      title: "Comprar créditos", size: "narrow",
      body: `<p class="muted" style="margin-bottom:14px">Escolha um pacote de créditos para gerar vídeos com IA.</p>
        <div class="grid" style="gap:10px">
          ${[[100, "R$ 29"], [300, "R$ 79"], [600, "R$ 139"]].map(([q, p]) => `<div class="qa" data-buy="${q}" style="flex-direction:row;align-items:center;justify-content:space-between"><div><b style="color:var(--text-0)">${q} créditos</b><div class="muted" style="font-size:12px">${p}</div></div><span class="pill pill-accent">Comprar</span></div>`).join("")}
        </div>`,
      onMount: (o) => o.querySelectorAll("[data-buy]").forEach((el) => el.onclick = () => { S.actions.addCredits(Number(el.dataset.buy)); U.closeModal(); U.toast(el.dataset.buy + " créditos adicionados ✓"); render(); }),
    });
  }

  function globalSearch(q) {
    const st = S.get(); const ql = q.toLowerCase();
    const res = [
      ...st.cards.filter((c) => c.title.toLowerCase().includes(ql)).map((c) => ({ t: "Card", title: c.title, act: () => openCard(c.id) })),
      ...st.campaigns.filter((c) => c.title.toLowerCase().includes(ql)).map((c) => ({ t: "Campanha", title: c.title, act: () => location.hash = "#/campanha/" + c.id })),
      ...st.ideas.filter((i) => i.title.toLowerCase().includes(ql)).map((i) => ({ t: "Ideia", title: i.title, act: () => openIdea(i.id) })),
      ...st.library.filter((l) => l.title.toLowerCase().includes(ql)).map((l) => ({ t: "Biblioteca", title: l.title, act: () => location.hash = "#/biblioteca" })),
    ];
    U.modal({
      title: `Resultados para "${q}"`, size: "",
      body: res.length ? res.map((r, i) => `<div class="status-row" data-res="${i}" style="cursor:pointer"><span class="pill pill-gray">${r.t}</span><div style="flex:1">${esc(r.title)}</div><span class="text-accent">→</span></div>`).join("") : V.emptyState("🔍", "Nada encontrado", "Tente outro termo."),
      onMount: (o) => o.querySelectorAll("[data-res]").forEach((el) => el.onclick = () => { U.closeModal(); res[Number(el.dataset.res)].act(); }),
    });
  }

  // ---------- Init ----------
  function init() {
    S.load();
    S.subscribe(render);
    window.addEventListener("hashchange", render);
    if (!location.hash) location.hash = "#/hoje";
    render();
    U.renderChat();
  }

  return { init, render, renderNav, openCard, openIdea, openCampaignForm, openCardForm, openIdeaForm, openPersonaForm, openLibForm, quickAction, generateCards, buyCredits, openCreateMenu };
})();

document.addEventListener("DOMContentLoaded", window.App.init);
