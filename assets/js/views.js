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
    const activeCards = st.cards.filter((c) => !["Concluído"].includes(c.status));
    const pubToday = window.PublishEngine.dueToday();

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
          <div class="panel panel-pad" style="margin-bottom:16px">
            <div class="section-title"><span class="st-ico">🃏</span><h2>Cards do dia</h2>
              <div class="st-actions"><button class="btn btn-sm" data-nav="board">Ver board →</button></div></div>
            <div class="grid" style="grid-template-columns:1fr 1fr">${cardsHTML}</div>
          </div>
          <div class="panel panel-pad">
            <div class="section-title"><span class="st-ico">📅</span><h2>Publicações de hoje</h2><span class="st-count">${pubToday.length}</span></div>
            ${pubToday.length ? pubToday.map((x) => `
              <div class="priority-item" data-open-card="${x.id}">
                <b style="width:52px;color:var(--accent-2)">${esc((x.publication && x.publication.time) || "—")}</b>
                <div class="pi-text">${esc(x.title)}<div class="pi-meta">${esc((x.publication && x.publication.channel) || x.channel)} · ${esc(window.PublishEngine.pubStatus(x))}</div></div>
                ${window.PublishEngine.pubStatus(x) === "Aprovado" || window.PublishEngine.pubStatus(x) === "Agendado" ? `<button class="btn btn-xs btn-primary" data-pubnow="${x.id}">🚀 Publicar</button>` : ""}
              </div>`).join("") : `<p class="muted" style="font-size:13px">Nada agendado para hoje. Crie uma campanha e aprove conteúdos.</p>`}
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
    root.querySelectorAll("[data-open-card]").forEach((el) => el.onclick = (e) => { if (e.target.closest("[data-pubnow]")) return; window.App.openCard(el.dataset.openCard); });
    root.querySelectorAll("[data-pubnow]").forEach((el) => el.onclick = (e) => { e.stopPropagation(); window.PublishEngine.publishNow(el.dataset.pubnow); });
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
  let campView = "Cards";
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
        <div class="flex gap-8"><button class="btn btn-danger btn-sm" data-act="del-campaign" data-id="${id}">Excluir</button><button class="btn" data-act="edit-campaign" data-id="${id}">Editar</button><button class="btn btn-primary" data-act="ai-cards" data-id="${id}">✨ Gerar cards com IA</button></div>
      </div>

      <div class="grid grid-4" style="margin-bottom:18px">
        <div class="stat"><div class="s-label">📊 Views</div><div class="s-val">${fmt(c.metrics.views)}</div></div>
        <div class="stat"><div class="s-label">🛒 Vendas</div><div class="s-val">${c.metrics.sales}</div></div>
        <div class="stat"><div class="s-label">💰 Faturamento</div><div class="s-val">${esc(c.metrics.revenue)}</div></div>
        <div class="stat"><div class="s-label">📈 Conversão</div><div class="s-val">${esc(c.metrics.conversion)}</div></div>
      </div>

      <div class="board-tabs">${[["Cards", "🃏"], ["Variações", "🧪"], ["Plano", "📅"], ["Fila", "🗂️"], ["Análise do Teste", "📊"], ["Histórico", "📜"]].map(([v, ic]) => `<div class="board-tab ${v === campView ? "active" : ""}" data-campview="${v}">${ic} ${v}</div>`).join("")}</div>
      ${campView === "Variações" ? variationsView(c)
        : campView === "Plano" ? planView(c)
        : campView === "Fila" ? filaView(c)
        : campView === "Análise do Teste" ? testView(c)
        : campView === "Histórico" ? histView(c) : `
      <div class="grid" style="grid-template-columns:1fr 1.3fr;align-items:start">
        <div>
          <div class="info-block"><h4>🎯 Estratégia da campanha</h4>
            <div class="kv">
              <div class="k">Objetivo</div><div class="v">${esc(c.objective)}</div>
              <div class="k">Produto</div><div class="v">${esc(c.productName || "—")}</div>
              <div class="k">Oferta</div><div class="v">${esc(c.offer || "—")}</div>
              <div class="k">Público</div><div class="v">${esc(c.audience || "—")}</div>
              <div class="k">Promessa</div><div class="v">${esc(c.promise || "—")}</div>
              <div class="k">CTA</div><div class="v">${esc(c.cta || "—")}</div>
              <div class="k">Modo de publicação</div><div class="v"><span class="pill pill-accent">${esc(c.publishMode || "Automático com aprovação")}</span></div>
              <div class="k">Canais</div><div class="v">${(c.channels || []).join(", ")}</div>
            </div></div>
          ${affBlock}
        </div>
        <div>
          <div class="section-title"><span class="st-ico">🃏</span><h2>Cards da campanha</h2><span class="st-count">${cards.length}</span>
            <div class="st-actions"><button class="btn btn-sm" data-campview="Variações">🧪 Variações</button><button class="btn btn-sm" data-act="new-card" data-camp="${id}">+ Card</button></div></div>
          <div class="grid" style="grid-template-columns:1fr 1fr">${cardsHTML || emptyState("🃏", "Sem cards", "Gere cards com IA.")}</div>
        </div>
      </div>`}`;
  }

  // ---------- Máquina de Variações (seção visível) ----------
  const VM_STYLES = ["Antes e depois", "Review", "Demonstração", "Prova social", "Objeção", "Oferta direta", "Bastidor", "Tutorial", "Comparação", "UGC natural", "Fundo branco", "Rua", "Produto na mão", "Ambiente real"];
  const VM_CHANNELS = ["Instagram", "TikTok", "YouTube Shorts", "Stories", "Facebook", "Marketplace", "Anúncios"];
  let vmForm = { qty: 10, channels: [], styles: [], mode: "Gerar, aprovar e publicar", product: "" };
  function variationsView(c) {
    const varis = S.sel.cardsByCampaign(c.id).filter((x) => x.isVariation);
    const qtys = [["3", "3 variações"], ["5", "5 variações"], ["10", "10 variações"], ["15", "15 variações"], ["30", "30 dias de conteúdo"]];
    const modes = ["Só gerar cards", "Gerar e agendar", "Gerar, aprovar e publicar", "Automático com regras"];
    return `
      <div class="info-block"><h4>🧪 Máquina de Variações</h4>
        <p class="muted" style="margin-bottom:14px">Teste vários ângulos do mesmo produto para encontrar o vídeo vencedor.</p>
        <div class="field"><label>Produto ou tema base</label><input class="input" id="vm-product" value="${esc(vmForm.product || c.productName || c.title)}"/></div>
        <div class="field"><label>Quantidade de variações</label><div class="chip-select" id="vm-qty">${qtys.map(([q, l]) => `<div class="chip ${String(vmForm.qty) === q ? "on" : ""}" data-q="${q}">${l}</div>`).join("")}</div></div>
        <div class="field"><label>Canais</label><div class="chip-select" id="vm-ch">${VM_CHANNELS.map((ch) => `<div class="chip ${vmForm.channels.includes(ch) ? "on" : ""}" data-ch="${esc(ch)}">${esc(ch)}</div>`).join("")}</div></div>
        <div class="field"><label>Estilos para testar</label><div class="chip-select" id="vm-st">${VM_STYLES.map((s) => `<div class="chip ${vmForm.styles.includes(s) ? "on" : ""}" data-st="${esc(s)}">${esc(s)}</div>`).join("")}</div></div>
        <div class="field"><label>Modo</label><div class="chip-select" id="vm-mode">${modes.map((m) => `<div class="chip ${vmForm.mode === m ? "on" : ""}" data-mode="${esc(m)}">${esc(m)}</div>`).join("")}</div></div>
        <button class="btn btn-primary mt-16" data-vmgo="${c.id}">✨ Gerar variações</button>
      </div>
      <div class="section-title"><span class="st-ico">🧬</span><h2>Variações desta campanha</h2><span class="st-count">${varis.length}</span></div>
      ${varis.length ? `<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(260px,1fr))">${varis.map((cd) => `
        <div class="mini-card" data-open-card="${cd.id}" style="cursor:pointer">
          <div class="mc-title">${esc(cd.title)}</div>
          <div class="mc-meta">${pill(cd.status)} <span class="pill pill-gray">${esc(cd.channel)}</span>${cd.potential ? ` <span class="pill ${cd.potential === "Alto" ? "pill-accent" : "pill-amber"}">📈 ${esc(cd.potential)}</span>` : ""}</div>
          <div class="mc-foot" style="font-size:11px">${esc(cd.scenario || "")}</div>
        </div>`).join("")}</div>` : emptyState("🧬", "Nenhuma variação ainda", "Escolha a quantidade e clique em Gerar variações.")}`;
  }

  // ---------- Plano de Publicação (seção visível) ----------
  function planView(c) {
    const PE = window.PublishEngine;
    const all = S.sel.cardsByCampaign(c.id).filter((x) => x.publication && x.publication.date);
    const byDate = {};
    all.forEach((x) => { (byDate[x.publication.date] = byDate[x.publication.date] || []).push(x); });
    const dias = Object.keys(byDate).sort();
    const plano = dias.map((d) => `
      <div class="info-block" style="margin-bottom:10px"><h4 style="margin-bottom:8px">📅 ${esc(fmtDate(d))}</h4>
        ${byDate[d].sort((a, b) => (a.publication.time > b.publication.time ? 1 : -1)).map((x) => `
          <div class="flex gap-8 center" style="padding:6px 0;border-bottom:1px solid var(--border)">
            <b style="width:52px;color:var(--text-0)">${esc(x.publication.time || "—")}</b>
            <span class="pill pill-gray">${esc(x.publication.channel || x.channel)}</span>
            <span style="flex:1;cursor:pointer" data-open-card="${x.id}">${esc(x.title)}</span>
            ${pill(PE.pubStatus(x))}
          </div>`).join("")}
      </div>`).join("") || emptyState("📅", "Sem plano ainda", "Gere o plano automaticamente ou crie variações.");
    const modes = PE.MODES.map((m) => `<span class="chip ${m === (c.publishMode || "Automático com aprovação") ? "on" : ""}" data-setmode="${esc(m)}">${esc(m)}</span>`).join("");
    return `
      <div class="info-block"><h4>⚙️ Modo de publicação & regras</h4>
        <div class="chip-select" style="margin-bottom:8px">${modes}</div>
        <div class="flex gap-8 wrap" style="margin-top:6px">
          <button class="btn btn-xs" data-pub="${c.automationPaused ? "resume" : "pause"}" data-id="${c.id}">${c.automationPaused ? "▶️ Retomar automação" : "⏸️ Pausar automação"}</button>
          <button class="btn btn-xs" data-pub="process" data-id="${c.id}">⚡ Processar fila agora</button>
        </div>
        <div class="alert good" style="margin-top:10px"><span class="al-ico">🛡️</span><div class="al-body" style="font-size:11px">Regras: só publica aprovados · máx ${PE.rules(c).maxPerDay}/dia · horários ${esc(PE.rules(c).allowedHours)} · não publica sem mídia/legenda · pausa em erro. <span class="muted">Publicação em modo simulado. Estrutura pronta para integração real.</span></div></div>
      </div>
      <div class="section-title"><span class="st-ico">📅</span><h2>Plano de Publicação</h2>
        <div class="st-actions"><button class="btn btn-sm" data-plan="gen" data-id="${c.id}">Gerar plano</button><button class="btn btn-sm" data-plan="approve-all" data-id="${c.id}">Aprovar tudo</button><button class="btn btn-sm" data-plan="schedule" data-id="${c.id}">Agendar aprovados</button><button class="btn btn-sm" data-plan="clear" data-id="${c.id}">Limpar</button></div></div>
      ${plano}`;
  }

  // ---------- Fila de Publicação (seção visível) ----------
  function filaView(c) {
    const PE = window.PublishEngine;
    const q = PE.queue(c.id);
    const rows = q.map((x) => `
      <div class="scene-card" style="padding:12px">
        <div class="flex gap-8 center wrap"><b style="flex:1;color:var(--text-0);cursor:pointer" data-open-card="${x.id}">${esc(x.title)}</b><span class="pill pill-gray">${esc(x.publication.channel || x.channel)}</span>${pill(PE.pubStatus(x))}</div>
        <div class="flex gap-8 center wrap" style="margin-top:8px">
          <input class="input" type="date" data-qdate="${x.id}" value="${esc(x.publication.date)}" style="max-width:150px"/>
          <input class="input" type="time" data-qtime="${x.id}" value="${esc(x.publication.time || "")}" style="max-width:110px"/>
          <select class="select" data-qchan="${x.id}" style="max-width:150px">${VM_CHANNELS.concat(["WhatsApp"]).map((ch) => `<option ${ch === (x.publication.channel || x.channel) ? "selected" : ""}>${esc(ch)}</option>`).join("")}</select>
        </div>
        <div class="flex gap-8 wrap" style="margin-top:8px">
          ${x.publication.approved ? "" : `<button class="btn btn-xs" data-pub="approve" data-id="${x.id}">✓ Aprovar</button>`}
          <button class="btn btn-xs" data-pub="schedule" data-id="${x.id}">📅 Agendar</button>
          <button class="btn btn-xs btn-primary" data-pub="now" data-id="${x.id}">🚀 Publicar agora</button>
          <button class="btn btn-xs" data-pub="manual" data-id="${x.id}">✍️ Publicado manual</button>
          <button class="btn btn-xs" data-pub="remove" data-id="${x.id}">Remover</button>
          <button class="btn btn-xs" data-open-card="${x.id}">Abrir card</button>
        </div>
      </div>`).join("") || emptyState("🗂️", "Fila vazia", "Gere variações e o plano para preencher a fila.");
    return `
      <div class="section-title"><span class="st-ico">🗂️</span><h2>Fila de Publicação</h2><span class="st-count">${q.length}</span>
        <div class="st-actions"><button class="btn btn-sm" data-pub="process" data-id="${c.id}">⚡ Processar fila</button><button class="btn btn-sm" data-pub="cancel" data-id="${c.id}">Cancelar fila</button></div></div>
      ${rows}`;
  }

  // ---------- Análise do Teste (comparar + explodir vencedor) ----------
  function testView(c) {
    const cards = S.sel.cardsByCampaign(c.id);
    const withM = cards.filter((x) => x.analysis && x.analysis.done && x.analysis.metrics && x.analysis.metrics.views);
    const score = (x) => { const m = x.analysis.metrics; return (m.views || 0) / 1000 + (parseInt(m.retention) || 0) * 2 + (m.sales || 0) * 10; };
    const ranked = withM.map((x) => ({ x, s: score(x) })).sort((a, b) => b.s - a.s);
    const best = ranked[0] && ranked[0].x, worst = ranked.length > 1 && ranked[ranked.length - 1].x;
    return `
      <div class="info-block"><h4>📊 Análise do Teste</h4>
        <p class="muted" style="margin-bottom:10px">Compare as variações por desempenho e transforme o vencedor em novos testes.</p>
        <div class="flex gap-8 wrap">
          <button class="btn btn-sm" data-test="sim" data-id="${c.id}">🎲 Simular métricas dos publicados</button>
          <button class="btn btn-primary btn-sm" data-test="explode" data-id="${c.id}">🏆 Explodir vencedor</button>
        </div>
      </div>
      ${withM.length ? `
      <div class="grid grid-2" style="align-items:start">
        <div class="info-block"><h4>🏆 Melhor variação</h4>${best ? `<div class="scene-card"><div class="scene-top"><span class="pill pill-accent">${esc(best.title)}</span></div><div class="kv" style="margin-top:6px"><div class="k">Views</div><div class="v">${fmt(best.analysis.metrics.views)}</div><div class="k">Retenção</div><div class="v">${esc(best.analysis.metrics.retention || "—")}</div><div class="k">Vendas</div><div class="v">${best.analysis.metrics.sales || 0}</div></div></div>` : "—"}</div>
        <div class="info-block"><h4>⚠️ Pior variação</h4>${worst ? `<div class="scene-card"><div class="scene-top"><span class="pill pill-red">${esc(worst.title)}</span></div><div class="kv" style="margin-top:6px"><div class="k">Views</div><div class="v">${fmt(worst.analysis.metrics.views)}</div><div class="k">Retenção</div><div class="v">${esc(worst.analysis.metrics.retention || "—")}</div></div></div>` : '<p class="muted" style="font-size:12px">Precisa de mais dados.</p>'}</div>
      </div>
      <div class="info-block mb-0"><h4>📈 Ranking</h4>${ranked.map((r, i) => `<div class="status-row"><b style="width:26px">${i + 1}º</b><div style="flex:1">${esc(r.x.title)}</div><span class="muted">${fmt(r.x.analysis.metrics.views)} views · ret ${esc(r.x.analysis.metrics.retention || "—")}</span></div>`).join("")}</div>`
      : emptyState("📊", "Sem métricas ainda", "Publique variações e clique em “Simular métricas dos publicados”.")}`;
  }

  function histView(c) {
    const h = c.publishHistory || [];
    return `
      <div class="section-title"><span class="st-ico">📜</span><h2>Histórico de publicações</h2><span class="st-count">${h.length}</span></div>
      ${h.length ? h.map((e) => `
        <div class="file-tile" style="margin-bottom:8px">
          <div class="ft-ico">${/simulado/.test(e.status) ? "🧪" : "✅"}</div>
          <div style="flex:1"><div class="ft-name">${esc(e.cardTitle)} <span class="pill pill-gray">${esc(e.channel)}</span></div>
            <div class="ft-meta">${esc(e.date)} ${esc(e.time)} · ${esc(e.mode || "")}${e.approvedBy ? " · aprovado por " + esc(e.approvedBy) : ""} · <a href="#" onclick="return false" class="text-accent">${esc(e.link || "sem link")}</a></div></div>
          ${pill(e.status.replace(" (simulado)", "") || "Publicado")}
        </div>`).join("") : emptyState("📜", "Sem publicações ainda", "Publique conteúdos para ver o histórico.")}`;
  }
  function fmtDate(d) { try { const dt = new Date(d + "T00:00:00"); return ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][dt.getDay()] + ", " + d.split("-").reverse().slice(0, 2).join("/"); } catch (e) { return d; } }
  function bindCampanha(root) {
    root.querySelectorAll("[data-nav]").forEach((el) => el.onclick = () => location.hash = "#/" + el.dataset.nav);
    root.querySelectorAll("[data-open-card]").forEach((el) => el.onclick = () => window.App.openCard(el.dataset.openCard));
    root.querySelectorAll("[data-act='edit-campaign']").forEach((el) => el.onclick = () => window.App.openCampaignForm(el.dataset.id));
    root.querySelectorAll("[data-act='del-campaign']").forEach((el) => el.onclick = () => U.confirm("Excluir esta campanha e seus cards?", () => { S.actions.deleteCampaign(el.dataset.id); U.toast("Campanha excluída"); location.hash = "#/campanhas"; }, { danger: true, yes: "Excluir" }));
    root.querySelectorAll("[data-act='ai-cards']").forEach((el) => el.onclick = () => window.App.generateCards(el.dataset.id));
    root.querySelectorAll("[data-act='new-card']").forEach((el) => el.onclick = () => window.App.openCardForm(el.dataset.camp));
    root.querySelectorAll("[data-act='variations']").forEach((el) => el.onclick = () => window.App.variationMenu(el.dataset.camp));
    // Publicação
    root.querySelectorAll("[data-campview]").forEach((el) => el.onclick = () => { campView = el.dataset.campview; window.App.render(); });
    root.querySelectorAll("[data-setmode]").forEach((el) => el.onclick = () => { const id = location.hash.split("/")[2]; S.actions.updateCampaign(id, { publishMode: el.dataset.setmode }); U.toast("Modo: " + el.dataset.setmode); window.App.render(); });
    root.querySelectorAll("[data-qdate]").forEach((el) => el.onchange = () => S.actions.patchCard(el.dataset.qdate, "publication.date", el.value));
    root.querySelectorAll("[data-qtime]").forEach((el) => el.onchange = () => S.actions.patchCard(el.dataset.qtime, "publication.time", el.value));
    root.querySelectorAll("[data-qchan]").forEach((el) => el.onchange = () => S.actions.patchCard(el.dataset.qchan, "publication.channel", el.value));
    const PE = window.PublishEngine;
    root.querySelectorAll("[data-pub]").forEach((el) => el.onclick = () => {
      const id = el.dataset.id, act = el.dataset.pub;
      if (act === "approve") { PE.approve(id); window.App.render(); }
      else if (act === "schedule") { PE.schedule(id); window.App.render(); }
      else if (act === "now") { PE.publishNow(id); }
      else if (act === "remove") { PE.setPub(id, { pubStatus: "Conteúdo gerado", date: "", time: "" }); U.toast("Removido da fila"); window.App.render(); }
      else if (act === "pause" || act === "resume") { PE.toggleAutomationPause(id); window.App.render(); }
      else if (act === "process") { PE.processQueue(id); }
      else if (act === "manual") { PE.markPublished(id); window.App.render(); }
      else if (act === "cancel") { U.confirm("Cancelar toda a fila desta campanha?", () => { PE.cancelQueue(id); window.App.render(); }, { danger: true, yes: "Cancelar fila" }); }
    });
    // Máquina de Variações (seção inline)
    root.querySelectorAll("#vm-qty .chip").forEach((el) => el.onclick = () => { vmForm.qty = +el.dataset.q; root.querySelectorAll("#vm-qty .chip").forEach((x) => x.classList.toggle("on", x === el)); });
    root.querySelectorAll("#vm-ch .chip").forEach((el) => el.onclick = () => { const v = el.dataset.ch, i = vmForm.channels.indexOf(v); i >= 0 ? vmForm.channels.splice(i, 1) : vmForm.channels.push(v); el.classList.toggle("on"); });
    root.querySelectorAll("#vm-st .chip").forEach((el) => el.onclick = () => { const v = el.dataset.st, i = vmForm.styles.indexOf(v); i >= 0 ? vmForm.styles.splice(i, 1) : vmForm.styles.push(v); el.classList.toggle("on"); });
    root.querySelectorAll("#vm-mode .chip").forEach((el) => el.onclick = () => { vmForm.mode = el.dataset.mode; root.querySelectorAll("#vm-mode .chip").forEach((x) => x.classList.toggle("on", x === el)); });
    root.querySelectorAll("[data-vmgo]").forEach((el) => el.onclick = () => {
      const id = el.dataset.vmgo, camp = S.sel.campaign(id);
      const prod = root.querySelector("#vm-product"); if (prod && prod.value.trim()) S.actions.updateCampaign(id, { productName: prod.value.trim() });
      const ids = window.VariationMachine.generate(S.sel.campaign(id), vmForm.qty, { channels: vmForm.channels.length ? vmForm.channels : camp.channels, styles: vmForm.styles });
      // aplica o modo escolhido
      if (/agendar|aprovar|publicar|regras/i.test(vmForm.mode)) window.PublishEngine.buildPlan(S.sel.campaign(id));
      U.toast(`${ids.length} variações criadas + plano de teste ✓`); window.App.render();
    });
    // Plano de Publicação — ações
    root.querySelectorAll("[data-plan]").forEach((el) => el.onclick = () => {
      const id = el.dataset.id, act = el.dataset.plan;
      if (act === "gen") { PE.buildPlan(S.sel.campaign(id)); U.toast("Plano gerado ✓"); }
      else if (act === "approve-all") { S.sel.cardsByCampaign(id).forEach((c) => PE.approve(c.id)); U.toast("Todos aprovados ✓"); }
      else if (act === "schedule") { S.sel.cardsByCampaign(id).forEach((c) => { if (c.publication && c.publication.approved && c.publication.date) PE.schedule(c.id); }); U.toast("Aprovados agendados ✓"); }
      else if (act === "clear") { U.confirm("Limpar o plano de publicação?", () => { S.sel.cardsByCampaign(id).forEach((c) => PE.setPub(c.id, { date: "", time: "", pubStatus: "Conteúdo gerado" })); U.toast("Plano limpo"); window.App.render(); }, { danger: true, yes: "Limpar" }); return; }
      window.App.render();
    });
    // Análise do Teste
    root.querySelectorAll("[data-test]").forEach((el) => el.onclick = () => {
      const id = el.dataset.id, act = el.dataset.test;
      if (act === "sim") { const pub = S.sel.cardsByCampaign(id).filter((c) => /Publicad/.test(PE.pubStatus(c))); if (!pub.length) { const any = S.sel.cardsByCampaign(id).slice(0, 5); any.forEach((c) => PE.collectMetrics(c.id)); U.toast("Métricas simuladas em " + any.length + " cards ✓"); } else { pub.forEach((c) => PE.collectMetrics(c.id)); U.toast("Métricas coletadas ✓"); } window.App.render(); }
      else if (act === "explode") { const win = window.VariationMachine.markWinner(id); if (!win) return U.toast("Simule/insira métricas primeiro (botão ao lado)", "warn"); const ids = window.VariationMachine.explodeWinner(win.id); U.toast(`Vencedor: ${win.title}. ${ids.length} novas variações ✓`); window.App.render(); }
    });
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
    if (boardView === "Produção") cols = st.statuses.map((s) => ({ name: s.name, cards: st.cards.filter((c) => c.status === s.name), color: s.color, drop: true, colmenu: true }));
    else if (boardView === "Semana") cols = WEEK_COLS.map((d, i) => ({ name: d, cards: st.cards.filter((c) => weekday(c.date) === i), color: "#3b82f6" }));
    else if (boardView === "Canal") cols = CHANNELS.map((ch) => ({ name: ch, cards: st.cards.filter((c) => c.channel === ch), color: "#a78bfa" }));
    else if (boardView === "Campanha") cols = st.campaigns.map((cp) => ({ name: cp.title, cards: S.sel.cardsByCampaign(cp.id), color: "#10b981" }));
    else if (boardView === "Calendário") return calendarView();

    const colsHTML = cols.map((col) => `
      <div class="board-col">
        <div class="board-col-head"><span class="bc-dot" style="background:${col.color}"></span><span class="bc-name">${esc(col.name)}</span><span class="bc-count">${col.cards.length}</span>${col.colmenu ? `<span class="x-btn" data-colmenu="${esc(col.name)}" style="width:24px;height:24px;font-size:13px">⋮</span>` : ""}</div>
        <div class="board-col-body" ${col.drop ? `data-drop="${esc(col.name)}"` : ""}>
          ${col.cards.map(miniCard).join("") || `<div class="muted" style="font-size:12px;text-align:center;padding:10px">—</div>`}
        </div>
      </div>`).join("") + (boardView === "Produção" ? `<div class="board-col" style="background:transparent;border-style:dashed;min-width:180px"><div class="board-col-body"><button class="btn btn-sm btn-block" data-act="add-column">+ Coluna</button></div></div>` : "");

    return `
      <div class="section-title"><span class="st-ico">📋</span><h2>Board</h2><span class="st-count">${st.cards.length} cards</span>
        <div class="st-actions"><button class="btn btn-primary btn-sm" data-act="new-card">+ Novo card</button></div></div>
      <div class="board-tabs">${tabs}</div>
      ${boardView === "Produção" ? `<p class="muted" style="margin-bottom:12px;font-size:12px">💡 Arraste os cards entre as colunas. Use ⋮ no card ou na coluna para mais ações.</p>` : ""}
      <div class="board">${colsHTML}</div>`;
  }

  function miniCard(c) {
    const camp = S.sel.campaign(c.campaignId);
    return `<div class="mini-card" draggable="true" data-card="${c.id}">
      <div class="flex" style="align-items:flex-start;gap:6px"><div class="mc-title" style="flex:1">${esc(c.title)}</div><span class="x-btn" data-cardmenu="${c.id}" title="Ações" style="width:24px;height:24px;font-size:13px">⋮</span></div>
      <div class="mc-meta"><span class="pill pill-gray">${esc(c.type)}</span> <span class="pill ${U.prioClass(c.priority)}" style="border-color:transparent;background:transparent;padding-left:0">● ${esc(c.priority)}</span>${c.potential ? ` <span class="pill ${c.potential === "Alto" ? "pill-accent" : c.potential === "Médio" ? "pill-amber" : "pill-gray"}">📈 ${esc(c.potential)}</span>` : ""}</div>
      <div class="mc-foot"><span class="avatar">${U.initials(c.responsible)}</span> ${esc(c.channel)}${camp ? " · " + esc(camp.title.slice(0, 16)) : ""}</div>
      ${c.publication && c.publication.date ? `<div class="mc-foot" style="margin-top:6px"><span class="pill ${pubPillClass(window.PublishEngine.pubStatus(c))}" style="font-size:10px">${esc(window.PublishEngine.pubStatus(c))}</span> <span class="muted">${esc(c.publication.date.split("-").reverse().slice(0, 2).join("/"))} ${esc(c.publication.time || "")}</span></div>` : ""}
      <div class="mc-progress"><span style="width:${c.progress}%"></span></div>
    </div>`;
  }
  function pubPillClass(s) { return { "Aprovado": "pill-accent", "Agendado": "pill-blue", "Publicado": "pill-accent", "Publicado manualmente": "pill-accent", "Publicando": "pill-purple", "Aguardando aprovação": "pill-amber", "Falha na publicação": "pill-red", "Em análise": "pill-blue" }[s] || "pill-gray"; }

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
    root.querySelectorAll("[data-act='add-column']").forEach((el) => el.onclick = () => window.App.addColumn());
    root.querySelectorAll("[data-cardmenu]").forEach((el) => el.onclick = (e) => { e.stopPropagation(); window.App.cardMenu(el.dataset.cardmenu); });
    root.querySelectorAll("[data-colmenu]").forEach((el) => el.onclick = (e) => { e.stopPropagation(); window.App.columnMenu(el.dataset.colmenu); });
    root.querySelectorAll("[data-card]").forEach((el) => {
      el.addEventListener("click", (e) => { if (e.target.closest("[data-cardmenu]")) return; if (!el.classList.contains("dragging")) window.App.openCard(el.dataset.card); });
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
          <div class="x-btn" data-libmenu="${l.id}" title="Ações">⋮</div></div>
        <div class="ic-desc">${esc(l.content)}</div>
        <div class="ic-foot">${(l.tags || []).map((t) => `<span class="pill pill-gray">#${esc(t)}</span>`).join("")}
          <button class="btn btn-xs" data-libcopy="${l.id}" style="margin-left:auto">Copiar</button>
          <button class="btn btn-xs btn-primary" data-reuse="${l.id}">Reutilizar</button></div>
      </div>`).join("");
    return `
      <div class="section-title"><span class="st-ico">📚</span><h2>Biblioteca</h2><span class="st-count">${st.library.length} itens reutilizáveis</span>
        <div class="st-actions"><button class="btn btn-primary btn-sm" data-act="new-lib">+ Adicionar</button></div></div>
      <p class="muted" style="margin-bottom:14px">Ganchos, roteiros, CTAs, legendas, cenas de retenção, públicos, criativos e aprendizados. Reutilize em cards e campanhas — a IA também consulta a biblioteca ao gerar conteúdo.</p>
      <div class="lib-cats">${catsHTML}</div>
      <div class="grid grid-auto">${cardsHTML || emptyState("📚", "Nada nesta categoria", "")}</div>`;
  }
  function bindBiblioteca(root) {
    root.querySelectorAll("[data-libcat]").forEach((el) => el.onclick = () => { libCat = el.dataset.libcat; window.App.render(); });
    root.querySelectorAll("[data-libmenu]").forEach((el) => el.onclick = (e) => { e.stopPropagation(); window.App.libMenu(el.dataset.libmenu); });
    root.querySelectorAll("[data-reuse]").forEach((el) => el.onclick = () => window.App.reuseLibrary(el.dataset.reuse));
    root.querySelectorAll("[data-libcopy]").forEach((el) => el.onclick = () => { const l = S.get().library.find((x) => x.id === el.dataset.libcopy); try { navigator.clipboard.writeText((l.title + "\n" + l.content)); } catch (e) {} U.toast("Copiado ✓"); });
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
      </div>
      <div class="info-block" style="margin-top:16px"><h4>👥 Inteligência de público</h4>
        <p class="muted" style="margin-bottom:10px">A partir do seu público, a IA gera subpúblicos com dor, desejo, linguagem, gancho e CTA — para criar variações de vídeo por público.</p>
        <button class="btn btn-primary btn-sm" data-act="gen-branches">✨ Gerar subpúblicos com IA</button>
        <div id="branch-out" style="margin-top:14px"></div>
      </div>`;
  }
  function bindPersona(root) {
    root.querySelectorAll("[data-act='edit-persona']").forEach((el) => el.onclick = () => window.App.openPersonaForm());
    root.querySelectorAll("[data-act='gen-branches']").forEach((el) => el.onclick = () => {
      const branches = window.AI.generateAudienceBranches(S.get().persona.audience);
      const out = root.querySelector("#branch-out");
      out.innerHTML = branches.map((b, i) => `
        <div class="scene-card">
          <div class="scene-top"><span class="pill pill-accent">${esc(b.name)}</span><span class="pill pill-gray">${esc(b.videoType)}</span><span class="pill pill-blue">${esc(b.platform)}</span></div>
          <div class="kv" style="margin-top:4px"><div class="k">Dor</div><div class="v">${esc(b.pain)}</div><div class="k">Desejo</div><div class="v">${esc(b.desire)}</div><div class="k">Linguagem</div><div class="v">${esc(b.language)}</div><div class="k">Gancho</div><div class="v">${esc(b.hook)}</div><div class="k">CTA</div><div class="v">${esc(b.cta)}</div></div>
          <button class="btn btn-xs mt-16" data-savebranch="${i}">💾 Salvar na biblioteca</button>
        </div>`).join("");
      out.querySelectorAll("[data-savebranch]").forEach((bt) => bt.onclick = () => { const b = branches[+bt.dataset.savebranch]; S.actions.addLibrary({ type: "Públicos/subpúblicos", title: b.name, content: `Dor: ${b.pain}. Desejo: ${b.desire}. Gancho: ${b.hook}. CTA: ${b.cta}. Plataforma: ${b.platform}.`, tags: ["público"] }); U.toast("Subpúblico salvo ✓"); });
      U.toast(branches.length + " subpúblicos gerados ✓");
    });
  }

  // ============================================================
  // CONFIGURAÇÕES
  // ============================================================
  let setTab = "Conta";
  function config() {
    const st = S.get();
    const tabs = ["Conta", "IA e APIs", "Aprendizados", "Equipe", "Créditos de IA", "Integrações", "Status personalizados", "Notificações"];
    const nav = tabs.map((t) => `<div class="set-nav-item ${t === setTab ? "active" : ""}" data-settab="${esc(t)}">${esc(t)}</div>`).join("");
    let panel = "";
    if (setTab === "Conta") panel = `
      <div class="info-block"><h4>👤 Conta</h4>
        <div class="field"><label>Nome</label><input class="input" value="${esc(st.user.name)}" data-setuser="name"/></div>
        <div class="field"><label>Email</label><input class="input" value="${esc(st.user.email)}" disabled/></div>
        <div class="field"><label>Papel</label><input class="input" value="${esc(st.user.role)}" disabled/></div>
      </div>
      <div class="info-block"><h4>💾 Dados</h4>
        <p class="muted" style="font-size:12px;margin-bottom:10px">Seus dados ficam salvos no navegador (localStorage). Exporte para backup ou importe em outro dispositivo.</p>
        <div class="flex gap-8 wrap"><button class="btn btn-sm" data-act="export-json">⬇️ Exportar JSON</button><button class="btn btn-sm" data-act="import-json">⬆️ Importar JSON</button></div>
      </div>
      <button class="btn btn-danger" data-act="reset-data">Restaurar dados de exemplo</button>`;
    else if (setTab === "IA e APIs") panel = aiPanel();
    else if (setTab === "Aprendizados") panel = learningPanel();
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
    const it = S.get().integrations;
    const stPill = (s) => ({ "conectado": "pill-accent", "conectando": "pill-amber", "erro": "pill-red", "em breve": "pill-gray" }[s] || "pill-gray");
    return `
      <div class="alert good" style="margin-bottom:14px"><span class="al-ico">🔌</span><div class="al-body" style="font-size:12px">Publicação automática em <b>modo simulado</b>. Estrutura pronta para integração real. Algumas contas exigem publicação manual ou aprovação final na plataforma.</div></div>
      <div class="info-block"><h4>📱 Meta (Instagram e Facebook)</h4>
        <div class="status-row"><span class="status-color" style="background:#3b82f6"></span><div style="flex:1"><b style="color:var(--text-0)">Conta Meta</b><div class="muted" style="font-size:12px">${it.meta.status === "conectado" ? esc(it.meta.ig + " · " + it.meta.fb) : "Instagram + Facebook"}</div></div><span class="pill ${stPill(it.meta.status)}">${esc(it.meta.status)}</span></div>
        <div class="flex gap-8 wrap mt-16">
          ${it.meta.status === "conectado"
            ? `<button class="btn btn-sm" data-intg="test:meta">Testar publicação</button><button class="btn btn-sm" data-intg="sync:meta">Sincronizar posts</button><button class="btn btn-sm btn-danger" data-intg="disc:meta">Desconectar</button>`
            : `<button class="btn btn-sm btn-primary" data-intg="conn:meta">Conectar Meta</button>`}
        </div>
      </div>
      <div class="info-block"><h4>🎵 TikTok</h4>
        <div class="status-row"><span class="status-color" style="background:#ec4899"></span><div style="flex:1"><b style="color:var(--text-0)">Conta TikTok</b><div class="muted" style="font-size:12px">${it.tiktok.status === "conectado" ? esc(it.tiktok.note || "Envio para revisão disponível") : "Publicação direta pode exigir envio para revisão"}</div></div><span class="pill ${stPill(it.tiktok.status)}">${esc(it.tiktok.status)}</span></div>
        <div class="flex gap-8 wrap mt-16">
          ${it.tiktok.status === "conectado"
            ? `<button class="btn btn-sm" data-intg="test:tiktok">Testar envio</button><button class="btn btn-sm" data-intg="sync:tiktok">Sincronizar vídeos</button><button class="btn btn-sm btn-danger" data-intg="disc:tiktok">Desconectar</button>`
            : `<button class="btn btn-sm btn-primary" data-intg="conn:tiktok">Conectar TikTok</button>`}
        </div>
      </div>
      <div class="info-block mb-0"><h4>▶️ YouTube Shorts</h4>
        <div class="status-row"><span class="status-color" style="background:#ef4444"></span><div style="flex:1"><b style="color:var(--text-0)">YouTube</b><div class="muted" style="font-size:12px">Estrutura preparada para o futuro</div></div><span class="pill pill-gray">em breve</span></div>
      </div>`;
  }

  function aiPanel() {
    const ai = S.get().ai || {};
    const real = ai.provider === "Claude Real";
    const stMap = { conectado: ["pill-accent", "Claude conectado"], simulado: ["pill-amber", "Modo simulado ativo"], conectando: ["pill-blue", "Conectando…"], offline: ["pill-red", "Backend offline"], sem_chave: ["pill-red", "Chave ausente no backend"], erro: ["pill-red", "Erro na resposta"] };
    const [stCls, stTxt] = stMap[ai.status] || ["pill-gray", ai.status || "—"];
    return `
      <div class="info-block"><h4>🤖 IA Principal</h4>
        <div class="field"><label>Modo</label><select class="select" data-ai="provider"><option ${!real ? "selected" : ""}>Modo Simulado</option><option ${real ? "selected" : ""}>Claude Real</option></select></div>
        <div id="ai-real-fields" style="${real ? "" : "display:none"}">
          <div class="field"><label>URL do backend</label><input class="input" data-ai="backendUrl" value="${esc(ai.backendUrl || "")}" placeholder="http://localhost:3000 (vazio = mesma origem)"/><div class="muted" style="font-size:11px;margin-top:4px">Deixe em branco se abrir pelo próprio backend, ou informe só a origem (<code>http://localhost:3000</code>). Se colar a URL completa (<code>http://localhost:3000/api/ai/claude</code>) por engano, também funciona.</div></div>
          <div class="form-row"><div class="field"><label>Modelo Claude</label><select class="select" data-ai="model">${["claude-opus-5", "claude-sonnet-5", "claude-haiku-4-5-20251001"].map((m) => `<option ${m === ai.model ? "selected" : ""}>${m}</option>`).join("")}</select></div><div class="field"><label>Temperatura</label><input class="input" type="number" step="0.1" min="0" max="1" data-ai="temperature" value="${ai.temperature}"/></div></div>
          <div class="field"><label>Máx. tokens</label><input class="input" type="number" data-ai="maxTokens" value="${ai.maxTokens}"/></div>
        </div>
        <div class="flex gap-8 center wrap" style="margin-top:6px"><span class="pill ${stCls}" id="ai-status-pill">${esc(stTxt)}</span><button class="btn btn-sm" data-act="ai-test">Testar conexão</button><button class="btn btn-primary btn-sm" data-act="ai-save">Salvar configuração</button><button class="btn btn-sm" data-act="ai-simulated">Voltar ao simulado</button></div>
        <div class="alert warn" style="margin-top:12px"><span class="al-ico">🔐</span><div class="al-body" style="font-size:12px">A chave <code>ANTHROPIC_API_KEY</code> deve ficar <b>no backend</b>. Não exponha chave no navegador.</div></div>
      </div>
      <div class="info-block mb-0"><h4>🔌 Como ligar o Claude real</h4>
        <p class="muted" style="font-size:12px;line-height:1.6"><code style="color:var(--accent-2)">Frontend → /api/ai/claude → Claude API</code>. Rode o backend em <code>server/</code> (<code>npm install && npm start</code> com a <code>ANTHROPIC_API_KEY</code> no <code>.env</code>), abra o app por <code>http://localhost:3000</code>, escolha <b>Claude Real</b> aqui e <b>Testar conexão</b>. Sem backend/chave, tudo funciona em <b>modo simulado</b> (mock) automaticamente. Todas as gerações passam pelo <code>AIProviderService</code>.</p>
      </div>`;
  }

  function learningPanel() {
    const L = window.Learning.all();
    const p = L.preferences || {};
    const chip = (arr, cls) => (arr || []).slice(0, 6).map((x) => `<span class="pill ${cls}">${esc(String(x).slice(0, 40))}</span>`).join(" ") || '<span class="muted">—</span>';
    const items = L.approvals.slice(0, 12).map((a) => `<div class="status-row"><span class="pill ${a.status === "approved" ? "pill-accent" : a.status === "rejected" ? "pill-red" : "pill-blue"}">${esc(a.status)}</span><div style="flex:1"><b style="color:var(--text-0)">${esc(a.type || "item")}</b><div class="muted" style="font-size:11px">${esc((a.finalContent || a.originalContent || a.insight || a.reason || "").slice(0, 70))}</div></div><span class="x-btn" data-lforget="${a.id}" title="Esquecer">🗑️</span></div>`).join("");
    return `
      <div class="info-block"><h4>🧠 Aprendizados da operação</h4>
        <p class="muted" style="font-size:12px;margin-bottom:10px">O Viraliza aprende com o que você aprova, rejeita, edita e com o desempenho — e usa isso ao gerar novos conteúdos.</p>
        <div class="kv">
          <div class="k">Ganchos aprovados</div><div class="v">${chip(p.approvedHooks, "pill-accent")}</div>
          <div class="k">CTAs aprovados</div><div class="v">${chip(p.approvedCTAs, "pill-accent")}</div>
          <div class="k">Evitar (rejeitados)</div><div class="v">${chip(p.rejectedReasons, "pill-red")}</div>
          <div class="k">Formatos vencedores</div><div class="v">${chip(p.winningFormats, "pill-accent")}</div>
        </div>
      </div>
      <div class="info-block mb-0"><h4>📜 Histórico de aprendizado <span class="st-count">${L.approvals.length}</span></h4>
        ${items || '<p class="muted" style="font-size:12px">Nada ainda. Aprove/rejeite roteiros e insira métricas para o sistema aprender.</p>'}
      </div>`;
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
    root.querySelectorAll("[data-intg]").forEach((el) => el.onclick = () => {
      const [act, plat] = el.dataset.intg.split(":"); const PE = window.PublishEngine;
      if (act === "conn") PE.connect(plat);
      else if (act === "disc") { PE.disconnect(plat); window.App.render(); }
      else if (act === "test") U.toast("Teste enviado (simulado) ✓");
      else if (act === "sync") U.toast("Sincronização concluída (simulado) ✓");
    });
    root.querySelectorAll("[data-act='buy-credits']").forEach((el) => el.onclick = () => window.App.buyCredits());
    root.querySelectorAll("[data-act='reset-data']").forEach((el) => el.onclick = () => U.confirm("Isso vai apagar suas alterações e restaurar os dados de exemplo. Continuar?", () => { S.reset(); U.toast("Dados restaurados"); location.hash = "#/hoje"; window.App.render(); }, { danger: true, yes: "Restaurar" }));
    const setUser = root.querySelector("[data-setuser]"); if (setUser) setUser.onchange = () => S.update((s) => s.user.name = setUser.value);
    root.querySelectorAll("[data-delstatus]").forEach((el) => el.onclick = () => { S.actions.deleteStatus(el.dataset.delstatus); U.toast("Status removido"); });
    const addStatus = root.querySelector("[data-act='add-status']");
    if (addStatus) addStatus.onclick = () => { const n = root.querySelector("#new-status-name").value.trim(); const c = root.querySelector("#new-status-color").value; if (!n) return U.toast("Digite um nome", "warn"); S.actions.addStatus(n, c); U.toast("Status adicionado"); };
    // IA e APIs
    root.querySelectorAll("[data-ai]").forEach((el) => el.onchange = () => {
      S.update((s) => { s.ai[el.dataset.ai] = el.type === "number" ? +el.value : el.value; });
      if (el.dataset.ai === "provider") { const rf = root.querySelector("#ai-real-fields"); if (rf) rf.style.display = el.value === "Claude Real" ? "" : "none"; S.update((s) => { s.ai.status = el.value === "Claude Real" ? "conectando" : "simulado"; }); }
    });
    root.querySelectorAll("[data-act='ai-test']").forEach((el) => el.onclick = async () => {
      const ai = S.get().ai;
      if (ai.provider !== "Claude Real") return U.toast("Selecione “Claude Real” para testar o backend", "warn");
      const pill = root.querySelector("#ai-status-pill"); if (pill) { pill.textContent = "Conectando…"; pill.className = "pill pill-blue"; }
      const st = await window.AIProvider.status();
      if (!st.success) { S.update((s) => s.ai.status = "offline"); U.toast("Backend offline em " + (window.AIProvider.base() || "mesma origem"), "warn"); window.App.render(); return; }
      if (!st.configured) { S.update((s) => s.ai.status = "sem_chave"); U.toast("Backend OK, mas sem ANTHROPIC_API_KEY — modo simulado", "warn"); window.App.render(); return; }
      const t = await window.AIProvider.testConnection();
      S.update((s) => s.ai.status = t.success ? "conectado" : "erro");
      U.toast(t.success ? "Claude conectado ✓" : ("Erro: " + ((t.error && t.error.message) || "")), t.success ? "" : "warn");
      window.App.render();
    });
    root.querySelectorAll("[data-act='ai-save']").forEach((el) => el.onclick = async () => {
      const ai = S.get().ai;
      if (ai.provider === "Claude Real") { const st = await window.AIProvider.status(); S.update((s) => s.ai.status = !st.success ? "offline" : !st.configured ? "sem_chave" : "conectado"); }
      else S.update((s) => s.ai.status = "simulado");
      U.toast("Configuração de IA salva ✓"); window.App.render();
    });
    root.querySelectorAll("[data-act='ai-simulated']").forEach((el) => el.onclick = () => { S.update((s) => { s.ai.provider = "Modo Simulado"; s.ai.status = "simulado"; }); U.toast("Voltou ao modo simulado"); window.App.render(); });
    // Aprendizados
    root.querySelectorAll("[data-lforget]").forEach((el) => el.onclick = () => { window.Learning.forget(el.dataset.lforget); U.toast("Aprendizado esquecido"); window.App.render(); });
    // Export / Import
    root.querySelectorAll("[data-act='export-json']").forEach((el) => el.onclick = () => window.App.exportData());
    root.querySelectorAll("[data-act='import-json']").forEach((el) => el.onclick = () => window.App.importData());
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
