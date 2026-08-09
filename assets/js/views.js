/* ============================================================
   R.E.A.L. OS — Views (renderização das telas)
   ============================================================ */
window.Views = (function () {
  const S = window.Store;
  const U = window.UI;
  const esc = U.esc, fmt = U.fmt, pill = U.statusPill;

  // ============================================================
  // HOJE
  // ============================================================
  function hoje() {
    const st = S.get();
    const doneP = st.today.priorities.filter((p) => p.done).length;
    const cardsToday = st.cards.filter((c) => c.date === st.today.priorities && false).length; // placeholder
    const activeCards = st.cards.filter((c) => !["Concluído"].includes(c.status));

    const quickActions = [
      { ico: "💡", label: "Nova ideia", act: "new-idea" }, { ico: "🎯", label: "Nova campanha", act: "new-campaign" },
      { ico: "🃏", label: "Novo card", act: "new-card" }, { ico: "📤", label: "Enviar vídeo", act: "send-video" },
      { ico: "🎥", label: "Gravar agora", act: "record" }, { ico: "✨", label: "Gerar criativo IA", act: "gen-ai" },
      { ico: "🔍", label: "Analisar conteúdo", act: "analyze" }, { ico: "📝", label: "Criar roteiro", act: "script" },
      { ico: "🛠️", label: "Ver correções", act: "corrections" },
    ];

    const prioHTML = st.today.priorities.map((p) => `
      <div class="priority-item" data-prio="${p.id}">
        <div class="checkbox ${p.done ? "done" : ""}">${p.done ? "✓" : ""}</div>
        <div class="pi-text ${p.done ? "done" : ""}">${esc(p.text)}<div class="pi-meta">${esc(p.meta)}</div></div>
      </div>`).join("");

    const cardsHTML = activeCards.slice(0, 6).map((c) => {
      const camp = S.sel.campaign(c.campaignId);
      return `<div class="mini-card" data-open-card="${c.id}" style="cursor:pointer">
        <div class="mc-title">${esc(c.title)}</div>
        <div class="mc-meta">${pill(c.status)} <span class="pill pill-gray">${esc(c.channel)}</span> <span class="pill ${U.prioClass(c.priority)}" style="border-color:transparent;background:transparent">● ${esc(c.priority)}</span></div>
        <div class="mc-foot"><span class="avatar">${U.initials(c.responsible)}</span> ${esc(c.responsible)} · ${esc(c.time || "—")} · <span class="text-accent">${esc(c.nextAction)}</span></div>
        <div class="mc-progress"><span style="width:${c.progress}%"></span></div>
      </div>`;
    }).join("");

    const alertsHTML = st.today.alerts.map((a) => `
      <div class="alert ${a.kind}"><span class="al-ico">${a.kind === "good" ? "✅" : a.kind === "warn" ? "⚠️" : "ℹ️"}</span><div class="al-body">${a.text}</div></div>`).join("");

    return `
      <div class="hero-today">
        <div class="ht-tag">VIRALIZA · Central de execução</div>
        <h1>Hoje faça isso.</h1>
        <p>Sua máquina de execução de conteúdo e performance. Transforme ideia ou produto em conteúdo pronto para criar, publicar, analisar e melhorar.</p>
        <div class="motto">
          <span class="pill pill-accent">Crie</span><span class="pill pill-blue">Teste</span>
          <span class="pill pill-purple">Analise</span><span class="pill pill-amber">Corrija</span><span class="pill pill-pink">Venda</span>
        </div>
      </div>

      <div class="grid grid-4" style="margin-bottom:20px">
        <div class="stat"><div class="s-label">🎯 Campanhas ativas</div><div class="s-val">${st.campaigns.filter((c) => c.status === "Ativa").length}</div><div class="s-delta up">de ${st.campaigns.length} campanhas</div></div>
        <div class="stat"><div class="s-label">🃏 Cards em execução</div><div class="s-val">${activeCards.length}</div><div class="s-delta up">${st.cards.filter((c) => c.status === "Precisa corrigir").length} precisam corrigir</div></div>
        <div class="stat"><div class="s-label">✅ Prioridades hoje</div><div class="s-val">${doneP}/${st.today.priorities.length}</div><div class="s-delta">concluídas</div></div>
        <div class="stat"><div class="s-label">✨ Créditos IA</div><div class="s-val">${st.credits.available}</div><div class="s-delta">de ${st.credits.total} disponíveis</div></div>
      </div>

      <div class="grid" style="grid-template-columns: 1.4fr 1fr; align-items:start">
        <div>
          <div class="panel panel-pad" style="margin-bottom:16px">
            <div class="section-title"><span class="st-ico">🔥</span><h2>Prioridades de hoje</h2><span class="st-count">${doneP}/${st.today.priorities.length}</span>
              <div class="st-actions"><button class="btn btn-sm" data-act="add-priority">+ Prioridade</button></div></div>
            <div class="priority-list">${prioHTML}</div>
          </div>
          <div class="panel panel-pad">
            <div class="section-title"><span class="st-ico">🃏</span><h2>Cards do dia</h2>
              <div class="st-actions"><button class="btn btn-sm" data-nav="board">Ver board →</button></div></div>
            <div class="grid" style="grid-template-columns:1fr 1fr">${cardsHTML}</div>
          </div>
        </div>
        <div>
          <div class="panel panel-pad" style="margin-bottom:16px">
            <div class="section-title"><span class="st-ico">⚡</span><h2>Ações rápidas</h2></div>
            <div class="quick-actions">${quickActions.map((q) => `<div class="qa" data-act="${q.act}"><div class="qa-ico">${q.ico}</div><div class="qa-label">${q.label}</div></div>`).join("")}</div>
          </div>
          <div class="panel panel-pad">
            <div class="section-title"><span class="st-ico">🔔</span><h2>Alertas importantes</h2></div>
            ${alertsHTML}
          </div>
        </div>
      </div>`;
  }

  function bindHoje(root) {
    root.querySelectorAll("[data-prio]").forEach((el) => el.onclick = () => { S.actions.togglePriority(el.dataset.prio); });
    root.querySelectorAll("[data-open-card]").forEach((el) => el.onclick = () => window.App.openCard(el.dataset.openCard));
    root.querySelectorAll("[data-nav]").forEach((el) => el.onclick = () => location.hash = "#/" + el.dataset.nav);
    root.querySelectorAll("[data-act]").forEach((el) => el.onclick = () => window.App.quickAction(el.dataset.act));
  }

  // ============================================================
  // IDEIAS
  // ============================================================
  function ideias() {
    const st = S.get();
    const byStatus = {};
    st.ideas.forEach((i) => { (byStatus[i.status] = byStatus[i.status] || []).push(i); });
    const cards = st.ideas.map((i) => {
      const cls = { "venda": "pill-accent", "antes e depois": "pill-purple", "comparação": "pill-blue", "oferta": "pill-amber", "quebra de objeção": "pill-pink" }[i.aiClass] || "pill-gray";
      return `<div class="item-card" data-idea="${i.id}">
        <div class="ic-top"><div class="ic-thumb">💡</div><div style="flex:1"><div class="ic-title">${esc(i.title)}</div><div class="muted" style="font-size:11px;margin-top:3px">${esc(i.source)} · ${esc(i.createdAt)}</div></div></div>
        <div class="ic-desc">${esc(i.description)}</div>
        <div class="ic-foot">${pill(i.status)} ${i.aiClass ? `<span class="pill ${cls}">🏷️ ${esc(i.aiClass)}</span>` : ""} ${(i.tags || []).slice(0, 2).map((t) => `<span class="pill pill-gray">#${esc(t)}</span>`).join("")}</div>
      </div>`;
    }).join("");
    return `
      <div class="section-title"><span class="st-ico">💡</span><h2>Ideias</h2><span class="st-count">${st.ideas.length} capturadas</span>
        <div class="st-actions"><button class="btn btn-primary btn-sm" data-act="new-idea">+ Nova ideia</button></div></div>
      <p class="muted" style="margin-bottom:18px">Capture pensamentos soltos: texto, comentário de cliente, tendência, print, produto. A IA classifica e você transforma em campanha ou card.</p>
      ${st.ideas.length ? `<div class="grid grid-auto">${cards}</div>` : emptyState("💡", "Nenhuma ideia ainda", "Capture sua primeira ideia.")}`;
  }
  function bindIdeias(root) {
    root.querySelectorAll("[data-idea]").forEach((el) => el.onclick = () => window.App.openIdea(el.dataset.idea));
    root.querySelectorAll("[data-act='new-idea']").forEach((el) => el.onclick = () => window.App.openIdeaForm());
  }

  // ============================================================
  // CAMPANHAS
  // ============================================================
  function campanhas() {
    const st = S.get();
    const cards = st.campaigns.map((c) => {
      const cardsN = S.sel.cardsByCampaign(c.id).length;
      const isAff = c.type === "Afiliado";
      return `<div class="item-card" data-camp="${c.id}">
        <div class="ic-top"><div class="ic-thumb">${isAff ? "🔗" : c.type === "Live Shop" ? "📡" : "🎯"}</div>
          <div style="flex:1"><div class="ic-title">${esc(c.title)}</div><div class="muted" style="font-size:11px;margin-top:3px">${esc(c.type)} · ${esc(c.productName || "")}</div></div>${pill(c.status)}</div>
        <div class="ic-desc">${esc(c.objective)}</div>
        <div class="flex gap-8 wrap" style="font-size:12px;color:var(--text-2)">
          <span>📊 ${fmt(c.metrics.views)} views</span><span>💰 ${esc(c.metrics.revenue)}</span><span>🛒 ${c.metrics.sales} vendas</span><span>🃏 ${cardsN} cards</span>
        </div>
        <div class="ic-foot">${(c.channels || []).map((ch) => `<span class="pill pill-gray">${esc(ch)}</span>`).join("")}</div>
      </div>`;
    }).join("");
    return `
      <div class="section-title"><span class="st-ico">🎯</span><h2>Campanhas</h2><span class="st-count">${st.campaigns.length} campanhas</span>
        <div class="st-actions"><button class="btn btn-primary btn-sm" data-act="new-campaign">+ Nova campanha</button></div></div>
      <p class="muted" style="margin-bottom:18px">A campanha é a unidade principal. Cada campanha gera cards de conteúdo. Tipos: Afiliado, Produto físico, Marketplace, Live Shop, Lançamento e mais.</p>
      <div class="grid grid-auto">${cards}</div>`;
  }
  function bindCampanhas(root) {
    root.querySelectorAll("[data-camp]").forEach((el) => el.onclick = () => location.hash = "#/campanha/" + el.dataset.camp);
    root.querySelectorAll("[data-act='new-campaign']").forEach((el) => el.onclick = () => window.App.openCampaignForm());
  }

  // Campaign detail
  function campanha(id) {
    const c = S.sel.campaign(id);
    if (!c) return emptyState("🎯", "Campanha não encontrada", "");
    const cards = S.sel.cardsByCampaign(id);
    const isAff = c.type === "Afiliado";
    const affBlock = isAff ? `
      <div class="info-block"><h4>🔗 Dados de afiliado</h4>
        <div class="kv">
          <div class="k">Link</div><div class="v"><a href="#" class="text-accent" onclick="return false">${esc(c.affiliateLink || "—")}</a></div>
          <div class="k">Comissão</div><div class="v">${esc(c.commission || "—")}</div>
          <div class="k">Preço</div><div class="v">${esc(c.price || "—")}</div>
          <div class="k">Plataforma</div><div class="v">${esc(c.platform || "—")}</div>
          <div class="k">Bônus</div><div class="v">${esc(c.bonus || "—")}</div>
        </div></div>` : "";
    const cardsHTML = cards.map((cd) => `
      <div class="mini-card" data-open-card="${cd.id}" style="cursor:pointer">
        <div class="mc-title">${esc(cd.title)}</div>
        <div class="mc-meta">${pill(cd.status)} <span class="pill pill-gray">${esc(cd.type)}</span></div>
        <div class="mc-foot"><span class="avatar">${U.initials(cd.responsible)}</span> ${esc(cd.channel)} · <span class="text-accent">${esc(cd.nextAction)}</span></div>
        <div class="mc-progress"><span style="width:${cd.progress}%"></span></div>
      </div>`).join("");

    return `
      <button class="btn btn-ghost btn-sm" data-nav="campanhas" style="margin-bottom:14px">← Campanhas</button>
      <div class="flex-between wrap" style="margin-bottom:18px;gap:12px">
        <div><h1 style="font-size:24px;color:var(--text-0);font-weight:800">${esc(c.title)}</h1>
          <div class="flex gap-8 center wrap" style="margin-top:8px">${pill(c.status)}<span class="pill pill-gray">${esc(c.type)}</span><span class="muted">${esc(c.startDate)} → ${esc(c.endDate)}</span></div></div>
        <div class="flex gap-8"><button class="btn" data-act="edit-campaign" data-id="${id}">Editar</button><button class="btn btn-primary" data-act="ai-cards" data-id="${id}">✨ Gerar cards com IA</button></div>
      </div>

      <div class="grid grid-4" style="margin-bottom:18px">
        <div class="stat"><div class="s-label">📊 Views</div><div class="s-val">${fmt(c.metrics.views)}</div></div>
        <div class="stat"><div class="s-label">🛒 Vendas</div><div class="s-val">${c.metrics.sales}</div></div>
        <div class="stat"><div class="s-label">💰 Faturamento</div><div class="s-val">${esc(c.metrics.revenue)}</div></div>
        <div class="stat"><div class="s-label">📈 Conversão</div><div class="s-val">${esc(c.metrics.conversion)}</div></div>
      </div>

      <div class="grid" style="grid-template-columns:1fr 1.3fr;align-items:start">
        <div>
          <div class="info-block"><h4>🎯 Estratégia da campanha</h4>
            <div class="kv">
              <div class="k">Objetivo</div><div class="v">${esc(c.objective)}</div>
              <div class="k">Produto</div><div class="v">${esc(c.productName || "—")}</div>
              <div class="k">Oferta</div><div class="v">${esc(c.offer || "—")}</div>
              <div class="k">Público</div><div class="v">${esc(c.audience || "—")}</div>
              <div class="k">Dor</div><div class="v">${esc(c.dor || "—")}</div>
              <div class="k">Promessa</div><div class="v">${esc(c.promise || "—")}</div>
              <div class="k">Emoção</div><div class="v">${esc(c.emotion || "—")}</div>
              <div class="k">CTA</div><div class="v">${esc(c.cta || "—")}</div>
              <div class="k">Objeções</div><div class="v">${esc(c.objections || "—")}</div>
              <div class="k">Provas</div><div class="v">${esc(c.proofs || "—")}</div>
              <div class="k">Canais</div><div class="v">${(c.channels || []).join(", ")}</div>
            </div></div>
          ${affBlock}
        </div>
        <div>
          <div class="section-title"><span class="st-ico">🃏</span><h2>Cards da campanha</h2><span class="st-count">${cards.length}</span>
            <div class="st-actions"><button class="btn btn-sm" data-act="new-card" data-camp="${id}">+ Card</button></div></div>
          <div class="grid" style="grid-template-columns:1fr 1fr">${cardsHTML || emptyState("🃏", "Sem cards", "Gere cards com IA.")}</div>
        </div>
      </div>`;
  }
  function bindCampanha(root) {
    root.querySelectorAll("[data-nav]").forEach((el) => el.onclick = () => location.hash = "#/" + el.dataset.nav);
    root.querySelectorAll("[data-open-card]").forEach((el) => el.onclick = () => window.App.openCard(el.dataset.openCard));
    root.querySelectorAll("[data-act='edit-campaign']").forEach((el) => el.onclick = () => window.App.openCampaignForm(el.dataset.id));
    root.querySelectorAll("[data-act='ai-cards']").forEach((el) => el.onclick = () => window.App.generateCards(el.dataset.id));
    root.querySelectorAll("[data-act='new-card']").forEach((el) => el.onclick = () => window.App.openCardForm(el.dataset.camp));
  }

  // ============================================================
  // BOARD
  // ============================================================
  const BOARD_VIEWS = ["Produção", "Semana", "Calendário", "Canal", "Campanha"];
  let boardView = "Produção";
  const PROD_COLS = ["Ideia", "Roteiro", "Pronto para gravar", "Gravado", "Enviado para análise", "Precisa corrigir", "Em edição", "Aguardando aprovação", "Pronto para publicar", "Publicado", "Analisando resultado", "Virou novo teste", "Concluído"];
  const WEEK_COLS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
  const CHANNELS = ["Instagram", "TikTok", "YouTube Shorts", "Facebook", "WhatsApp", "Marketplace", "Live Shop", "Anúncios"];

  function board() {
    const st = S.get();
    const tabs = BOARD_VIEWS.map((v) => `<div class="board-tab ${v === boardView ? "active" : ""}" data-bview="${v}">${v}</div>`).join("");
    let cols;
    if (boardView === "Produção") cols = PROD_COLS.map((s) => ({ name: s, cards: st.cards.filter((c) => c.status === s), color: statusColor(s), drop: true }));
    else if (boardView === "Semana") cols = WEEK_COLS.map((d, i) => ({ name: d, cards: st.cards.filter((c) => weekday(c.date) === i), color: "#3b82f6" }));
    else if (boardView === "Canal") cols = CHANNELS.map((ch) => ({ name: ch, cards: st.cards.filter((c) => c.channel === ch), color: "#a78bfa" }));
    else if (boardView === "Campanha") cols = st.campaigns.map((cp) => ({ name: cp.title, cards: S.sel.cardsByCampaign(cp.id), color: "#10b981" }));
    else if (boardView === "Calendário") return calendarView();

    const colsHTML = cols.map((col) => `
      <div class="board-col">
        <div class="board-col-head"><span class="bc-dot" style="background:${col.color}"></span><span class="bc-name">${esc(col.name)}</span><span class="bc-count">${col.cards.length}</span></div>
        <div class="board-col-body" ${col.drop ? `data-drop="${esc(col.name)}"` : ""}>
          ${col.cards.map(miniCard).join("") || `<div class="muted" style="font-size:12px;text-align:center;padding:10px">—</div>`}
        </div>
      </div>`).join("");

    return `
      <div class="section-title"><span class="st-ico">📋</span><h2>Board</h2><span class="st-count">${st.cards.length} cards</span>
        <div class="st-actions"><button class="btn btn-primary btn-sm" data-act="new-card">+ Novo card</button></div></div>
      <div class="board-tabs">${tabs}</div>
      ${boardView === "Produção" ? `<p class="muted" style="margin-bottom:12px;font-size:12px">💡 Arraste os cards entre as colunas para mudar o status.</p>` : ""}
      <div class="board">${colsHTML}</div>`;
  }

  function miniCard(c) {
    const camp = S.sel.campaign(c.campaignId);
    return `<div class="mini-card" draggable="true" data-card="${c.id}">
      <div class="mc-title">${esc(c.title)}</div>
      <div class="mc-meta"><span class="pill pill-gray">${esc(c.type)}</span> <span class="pill ${U.prioClass(c.priority)}" style="border-color:transparent;background:transparent;padding-left:0">● ${esc(c.priority)}</span></div>
      <div class="mc-foot"><span class="avatar">${U.initials(c.responsible)}</span> ${esc(c.channel)}${camp ? " · " + esc(camp.title.slice(0, 16)) : ""}</div>
      <div class="mc-progress"><span style="width:${c.progress}%"></span></div>
    </div>`;
  }

  function calendarView() {
    const st = S.get();
    const byDate = {};
    st.cards.forEach((c) => { (byDate[c.date] = byDate[c.date] || []).push(c); });
    const dates = Object.keys(byDate).sort();
    const tabs = BOARD_VIEWS.map((v) => `<div class="board-tab ${v === boardView ? "active" : ""}" data-bview="${v}">${v}</div>`).join("");
    const rows = dates.map((d) => `
      <div class="panel panel-pad" style="margin-bottom:12px">
        <div class="flex-between" style="margin-bottom:10px"><b style="color:var(--text-0)">📅 ${esc(d)}</b><span class="muted">${byDate[d].length} card(s)</span></div>
        <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(240px,1fr))">${byDate[d].map(miniCard).join("")}</div>
      </div>`).join("");
    return `<div class="section-title"><span class="st-ico">📋</span><h2>Board</h2></div><div class="board-tabs">${tabs}</div>${rows}`;
  }

  function bindBoard(root) {
    root.querySelectorAll("[data-bview]").forEach((el) => el.onclick = () => { boardView = el.dataset.bview; window.App.render(); });
    root.querySelectorAll("[data-act='new-card']").forEach((el) => el.onclick = () => window.App.openCardForm());
    root.querySelectorAll("[data-card]").forEach((el) => {
      el.addEventListener("click", (e) => { if (!el.classList.contains("dragging")) window.App.openCard(el.dataset.card); });
      el.addEventListener("dragstart", (e) => { el.classList.add("dragging"); e.dataTransfer.setData("text/plain", el.dataset.card); });
      el.addEventListener("dragend", () => el.classList.remove("dragging"));
    });
    root.querySelectorAll("[data-drop]").forEach((zone) => {
      zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.classList.add("drag-over"); });
      zone.addEventListener("dragleave", () => zone.classList.remove("drag-over"));
      zone.addEventListener("drop", (e) => {
        e.preventDefault(); zone.classList.remove("drag-over");
        const cardId = e.dataTransfer.getData("text/plain");
        S.actions.setCardStatus(cardId, zone.dataset.drop);
        U.toast("Card movido para " + zone.dataset.drop);
      });
    });
  }

  // ============================================================
  // ANÁLISE
  // ============================================================
  function analise() {
    const st = S.get();
    const published = st.cards.filter((c) => c.analysis && c.analysis.done);
    const totalViews = st.campaigns.reduce((a, c) => a + (c.metrics.views || 0), 0);
    const totalSales = st.campaigns.reduce((a, c) => a + (c.metrics.sales || 0), 0);

    const rows = published.map((c) => {
      const m = c.analysis.metrics;
      return `<div class="item-card" data-open-card="${c.id}">
        <div class="ic-top"><div class="ic-thumb">📊</div><div style="flex:1"><div class="ic-title">${esc(c.title)}</div><div class="muted" style="font-size:11px">${esc(c.channel)} · ${esc(c.publication.date || c.date)}</div></div></div>
        <div class="metric-grid" style="grid-template-columns:repeat(4,1fr)">
          <div><div class="mt-lbl">Views</div><div class="mt-val" style="font-size:16px">${fmt(m.views)}</div></div>
          <div><div class="mt-lbl">Retenção</div><div class="mt-val" style="font-size:16px">${esc(m.retention || "—")}</div></div>
          <div><div class="mt-lbl">Saves</div><div class="mt-val" style="font-size:16px">${fmt(m.saves)}</div></div>
          <div><div class="mt-lbl">Vendas</div><div class="mt-val" style="font-size:16px">${m.sales || 0}</div></div>
        </div>
        ${c.analysis.summary ? `<div class="alert good mb-0" style="margin-top:8px"><span class="al-ico">🤖</span><div class="al-body" style="font-size:12px"><b>IA:</b> ${esc(c.analysis.summary.fix)}</div></div>` : ""}
      </div>`;
    }).join("");

    return `
      <div class="section-title"><span class="st-ico">📈</span><h2>Análise</h2><span class="st-count">performance de conteúdo</span></div>
      <div class="grid grid-4" style="margin-bottom:18px">
        <div class="stat"><div class="s-label">📊 Views totais</div><div class="s-val">${fmt(totalViews)}</div><div class="s-delta up">todas campanhas</div></div>
        <div class="stat"><div class="s-label">🛒 Vendas</div><div class="s-val">${totalSales}</div><div class="s-delta up">via link</div></div>
        <div class="stat"><div class="s-label">📈 Conversão média</div><div class="s-val">1,6%</div><div class="s-delta up">+0,3pp</div></div>
        <div class="stat"><div class="s-label">🏆 Melhor retenção</div><div class="s-val">62%</div><div class="s-delta">Antes/Depois</div></div>
      </div>
      <div class="panel panel-pad" style="margin-bottom:18px">
        <div class="section-title"><span class="st-ico">🤖</span><h2>Diagnóstico da IA</h2></div>
        <div class="analysis-row"><span class="ar-ico">✅</span><div><b style="color:var(--text-0)">O que funcionou:</b> ganchos de curiosidade e transformação visual (antes/depois) seguram retenção acima de 60%.</div></div>
        <div class="analysis-row"><span class="ar-ico">⚠️</span><div><b style="color:var(--text-0)">O que corrigir:</b> CTA aparece tarde nos vídeos — muitos salvamentos, mas conversão abaixo do potencial.</div></div>
        <div class="analysis-row"><span class="ar-ico">🔁</span><div><b style="color:var(--text-0)">O que repetir:</b> fórmula antes/depois com pessoa real. Vale testar com gaveta de cozinha.</div></div>
        <div class="analysis-row"><span class="ar-ico">✨</span><div><b style="color:var(--text-0)">Próxima ação:</b> criar variação com produto nos 2 primeiros segundos (já virou card de regravação).</div></div>
      </div>
      <div class="section-title"><span class="st-ico">📊</span><h2>Conteúdos analisados</h2><span class="st-count">${published.length}</span></div>
      ${published.length ? `<div class="grid grid-auto">${rows}</div>` : emptyState("📊", "Nenhum conteúdo analisado", "Publique e insira métricas para ver a análise.")}`;
  }
  function bindAnalise(root) { root.querySelectorAll("[data-open-card]").forEach((el) => el.onclick = () => window.App.openCard(el.dataset.openCard)); }

  // ============================================================
  // BIBLIOTECA
  // ============================================================
  let libCat = "Todos";
  function biblioteca() {
    const st = S.get();
    const cats = ["Todos", ...Array.from(new Set(st.library.map((l) => l.type)))];
    const items = st.library.filter((l) => libCat === "Todos" || l.type === libCat);
    const catsHTML = cats.map((c) => `<span class="chip ${c === libCat ? "on" : ""}" data-libcat="${esc(c)}">${esc(c)}</span>`).join("");
    const cardsHTML = items.map((l) => `
      <div class="item-card">
        <div class="ic-top"><div class="ic-thumb">${libIco(l.type)}</div><div style="flex:1"><div class="ic-title">${esc(l.title)}</div><span class="pill pill-accent" style="margin-top:4px">${esc(l.type)}</span></div>
          <div class="x-btn" data-dellib="${l.id}" title="Excluir">🗑️</div></div>
        <div class="ic-desc">${esc(l.content)}</div>
        <div class="ic-foot">${(l.tags || []).map((t) => `<span class="pill pill-gray">#${esc(t)}</span>`).join("")}
          <button class="btn btn-xs" data-reuse="${l.id}" style="margin-left:auto">Reutilizar</button></div>
      </div>`).join("");
    return `
      <div class="section-title"><span class="st-ico">📚</span><h2>Biblioteca</h2><span class="st-count">${st.library.length} itens reutilizáveis</span>
        <div class="st-actions"><button class="btn btn-primary btn-sm" data-act="new-lib">+ Adicionar</button></div></div>
      <p class="muted" style="margin-bottom:14px">Ganchos, roteiros, criativos e aprendizados vencedores. A IA usa a biblioteca para sugerir novos conteúdos.</p>
      <div class="lib-cats">${catsHTML}</div>
      <div class="grid grid-auto">${cardsHTML || emptyState("📚", "Nada nesta categoria", "")}</div>`;
  }
  function bindBiblioteca(root) {
    root.querySelectorAll("[data-libcat]").forEach((el) => el.onclick = () => { libCat = el.dataset.libcat; window.App.render(); });
    root.querySelectorAll("[data-dellib]").forEach((el) => el.onclick = (e) => { e.stopPropagation(); U.confirm("Excluir este item da biblioteca?", () => { S.actions.deleteLibrary(el.dataset.dellib); U.toast("Item excluído"); }, { danger: true, yes: "Excluir" }); });
    root.querySelectorAll("[data-reuse]").forEach((el) => el.onclick = () => U.simulated("Reutilizar item", "Item aplicado a um novo card de rascunho."));
    root.querySelectorAll("[data-act='new-lib']").forEach((el) => el.onclick = () => window.App.openLibForm());
  }

  // ============================================================
  // PERSONA
  // ============================================================
  function persona() {
    const p = S.get().persona;
    return `
      <div class="section-title"><span class="st-ico">🎭</span><h2>Persona</h2><span class="st-count">identidade da marca/operação</span>
        <div class="st-actions"><button class="btn btn-primary btn-sm" data-act="edit-persona">Editar persona</button></div></div>
      <div class="panel panel-pad" style="margin-bottom:16px">
        <div class="persona-hero">
          <div class="persona-avatar">${U.initials(p.brandName)}</div>
          <div><h1 style="font-size:22px;color:var(--text-0);font-weight:800">${esc(p.brandName)}</h1>
            <div class="flex gap-8 center wrap" style="margin-top:6px"><span class="pill pill-accent">${esc(p.userType)}</span><span class="pill pill-gray">${esc(p.niche)}</span></div>
            <p class="muted" style="margin-top:8px;max-width:640px">${esc(p.positioning)}</p></div>
        </div>
      </div>
      <div class="grid grid-2" style="align-items:start">
        <div class="info-block"><h4>👥 Público & tom</h4>
          <div class="kv">
            <div class="k">Público</div><div class="v">${esc(p.audience)}</div>
            <div class="k">Tom de voz</div><div class="v">${(p.tone || []).map((t) => `<span class="pill pill-gray">${esc(t)}</span>`).join(" ")}</div>
            <div class="k">Linguagem</div><div class="v">${esc(p.language)}</div>
            <div class="k">Objetivo</div><div class="v">${esc(p.objective)}</div>
          </div></div>
        <div class="info-block"><h4>🎯 Marca & limites</h4>
          <div class="kv">
            <div class="k">Promessa central</div><div class="v">${esc(p.promise)}</div>
            <div class="k">Produtos</div><div class="v">${esc(p.products)}</div>
            <div class="k">Canais</div><div class="v">${(p.channels || []).join(", ")}</div>
            <div class="k">Estilo visual</div><div class="v">${esc(p.visualStyle)}</div>
            <div class="k">Limites</div><div class="v">${esc(p.limits)}</div>
            <div class="k">Temas proibidos</div><div class="v">${esc(p.forbidden)}</div>
          </div></div>
      </div>`;
  }
  function bindPersona(root) { root.querySelectorAll("[data-act='edit-persona']").forEach((el) => el.onclick = () => window.App.openPersonaForm()); }

  // ============================================================
  // CONFIGURAÇÕES
  // ============================================================
  let setTab = "Conta";
  function config() {
    const st = S.get();
    const tabs = ["Conta", "Equipe", "Créditos de IA", "Integrações", "Status personalizados", "Notificações"];
    const nav = tabs.map((t) => `<div class="set-nav-item ${t === setTab ? "active" : ""}" data-settab="${esc(t)}">${esc(t)}</div>`).join("");
    let panel = "";
    if (setTab === "Conta") panel = `
      <div class="info-block"><h4>👤 Conta</h4>
        <div class="field"><label>Nome</label><input class="input" value="${esc(st.user.name)}" data-setuser="name"/></div>
        <div class="field"><label>Email</label><input class="input" value="${esc(st.user.email)}" disabled/></div>
        <div class="field"><label>Papel</label><input class="input" value="${esc(st.user.role)}" disabled/></div>
      </div>
      <button class="btn btn-danger" data-act="reset-data">Restaurar dados de exemplo</button>`;
    else if (setTab === "Equipe") panel = `
      <div class="info-block"><h4>👥 Equipe & permissões</h4>
        <div class="status-row"><span class="avatar">MA</span><div style="flex:1"><b style="color:var(--text-0)">${esc(st.user.name)}</b><div class="muted" style="font-size:12px">${esc(st.user.email)}</div></div><span class="pill pill-accent">Owner</span></div>
        <div class="status-row"><span class="avatar">AN</span><div style="flex:1"><b style="color:var(--text-0)">Ana</b><div class="muted" style="font-size:12px">ana@casaleve.com</div></div><span class="pill pill-blue">Editor</span></div>
        <button class="btn btn-sm mt-16" data-sim="Convidar membro">+ Convidar membro</button></div>`;
    else if (setTab === "Créditos de IA") panel = creditsPanel();
    else if (setTab === "Integrações") panel = integrationsPanel();
    else if (setTab === "Status personalizados") panel = statusPanel();
    else if (setTab === "Notificações") panel = `
      <div class="info-block"><h4>🔔 Notificações</h4>
        ${["Card pronto para gravar", "Conteúdo com baixa performance", "Créditos acabando", "Campanha sem publicação", "Aprovação pendente"].map((n) => `<div class="status-row"><div style="flex:1">${esc(n)}</div><label style="cursor:pointer"><input type="checkbox" checked style="accent-color:var(--accent);width:16px;height:16px"></label></div>`).join("")}</div>`;
    return `
      <div class="section-title"><span class="st-ico">⚙️</span><h2>Configurações</h2></div>
      <div class="grid" style="grid-template-columns:220px 1fr;align-items:start">
        <div class="panel panel-pad"><div class="set-nav">${nav}</div></div>
        <div>${panel}</div>
      </div>`;
  }

  function creditsPanel() {
    const cr = S.get().credits;
    const pct = Math.round((cr.available / cr.total) * 100);
    const hist = cr.history.map((h) => `<div class="status-row"><div style="flex:1">${esc(h.desc)}</div><span class="muted">${esc(h.date)}</span><b style="color:${h.amount > 0 ? "var(--accent-2)" : "var(--red)"};margin-left:12px">${h.amount > 0 ? "+" : ""}${h.amount}</b></div>`).join("");
    return `
      <div class="info-block"><h4>✨ Créditos de IA</h4>
        <div class="grid grid-3" style="margin-bottom:14px">
          <div class="metric-tile"><div class="mt-lbl">Disponíveis</div><div class="mt-val text-accent">${cr.available}</div></div>
          <div class="metric-tile"><div class="mt-lbl">Usados</div><div class="mt-val">${cr.used}</div></div>
          <div class="metric-tile"><div class="mt-lbl">Total</div><div class="mt-val">${cr.total}</div></div>
        </div>
        <div class="bar" style="margin-bottom:6px"><span style="width:${pct}%"></span></div>
        <div class="muted" style="font-size:12px;margin-bottom:14px">${pct}% dos créditos disponíveis. Cada geração de vídeo IA consome entre 8 e 30 créditos.</div>
        <button class="btn btn-primary" data-act="buy-credits">+ Comprar créditos</button>
      </div>
      <div class="info-block"><h4>📜 Histórico de consumo</h4>${hist}</div>`;
  }

  function integrationsPanel() {
    const groups = [
      { name: "Meta", items: ["Instagram", "Facebook", "Reels", "Ads"], ico: "📱" },
      { name: "Google", items: ["YouTube", "Shorts", "Google Ads", "Google Trends"], ico: "🔍" },
      { name: "Vídeo IA", items: ["Vídeo rápido", "Vídeo premium", "Vídeo para anúncio", "Vídeo para afiliado"], ico: "✨" },
    ];
    return groups.map((g) => `
      <div class="info-block"><h4>${g.ico} ${esc(g.name)}</h4>
        ${g.items.map((i) => `<div class="status-row"><div style="flex:1">${esc(i)}</div><span class="pill pill-gray">Não conectado</span><button class="btn btn-xs" data-sim="Integração ${esc(i)}" style="margin-left:10px">Conectar</button></div>`).join("")}
      </div>`).join("") + `<p class="muted" style="font-size:12px">Você escolhe o objetivo (rápido, premium, anúncio, afiliado) e o sistema decide o provedor por trás.</p>`;
  }

  function statusPanel() {
    const st = S.get();
    const rows = st.statuses.map((s) => `<div class="status-row"><span class="status-color" style="background:${s.color}"></span><div style="flex:1"><b style="color:var(--text-0)">${esc(s.name)}</b></div><div class="x-btn" data-delstatus="${esc(s.name)}">🗑️</div></div>`).join("");
    return `
      <div class="info-block"><h4>🏷️ Status personalizados do Board</h4>
        ${rows}
        <div class="flex gap-8 mt-16"><input class="input" id="new-status-name" placeholder="Nome do novo status" style="flex:1"/><input type="color" id="new-status-color" value="#10b981" style="width:44px;height:40px;border-radius:8px;border:1px solid var(--border-2);background:var(--bg-2)"/><button class="btn btn-primary" data-act="add-status">Adicionar</button></div>
      </div>`;
  }

  function bindConfig(root) {
    root.querySelectorAll("[data-settab]").forEach((el) => el.onclick = () => { setTab = el.dataset.settab; window.App.render(); });
    root.querySelectorAll("[data-sim]").forEach((el) => el.onclick = () => U.simulated(el.dataset.sim, "Integração preparada para conexão real."));
    root.querySelectorAll("[data-act='buy-credits']").forEach((el) => el.onclick = () => window.App.buyCredits());
    root.querySelectorAll("[data-act='reset-data']").forEach((el) => el.onclick = () => U.confirm("Isso vai apagar suas alterações e restaurar os dados de exemplo. Continuar?", () => { S.reset(); U.toast("Dados restaurados"); location.hash = "#/hoje"; window.App.render(); }, { danger: true, yes: "Restaurar" }));
    const setUser = root.querySelector("[data-setuser]"); if (setUser) setUser.onchange = () => S.update((s) => s.user.name = setUser.value);
    root.querySelectorAll("[data-delstatus]").forEach((el) => el.onclick = () => { S.actions.deleteStatus(el.dataset.delstatus); U.toast("Status removido"); });
    const addStatus = root.querySelector("[data-act='add-status']");
    if (addStatus) addStatus.onclick = () => { const n = root.querySelector("#new-status-name").value.trim(); const c = root.querySelector("#new-status-color").value; if (!n) return U.toast("Digite um nome", "warn"); S.actions.addStatus(n, c); U.toast("Status adicionado"); };
  }

  // ============================================================
  // Helpers
  // ============================================================
  function emptyState(ico, title, sub) { return `<div class="empty"><div class="e-ico">${ico}</div><h3>${esc(title)}</h3><p>${esc(sub)}</p></div>`; }
  function statusColor(s) { const f = (S.get().statuses.find((x) => x.name === s)); return f ? f.color : "#8fa39c"; }
  function weekday(d) { if (!d) return -1; const dt = new Date(d + "T00:00:00"); return (dt.getDay() + 6) % 7; } // Mon=0
  function libIco(type) { return { "Gancho vencedor": "🪝", "Roteiro vencedor": "📝", "Criativo vencedor": "🎬", "CTA": "📣", "Promessa": "🎯", "Objeção": "🛡️", "Aprendizado": "🧠", "Template": "🧩" }[type] || "📚"; }

  return {
    hoje, bindHoje, ideias, bindIdeias, campanhas, bindCampanhas, campanha, bindCampanha,
    board, bindBoard, analise, bindAnalise, biblioteca, bindBiblioteca, persona, bindPersona, config, bindConfig,
    emptyState, statusColor,
  };
})();
