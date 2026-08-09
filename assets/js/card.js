/* ============================================================
   R.E.A.L. OS — Card detalhado (drawer com 9 abas)
   Resumo · Estratégia · Roteiro · Conteúdo · Checklist ·
   Publicação · Análise · Correção · Arquivos
   ============================================================ */
window.CardView = (function () {
  const S = window.Store, U = window.UI, esc = U.esc, fmt = U.fmt, pill = U.statusPill;
  let cardId = null, tab = "Resumo";

  const TABS = ["Resumo", "Estratégia", "Roteiro", "Conteúdo", "Checklist", "Publicação", "Análise", "Correção", "Arquivos"];
  const METHODS = ["Promessa Forte", "Gancho de Retenção", "Dor e Solução", "Antes e Depois", "Prova Social", "Review", "Demonstração", "Comparação", "Unboxing", "Oferta Clara", "Urgência", "Bastidor de Autoridade", "Resposta a Comentário", "Quebra de Objeção", "Conteúdo de Rua", "Produto no Dia a Dia", "Transformação", "Comunidade e Desejo", "Frases de Corte", "Volume e Distribuição", "Teste de Variações"];
  const METHOD_ICO = { "Promessa Forte": "🎯", "Gancho de Retenção": "🪝", "Dor e Solução": "💢", "Antes e Depois": "🔄", "Prova Social": "👥", "Review": "⭐", "Demonstração": "🧪", "Comparação": "⚖️", "Unboxing": "📦", "Oferta Clara": "🏷️", "Urgência": "⏰", "Bastidor de Autoridade": "🎬", "Resposta a Comentário": "💬", "Quebra de Objeção": "🛡️", "Conteúdo de Rua": "🏙️", "Produto no Dia a Dia": "🏠", "Transformação": "✨", "Comunidade e Desejo": "❤️", "Frases de Corte": "✂️", "Volume e Distribuição": "📡", "Teste de Variações": "🧬" };

  const VIDEO_TYPES = ["Produto em destaque", "Antes e depois", "Ambiente decorado", "Oferta rápida", "Vídeo de afiliado", "Review", "Anúncio", "Story", "Marketplace", "Live Shop", "Prova social", "Transformação"];
  const TEMPLATES = ["Zoom lento no produto", "Produto entrando em cena", "Ambiente antes e depois", "Destaque de benefício", "Oferta com CTA", "Comparação", "Demonstração visual", "Vídeo UGC simulado", "Produto em uso", "Chamada para live"];
  const CORRECTION_REASONS = ["Gancho fraco", "Produto apareceu tarde", "CTA fraco", "Vídeo longo", "Áudio ruim", "Imagem ruim", "Promessa confusa", "Faltou prova", "Faltou oferta", "Pouca emoção", "Público errado", "Canal errado", "Legenda fraca", "Baixa conversão", "Baixa retenção"];

  function open(id) { cardId = id; tab = "Resumo"; render(); }
  function card() { return S.sel.card(cardId); }

  function render() {
    const c = card();
    if (!c) return U.closeModal();
    const chkDone = c.checklist.flatMap((g) => g.items).filter((i) => i.done).length;
    const chkTotal = c.checklist.flatMap((g) => g.items).length;
    const counts = { "Correção": c.corrections.length, "Arquivos": c.files.length, "Checklist": `${chkDone}/${chkTotal}` };
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
    root.querySelector("[data-cardact='ai']").onclick = () => U.openChat("Card: " + card().title, "Estou no contexto deste card. Posso melhorar o gancho, gerar roteiro, criar checklist, analisar o vídeo ou criar uma correção. O que você quer?", ["Melhorar gancho", "Criar variação", "Gerar nova legenda", "Criar card de regravação", "Salvar na biblioteca"]);
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
      case "Resumo": return tResumo(c);
      case "Estratégia": return tEstrategia(c);
      case "Roteiro": return tRoteiro(c);
      case "Conteúdo": return tConteudo(c);
      case "Checklist": return tChecklist(c);
      case "Publicação": return tPublicacao(c);
      case "Análise": return tAnalise(c);
      case "Correção": return tCorrecao(c);
      case "Arquivos": return tArquivos(c);
    }
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
    const tools = [["melhorar-gancho", "Melhorar gancho"], ["mais-direto", "Mais direto"], ["mais-popular", "Mais popular"], ["mais-emocional", "Mais emocional"], ["mais-vendedor", "Mais vendedor"], ["versao-curta", "Versão curta"], ["versao-anuncio", "Versão anúncio"], ["versao-stories", "Versão stories"], ["salvar-lib", "Salvar na biblioteca"], ["variacao", "Transformar em variação"]];
    return `
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
    if (ct.path === "enviar") return contentSend(c, creatives);
    if (ct.path === "gravar") return contentRecord(c, creatives);

    return `
      <p class="muted" style="margin-bottom:16px">Escolha como criar o conteúdo deste card. Três caminhos:</p>
      <div class="content-paths">
        <div class="content-path" data-path="gerar"><div class="cp-ico">✨</div><h4>Gerar com IA</h4><p>Crie um vídeo com IA a partir da foto do produto, com template e prévia.</p></div>
        <div class="content-path" data-path="enviar"><div class="cp-ico">📤</div><h4>Enviar vídeo</h4><p>Suba um vídeo gravado por você e receba análise completa da IA.</p></div>
        <div class="content-path" data-path="gravar"><div class="cp-ico">🎥</div><h4>Gravar agora</h4><p>Grave direto pelo sistema com roteiro e gancho na tela.</p></div>
      </div>
      ${creatives ? `<div class="info-block"><h4>🎬 Criativos deste card</h4>${creatives}</div>` : ""}`;
  }

  function contentGenerate(c, creatives) {
    const cr = S.get().credits;
    return `
      <button class="btn btn-ghost btn-sm" data-path="" style="margin-bottom:12px">← Caminhos</button>
      <div class="info-block"><h4>✨ Gerar vídeo com IA</h4>
        <div class="upload-zone" data-sim="Upload da imagem do produto" style="margin-bottom:16px"><div class="uz-ico">🖼️</div><b style="color:var(--text-0)">Upload da imagem do produto</b><div class="muted" style="font-size:12px;margin-top:4px">A IA valida a imagem automaticamente. Formatos: JPG, PNG.</div></div>
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

  // ---------- CHECKLIST ----------
  function tChecklist(c) {
    return c.checklist.map((g, gi) => {
      const done = g.items.filter((i) => i.done).length;
      return `<div class="chk-group">
        <div class="chk-group-head">📌 ${esc(g.group)}<span class="chk-prog">${done}/${g.items.length}</span></div>
        ${g.items.map((i, ii) => `<div class="chk-item"><div class="chk-box ${i.done ? "done" : ""}" data-chk="${gi}-${ii}">${i.done ? "✓" : ""}</div><div class="ci-text ${i.done ? "done" : ""}">${esc(i.t)}</div></div>`).join("")}
      </div>`;
    }).join("");
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
    root.querySelectorAll("[data-sc]").forEach((el) => el.onblur = () => {
      const key = el.dataset.sc, val = el.innerText.trim();
      if (["scenes", "screenText", "cutPhrases"].includes(key)) S.actions.patchCard(cardId, "script." + key, val.split(/[•|]/).map((x) => x.trim()).filter(Boolean));
      else S.actions.patchCard(cardId, "script." + key, val);
    });
    root.querySelectorAll("[data-m]").forEach((el) => el.onchange = () => S.actions.patchCard(cardId, "analysis.metrics." + el.dataset.m, el.value));

    // Methods (apply strategy)
    root.querySelectorAll("[data-method]").forEach((el) => el.onclick = () => applyMethod(el.dataset.method));

    // Checklist
    root.querySelectorAll("[data-chk]").forEach((el) => el.onclick = () => { const [gi, ii] = el.dataset.chk.split("-").map(Number); S.actions.toggleChecklist(cardId, gi, ii); refreshBody(); });

    // Content path switch (Gravar agora abre o estúdio direto)
    root.querySelectorAll("[data-path]").forEach((el) => el.onclick = () => { S.actions.patchCard(cardId, "content.path", el.dataset.path || null); refreshBody(); if (el.dataset.path === "gravar") window.Recorder.open(cardId); });

    // Roteiro tools
    root.querySelectorAll("[data-rt]").forEach((el) => el.onclick = () => roteiroTool(el.dataset.rt));

    // Simulated
    root.querySelectorAll("[data-sim]").forEach((el) => el.onclick = () => U.simulated(el.dataset.sim, "Fluxo salvo no card."));

    // Card actions
    root.querySelectorAll("[data-ca]").forEach((el) => el.onclick = () => cardAction(el.dataset.ca));
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
  function cardAction(a) {
    const c = card();
    const cr = S.get().credits;
    switch (a) {
      case "iniciar": S.actions.setCardStatus(cardId, "Roteiro"); U.toast("Execução iniciada"); refreshHead(); break;
      case "send-video": S.actions.patchCard(cardId, "content.path", "enviar"); tab = "Conteúdo"; render(); break;
      case "record": S.actions.patchCard(cardId, "content.path", "gravar"); tab = "Conteúdo"; window.Recorder.open(cardId); break;
      case "open-recorder": window.Recorder.open(cardId); break;
      case "gen-ai": S.actions.patchCard(cardId, "content.path", "gerar"); tab = "Conteúdo"; render(); break;
      case "analyze":
        S.actions.setCardStatus(cardId, "Enviado para análise");
        S.actions.addCreative(cardId, { type: "Vídeo enviado", source: "Upload", status: "Analisado", fileName: "video-enviado.mp4", creditsUsed: 0 });
        U.toast("Vídeo analisado pela IA ✓"); render(); break;
      case "gen-ai-confirm":
        if (cr.available < 12) return U.toast("Créditos insuficientes", "warn");
        U.confirm("Essa geração consumirá 12 créditos. Deseja continuar?", () => {
          S.actions.spendCredits(12, "Vídeo IA — " + c.title);
          S.actions.addCreative(cardId, { type: "Vídeo IA", source: "IA (foto do produto)", template: "Zoom lento no produto", status: "Gerado", creditsUsed: 12, fileName: "video-ia-" + cardId.slice(-4) + ".mp4" });
          U.toast("Vídeo IA gerado ✓ (12 créditos)"); refreshBody();
        }, { yes: "Gerar (12 créditos)" }); break;
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
      case "correction": tab = "Correção"; render(); break;
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

  return { open };
})();
