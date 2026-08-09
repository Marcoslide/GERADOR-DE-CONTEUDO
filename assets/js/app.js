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
        <div class="brand-logo">V</div>
        <div><div class="brand-name">VIRALIZA</div><div class="brand-sub">Execução de conteúdo</div></div>
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
    const [t, sub] = titles[view] || ["VIRALIZA", ""];
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
    // Nova campanha = fluxo conversacional com IA. Editar = form avançado.
    if (!id) { window.CampaignWizard.open(prefill); return; }
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
      case "record": {
        const card = S.get().cards.find((c) => !["Concluído", "Publicado"].includes(c.status)) || S.get().cards[0];
        if (!card) return openCardForm();
        window.Recorder.open(card.id);
        break;
      }
      case "send-video": case "gen-ai": case "analyze": case "script": {
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
    const plan = window.AI.generateCampaignPlan({ text: camp.productName || camp.title, goal: camp.type === "Afiliado" ? "Campanha de afiliado" : "Vender produto", channels: camp.channels, style: camp.style || "Direto e vendedor", audience: camp.audience, quantity: "5 vídeos" });
    U.confirm(`A IA vai gerar ${plan.cardPlan.length} cards prontos (com roteiro, gancho, cena de retenção, visual, checklist e CTA) para "${camp.title}". Continuar?`, () => {
      const ids = window.AI.generateCardsForCampaign(camp, plan.cardPlan);
      U.toast(`${ids.length} cards gerados pela IA ✓`); render();
    }, { yes: "Gerar cards" });
  }

  // ---------- Biblioteca: menu e reutilizar ----------
  function libMenu(id) {
    const l = S.get().library.find((x) => x.id === id);
    const items = [["reuse", "♻️ Reutilizar"], ["edit", "✏️ Editar"], ["variation", "🧬 Criar variação"], ["copy", "📋 Copiar"], ["delete", "🗑️ Apagar"]];
    U.modal({
      title: l.title, size: "narrow",
      body: `<div class="set-nav">${items.map(([a, t]) => `<div class="set-nav-item" data-lm="${a}" ${a === "delete" ? 'style="color:var(--red)"' : ""}>${t}</div>`).join("")}</div>`,
      onMount: (o) => o.querySelectorAll("[data-lm]").forEach((el) => el.onclick = () => {
        const a = el.dataset.lm; U.closeModal();
        if (a === "reuse") reuseLibrary(id);
        else if (a === "edit") editLibrary(id);
        else if (a === "variation") { S.actions.addLibrary({ type: l.type, title: l.title + " (variação)", content: l.content, tags: l.tags }); U.toast("Variação salva na biblioteca ✓"); render(); }
        else if (a === "copy") { try { navigator.clipboard.writeText(l.title + "\n" + l.content); } catch (e) {} U.toast("Copiado ✓"); }
        else if (a === "delete") U.confirm("Apagar este item da biblioteca?", () => { S.actions.deleteLibrary(id); U.toast("Item apagado"); render(); }, { danger: true, yes: "Apagar" });
      }),
    });
  }

  function editLibrary(id) {
    const l = S.get().library.find((x) => x.id === id);
    U.modal({
      title: "Editar item", size: "",
      body: `${field("Título", "el-title", l.title)}${textField("Conteúdo", "el-content", l.content)}${field("Tags", "el-tags", (l.tags || []).join(", "))}`,
      foot: `<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" id="el-save">Salvar</button>`,
      onMount: (o) => o.querySelector("#el-save").onclick = () => { S.actions.updateLibrary(id, { title: o.querySelector("#el-title").value, content: o.querySelector("#el-content").value, tags: o.querySelector("#el-tags").value.split(",").map((t) => t.trim()).filter(Boolean) }); U.closeModal(); U.toast("Item atualizado ✓"); render(); },
    });
  }

  function reuseLibrary(id) {
    const l = S.get().library.find((x) => x.id === id);
    const opts = [["new-card", "🃏 Criar novo card"], ["new-campaign", "🎯 Criar nova campanha"], ["variation", "🧬 Salvar como variação"], ["copy", "📋 Copiar conteúdo"]];
    U.modal({
      title: "Reutilizar: " + l.title, size: "narrow",
      body: `<p class="muted" style="margin-bottom:12px">Como você quer usar este item?</p><div class="set-nav">${opts.map(([a, t]) => `<div class="set-nav-item" data-ru="${a}">${t}</div>`).join("")}</div>`,
      onMount: (o) => o.querySelectorAll("[data-ru]").forEach((el) => el.onclick = () => {
        const a = el.dataset.ru; U.closeModal();
        if (a === "new-card") { const nid = S.actions.addCard({ title: l.title, type: "Conteúdo orgânico", status: "Ideia", nextAction: "Gerar roteiro", script: { hook: l.type.includes("Gancho") ? l.title : "", caption: l.type.includes("Legenda") ? l.content : "", cta: l.type === "CTA" ? l.content : "" } }); U.toast("Card criado a partir da biblioteca ✓"); openCard(nid); }
        else if (a === "new-campaign") window.CampaignWizard.open({ text: l.title + " — " + l.content });
        else if (a === "variation") { S.actions.addLibrary({ type: l.type, title: l.title + " (variação)", content: l.content, tags: l.tags }); U.toast("Variação salva ✓"); render(); }
        else if (a === "copy") { try { navigator.clipboard.writeText(l.title + "\n" + l.content); } catch (e) {} U.toast("Copiado ✓"); }
      }),
    });
  }

  // ---------- Export / Import ----------
  function exportData() {
    try {
      const data = JSON.stringify(S.get(), null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "viraliza-backup.json"; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      U.toast("Backup exportado ✓");
    } catch (e) { U.toast("Falha ao exportar", "warn"); }
  }
  function importData() {
    const inp = document.createElement("input"); inp.type = "file"; inp.accept = "application/json,.json";
    inp.onchange = () => {
      const f = inp.files && inp.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = () => { try { const obj = JSON.parse(r.result); if (!obj.cards || !obj.campaigns) throw new Error("inválido"); S.importState(obj); U.toast("Dados importados ✓"); location.hash = "#/hoje"; render(); } catch (e) { U.toast("Arquivo inválido", "warn"); } };
      r.readAsText(f);
    };
    inp.click();
  }

  // ---------- Máquina de Variações ----------
  function variationMenu(campaignId) {
    const camp = S.sel.campaign(campaignId);
    const STYLES = ["Antes e depois", "Review", "Demonstração", "Prova social", "Resposta a objeção", "Oferta", "Bastidor", "Comparação", "UGC"];
    let sel = [];
    U.modal({
      title: "🧪 Máquina de Variações", size: "",
      body: `<p class="muted" style="margin-bottom:12px">Teste vários ângulos do mesmo produto para achar o vídeo vencedor. Cada variação vira um card real com cenário, formato, gancho e visual diferentes.</p>
        <div class="field"><label>Quantidade</label><div class="chip-select" id="vm-qty">${["3", "5", "10", "15", "30"].map((q, i) => `<div class="chip ${q === "5" ? "on" : ""}" data-q="${q}">${q === "30" ? "30 dias" : q}</div>`).join("")}</div></div>
        <div class="field mb-0"><label>Estilos para testar (opcional)</label><div class="chip-select" id="vm-styles">${STYLES.map((s) => `<div class="chip" data-vs="${esc(s)}">${esc(s)}</div>`).join("")}</div></div>`,
      foot: `<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn" id="vm-explode">🏆 Explodir vencedor</button><button class="btn btn-primary" id="vm-go">Gerar variações</button>`,
      onMount: (o) => {
        let qty = 5;
        o.querySelectorAll("#vm-qty .chip").forEach((c) => c.onclick = () => { o.querySelectorAll("#vm-qty .chip").forEach((x) => x.classList.remove("on")); c.classList.add("on"); qty = c.dataset.q === "30" ? 30 : +c.dataset.q; });
        o.querySelectorAll("#vm-styles .chip").forEach((c) => c.onclick = () => { c.classList.toggle("on"); const v = c.dataset.vs; const i = sel.indexOf(v); i >= 0 ? sel.splice(i, 1) : sel.push(v); });
        o.querySelector("#vm-go").onclick = () => { const ids = window.VariationMachine.generate(camp, qty, { channels: camp.channels, styles: sel }); U.closeModal(); U.toast(`${ids.length} variações criadas + plano de teste ✓`); render(); };
        o.querySelector("#vm-explode").onclick = () => { const win = window.VariationMachine.markWinner(campaignId); if (!win) return U.toast("Sem métricas para eleger vencedor — insira/colete métricas primeiro", "warn"); const ids = window.VariationMachine.explodeWinner(win.id); U.closeModal(); U.toast(`Vencedor: ${win.title}. ${ids.length} novas variações ✓`); render(); };
      },
    });
  }

  // ---------- Board: menu de card e coluna ----------
  function cardMenu(id) {
    const c = S.sel.card(id);
    const items = [
      ["open", "📂 Abrir"], ["approve", "✓ Aprovar"], ["schedule", "📅 Agendar"], ["now", "🚀 Publicar agora"],
      ["duplicate", "📄 Duplicar"], ["variation", "🧬 Criar variação"], ["correction", "🛠️ Criar correção"], ["delete", "🗑️ Apagar"],
    ];
    U.modal({
      title: c.title, size: "narrow",
      body: `<div class="set-nav">${items.map(([a, l]) => `<div class="set-nav-item" data-cm="${a}" ${a === "delete" ? 'style="color:var(--red)"' : ""}>${l}</div>`).join("")}</div>`,
      onMount: (o) => o.querySelectorAll("[data-cm]").forEach((el) => el.onclick = () => {
        const a = el.dataset.cm, PE = window.PublishEngine; U.closeModal();
        if (a === "open") openCard(id);
        else if (a === "approve") { PE.approve(id); render(); }
        else if (a === "schedule") { if (!(c.publication && c.publication.date)) { openCard(id); U.toast("Defina data/hora na aba Publicação"); } else { PE.schedule(id); render(); } }
        else if (a === "now") { PE.publishNow(id); }
        else if (a === "duplicate") { S.actions.duplicateCard(id); U.toast("Card duplicado ✓"); render(); }
        else if (a === "variation") { const nid = S.actions.duplicateCard(id); S.actions.updateCard(nid, { title: c.title + " — Variação", status: "Ideia", nextAction: "Testar variação" }); U.toast("Variação criada ✓"); render(); }
        else if (a === "correction") { const nid = S.actions.addCard({ title: "Correção — " + c.title, type: c.type, campaignId: c.campaignId, channel: c.channel, status: "Precisa corrigir", priority: "Alta", originCardId: id, correctionReason: "Ajuste geral", nextAction: "Regravar aplicando correção", strategy: Object.assign({}, c.strategy), script: Object.assign({}, c.script) }); U.toast("Card de correção criado ✓"); openCard(nid); }
        else if (a === "delete") U.confirm("Apagar o card \"" + c.title + "\"?", () => { S.actions.deleteCard(id); U.toast("Card apagado"); render(); }, { danger: true, yes: "Apagar" });
      }),
    });
  }

  function columnMenu(name) {
    const st = S.get().statuses.find((x) => x.name === name) || { name, color: "#8fa39c" };
    U.modal({
      title: "Coluna: " + name, size: "narrow",
      body: `<div class="field"><label>Nome</label><input class="input" id="col-name" value="${esc(st.name)}"/></div>
        <div class="field"><label>Cor</label><input type="color" id="col-color" value="${st.color}" style="width:60px;height:40px;border:1px solid var(--border-2);border-radius:8px;background:var(--bg-2)"/></div>`,
      foot: `<button class="btn btn-danger btn-sm" id="col-del">Apagar coluna</button><span style="flex:1"></span><button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" id="col-save">Salvar</button>`,
      onMount: (o) => {
        o.querySelector("#col-save").onclick = () => { S.actions.renameStatus(name, o.querySelector("#col-name").value.trim(), o.querySelector("#col-color").value); U.closeModal(); U.toast("Coluna atualizada ✓"); render(); };
        o.querySelector("#col-del").onclick = () => U.confirm("Apagar a coluna \"" + name + "\"? Os cards vão para outra coluna.", () => { S.actions.deleteStatus(name); U.closeModal(); U.toast("Coluna apagada"); render(); }, { danger: true, yes: "Apagar" });
      },
    });
  }

  function addColumn() {
    U.modal({
      title: "Nova coluna", size: "narrow",
      body: `<div class="field"><label>Nome</label><input class="input" id="nc-name" placeholder="Ex: Revisão final"/></div>
        <div class="field"><label>Cor</label><input type="color" id="nc-color" value="#10b981" style="width:60px;height:40px;border:1px solid var(--border-2);border-radius:8px;background:var(--bg-2)"/></div>`,
      foot: `<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" id="nc-ok">Adicionar</button>`,
      onMount: (o) => o.querySelector("#nc-ok").onclick = () => { const n = o.querySelector("#nc-name").value.trim(); if (!n) return U.toast("Digite um nome", "warn"); S.actions.addStatus(n, o.querySelector("#nc-color").value); U.closeModal(); U.toast("Coluna adicionada ✓"); render(); },
    });
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

  return { init, render, renderNav, openCard, openIdea, openCampaignForm, openCardForm, openIdeaForm, openPersonaForm, openLibForm, quickAction, generateCards, buyCredits, openCreateMenu, cardMenu, columnMenu, addColumn, libMenu, reuseLibrary, variationMenu, exportData, importData };
})();

// Robusto: inicia mesmo se o DOM já estiver pronto (ex.: artifact/inline)
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", window.App.init);
else window.App.init();
