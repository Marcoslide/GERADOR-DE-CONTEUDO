/* ============================================================
   VIRALIZA — Card detalhado (5 abas)
   Executar · Roteiro · Conteúdo · Checklist · Análise e Correção
   ============================================================ */
window.CardView = (function () {
  const S = window.Store, U = window.UI, AI = window.AI, esc = U.esc, fmt = U.fmt, pill = U.statusPill;
  let cardId = null, tab = "Executar";

  const TABS = ["Executar", "Roteiro", "Conteúdo", "Checklist", "Publicação", "Análise e Correção"];
  const METHODS = ["Promessa Forte", "Gancho de Retenção", "Dor e Solução", "Antes e Depois", "Prova Social", "Review", "Demonstração", "Comparação", "Unboxing", "Oferta Clara", "Urgência", "Bastidor de Autoridade", "Resposta a Comentário", "Quebra de Objeção", "Conteúdo de Rua", "Produto no Dia a Dia", "Transformação", "Comunidade e Desejo", "Frases de Corte", "Volume e Distribuição", "Teste de Variações"];
  const METHOD_ICO = { "Promessa Forte": "🎯", "Gancho de Retenção": "🪝", "Dor e Solução": "💢", "Antes e Depois": "🔄", "Prova Social": "👥", "Review": "⭐", "Demonstração": "🧪", "Comparação": "⚖️", "Unboxing": "📦", "Oferta Clara": "🏷️", "Urgência": "⏰", "Bastidor de Autoridade": "🎬", "Resposta a Comentário": "💬", "Quebra de Objeção": "🛡️", "Conteúdo de Rua": "🏙️", "Produto no Dia a Dia": "🏠", "Transformação": "✨", "Comunidade e Desejo": "❤️", "Frases de Corte": "✂️", "Volume e Distribuição": "📡", "Teste de Variações": "🧬" };

  const VIDEO_TYPES = ["Produto em destaque", "Antes e depois", "Ambiente decorado", "Oferta rápida", "Vídeo de afiliado", "Review", "Anúncio", "Story", "Marketplace", "Live Shop", "Prova social", "Transformação"];
  const TEMPLATES = ["Zoom lento no produto", "Produto entrando em cena", "Ambiente antes e depois", "Destaque de benefício", "Oferta com CTA", "Comparação", "Demonstração visual", "Vídeo UGC simulado", "Produto em uso", "Chamada para live"];
  const CORRECTION_REASONS = ["Gancho fraco", "Produto apareceu tarde", "CTA fraco", "Vídeo longo", "Áudio ruim", "Imagem ruim", "Promessa confusa", "Faltou prova", "Faltou oferta", "Pouca emoção", "Público errado", "Canal errado", "Legenda fraca", "Baixa conversão", "Baixa retenção"];

  function open(id) { cardId = id; tab = "Executar"; render(); }
  function card() { return S.sel.card(cardId); }

  function render() {
    const c = card();
    if (!c) return U.closeModal();
    const chkDone = c.checklist.flatMap((g) => g.items).filter((i) => i.done).length;
    const chkTotal = c.checklist.flatMap((g) => g.items).length;
    const counts = { "Análise e Correção": c.corrections.length || null, "Checklist": `${chkDone}/${chkTotal}` };
    const tabsHTML = TABS.map((t) => `<div class="drawer-tab ${t === tab ? "active" : ""}" data-tab="${t}">${t}${counts[t] != null ? `<span class="dt-count">${counts[t]}</span>` : ""}</div>`).join("");

    const body = `
      <div style="margin:-22px -22px 0">
        <div class="drawer-tabs">${tabsHTML}</div>
        <div style="padding:22px" id="card-tab-body">${renderTab(c)}</div>
      </div>`;

    const camp = S.sel.campaign(c.campaignId);
    U.modal({
      title: c.title, size: "wide", body,
      foot: `<div style="margin-right:auto;display:flex;gap:8px;align-items:center" class="wrap">${pill(c.status)} <span class="muted">${camp ? esc(camp.title) : ""}</span></div>
        <button class="btn btn-ghost btn-sm" data-cardact="delete">Excluir</button>
        <button class="btn btn-primary btn-sm" data-cardact="ai">✦ Assistente do card</button>`,
      onMount: bind,
    });
  }

  function bind(root) {
    root.querySelectorAll("[data-tab]").forEach((el) => el.onclick = () => { tab = el.dataset.tab; refreshBody(); root.querySelectorAll("[data-tab]").forEach((x) => x.classList.toggle("active", x.dataset.tab === tab)); });
    root.querySelector("[data-cardact='ai']").onclick = () => U.openChatContext();
    root.querySelector("[data-cardact='delete']").onclick = () => U.confirm("Excluir este card?", () => { S.actions.deleteCard(cardId); U.closeModal(); U.toast("Card excluído"); window.App.render(); }, { danger: true, yes: "Excluir" });
    bindTab(root);
  }

  function refreshBody() {
    const el = document.getElementById("card-tab-body");
    if (el) { el.innerHTML = renderTab(card()); bindTab(document.getElementById("modal-overlay")); }
  }

  // ------------------------------------------------------------
  function renderTab(c) {
    switch (tab) {
      case "Executar": return tExecutar(c);
      case "Roteiro": return tRoteiro(c);
      case "Conteúdo": return tConteudo(c);
      case "Checklist": return tChecklist(c);
      case "Publicação": return tPublicacaoTab(c);
      case "Análise e Correção": return tAnaliseCorrecao(c);
    }
  }

  // ---------- PUBLICAÇÃO ----------
  function tPublicacaoTab(c) {
    const PE = window.PublishEngine;
    const p = c.publication || {};
    const st = PE.pubStatus(c);
    const approval = p.approval || PE.APPROVAL_ITEMS.map((t) => ({ t, done: !!p.approved }));
    const doneN = approval.filter((i) => i.done).length;
    const PUB_STATUS = ["Rascunho", "Conteúdo gerado", "Aguardando aprovação", "Aprovado", "Agendado", "Publicando", "Publicado", "Publicado manualmente", "Falha na publicação", "Em análise"];
    return `
      <div class="grid grid-2" style="align-items:start">
        <div>
          <div class="info-block"><h4>✅ Checklist de aprovação <span class="chk-prog" style="margin-left:auto">${doneN}/${approval.length}</span></h4>
            ${approval.map((i, ii) => `<div class="chk-item"><div class="chk-box ${i.done ? "done" : ""}" data-appr="${ii}">${i.done ? "✓" : ""}</div><div class="ci-text ${i.done ? "done" : ""}">${esc(i.t)}</div></div>`).join("")}
            <button class="btn btn-primary btn-sm mt-16" data-ca="pub-approve">✓ Aprovar para publicação</button>
          </div>
          <div class="info-block mb-0"><h4>📤 Status</h4>
            <div class="flex gap-8 center wrap" style="margin-bottom:10px">${pill(st)} ${p.publishedAt ? `<span class="muted">${esc(p.publishedAt)}</span>` : ""}</div>
            <div class="flex gap-8 wrap">
              <button class="btn btn-sm" data-ca="pub-schedule">📅 Agendar</button>
              <button class="btn btn-sm btn-primary" data-ca="pub-now">🚀 Publicar agora</button>
              <button class="btn btn-sm" data-ca="pub-manual">✍️ Marcar publicado manualmente</button>
              <button class="btn btn-sm" data-ca="pub-metrics">📊 Coletar métricas</button>
            </div>
          </div>
        </div>
        <div>
          <div class="info-block"><h4>🗓️ Agendamento</h4>
            <div class="kv">
              <div class="k">Canal</div><div class="v">${selChannel(p.channel || c.channel, "pub.channel")}</div>
              <div class="k">Data / hora</div><div class="v"><div class="flex gap-8"><input class="input" type="date" data-p="date" value="${esc(p.date || "")}"/><input class="input" type="time" data-p="time" value="${esc(p.time || "")}" style="max-width:120px"/></div></div>
              <div class="k">Modo</div><div class="v"><span class="pill pill-gray">${esc(p.mode || (S.sel.campaign(c.campaignId) || {}).publishMode || "Automático com aprovação")}</span></div>
              <div class="k">Status</div><div class="v"><select class="select" data-pubstatus>${PUB_STATUS.map((s) => `<option ${s === st ? "selected" : ""}>${esc(s)}</option>`).join("")}</select></div>
            </div>
          </div>
          <div class="info-block mb-0"><h4>✍️ Conteúdo da publicação</h4>
            <div class="field"><label>Legenda final</label><textarea class="textarea" data-p="captionFinal">${esc(p.captionFinal || c.script.caption || "")}</textarea></div>
            <div class="field"><label>Hashtags</label><textarea class="textarea" data-p="hashtagsFinal" style="min-height:50px">${esc(p.hashtagsFinal || c.script.hashtags || "")}</textarea></div>
            <div class="field"><label>CTA</label><input class="input" data-p="ctaFinal" value="${esc(p.ctaFinal || c.script.cta || "")}"/></div>
            <div class="field mb-0"><label>🔗 Link publicado</label><input class="input" data-p="link" value="${esc(p.link || "")}" placeholder="Gerado ao publicar (ou cole o seu)"/></div>
            <div class="flex gap-8 wrap" style="margin-top:12px"><button class="btn btn-xs" data-ca="copy-caption">📋 Copiar legenda</button><button class="btn btn-xs" data-ca="copy-hashtags">📋 Copiar hashtags</button><button class="btn btn-xs" data-sim="Baixar vídeo">⬇️ Baixar vídeo</button></div>
          </div>
        </div>
      </div>`;
  }

  // ---------- EXECUTAR (resumo + estratégia IA + visual + ações) ----------
  function tExecutar(c) {
    const camp = S.sel.campaign(c.campaignId);
    const s = c.strategy || {};
    const v = c.visual || {};
    const origin = c.originCardId ? S.sel.card(c.originCardId) : null;
    const potCls = { "Alto": "pill-accent", "Médio": "pill-amber", "Baixo": "pill-gray" }[c.potential] || "pill-gray";
    return `
      ${origin ? `<div class="alert info" style="margin-bottom:14px"><span class="al-ico">🛠️</span><div class="al-body" style="font-size:12px">Card de correção de <b>${esc(origin.title)}</b>${c.correctionReason ? " · motivo: " + esc(c.correctionReason) : ""}</div></div>` : ""}
      ${c.potential || c.origin ? `<div class="alert good" style="margin-bottom:14px"><span class="al-ico">${c.potential ? "📈" : "🔎"}</span><div class="al-body" style="font-size:12px">${c.potential ? `<span class="pill ${potCls}">Potencial: ${esc(c.potential)}</span> ${esc(c.potentialReason || "")}` : ""}${c.origin ? `<div class="muted" style="margin-top:4px">Origem: ${esc(c.origin)}${c.basis ? " · " + esc(c.basis) : ""}</div>` : ""}</div></div>` : ""}
      <div class="grid" style="grid-template-columns:1fr 1fr;align-items:start">
        <div>
          <div class="info-block"><h4>⚡ Próxima ação</h4>
            <div class="kv">
              <div class="k">O que fazer agora</div><div class="v"><input class="input" data-f="nextAction" value="${esc(c.nextAction || "")}"/></div>
              <div class="k">Status</div><div class="v">${selStatus(c.status)}</div>
              <div class="k">Canal</div><div class="v">${selChannel(c.channel, "channel")}</div>
              <div class="k">Data / hora</div><div class="v"><div class="flex gap-8"><input class="input" type="date" data-f="date" value="${esc(c.date || "")}"/><input class="input" type="time" data-f="time" value="${esc(c.time || "")}" style="max-width:120px"/></div></div>
              <div class="k">Responsável</div><div class="v"><input class="input" data-f="responsible" value="${esc(c.responsible || "")}"/></div>
            </div>
            <div class="flex-between" style="margin:12px 0 6px"><span class="muted">Checklist</span><b class="text-accent">${c.progress || 0}%</b></div>
            <div class="bar"><span style="width:${c.progress || 0}%"></span></div>
          </div>
          <div class="info-block mb-0"><h4>🚀 Ações</h4>
            <div class="grid" style="grid-template-columns:1fr 1fr;gap:8px">
              <button class="btn btn-sm" data-ca="record" style="justify-content:flex-start">🎥 Gravar agora</button>
              <button class="btn btn-sm" data-ca="upload-gallery" style="justify-content:flex-start">📤 Enviar vídeo</button>
              <button class="btn btn-sm" data-ca="gen-ai" style="justify-content:flex-start">✨ Gerar vídeo IA</button>
              <button class="btn btn-sm" data-ca="analyze" style="justify-content:flex-start">🔍 Analisar</button>
              <button class="btn btn-sm" data-ca="correction" style="justify-content:flex-start">🛠️ Criar correção</button>
              <button class="btn btn-sm" data-ca="published" style="justify-content:flex-start">✅ Publicado</button>
            </div>
          </div>
        </div>
        <div>
          <div class="info-block"><h4>🎯 Estratégia sugerida pela IA</h4>
            <div class="kv">
              <div class="k">Objetivo</div><div class="v"><input class="input" data-s="objective" value="${esc(s.objective || "")}"/></div>
              <div class="k">Ângulo</div><div class="v"><input class="input" data-s="angle" value="${esc(s.angle || c.type || "")}"/></div>
              <div class="k">Público</div><div class="v"><input class="input" data-s="audience" value="${esc(s.audience || "")}"/></div>
              <div class="k">Emoção</div><div class="v"><input class="input" data-s="emotion" value="${esc(s.emotion || "")}"/></div>
              <div class="k">Promessa</div><div class="v"><input class="input" data-s="promise" value="${esc(s.promise || "")}"/></div>
              <div class="k">CTA</div><div class="v"><input class="input" data-s="cta" value="${esc(s.cta || "")}"/></div>
            </div>
            <div class="flex gap-8 wrap" style="margin-top:12px">
              <button class="btn btn-xs" data-ca="new-strategy">🔁 Pedir nova estratégia</button>
              <button class="btn btn-xs" data-ca="strategy-to-script">→ Aplicar no roteiro</button>
            </div>
          </div>
          <div class="info-block mb-0"><h4>🎬 Visual do vídeo <span class="muted" style="font-weight:400">(gerado pela IA)</span></h4>
            ${Object.keys(v).length ? `<div class="kv">
              <div class="k">Roupa</div><div class="v"><input class="input" data-v="roupa" value="${esc(v.roupa || "")}"/></div>
              <div class="k">Cores</div><div class="v"><input class="input" data-v="cor" value="${esc(v.cor || "")}"/></div>
              <div class="k">Ambiente</div><div class="v"><input class="input" data-v="ambiente" value="${esc(v.ambiente || "")}"/></div>
              <div class="k">Enquadramento</div><div class="v"><input class="input" data-v="enquadramento" value="${esc(v.enquadramento || "")}"/></div>
              <div class="k">Iluminação</div><div class="v"><input class="input" data-v="iluminacao" value="${esc(v.iluminacao || "")}"/></div>
              <div class="k">Objetos</div><div class="v"><input class="input" data-v="objetos" value="${esc(v.objetos || "")}"/></div>
              <div class="k">Produto aparece</div><div class="v"><input class="input" data-v="momentoProduto" value="${esc(v.momentoProduto || "")}"/></div>
              <div class="k">Energia da fala</div><div class="v"><input class="input" data-v="energia" value="${esc(v.energia || "")}"/></div>
            </div>` : `<p class="muted" style="margin-bottom:10px">Ainda sem direção de visual.</p>`}
            <button class="btn btn-xs mt-16" data-ca="gen-visual">✨ ${Object.keys(v).length ? "Gerar novo visual" : "Gerar visual com IA"}</button>
          </div>
        </div>
      </div>`;
  }

  // ---------- ANÁLISE E CORREÇÃO (fusão) ----------
  function tAnaliseCorrecao(c) {
    const a = c.analysis || {};
    const m = a.metrics || {};
    const p = c.publication || {};
    const fields = [["views", "Views"], ["retention", "Retenção"], ["likes", "Curtidas"], ["comments", "Coment."], ["saves", "Salvos"], ["clicks", "Cliques"], ["sales", "Vendas"], ["conversion", "Conversão"]];
    const inputs = fields.map(([k, l]) => `<div class="field mb-0"><label>${l}</label><input class="input" data-m="${k}" value="${esc(m[k] != null ? m[k] : "")}"/></div>`).join("");
    const versions = (c.video && c.video.versions || []);
    const cor = c.corrections || [];
    const linked = S.get().cards.filter((x) => x.originCardId === c.id);
    return `
      <div class="grid" style="grid-template-columns:1fr 1fr;align-items:start">
        <div class="info-block"><h4>📊 Métricas ${a.done ? "" : "(inserir)"}</h4>
          <div class="grid" style="grid-template-columns:1fr 1fr;gap:10px">${inputs}</div>
          <div class="field mb-0" style="margin-top:12px"><label>🔗 Link publicado</label><input class="input" data-p="link" placeholder="Cole o link do post" value="${esc(p.link || "")}"/></div>
          <button class="btn btn-primary btn-sm mt-16" data-ca="save-metrics">💾 Salvar e analisar</button>
        </div>
        <div>
          ${a.done && a.summary ? `<div class="info-block"><h4>🤖 Diagnóstico da IA</h4>
            <div class="analysis-row"><span class="ar-ico">✅</span><div><b style="color:var(--text-0)">Funcionou:</b> ${esc(a.summary.worked)}</div></div>
            <div class="analysis-row"><span class="ar-ico">⚠️</span><div><b style="color:var(--text-0)">Corrigir:</b> ${esc(a.summary.fix)}</div></div>
            <div class="analysis-row"><span class="ar-ico">🧬</span><div><b style="color:var(--text-0)">Variação:</b> ${esc(a.summary.variation)}</div></div>
          </div>` : `<div class="empty" style="padding:24px"><div class="e-ico">📊</div><h3>Sem análise ainda</h3><p>Insira as métricas para a IA gerar o diagnóstico.</p></div>`}
        </div>
      </div>

      <div class="section-title" style="margin-top:6px"><span class="st-ico">🛠️</span><h2>Correção</h2></div>
      <div class="grid grid-2" style="align-items:start">
        <div class="info-block"><h4>✏️ Correção no mesmo card <span class="muted" style="font-weight:400">(variação pequena)</span></h4>
          <p class="muted" style="font-size:12px;margin-bottom:10px">Trocar gancho, CTA, cortar início, melhorar legenda ou texto na tela — sem regravar.</p>
          <button class="btn btn-sm" data-ca="quick-correction">🤖 Gerar correção sugerida</button>
          <div id="quick-cor-box"></div>
        </div>
        <div class="info-block"><h4>🎬 Novo card de correção <span class="muted" style="font-weight:400">(regravar/nova peça)</span></h4>
          <p class="muted" style="font-size:12px;margin-bottom:10px">Regravar, novo criativo, outro ângulo ou público. Nasce vinculado a este card.</p>
          <div class="field"><label>Motivo</label><select class="select" id="cor-reason">${CORRECTION_REASONS.map((r) => `<option>${esc(r)}</option>`).join("")}</select></div>
          <button class="btn btn-primary btn-sm" data-ca="new-correction-card">➕ Criar novo card de correção</button>
        </div>
      </div>

      <div class="info-block"><h4>🎞️ Histórico de versões</h4>
        ${versions.length ? versions.map((ver) => `<div class="file-tile" style="margin-bottom:8px"><div class="ft-ico">${ver.kind === "Abertura Inteligente" ? "✨" : ver.kind === "Variação" ? "🧬" : "🎬"}</div><div style="flex:1"><div class="ft-name">${esc(ver.label)} ${c.video && c.video.chosenVersionId === ver.id ? '<span class="pill pill-accent">Em uso</span>' : ""}</div><div class="ft-meta">${esc(ver.kind)} · ${esc(ver.status || "")}</div></div></div>`).join("") : `<p class="muted" style="font-size:12px">Sem versões de vídeo ainda. Grave, envie ou gere um vídeo na aba Conteúdo.</p>`}
        ${cor.length ? `<div class="divider"></div>${cor.map((x) => `<div class="analysis-row"><span class="ar-ico">🛠️</span><div><b style="color:var(--text-0)">${esc(x.reason)}</b> — ${esc(x.note || x.diagnosis || "")} <span class="muted">${esc(x.createdAt || "")}</span></div></div>`).join("")}` : ""}
        ${linked.length ? `<div class="divider"></div><p class="muted" style="font-size:12px;margin-bottom:6px">Cards de correção vinculados:</p>${linked.map((x) => `<div class="file-tile" style="margin-bottom:8px;cursor:pointer" data-openlinked="${x.id}"><div class="ft-ico">🎬</div><div style="flex:1"><div class="ft-name">${esc(x.title)}</div><div class="ft-meta">${esc(x.correctionReason || "")}</div></div>${pill(x.status)}</div>`).join("")}` : ""}
      </div>`;
  }

  // ---------- RESUMO ----------
  function tResumo(c) {
    const camp = S.sel.campaign(c.campaignId);
    const actions = [
      ["iniciar", "▶️ Iniciar execução"], ["send-video", "📤 Enviar vídeo"], ["record", "🎥 Gravar agora"],
      ["gen-ai", "✨ Gerar criativo IA"], ["analyze", "🔍 Analisar conteúdo"], ["variation", "🧬 Criar variação"],
      ["published", "✅ Marcar como publicado"], ["correction", "🛠️ Criar correção"],
    ];
    return `
      <div class="grid" style="grid-template-columns:1.3fr 1fr;align-items:start">
        <div>
          <div class="info-block"><h4>🃏 Resumo</h4>
            <div class="kv">
              <div class="k">Título</div><div class="v"><input class="input" data-f="title" value="${esc(c.title)}"/></div>
              <div class="k">Campanha</div><div class="v">${camp ? esc(camp.title) : "—"}</div>
              <div class="k">Produto</div><div class="v">${esc(camp ? camp.productName : "—")}</div>
              <div class="k">Tipo</div><div class="v">${esc(c.type)}</div>
              <div class="k">Objetivo</div><div class="v"><input class="input" data-f="objective" value="${esc(c.objective)}"/></div>
              <div class="k">Canal</div><div class="v">${selChannel(c.channel, "channel")}</div>
              <div class="k">Status</div><div class="v">${selStatus(c.status)}</div>
              <div class="k">Prioridade</div><div class="v">${selPrio(c.priority)}</div>
              <div class="k">Responsável</div><div class="v"><input class="input" data-f="responsible" value="${esc(c.responsible)}"/></div>
              <div class="k">Data / hora</div><div class="v"><div class="flex gap-8"><input class="input" type="date" data-f="date" value="${esc(c.date)}"/><input class="input" type="time" data-f="time" value="${esc(c.time)}" style="max-width:120px"/></div></div>
              <div class="k">Prazo</div><div class="v"><input class="input" type="date" data-f="deadline" value="${esc(c.deadline)}"/></div>
              <div class="k">Próxima ação</div><div class="v"><input class="input" data-f="nextAction" value="${esc(c.nextAction)}"/></div>
            </div>
          </div>
        </div>
        <div>
          <div class="info-block"><h4>📊 Progresso</h4>
            <div class="flex-between" style="margin-bottom:8px"><span class="muted">Checklist concluído</span><b class="text-accent">${c.progress}%</b></div>
            <div class="bar"><span style="width:${c.progress}%"></span></div>
          </div>
          <div class="info-block"><h4>⚡ Ações do card</h4>
            <div class="grid" style="grid-template-columns:1fr 1fr;gap:8px">
              ${actions.map(([a, l]) => `<button class="btn btn-sm" data-ca="${a}" style="justify-content:flex-start">${l}</button>`).join("")}
            </div>
          </div>
          <div class="info-block mb-0"><h4>📝 Observações rápidas</h4>
            <textarea class="textarea" data-f="notes" placeholder="Anotações rápidas…">${esc(c.notes || "")}</textarea>
          </div>
        </div>
      </div>`;
  }

  // ---------- ESTRATÉGIA ----------
  function tEstrategia(c) {
    const s = c.strategy || {};
    const realCards = [
      { l: "R", n: "Retenção", c: "var(--r-ret)", q: "Por que a pessoa pararia para assistir?" },
      { l: "E", n: "Emoção", c: "var(--r-emo)", q: "O que a pessoa precisa sentir para agir?" },
      { l: "A", n: "Autoridade", c: "var(--r-aut)", q: "Por que a pessoa deveria confiar nisso?" },
      { l: "L", n: "Loop", c: "var(--r-loop)", q: "Por que a pessoa voltaria para ver o próximo?" },
    ];
    return `
      <div class="info-block"><h4>🧭 Método R.E.A.L.</h4>
        <div class="real-grid">${realCards.map((r) => `<div class="real-card" style="border-top:2px solid ${r.c}"><div class="rc-letter" style="background:${r.c}22;color:${r.c}">${r.l}</div><h5>${r.n}</h5><p>${r.q}</p></div>`).join("")}</div>
      </div>
      <div class="info-block"><h4>🎯 Métodos estratégicos <span class="muted" style="font-weight:400">(clique para aplicar no card)</span></h4>
        <div class="method-grid">
          ${METHODS.map((m) => `<div class="method-btn ${(c.methods || []).includes(m) ? "on" : ""}" data-method="${esc(m)}"><span class="mb-ico">${METHOD_ICO[m] || "•"}</span>${esc(m)}</div>`).join("")}
        </div>
      </div>
      <div class="grid grid-2" style="align-items:start">
        <div class="info-block"><h4>📋 Definição estratégica</h4>
          <div class="field"><label>Objetivo do conteúdo</label><input class="input" data-s="objective" value="${esc(s.objective || "")}"/></div>
          <div class="field"><label>Público</label><input class="input" data-s="audience" value="${esc(s.audience || "")}"/></div>
          <div class="form-row"><div class="field"><label>Dor</label><input class="input" data-s="pain" value="${esc(s.pain || "")}"/></div><div class="field"><label>Desejo</label><input class="input" data-s="desire" value="${esc(s.desire || "")}"/></div></div>
          <div class="field"><label>Promessa</label><input class="input" data-s="promise" value="${esc(s.promise || "")}"/></div>
          <div class="form-row"><div class="field"><label>Emoção principal</label><input class="input" data-s="emotion" value="${esc(s.emotion || "")}"/></div><div class="field"><label>CTA</label><input class="input" data-s="cta" value="${esc(s.cta || "")}"/></div></div>
        </div>
        <div class="info-block"><h4>🛡️ Prova & adaptação</h4>
          <div class="field"><label>Oferta</label><input class="input" data-s="offer" value="${esc(s.offer || "")}"/></div>
          <div class="field"><label>Objeção que será quebrada</label><input class="input" data-s="objection" value="${esc(s.objection || "")}"/></div>
          <div class="field"><label>Prova usada</label><input class="input" data-s="proof" value="${esc(s.proof || "")}"/></div>
          <div class="field"><label>Método R.E.A.L. aplicado</label><textarea class="textarea" data-s="realMethod" style="min-height:70px">${esc(s.realMethod || "")}</textarea></div>
          <div class="form-row"><div class="field mb-0"><label>Canal principal</label><input class="input" data-s="channel" value="${esc(s.channel || "")}"/></div><div class="field mb-0"><label>Adaptação por canal</label><input class="input" data-s="channelAdapt" value="${esc(s.channelAdapt || "")}"/></div></div>
        </div>
      </div>`;
  }

  // ---------- ROTEIRO ----------
  function tRoteiro(c) {
    const s = c.script || {};
    const hasScript = !!(s.hook || s.mainLine);
    const gen = [["gen-script", "✨ Gerar roteiro completo"], ["gen-hooks", "🪝 Gerar 3 ganchos"], ["gen-stories", "📲 Gerar stories"], ["research-roteiro", "🔎 Melhorar com pesquisa"], ["gen-audience-var", "👥 Variação por público"], ["versao-curta", "⏱️ Versão curta"], ["versao-anuncio", "📢 Versão anúncio"], ["salvar-lib", "📚 Salvar na biblioteca"]];
    const tools = [["melhorar-gancho", "Melhorar gancho"], ["mais-direto", "Mais direto"], ["mais-popular", "Mais popular"], ["mais-emocional", "Mais emocional"], ["mais-vendedor", "Mais vendedor"], ["variacao", "Transformar em variação"]];
    const camp = S.sel.campaign(c.campaignId);
    const research = camp && camp.research;
    return `
      <div class="info-block" style="padding:12px 14px"><div class="flex gap-8 wrap">${gen.map(([a, l]) => `<button class="btn btn-sm" data-ca="${a}">${l}</button>`).join("")}</div>
        <div class="flex gap-8 wrap" style="margin-top:8px;border-top:1px solid var(--border);padding-top:8px">
          <span class="muted" style="font-size:11px;align-self:center">Aprendizado:</span>
          <button class="btn btn-xs" data-ca="approve_script">👍 Aprovar</button>
          <button class="btn btn-xs" data-ca="reject_script">👎 Rejeitar</button>
          <button class="btn btn-xs" data-ca="save_pattern_script">⭐ Salvar como padrão</button>
          ${s._memoryUsed ? `<span class="pill pill-accent" style="font-size:10px">🧠 gerado com sua memória</span>` : ""}
        </div>
      </div>
      ${research ? `<div class="info-block" style="padding:12px 14px"><h4 style="margin-bottom:8px">🔎 Base usada (inteligência de mercado)</h4><div class="flex gap-8 wrap">${(research.contentOpportunities.duvidas.slice(0, 1)).map((t) => `<span class="pill pill-blue">Dúvida: ${esc(t)}</span>`).join("")}${(research.contentOpportunities.objecoes.slice(0, 1)).map((t) => `<span class="pill pill-amber">Objeção: ${esc(t)}</span>`).join("")}${(research.contentOpportunities.elogios.slice(0, 1)).map((t) => `<span class="pill pill-accent">Prova: ${esc(t)}</span>`).join("")}<span class="pill pill-gray">Público: ${esc(c.strategy && c.strategy.audience || camp.audience || "")}</span></div></div>` : ""}
      ${s.retention ? `<div class="alert good" style="margin-bottom:14px"><span class="al-ico">🎯</span><div class="al-body" style="font-size:12px"><b>Cena de retenção:</b> ${esc(s.retention.start)}–${esc(s.retention.end)} · ${esc(s.retention.type)} — “${esc(s.retention.screenText)}”</div></div>` : ""}
      ${hasScript ? "" : `<div class="empty" style="padding:20px"><div class="e-ico">📝</div><h3>Sem roteiro ainda</h3><p>Clique em <b>Gerar roteiro completo</b> — a IA cria gancho, cena de retenção, fala, texto na tela, CTA, legenda e hashtags.</p></div>`}
      <div class="flex gap-8 wrap" style="margin-bottom:16px">${tools.map(([a, l]) => `<button class="btn btn-xs" data-rt="${a}">${l}</button>`).join("")}</div>
      <div class="grid grid-2" style="align-items:start">
        <div>
          <div class="script-block"><div class="sb-label">🪝 Gancho principal</div><div class="sb-content" contenteditable="true" data-sc="hook">${esc(s.hook)}</div></div>
          <div class="script-block"><div class="sb-label">Gancho alternativo 1</div><div class="sb-content alt" contenteditable="true" data-sc="hookAlt1">${esc(s.hookAlt1)}</div></div>
          <div class="script-block"><div class="sb-label">Gancho alternativo 2</div><div class="sb-content alt" contenteditable="true" data-sc="hookAlt2">${esc(s.hookAlt2)}</div></div>
          <div class="script-block"><div class="sb-label">⏱️ Abertura (3 segundos)</div><div class="sb-content" contenteditable="true" data-sc="opening">${esc(s.opening)}</div></div>
          <div class="script-block"><div class="sb-label">🎙️ Fala principal</div><div class="sb-content" contenteditable="true" data-sc="mainLine">${esc(s.mainLine)}</div></div>
          <div class="script-block"><div class="sb-label">🎬 Cenas sugeridas</div><div class="sb-content" contenteditable="true" data-sc="scenes">${esc((s.scenes || []).join(" • "))}</div></div>
        </div>
        <div>
          <div class="script-block"><div class="sb-label">🔤 Texto na tela</div><div class="sb-content" contenteditable="true" data-sc="screenText">${esc((s.screenText || []).join(" | "))}</div></div>
          <div class="script-block"><div class="sb-label">✂️ Frases de corte</div><div class="sb-content" contenteditable="true" data-sc="cutPhrases">${esc((s.cutPhrases || []).join(" • "))}</div></div>
          <div class="script-block"><div class="sb-label">📣 CTA</div><div class="sb-content" contenteditable="true" data-sc="cta">${esc(s.cta)}</div></div>
          <div class="script-block"><div class="sb-label">✍️ Legenda</div><div class="sb-content" contenteditable="true" data-sc="caption">${esc(s.caption)}</div></div>
          <div class="script-block"><div class="sb-label"># Hashtags</div><div class="sb-content alt" contenteditable="true" data-sc="hashtags">${esc(s.hashtags)}</div></div>
          <div class="form-row"><div class="script-block"><div class="sb-label">📌 Título</div><div class="sb-content" contenteditable="true" data-sc="title">${esc(s.title)}</div></div><div class="script-block"><div class="sb-label">🖼️ Capa</div><div class="sb-content alt" contenteditable="true" data-sc="cover">${esc(s.cover)}</div></div></div>
          <div class="script-block mb-0"><div class="sb-label">📲 Roteiro para stories</div><div class="sb-content alt" contenteditable="true" data-sc="stories">${esc(s.stories)}</div></div>
        </div>
      </div>`;
  }

  // ---------- CONTEÚDO ----------
  function tConteudo(c) {
    const ct = c.content || { path: null, creatives: [] };
    const creatives = (ct.creatives || []).map((cr) => `
      <div class="file-tile" style="margin-bottom:8px"><div class="ft-ico">${cr.source && cr.source.includes("IA") ? "✨" : "🎬"}</div>
        <div style="flex:1"><div class="ft-name">${esc(cr.fileName || cr.type)}</div><div class="ft-meta">${esc(cr.type)} · ${esc(cr.source)}${cr.creditsUsed ? ` · ${cr.creditsUsed} créditos` : ""}</div></div>
        <span class="pill pill-accent">${esc(cr.status)}</span></div>`).join("");

    if (ct.path === "gerar") return contentGenerate(c, creatives);
    return videoArea(c);
  }

  // Área "Vídeo do Card": gravar / enviar → revisar → aprovar → retenção → abertura inteligente
  function videoArea(c) {
    const v = c.video || { original: null, versions: [], chosenVersionId: null };
    const hasOriginal = !!v.original;
    const hasEdited = (v.versions || []).some((x) => x.kind === "Abertura Inteligente");
    const kindIco = { "Original": "🎬", "Abertura Inteligente": "✨", "Variação": "🧬" };
    const versions = (v.versions || []).map((ver) => {
      const chosen = v.chosenVersionId === ver.id;
      return `<div class="file-tile" style="margin-bottom:8px${chosen ? ";border-color:var(--accent-dim)" : ""}">
        <div class="ft-ico">${kindIco[ver.kind] || "🎞️"}</div>
        <div style="flex:1"><div class="ft-name">${esc(ver.label)} ${chosen ? '<span class="pill pill-accent" style="margin-left:6px">Em uso</span>' : ""}</div>
          <div class="ft-meta">${esc(ver.kind)} · ${esc(ver.source)} · ${esc(ver.status || "")}${ver.duration ? " · " + fmtDur(ver.duration) : ""}</div></div>
        ${chosen ? "" : `<button class="btn btn-xs" data-ca="use-version" data-ver="${ver.id}">Usar</button>`}
        ${ver.kind === "Abertura Inteligente" ? `<button class="btn btn-xs" data-ca="view-edited">Ver</button>` : ver.kind === "Original" ? `<button class="btn btn-xs" data-ca="view-original">Ver</button>` : ""}
      </div>`;
    }).join("");

    return `
      <div class="info-block"><h4>🎥 Vídeo do Card</h4>
        <p class="muted" style="margin-bottom:14px">Grave pelo sistema (com teleprompter) ou envie um vídeo da galeria. Depois de aprovar, o Viraliza encontra a melhor cena de retenção e gera uma <b>Abertura Inteligente</b> automaticamente.</p>
        <div class="grid grid-2" style="gap:12px;margin-bottom:12px">
          <div class="content-path" data-ca="open-recorder"><div class="cp-ico">🎥</div><h4>Gravar agora</h4><p>Câmera + teleprompter. O roteiro aparece para você ler e não entra no vídeo.</p></div>
          <div class="content-path" data-ca="upload-gallery"><div class="cp-ico">📤</div><h4>Enviar vídeo</h4><p>Suba um vídeo da galeria (MP4, MOV, WEBM).</p></div>
        </div>
        <div class="flex gap-8 wrap">
          <button class="btn btn-sm" data-ca="view-original" ${hasOriginal ? "" : "disabled"}>▶️ Ver original</button>
          <button class="btn btn-sm" data-ca="gen-opening" ${hasOriginal ? "" : "disabled"}>✨ Gerar abertura inteligente</button>
          <button class="btn btn-sm" data-ca="view-edited" ${hasEdited ? "" : "disabled"}>🎬 Ver versão editada</button>
          <button class="btn btn-sm" data-ca="send-analysis-video" ${hasOriginal ? "" : "disabled"}>🔍 Enviar para análise</button>
        </div>
      </div>
      ${versions ? `<div class="info-block"><h4>🎞️ Versões do vídeo</h4>${versions}<p class="muted" style="font-size:12px;margin-top:8px">Escolha qual versão será usada para publicação com o botão <b>Usar</b>.</p></div>`
        : `<div class="empty" style="padding:24px"><div class="e-ico">🎬</div><h3>Ainda sem vídeo</h3><p>Grave agora ou envie um vídeo da galeria para começar.</p></div>`}
      <div class="info-block mb-0" style="opacity:.85"><h4>✨ Ou gere com IA a partir da foto do produto</h4>
        <p class="muted" style="font-size:12px;margin-bottom:10px">Caminho alternativo: criar um vídeo com IA usando a imagem do produto (consome créditos).</p>
        <button class="btn btn-sm" data-path="gerar">Abrir geração com IA →</button>
      </div>`;
  }
  function fmtDur(s) { s = Math.round(s || 0); const m = Math.floor(s / 60), r = s % 60; return String(m).padStart(2, "0") + ":" + String(r).padStart(2, "0"); }

  function contentGenerate(c, creatives) {
    const cr = S.get().credits;
    const imgs = (c.content.media && c.content.media.productImages) || [];
    const gallery = imgs.map((im) => `
      <div style="position:relative;width:88px;height:88px;border-radius:10px;overflow:hidden;border:2px solid ${im.isPrimary ? "var(--accent)" : "var(--border-2)"}">
        <img src="${im.url}" style="width:100%;height:100%;object-fit:cover"/>
        ${im.isPrimary ? `<span class="pill pill-accent" style="position:absolute;top:4px;left:4px;font-size:9px">principal</span>` : `<button class="btn btn-xs" data-imgprimary="${im.id}" style="position:absolute;bottom:4px;left:4px;padding:2px 6px;font-size:9px">Principal</button>`}
        <span class="x-btn" data-imgdel="${im.id}" style="position:absolute;top:2px;right:2px;width:20px;height:20px;font-size:11px;background:rgba(0,0,0,.6)">✕</span>
      </div>`).join("");
    return `
      <button class="btn btn-ghost btn-sm" data-path="" style="margin-bottom:12px">← Caminhos</button>
      <div class="info-block"><h4>✨ Gerar vídeo com IA</h4>
        <div class="upload-zone" data-ca="upload-photo" style="margin-bottom:12px"><div class="uz-ico">🖼️</div><b style="color:var(--text-0)">${imgs.length ? "Adicionar outra foto do produto" : "Upload da imagem do produto"}</b><div class="muted" style="font-size:12px;margin-top:4px">JPG, PNG ou WEBP. As fotos ficam salvas no card.</div></div>
        ${imgs.length ? `<div class="flex gap-8 wrap" style="margin-bottom:14px">${gallery}</div>` : ""}
        <div class="form-row">
          <div class="field"><label>Tipo de vídeo</label><select class="select" id="gen-type">${VIDEO_TYPES.map((t) => `<option>${esc(t)}</option>`).join("")}</select></div>
          <div class="field"><label>Template</label><select class="select" id="gen-tpl">${TEMPLATES.map((t) => `<option>${esc(t)}</option>`).join("")}</select></div>
        </div>
        <div class="alert good" style="margin-top:6px"><span class="al-ico">🛡️</span><div class="al-body" style="font-size:12px">A IA preserva o produto: não muda cor, formato, logo ou embalagem, e não inventa características falsas.</div></div>
      </div>
      <div class="info-block"><h4>👀 Prévia da geração</h4>
        <div class="kv">
          <div class="k">Duração</div><div class="v">~20s (vertical 9:16)</div>
          <div class="k">Canal</div><div class="v">${esc(c.channel)}</div>
          <div class="k">Cenas</div><div class="v">Produto → benefício → oferta → CTA</div>
          <div class="k">Texto na tela</div><div class="v">${esc((c.script.screenText || []).join(" | ") || "Gerado pela IA")}</div>
          <div class="k">CTA</div><div class="v">${esc(c.script.cta || "Link na bio")}</div>
          <div class="k">Custo estimado</div><div class="v"><b class="text-accent">12 créditos</b> <span class="muted">(você tem ${cr.available})</span></div>
        </div>
        <button class="btn btn-primary mt-16" data-ca="gen-ai-confirm">✨ Gerar vídeo (12 créditos)</button>
      </div>
      ${creatives ? `<div class="info-block mb-0"><h4>🎬 Criativos gerados</h4>${creatives}</div>` : ""}`;
  }

  function contentSend(c, creatives) {
    const analyzed = (c.content.creatives || []).some((x) => x.status === "Analisado");
    return `
      <button class="btn btn-ghost btn-sm" data-path="" style="margin-bottom:12px">← Caminhos</button>
      <div class="info-block"><h4>📤 Enviar vídeo</h4>
        <div class="upload-zone" data-ca="upload-video"><div class="uz-ico">🎬</div><b style="color:var(--text-0)">Arraste ou clique para enviar seu vídeo</b><div class="muted" style="font-size:12px;margin-top:4px">Vídeo bruto, editado, celular, corte, story, anúncio. Vertical ou horizontal.</div></div>
      </div>
      ${creatives ? `<div class="info-block"><h4>🎬 Vídeos enviados</h4>${creatives}<button class="btn btn-sm mt-16" data-ca="analyze">🔍 Analisar com IA</button></div>` : ""}
      ${analyzed || c.analysis.done ? analysisSummaryBlock(c) : ""}`;
  }

  function contentRecord(c, creatives) {
    const s = c.script || {};
    const takes = (c.content.creatives || []).filter((x) => /Grava|gancho|CTO|CTA/.test((x.source || "") + (x.type || "")));
    return `
      <button class="btn btn-ghost btn-sm" data-path="" style="margin-bottom:12px">← Caminhos</button>
      <div class="info-block"><h4>🎥 Gravar agora</h4>
        <div class="grid grid-2" style="align-items:center;gap:18px">
          <div>
            <p class="muted" style="margin-bottom:12px">Estúdio de gravação com <b>câmera + teleprompter</b>. O roteiro aparece na tela para você ler e <b>não</b> entra no vídeo final. Ajuste velocidade, fonte, contagem regressiva, pause, repita, salve o take, baixe e envie para análise.</p>
            <div class="script-block"><div class="sb-label">🪝 Vai aparecer no teleprompter</div><div class="sb-content">${esc(s.hook || "Sem gancho — crie o roteiro primeiro")}</div></div>
            <button class="btn btn-primary btn-block mt-16" data-ca="open-recorder">🎬 Abrir estúdio de gravação</button>
          </div>
          <div style="aspect-ratio:9/16;background:var(--bg-0);border:1px solid var(--border-2);border-radius:14px;display:grid;place-items:center;position:relative;overflow:hidden;max-width:200px;margin:0 auto">
            <div style="position:absolute;left:10px;right:10px;bottom:12px;top:45%;background:linear-gradient(180deg,transparent,rgba(0,0,0,.55));border-radius:8px;padding:8px;font-size:10px;color:#fff;display:flex;align-items:flex-end"><span style="color:var(--accent-2);font-weight:700">${esc((s.hook || "roteiro rola aqui…").slice(0, 60))}</span></div>
            <div style="text-align:center;color:var(--text-3)"><div style="font-size:30px">📷</div><div style="font-size:11px;margin-top:4px">prévia</div></div>
          </div>
        </div>
      </div>
      ${takes.length ? `<div class="info-block mb-0"><h4>🎬 Takes gravados</h4>${takes.map((cr) => `<div class="file-tile" style="margin-bottom:8px"><div class="ft-ico">🎬</div><div style="flex:1"><div class="ft-name">${esc(cr.fileName || cr.type)}</div><div class="ft-meta">${esc(cr.type)} · ${esc(cr.source)}</div></div><span class="pill pill-accent">${esc(cr.status)}</span></div>`).join("")}<button class="btn btn-sm mt-16" data-ca="open-recorder">🎥 Gravar outro take</button></div>` : ""}`;
  }

  // ---------- CHECKLIST (editável) ----------
  function tChecklist(c) {
    const groups = (c.checklist || []).map((g, gi) => {
      const done = g.items.filter((i) => i.done).length;
      return `<div class="chk-group">
        <div class="chk-group-head">📌 <span data-chkgname="${gi}" style="cursor:text" title="Clique para renomear">${esc(g.group)}</span><span class="chk-prog">${done}/${g.items.length}</span>
          <span class="x-btn" data-chkdelg="${gi}" title="Apagar grupo" style="width:26px;height:26px">🗑️</span></div>
        ${g.items.map((i, ii) => `<div class="chk-item">
          <div class="chk-box ${i.done ? "done" : ""}" data-chk="${gi}-${ii}">${i.done ? "✓" : ""}</div>
          <div class="ci-text ${i.done ? "done" : ""}" data-chkedit="${gi}-${ii}" style="cursor:text">${esc(i.t)}</div>
          <span class="x-btn" data-chkdel="${gi}-${ii}" title="Apagar" style="width:26px;height:26px">✕</span>
        </div>`).join("")}
        <div class="chk-item" style="opacity:.9"><div class="chk-box" style="border-style:dashed">+</div><input class="input" data-chkadd="${gi}" placeholder="Adicionar item… (Enter)" style="background:transparent;border:none;padding:6px 0"/></div>
      </div>`;
    }).join("");
    return `${groups}
      <div class="flex gap-8 wrap" style="margin-top:12px">
        <button class="btn btn-sm" data-ca="add-group">+ Adicionar grupo</button>
        <button class="btn btn-sm" data-ca="reset-checklist">🤖 Gerar checklist com IA</button>
      </div>`;
  }

  // ---------- PUBLICAÇÃO ----------
  function tPublicacao(c) {
    const p = c.publication || {};
    const PUB_STATUS = ["Não publicado", "Agendado", "Publicado", "Pausado", "Impulsionado", "Em anúncio", "Encerrado"];
    return `
      <div class="grid grid-2" style="align-items:start">
        <div class="info-block"><h4>📤 Publicação</h4>
          <div class="field"><label>Canal</label>${selChannel(p.channel, "pub.channel")}</div>
          <div class="form-row"><div class="field"><label>Data</label><input class="input" type="date" data-p="date" value="${esc(p.date)}"/></div><div class="field"><label>Horário</label><input class="input" type="time" data-p="time" value="${esc(p.time)}"/></div></div>
          <div class="field"><label>Status</label><select class="select" data-p="status">${PUB_STATUS.map((s) => `<option ${s === p.status ? "selected" : ""}>${esc(s)}</option>`).join("")}</select></div>
          <div class="field"><label>Responsável</label><input class="input" data-p="responsible" value="${esc(p.responsible)}"/></div>
          <div class="field mb-0"><label style="display:flex;gap:8px;align-items:center;cursor:pointer"><input type="checkbox" data-p="approved" ${p.approved ? "checked" : ""} style="accent-color:var(--accent);width:16px;height:16px"/> Aprovado</label></div>
        </div>
        <div class="info-block"><h4>✍️ Conteúdo final</h4>
          <div class="field"><label>Legenda final</label><textarea class="textarea" data-p="captionFinal">${esc(p.captionFinal)}</textarea></div>
          <div class="field"><label>Hashtags finais</label><textarea class="textarea" data-p="hashtagsFinal" style="min-height:60px">${esc(p.hashtagsFinal)}</textarea></div>
          <div class="field"><label>CTA final</label><input class="input" data-p="ctaFinal" value="${esc(p.ctaFinal)}"/></div>
          <div class="field mb-0"><label>🔗 Link publicado</label><input class="input" data-p="link" placeholder="Cole o link do Instagram, TikTok, YouTube…" value="${esc(p.link)}"/></div>
        </div>
      </div>
      <div class="flex gap-8 wrap" style="margin-top:16px">
        <button class="btn btn-sm" data-ca="copy-caption">📋 Copiar legenda</button>
        <button class="btn btn-sm" data-ca="copy-hashtags">📋 Copiar hashtags</button>
        <button class="btn btn-sm" data-ca="save-link">💾 Salvar link</button>
        <button class="btn btn-sm" data-ca="published">✅ Marcar como publicado</button>
        <button class="btn btn-sm" data-ca="analyze">🔍 Enviar para análise</button>
        <button class="btn btn-sm" data-ca="variation">🧬 Criar variação</button>
      </div>`;
  }

  // ---------- ANÁLISE ----------
  function tAnalise(c) {
    const a = c.analysis || {};
    const fields = [["views", "Visualizações"], ["reach", "Alcance"], ["retention", "Retenção"], ["likes", "Curtidas"], ["comments", "Comentários"], ["shares", "Compart."], ["saves", "Salvamentos"], ["clicks", "Cliques"], ["leads", "Leads"], ["sales", "Vendas"], ["cost", "Custo"], ["conversion", "Conversão"]];
    const m = a.metrics || {};
    const inputs = fields.map(([k, l]) => `<div class="field mb-0"><label>${l}</label><input class="input" data-m="${k}" value="${esc(m[k] != null ? m[k] : "")}"/></div>`).join("");
    return `
      <div class="grid" style="grid-template-columns:1fr 1.2fr;align-items:start">
        <div class="info-block"><h4>📊 Métricas ${a.done ? "" : "(inserir manualmente)"}</h4>
          <div class="grid" style="grid-template-columns:1fr 1fr;gap:12px">${inputs}</div>
          <button class="btn btn-primary btn-sm mt-16" data-ca="save-metrics">💾 Salvar métricas & analisar</button>
        </div>
        <div>
          ${a.done && a.summary ? `
          <div class="info-block"><h4>🤖 Diagnóstico da IA</h4>
            <div class="analysis-row"><span class="ar-ico">✅</span><div><b style="color:var(--text-0)">Funcionou:</b> ${esc(a.summary.worked)}</div></div>
            <div class="analysis-row"><span class="ar-ico">⚠️</span><div><b style="color:var(--text-0)">Não funcionou:</b> ${esc(a.summary.failed)}</div></div>
            <div class="analysis-row"><span class="ar-ico">🔁</span><div><b style="color:var(--text-0)">Repetir:</b> ${esc(a.summary.repeat)}</div></div>
            <div class="analysis-row"><span class="ar-ico">🛠️</span><div><b style="color:var(--text-0)">Corrigir:</b> ${esc(a.summary.fix)}</div></div>
            <div class="analysis-row"><span class="ar-ico">🧬</span><div><b style="color:var(--text-0)">Variação:</b> ${esc(a.summary.variation)}</div></div>
          </div>
          <div class="flex gap-8 wrap">
            <button class="btn btn-sm" data-ca="correction">🛠️ Gerar correção</button>
            <button class="btn btn-sm" data-ca="new-card-analysis">➕ Criar novo card</button>
            <button class="btn btn-sm" data-ca="variation">🧬 Criar variação</button>
            <button class="btn btn-sm" data-ca="save-learning">🧠 Salvar aprendizado</button>
            <button class="btn btn-sm" data-ca="save-winner">🏆 Gancho vencedor</button>
          </div>` : `<div class="empty" style="padding:30px"><div class="e-ico">📊</div><h3>Sem análise ainda</h3><p>Insira as métricas ao lado e a IA vai gerar o diagnóstico: o que funcionou, o que corrigir e qual variação criar.</p></div>`}
        </div>
      </div>`;
  }

  function analysisSummaryBlock(c) {
    return `<div class="info-block mb-0" style="margin-top:16px"><h4>🤖 Análise da IA (vídeo enviado)</h4>
      <div class="score-ring" style="margin-bottom:14px">
        <div class="ring" style="background:conic-gradient(var(--accent) 0% 74%, var(--bg-3) 74% 100%)"><div style="width:72px;height:72px;border-radius:50%;background:var(--panel);display:grid;place-items:center"><div class="ring-val">7.4</div></div></div>
        <div><b style="color:var(--text-0)">Nota geral: boa base</b><p class="muted" style="font-size:13px;margin-top:4px">Retenção provável média-alta. Ajustar CTA e mostrar produto mais cedo aumenta conversão.</p></div>
      </div>
      <div class="analysis-row"><span class="ar-ico">⚠️</span><div><b style="color:var(--text-0)">Problema:</b> produto aparece só depois de 8s.</div></div>
      <div class="analysis-row"><span class="ar-ico">✅</span><div><b style="color:var(--text-0)">Ponto forte:</b> gancho de dor bem construído.</div></div>
      <div class="analysis-row"><span class="ar-ico">✨</span><div><b style="color:var(--text-0)">Sugestão:</b> mostrar produto nos 2 primeiros segundos e repetir CTA no meio.</div></div>
      <div class="flex gap-8 wrap mt-16"><button class="btn btn-sm" data-ca="correction">🛠️ Criar card de regravação</button><button class="btn btn-sm" data-ca="new-caption">✍️ Nova legenda</button><button class="btn btn-sm" data-ca="variation">🧬 Variações para teste</button></div>
    </div>`;
  }

  // ---------- CORREÇÃO ----------
  function tCorrecao(c) {
    const list = (c.corrections || []).map((cor) => `
      <div class="info-block"><div class="flex-between"><h4 style="margin:0">🛠️ ${esc(cor.reason)}</h4>${pill(cor.status)}</div>
        <p class="muted" style="margin-top:8px">${esc(cor.note)}</p><div class="muted" style="font-size:11px;margin-top:6px">${esc(cor.createdAt)}</div></div>`).join("");
    return `
      <div class="info-block"><h4>🛠️ Nova correção</h4>
        <div class="field"><label>Motivo da correção</label><select class="select" id="cor-reason">${CORRECTION_REASONS.map((r) => `<option>${esc(r)}</option>`).join("")}</select></div>
        <div class="field"><label>Observação</label><textarea class="textarea" id="cor-note" placeholder="Descreva o que precisa melhorar…"></textarea></div>
        <div class="alert good"><span class="al-ico">🤖</span><div class="al-body" style="font-size:12px">A IA vai gerar: novo gancho, novo roteiro, nova legenda, novo CTA e um card de regravação.</div></div>
        <button class="btn btn-primary mt-16" data-ca="create-correction">🛠️ Gerar correção + card de regravação</button>
      </div>
      ${list ? `<div class="section-title"><span class="st-ico">📜</span><h2>Histórico de correções</h2></div>${list}` : ""}`;
  }

  // ---------- ARQUIVOS ----------
  function tArquivos(c) {
    const byType = {};
    (c.files || []).forEach((f) => { (byType[f.type] = byType[f.type] || []).push(f); });
    const types = ["Produto", "Vídeo bruto", "Vídeo editado", "Vídeo IA", "Referência", "Publicação", "Análise", "Documento"];
    const groups = types.filter((t) => byType[t]).map((t) => `
      <div class="info-block"><h4>📁 ${esc(t)}</h4>
        <div class="grid" style="grid-template-columns:1fr 1fr;gap:8px">${byType[t].map((f) => `<div class="file-tile"><div class="ft-ico">${f.ico || "📄"}</div><div style="flex:1"><div class="ft-name">${esc(f.name)}</div><div class="ft-meta">${esc(f.size || "")}</div></div></div>`).join("")}</div></div>`).join("");
    return `
      <div class="upload-zone" data-ca="upload-file" style="margin-bottom:16px"><div class="uz-ico">📎</div><b style="color:var(--text-0)">Anexar arquivo</b><div class="muted" style="font-size:12px;margin-top:4px">Fotos, vídeos, áudios, PDFs, prints, referências, autorização de imagem, briefing.</div></div>
      ${groups || U.esc ? groups : ""}
      ${!(c.files || []).length ? `<div class="empty" style="padding:20px"><p>Nenhum arquivo anexado ainda.</p></div>` : ""}`;
  }

  // ------------------------------------------------------------
  // Bind interactions inside the drawer body
  // ------------------------------------------------------------
  function bindTab(root) {
    if (!root) return;
    const c = card();
    // Resumo fields
    root.querySelectorAll("[data-f]").forEach((el) => el.onchange = () => { S.actions.updateCard(cardId, { [el.dataset.f]: el.value }); if (el.dataset.f === "status") window.App.render(); });
    root.querySelectorAll("[data-s]").forEach((el) => el.onchange = () => S.actions.patchCard(cardId, "strategy." + el.dataset.s, el.value));
    root.querySelectorAll("[data-p]").forEach((el) => el.onchange = () => { const v = el.type === "checkbox" ? el.checked : el.value; S.actions.patchCard(cardId, "publication." + el.dataset.p, v); });
    root.querySelectorAll("[data-sc]").forEach((el) => {
      el.dataset.orig = el.innerText.trim();
      el.onblur = () => {
        const key = el.dataset.sc, val = el.innerText.trim(), old = el.dataset.orig;
        if (["scenes", "screenText", "cutPhrases"].includes(key)) S.actions.patchCard(cardId, "script." + key, val.split(/[•|]/).map((x) => x.trim()).filter(Boolean));
        else S.actions.patchCard(cardId, "script." + key, val);
        // aprendizado por edição (gancho, fala principal, CTA)
        if (old && val && old !== val && ["hook", "mainLine", "cta"].includes(key) && window.Learning) {
          const ins = window.Learning.saveEdit(old, val, key === "mainLine" ? "mainLine" : key, { cardId, campaignId: card.campaignId });
          U.toast("Aprendi com sua edição: " + ins);
        }
      };
    });
    root.querySelectorAll("[data-m]").forEach((el) => el.onchange = () => S.actions.patchCard(cardId, "analysis.metrics." + el.dataset.m, el.value));

    // Methods (apply strategy)
    root.querySelectorAll("[data-method]").forEach((el) => el.onclick = () => applyMethod(el.dataset.method));

    // Visual do vídeo
    root.querySelectorAll("[data-v]").forEach((el) => el.onchange = () => S.actions.patchCard(cardId, "visual." + el.dataset.v, el.value));
    // Fotos do produto
    root.querySelectorAll("[data-imgprimary]").forEach((el) => el.onclick = () => { S.actions.setPrimaryImage(cardId, el.dataset.imgprimary); refreshBody(); });
    root.querySelectorAll("[data-imgdel]").forEach((el) => el.onclick = () => { S.actions.removeProductImage(cardId, el.dataset.imgdel); U.toast("Foto removida"); refreshBody(); });
    // Cards de correção vinculados
    root.querySelectorAll("[data-openlinked]").forEach((el) => el.onclick = () => window.App.openCard(el.dataset.openlinked));

    // Checklist (editável)
    root.querySelectorAll("[data-chk]").forEach((el) => el.onclick = () => { const [gi, ii] = el.dataset.chk.split("-").map(Number); S.actions.toggleChecklist(cardId, gi, ii); refreshBody(); });
    root.querySelectorAll("[data-chkedit]").forEach((el) => el.onblur = () => { const [gi, ii] = el.dataset.chkedit.split("-").map(Number); const t = el.innerText.trim(); if (t) S.actions.chkEditItem(cardId, gi, ii, t); });
    root.querySelectorAll("[data-chkedit]").forEach((el) => el.setAttribute("contenteditable", "true"));
    root.querySelectorAll("[data-chkdel]").forEach((el) => el.onclick = () => { const [gi, ii] = el.dataset.chkdel.split("-").map(Number); S.actions.chkDelItem(cardId, gi, ii); refreshBody(); });
    root.querySelectorAll("[data-chkdelg]").forEach((el) => el.onclick = () => { U.confirm("Apagar este grupo do checklist?", () => { S.actions.chkDelGroup(cardId, +el.dataset.chkdelg); refreshBody(); }, { danger: true, yes: "Apagar" }); });
    root.querySelectorAll("[data-chkgname]").forEach((el) => { el.setAttribute("contenteditable", "true"); el.onblur = () => { const t = el.innerText.trim(); if (t) S.actions.chkRenameGroup(cardId, +el.dataset.chkgname, t); }; });
    root.querySelectorAll("[data-chkadd]").forEach((el) => el.onkeydown = (e) => { if (e.key === "Enter") { const t = el.value.trim(); if (t) { S.actions.chkAddItem(cardId, +el.dataset.chkadd, t); refreshBody(); } } });

    // Publicação: checklist de aprovação + status
    root.querySelectorAll("[data-appr]").forEach((el) => el.onclick = () => {
      const ii = +el.dataset.appr;
      S.update((s) => { const cc = s.cards.find((x) => x.id === cardId); if (!cc.publication) cc.publication = {}; if (!cc.publication.approval) cc.publication.approval = window.PublishEngine.APPROVAL_ITEMS.map((t) => ({ t, done: false })); cc.publication.approval[ii].done = !cc.publication.approval[ii].done; });
      refreshBody();
    });
    const ps = root.querySelector("[data-pubstatus]"); if (ps) ps.onchange = () => { S.actions.patchCard(cardId, "publication.pubStatus", ps.value); refreshHead(); };

    // Content path switch (Gravar agora abre o estúdio direto)
    root.querySelectorAll("[data-path]").forEach((el) => el.onclick = () => { S.actions.patchCard(cardId, "content.path", el.dataset.path || null); refreshBody(); if (el.dataset.path === "gravar") window.Recorder.open(cardId); });

    // Roteiro tools
    root.querySelectorAll("[data-rt]").forEach((el) => el.onclick = () => roteiroTool(el.dataset.rt));

    // Simulated
    root.querySelectorAll("[data-sim]").forEach((el) => el.onclick = () => U.simulated(el.dataset.sim, "Fluxo salvo no card."));

    // Card actions
    root.querySelectorAll("[data-ca]").forEach((el) => el.onclick = () => cardAction(el.dataset.ca, el));
  }

  function applyMethod(method) {
    const c = card();
    const methods = new Set(c.methods || []);
    methods.has(method) ? methods.delete(method) : methods.add(method);
    S.actions.updateCard(cardId, { methods: Array.from(methods) });
    // Real effect: apply changes to the card depending on method
    if (methods.has(method)) {
      const effect = methodEffect(method, c);
      S.actions.patchCard(cardId, "script.hook", effect.hook);
      S.actions.patchCard(cardId, "nextAction", effect.next);
      U.toast(`Método "${method}" aplicado ✓ — roteiro e ganchos atualizados`);
    } else {
      U.toast(`Método "${method}" removido`);
    }
    refreshBody();
  }

  function methodEffect(method, c) {
    const p = S.get().persona;
    const map = {
      "Dor e Solução": { hook: "Você perde tempo TODO dia por causa disso 👇", next: "Gravar cena do problema" },
      "Gancho de Retenção": { hook: "Não role o feed antes de ver isso 👀", next: "Gravar os 3 ganchos" },
      "Antes e Depois": { hook: "Olha o ANTES... agora o DEPOIS 😱", next: "Gravar antes e depois" },
      "Prova Social": { hook: "Mais de 5 mil pessoas já testaram isso 👇", next: "Reunir provas/comentários" },
      "Review": { hook: "Testei por 30 dias, olha a verdade 👇", next: "Gravar review honesto" },
      "Demonstração": { hook: "Bora testar AGORA na sua frente 🧪", next: "Gravar demonstração" },
      "Comparação": { hook: "Comum x melhor: olha a diferença ⚖️", next: "Gravar comparação split-screen" },
      "Oferta Clara": { hook: `Só hoje: ${c.strategy && c.strategy.offer ? c.strategy.offer : "oferta especial"} 🏷️`, next: "Destacar preço na tela" },
      "Urgência": { hook: "Corre que é por tempo limitado ⏰", next: "Adicionar contador/urgência" },
      "Quebra de Objeção": { hook: `"${c.strategy && c.strategy.objection ? c.strategy.objection : "Será que funciona?"}" — vou provar 🛡️`, next: "Gravar quebra de objeção" },
    };
    return map[method] || { hook: c.script.hook || `Método ${method} aplicado`, next: c.nextAction };
  }

  // Variação por público (usa ramificação da IA)
  function genAudienceVariation(c) {
    const camp = S.sel.campaign(c.campaignId) || {};
    const branches = AI.generateAudienceBranches((c.strategy && c.strategy.audience) || camp.audience || "público");
    U.modal({
      title: "Variação por público", size: "",
      body: `<p class="muted" style="margin-bottom:12px">Escolha um subpúblico. A IA cria um novo card com roteiro adaptado.</p>
        ${branches.slice(0, 6).map((b, i) => `<div class="status-row" data-br="${i}" style="cursor:pointer"><div style="flex:1"><b style="color:var(--text-0)">${esc(b.name)}</b><div class="muted" style="font-size:12px">${esc(b.videoType)} · ${esc(b.platform)} · "${esc(b.hook)}"</div></div><span class="text-accent">→</span></div>`).join("")}`,
      onMount: (o) => o.querySelectorAll("[data-br]").forEach((el) => el.onclick = () => {
        const b = branches[+el.dataset.br];
        const nid = S.actions.addCard({ title: c.title + " — " + b.name, type: b.videoType, campaignId: c.campaignId, channel: b.platform, status: "Pronto para gravar", priority: "Média", nextAction: "Gravar para " + b.name,
          strategy: { objective: (c.strategy && c.strategy.objective) || "", angle: b.videoType, audience: b.name, pain: b.pain, desire: b.desire, promise: (c.strategy && c.strategy.promise) || "", emotion: "identificação", cta: b.cta },
          script: Object.assign({}, AI.generateScriptForCard({ type: b.videoType, strategy: { pain: b.pain } }, camp), { hook: b.hook, cta: b.cta }) });
        U.closeModal(); U.toast("Variação para “" + b.name + "” criada ✓"); window.App.openCard(nid);
      }),
    });
  }

  // Correção no mesmo card (variação pequena)
  function quickCorrection(c) {
    const cor = AI.generateCorrectionFromAnalysis(c, c.analysis);
    const box = document.getElementById("quick-cor-box");
    if (!box) return;
    box.innerHTML = `
      <div class="scene-card" style="margin-top:12px">
        <div class="scene-top"><span class="pill pill-amber">${esc(cor.reason)}</span></div>
        <div class="scene-reason">${esc(cor.diagnosis)}</div>
        <div class="kv" style="margin-top:6px">
          <div class="k">Novo gancho</div><div class="v">${esc(cor.correctedScript.hook)}</div>
          <div class="k">Abertura</div><div class="v">${esc(cor.correctedScript.opening)}</div>
          <div class="k">Novo CTA</div><div class="v">${esc(cor.correctedScript.cta)}</div>
          <div class="k">Texto na tela</div><div class="v">“${esc(cor.correctedScript.screenText)}”</div>
        </div>
        <button class="btn btn-primary btn-sm mt-16" id="qc-apply">💾 Salvar como nova versão do roteiro</button>
      </div>`;
    box.querySelector("#qc-apply").onclick = () => {
      S.actions.patchCard(cardId, "script.hook", cor.correctedScript.hook);
      S.actions.patchCard(cardId, "script.opening", cor.correctedScript.opening);
      S.actions.patchCard(cardId, "script.cta", cor.correctedScript.cta);
      S.actions.addCorrection(cardId, { reason: cor.reason, note: "Correção aplicada no mesmo card (gancho/abertura/CTA).", status: "Aplicada" });
      U.toast("Correção aplicada ao roteiro ✓"); refreshBody();
    };
  }

  // ---------- Pesquisa IA / Inteligência de mercado ----------
  // Usa research salvo na campanha; se não houver, pergunta (uma vez por campanha).
  function maybeResearch(c, cb) {
    const camp = S.sel.campaign(c.campaignId);
    if (!camp) return cb(null);
    if (camp.research) return cb(camp.research);
    if (camp.researchOptOut) return cb(null);
    U.modal({
      title: "Deixar esse roteiro mais forte?", size: "",
      body: `<p style="color:var(--text-1);line-height:1.6;margin-bottom:6px">Quer que eu busque referências de mercado (dúvidas, objeções e provas reais) para deixar esse roteiro mais forte?</p>
        <p class="muted" style="font-size:12px">Pesquisa simulada no MVP. Estrutura pronta para busca real.</p>`,
      foot: `<button class="btn btn-ghost btn-sm" data-rq="never">Não perguntar de novo</button>
        <button class="btn btn-sm" data-rq="paste">Vou colar avaliações</button>
        <button class="btn btn-sm" data-rq="camp">Usar só a campanha</button>
        <button class="btn btn-primary btn-sm" data-rq="yes">Sim, buscar referências</button>`,
      onMount: (o) => {
        o.querySelector("[data-rq='yes']").onclick = () => { U.closeModal(); const r = runResearch(camp, null); cb(r); };
        o.querySelector("[data-rq='camp']").onclick = () => { U.closeModal(); cb(null); };
        o.querySelector("[data-rq='never']").onclick = () => { U.closeModal(); S.actions.updateCampaign(camp.id, { researchOptOut: true }); cb(null); };
        o.querySelector("[data-rq='paste']").onclick = () => { U.closeModal(); pasteResearch(camp, cb); };
      },
    });
  }

  function pasteResearch(camp, cb) {
    U.modal({
      title: "Colar avaliações / perguntas", size: "",
      body: `<div class="field"><label>Avaliações (uma por linha)</label><textarea class="textarea" id="pr-reviews" placeholder="Chegou rápido…"></textarea></div>
        <div class="field mb-0"><label>Perguntas de clientes (uma por linha)</label><textarea class="textarea" id="pr-questions" placeholder="Vem com vidro?…"></textarea></div>`,
      foot: `<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" id="pr-go">🤖 Analisar</button>`,
      onMount: (o) => o.querySelector("#pr-go").onclick = () => {
        const pasted = { reviews: o.querySelector("#pr-reviews").value, questions: o.querySelector("#pr-questions").value };
        U.closeModal(); const r = runResearch(camp, pasted); cb(r);
      },
    });
  }

  function runResearch(camp, pasted) {
    const research = window.MarketResearch.analyze({ product: camp.productName || camp.title, niche: camp.style, references: (camp.references || []), pasted: pasted || {}, audience: camp.audience });
    S.actions.updateCampaign(camp.id, { research });
    U.toast("Pesquisa concluída (simulada) ✓ — inteligência aplicada");
    return research;
  }

  // Botão "Melhorar com pesquisa": força nova pesquisa e regenera roteiro
  function doResearch(c) {
    const camp = S.sel.campaign(c.campaignId);
    if (!camp) return U.toast("Card sem campanha", "warn");
    const research = runResearch(camp, null);
    let ns = applyResearch(AI.generateScriptForCard(c, camp), research);
    S.actions.updateCard(cardId, { script: ns });
    refreshBody();
  }

  // Aplica a inteligência de mercado no roteiro (gancho, texto na tela, retenção)
  function applyResearch(script, research) {
    const sc = (research.suggestedCards || [])[0];
    if (sc) {
      script.hook = sc.hook;
      script.screenText = [sc.screenText, "Link na bio 👆"];
      script.retention = { start: "00:12", end: "00:17", type: "Momento de virada", reason: sc.potentialReason, screenText: sc.screenText };
    }
    const obj = (research.contentOpportunities.objecoes || [])[0];
    if (obj && script.cutPhrases) script.cutPhrases = [obj, ...(script.cutPhrases || [])].slice(0, 3);
    return script;
  }

  // Novo card de correção vinculado
  function createCorrectionCard(c, reason) {
    const camp = S.sel.campaign(c.campaignId) || {};
    const cor = AI.generateCorrectionFromAnalysis(c, c.analysis);
    const ns = Object.assign({}, AI.generateScriptForCard(c, camp), { hook: cor.correctedScript.hook, opening: cor.correctedScript.opening, cta: cor.correctedScript.cta });
    const nid = S.actions.addCard({
      title: "Correção — " + reason, type: c.type, campaignId: c.campaignId, channel: c.channel,
      status: "Precisa corrigir", priority: "Alta", nextAction: "Regravar aplicando a correção",
      originCardId: c.id, correctionReason: reason, methods: c.methods,
      strategy: Object.assign({}, c.strategy), script: ns, visual: c.visual || {},
    });
    S.actions.addCorrection(cardId, { reason, note: "Gerou novo card de correção.", status: "Gerou novo card" });
    U.toast("Novo card de correção criado ✓");
    window.App.openCard(nid);
  }

  function roteiroTool(tool) {
    const c = card();
    const s = c.script;
    const t = {
      "melhorar-gancho": () => { S.actions.patchCard(cardId, "script.hook", "PARA TUDO: " + (s.hook || "isso vai mudar sua rotina") + " 🔥"); U.toast("Gancho melhorado ✓"); },
      "mais-direto": () => { S.actions.patchCard(cardId, "script.mainLine", "Direto ao ponto: " + (s.mainLine || "")); U.toast("Roteiro mais direto ✓"); },
      "mais-popular": () => { S.actions.patchCard(cardId, "script.mainLine", (s.mainLine || "") + " (linguagem do dia a dia)"); U.toast("Tom mais popular ✓"); },
      "mais-emocional": () => { S.actions.patchCard(cardId, "script.hook", "Sabe aquele cansaço de sempre? " + (s.hook || "")); U.toast("Mais emocional ✓"); },
      "mais-vendedor": () => { S.actions.patchCard(cardId, "script.cta", "Toca no link AGORA e garante o seu antes que acabe. 🛒"); U.toast("CTA mais vendedor ✓"); },
      "versao-curta": () => U.simulated("Versão curta", "Versão de 10s criada como variação."),
      "versao-anuncio": () => U.simulated("Versão anúncio", "Versão para anúncio criada como variação."),
      "versao-stories": () => { S.actions.patchCard(cardId, "script.stories", "Enquete + link no story seguinte. " + (s.stories || "")); U.toast("Versão stories ✓"); },
      "salvar-lib": () => { S.actions.addLibrary({ type: "Roteiro vencedor", title: s.title || c.title, content: s.hook || "", source: cardId, tags: ["roteiro"] }); U.toast("Salvo na biblioteca ✓"); },
      "variacao": () => cardAction("variation"),
    };
    (t[tool] || (() => {}))();
    refreshBody();
  }

  // Central card action handler
  function cardAction(a, el2) {
    const c = card();
    const cr = S.get().credits;
    const a2 = el2 ? el2.dataset.ver : null;
    switch (a) {
      case "iniciar": S.actions.setCardStatus(cardId, "Roteiro"); U.toast("Execução iniciada"); refreshHead(); break;
      case "send-video": S.actions.patchCard(cardId, "content.path", "enviar"); tab = "Conteúdo"; render(); break;
      case "record": S.actions.patchCard(cardId, "content.path", "gravar"); tab = "Conteúdo"; window.Recorder.open(cardId); break;
      case "open-recorder": window.Recorder.open(cardId); break;
      case "upload-gallery": window.VideoStudio.openUpload(cardId); break;
      case "view-original": window.VideoStudio.viewOriginal(cardId); break;
      case "gen-opening": window.VideoStudio.retention(true); break;
      case "view-edited": window.VideoStudio.openEdited(cardId); break;
      case "use-version": if (a2) { window.VideoStudio.chooseVersion(cardId, a2); refreshBody(); refreshHead(); } break;
      case "send-analysis-video":
        S.actions.setCardStatus(cardId, "Enviado para análise");
        S.update((s) => { const cc = s.cards.find((x) => x.id === cardId); if (cc.content.creatives[0]) cc.content.creatives[0].status = "Analisado"; });
        U.toast("Vídeo enviado para análise da IA ✓"); render(); break;
      case "gen-ai": S.actions.patchCard(cardId, "content.path", "gerar"); tab = "Conteúdo"; render(); break;
      // ---- IA: estratégia, roteiro, visual, checklist ----
      case "new-strategy": { const camp = S.sel.campaign(c.campaignId) || {}; S.actions.updateCard(cardId, { strategy: AI.generateStrategyForCard(c, camp) }); U.toast("Nova estratégia gerada pela IA ✓"); refreshBody(); break; }
      case "strategy-to-script": { const camp = S.sel.campaign(c.campaignId) || {}; S.actions.updateCard(cardId, { script: AI.generateScriptForCard(c, camp) }); U.toast("Estratégia aplicada no roteiro ✓"); tab = "Roteiro"; render(); break; }
      case "gen-visual": { const camp = S.sel.campaign(c.campaignId) || {}; S.actions.updateCard(cardId, { visual: AI.generateVisualDirection(c, camp) }); U.toast("Visual do vídeo gerado pela IA ✓"); refreshBody(); break; }
      case "gen-script": maybeResearch(c, (research) => { const camp = S.sel.campaign(c.campaignId) || {}; let ns = AI.generateScriptForCard(c, camp); if (research) ns = applyResearch(ns, research); S.actions.updateCard(cardId, { script: ns }); U.toast("Roteiro completo gerado ✓"); refreshBody(); }); break;
      case "gen-hooks": maybeResearch(c, (research) => { const camp = S.sel.campaign(c.campaignId) || {}; let ns = AI.generateScriptForCard(c, camp); if (research) ns = applyResearch(ns, research); S.actions.patchCard(cardId, "script.hook", ns.hook); S.actions.patchCard(cardId, "script.hookAlt1", ns.hookAlt1); S.actions.patchCard(cardId, "script.hookAlt2", ns.hookAlt2); U.toast("3 ganchos gerados ✓"); refreshBody(); }); break;
      case "research-roteiro": doResearch(c); break;
      case "approve_script": {
        window.Learning.saveApproval({ type: "script", finalContent: c.script.hook, tone: (S.sel.campaign(c.campaignId) || {}).style, cardId, campaignId: c.campaignId });
        window.Learning.saveApproval({ type: "hook", finalContent: c.script.hook, cardId });
        if (c.script.cta) window.Learning.saveApproval({ type: "cta", finalContent: c.script.cta, cardId });
        S.actions.addLibrary({ type: "Roteiro vencedor", title: c.script.title || c.title, content: c.script.hook || "", source: cardId, tags: ["aprovado"] });
        U.toast("Roteiro aprovado ✓ — salvei como padrão da sua operação"); break;
      }
      case "save_pattern_script": window.Learning.saveApproval({ type: "hook", finalContent: c.script.hook, cardId }); U.toast("Gancho salvo como padrão aprovado ✓"); break;
      case "reject_script": {
        const reasons = ["Genérico demais", "Formal demais", "Longo demais", "Fraco para venda", "Não combina com meu público", "Roteiro desconexo", "CTA fraco"];
        U.modal({ title: "Rejeitar roteiro", size: "narrow", body: `<p class="muted" style="margin-bottom:10px">Por quê? Vou evitar esse estilo nas próximas gerações.</p><div class="set-nav">${reasons.map((r) => `<div class="set-nav-item" data-rej="${esc(r)}">${r}</div>`).join("")}</div>`,
          onMount: (o) => o.querySelectorAll("[data-rej]").forEach((el) => el.onclick = () => { window.Learning.saveRejection({ type: "hook", originalContent: c.script.hook, reason: el.dataset.rej, cardId, campaignId: c.campaignId }); U.closeModal(); U.toast("Anotado: evitar “" + el.dataset.rej + "” ✓"); }) });
        break;
      }
      case "gen-stories": { const camp = S.sel.campaign(c.campaignId) || {}; S.actions.patchCard(cardId, "script.stories", AI.generateStoriesForCard(c, camp).join("\n")); U.toast("Stories gerados ✓"); refreshBody(); break; }
      case "gen-audience-var": genAudienceVariation(c); break;
      case "versao-curta": U.simulated("Versão curta", "Versão de 10s criada como variação."); break;
      case "versao-anuncio": U.simulated("Versão anúncio", "Versão para anúncio criada como variação."); break;
      case "salvar-lib": S.actions.addLibrary({ type: "Roteiro vencedor", title: c.script.title || c.title, content: c.script.hook || "", source: cardId, tags: ["roteiro"] }); U.toast("Roteiro salvo na biblioteca ✓"); break;
      // ---- Checklist ----
      case "add-group": U.modal({ title: "Novo grupo", size: "narrow", body: `<div class="field mb-0"><input class="input" id="ng-name" placeholder="Nome do grupo"/></div>`, foot: `<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" id="ng-ok">Adicionar</button>`, onMount: (o) => o.querySelector("#ng-ok").onclick = () => { const n = o.querySelector("#ng-name").value.trim(); if (!n) return; S.actions.chkAddGroup(cardId, n); U.closeModal(); refreshBody(); } }); break;
      case "reset-checklist": { const camp = S.sel.campaign(c.campaignId) || {}; S.actions.setChecklist(cardId, AI.generateChecklistForCard(c, camp)); U.toast("Checklist gerado pela IA ✓"); refreshBody(); break; }
      // ---- Correção ----
      case "quick-correction": quickCorrection(c); break;
      case "new-correction-card": { const reason = document.querySelector("#cor-reason").value; createCorrectionCard(c, reason); break; }
      case "analyze":
        S.actions.setCardStatus(cardId, "Enviado para análise");
        S.actions.addCreative(cardId, { type: "Vídeo enviado", source: "Upload", status: "Analisado", fileName: "video-enviado.mp4", creditsUsed: 0 });
        U.toast("Vídeo analisado pela IA ✓"); render(); break;
      case "upload-photo": {
        const inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/jpeg,image/png,image/webp,image/*";
        inp.onchange = () => { const f = inp.files && inp.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { S.actions.addProductImage(cardId, { name: f.name, url: r.result, type: "image" }); U.toast("Foto do produto salva no card ✓"); refreshBody(); }; r.readAsDataURL(f); };
        inp.click(); break;
      }
      case "gen-ai-confirm": {
        const imgs = (c.content.media && c.content.media.productImages) || [];
        if (!imgs.length) return U.toast("Envie a foto do produto primeiro", "warn");
        if (cr.available < 12) return U.toast("Créditos insuficientes — compre mais", "warn");
        const primary = imgs.find((i) => i.isPrimary) || imgs[0];
        U.confirm("Essa geração consumirá 12 créditos. Deseja continuar?", () => {
          S.actions.spendCredits(12, "Vídeo IA — " + c.title);
          const tpl = (document.querySelector("#gen-tpl") || {}).value;
          const creative = Object.assign(AI.generateVideoCreativeMock(c, { template: tpl, cost: 12 }), { sourceImageId: primary.id, previewUrl: primary.url });
          S.actions.addCreative(cardId, creative);
          S.actions.setCardStatus(cardId, "Em edição");
          U.toast("Vídeo IA gerado (simulado) ✓ — 12 créditos"); refreshBody();
        }, { yes: "Gerar (12 créditos)" }); break;
      }
      case "upload-video":
        S.actions.addCreative(cardId, { type: "Vídeo enviado", source: "Upload", status: "Enviado", fileName: "meu-video.mp4", creditsUsed: 0 });
        S.actions.addFile(cardId, { name: "meu-video.mp4", type: "Vídeo bruto", size: "12 MB", ico: "🎬" });
        U.toast("Vídeo enviado ✓"); refreshBody(); break;
      case "record-take": U.toast("Gravando… (simulado)"); break;
      case "record-repeat": U.toast("Novo take"); break;
      case "record-save":
        S.actions.addCreative(cardId, { type: "Vídeo gravado", source: "Gravação no app", status: "Gravado", fileName: "take-gravado.mp4", creditsUsed: 0 });
        S.actions.addFile(cardId, { name: "take-gravado.mp4", type: "Vídeo bruto", size: "9 MB", ico: "🎬" });
        S.actions.setCardStatus(cardId, "Gravado"); U.toast("Take salvo no card ✓"); refreshBody(); break;
      case "variation":
        const vid = S.actions.addCard({ title: c.title + " — Variação", type: c.type, campaignId: c.campaignId, channel: c.channel, status: "Ideia", priority: c.priority, methods: c.methods, strategy: Object.assign({}, c.strategy), nextAction: "Testar variação" });
        U.toast("Variação criada no Board ✓"); break;
      case "published":
        S.actions.setCardStatus(cardId, "Publicado"); S.actions.patchCard(cardId, "publication.status", "Publicado"); U.toast("Marcado como publicado ✓"); refreshHead(); break;
      case "pub-approve": window.PublishEngine.approve(cardId); refreshBody(); refreshHead(); break;
      case "pub-schedule": { const p = c.publication || {}; if (!p.date) return U.toast("Defina data e hora primeiro", "warn"); window.PublishEngine.schedule(cardId); refreshBody(); refreshHead(); break; }
      case "pub-now": window.PublishEngine.publishNow(cardId, () => { render(); }); break;
      case "pub-manual": {
        U.modal({ title: "Marcar como publicado", size: "narrow", body: `<div class="field mb-0"><label>Link da publicação (opcional)</label><input class="input" id="pm-link" placeholder="https://instagram.com/p/…"/></div>`, foot: `<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" id="pm-ok">Marcar publicado</button>`, onMount: (o) => o.querySelector("#pm-ok").onclick = () => { window.PublishEngine.markPublished(cardId, o.querySelector("#pm-link").value.trim()); U.closeModal(); refreshBody(); refreshHead(); } });
        break;
      }
      case "pub-metrics": window.PublishEngine.collectMetrics(cardId); tab = "Análise e Correção"; render(); break;
      case "correction": tab = "Análise e Correção"; render(); break;
      case "create-correction": {
        const reason = document.querySelector("#cor-reason").value;
        const note = document.querySelector("#cor-note").value || "IA gerou novo gancho, roteiro, legenda e CTA.";
        S.actions.addCorrection(cardId, { reason, note, status: "Gerou novo card" });
        const ncid = S.actions.addCard({ title: "Regravação — " + reason, type: c.type, campaignId: c.campaignId, channel: c.channel, status: "Precisa corrigir", priority: "Alta", methods: c.methods, nextAction: "Regravar aplicando correção" });
        S.actions.setCardStatus(cardId, "Virou novo teste");
        U.toast("Correção criada + card de regravação ✓"); render(); break;
      }
      case "save-metrics":
        S.actions.patchCard(cardId, "analysis.done", true);
        if (!c.analysis.summary) S.actions.patchCard(cardId, "analysis.summary", { worked: "Gancho segurou a atenção nos primeiros segundos.", failed: "CTA apareceu tarde — conversão abaixo do potencial.", repeat: "Manter o formato do gancho.", fix: "Mover CTA para o meio e mostrar produto mais cedo.", variation: "Testar mesma ideia em outro canal." });
        S.actions.setCardStatus(cardId, "Analisando resultado");
        U.toast("Métricas salvas — IA gerou diagnóstico ✓"); render(); break;
      case "new-card-analysis": case "new-caption": {
        const nid = S.actions.addCard({ title: c.title + " — Novo teste", type: c.type, campaignId: c.campaignId, channel: c.channel, status: "Ideia", nextAction: "Aplicar aprendizado" });
        U.toast("Novo card criado a partir da análise ✓"); break;
      }
      case "save-learning": S.actions.addLibrary({ type: "Aprendizado", title: "Aprendizado — " + c.title, content: c.analysis.summary ? c.analysis.summary.fix : "CTA cedo aumenta conversão.", source: cardId, tags: ["aprendizado"] }); U.toast("Aprendizado salvo ✓"); break;
      case "save-winner": S.actions.addLibrary({ type: "Gancho vencedor", title: c.script.hook || c.title, content: "Gancho que performou bem.", source: cardId, tags: ["gancho"] }); U.toast("Gancho vencedor salvo ✓"); break;
      case "copy-caption": copy(c.publication.captionFinal || c.script.caption); break;
      case "copy-hashtags": copy(c.publication.hashtagsFinal || c.script.hashtags); break;
      case "save-link": U.toast(c.publication.link ? "Link salvo ✓" : "Cole um link primeiro", c.publication.link ? "" : "warn"); break;
      case "upload-file": S.actions.addFile(cardId, { name: "arquivo-" + Math.floor(Math.random() * 900 + 100) + ".jpg", type: "Referência", size: "1.1 MB", ico: "🖼️" }); U.toast("Arquivo anexado ✓"); refreshBody(); break;
      case "analyze-again": break;
    }
  }

  function refreshHead() { const c = card(); const foot = document.querySelector(".modal-foot > div"); if (foot) foot.querySelector(".pill").outerHTML = pill(c.status); window.App.renderNav && window.App.renderNav(); }
  function copy(text) { try { navigator.clipboard.writeText(text || ""); U.toast("Copiado ✓"); } catch (e) { U.toast("Copiado ✓"); } }

  // Select helpers
  function selChannel(val, key) { const ch = ["Instagram", "TikTok", "YouTube Shorts", "Facebook", "WhatsApp", "Marketplace", "Live Shop", "Anúncios"]; return `<select class="select" ${key.startsWith("pub") ? `data-p="channel"` : `data-f="channel"`}>${ch.map((o) => `<option ${o === val ? "selected" : ""}>${esc(o)}</option>`).join("")}</select>`; }
  function selStatus(val) { return `<select class="select" data-f="status">${S.get().statuses.map((s) => `<option ${s.name === val ? "selected" : ""}>${esc(s.name)}</option>`).join("")}</select>`; }
  function selPrio(val) { return `<select class="select" data-f="priority">${["Alta", "Média", "Baixa"].map((o) => `<option ${o === val ? "selected" : ""}>${esc(o)}</option>`).join("")}</select>`; }

  // Aplica uma correção (vinda do Claude ou do mock) como nova versão do roteiro
  function applyCorrection(id, cor) {
    if (!cor) return; const cs = cor.correctedScript || cor;
    if (cs.hook) S.actions.patchCard(id, "script.hook", cs.hook);
    if (cs.opening) S.actions.patchCard(id, "script.opening", cs.opening);
    if (cs.cta) S.actions.patchCard(id, "script.cta", cs.cta);
    if (cs.screenText) S.actions.patchCard(id, "script.screenText", Array.isArray(cs.screenText) ? cs.screenText : [cs.screenText]);
    S.actions.addCorrection(id, { reason: cor.reason || "Correção", note: cor.diagnosis || "Correção aplicada (nova versão do roteiro).", status: "Aplicada" });
    const el = document.getElementById("card-tab-body"); if (el && (window.CardView.current && window.CardView.current() === id)) refreshBody();
  }
  return { open, applyCorrection, current: () => (document.getElementById("modal-overlay") && document.querySelector(".drawer-tabs") ? cardId : null), refresh: () => { const el = document.getElementById("card-tab-body"); if (el) refreshBody(); } };
})();
