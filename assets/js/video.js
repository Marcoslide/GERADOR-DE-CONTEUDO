/* ============================================================
   VIRALIZA — Vídeo do Card
   Dois caminhos (Gravar agora / Enviar vídeo) → mesmo fluxo:
   revisar → aprovar → análise de retenção → abertura inteligente
   → versão editada → salvar/escolher versão.
   Processamento de vídeo simulado (MVP), mas com fluxo funcional.
   ============================================================ */
window.VideoStudio = (function () {
  const S = window.Store, U = window.UI, esc = U.esc;

  // Registro de blob URLs em memória (não persistem no localStorage)
  const URLS = {};
  let pending = null; // meta do vídeo em revisão (antes de aprovar)
  let cid = null;

  function card() { return S.sel.card(cid); }
  function vid() { const c = card(); return c && c.video ? c.video : { original: null, versions: [], retention: null, chosenVersionId: null }; }
  function mmss(s) { s = Math.max(0, Math.round(s || 0)); const m = Math.floor(s / 60), r = s % 60; return String(m).padStart(2, "0") + ":" + String(r).padStart(2, "0"); }

  // ============================================================
  // Entradas
  // ============================================================
  // Chamado pelo Recorder após finalizar a gravação
  function review(cardId, meta) {
    cid = cardId;
    pending = Object.assign({ source: "gravado" }, meta);
    renderReview();
  }

  // Enviar vídeo da galeria
  function openUpload(cardId) {
    cid = cardId;
    const inp = document.createElement("input");
    inp.type = "file";
    inp.accept = "video/mp4,video/quicktime,video/webm,video/*";
    inp.onchange = () => {
      const f = inp.files && inp.files[0];
      if (!f) return;
      const url = URL.createObjectURL(f);
      pending = { source: "enviado", fileName: f.name, size: (f.size / 1048576).toFixed(1) + " MB", url, mime: f.type, duration: 0, simulated: false };
      // tenta ler a duração real
      const probe = document.createElement("video");
      probe.preload = "metadata"; probe.src = url;
      probe.onloadedmetadata = () => { pending.duration = Math.round(probe.duration) || estimateDuration(); renderReview(); };
      probe.onerror = () => { pending.duration = estimateDuration(); renderReview(); };
      setTimeout(() => { if (document.getElementById("vs-overlay")) return; if (pending) { pending.duration = pending.duration || estimateDuration(); renderReview(); } }, 700);
    };
    inp.click();
  }
  function estimateDuration() { return 22 + Math.floor(Math.random() * 20); }

  // ============================================================
  // 1) Revisar vídeo (gravado ou enviado)
  // ============================================================
  function renderReview() {
    const m = pending;
    const isRec = m.source === "gravado";
    const player = playerHTML(m.url, m.simulated, mmss(m.duration));
    const metaRows = m.source === "enviado"
      ? `<div class="kv" style="margin-top:12px"><div class="k">Arquivo</div><div class="v">${esc(m.fileName)}</div><div class="k">Duração</div><div class="v">${mmss(m.duration)}</div><div class="k">Tamanho</div><div class="v">${esc(m.size || "—")}</div></div>`
      : `<div class="kv" style="margin-top:12px"><div class="k">Origem</div><div class="v">Gravado no app (teleprompter)</div><div class="k">Duração</div><div class="v">${mmss(m.duration)}</div></div>`;
    shell(isRec ? "Revisar gravação" : "Revisar vídeo enviado", `
      ${player}
      ${metaRows}
      <div class="alert info" style="margin-top:14px"><span class="al-ico">👀</span><div class="al-body" style="font-size:12px">Assista e aprove. Só depois de <b>Aprovar vídeo</b> o Viraliza analisa a retenção e sugere uma abertura mais forte.</div></div>`,
      `<button class="btn btn-ghost" data-vs="cancel">Cancelar</button>
       <button class="btn btn-sm" data-vs="${isRec ? "again-rec" : "again-up"}">${isRec ? "↺ Gravar novamente" : "📤 Enviar outro vídeo"}</button>
       <button class="btn btn-sm" data-vs="save-original">💾 Salvar original no card</button>
       <button class="btn btn-primary" data-vs="approve">✓ Aprovar vídeo</button>`);
  }

  function saveOriginal() {
    const m = pending;
    const version = { id: S.uid("ver"), kind: "Original", label: "Original", source: m.source, fileName: m.fileName || ("video-" + cid.slice(-4)), duration: m.duration, size: m.size || "—", createdAt: today(), status: "Salvo" };
    if (m.url) URLS["orig:" + cid] = m.url;
    S.actions.withVideo(cid, (v, c) => {
      v.original = { id: version.id, source: m.source, fileName: version.fileName, duration: m.duration, size: version.size, createdAt: today() };
      // substitui Original anterior, se houver
      v.versions = v.versions.filter((x) => x.kind !== "Original");
      v.versions.unshift(version);
      if (!v.chosenVersionId) v.chosenVersionId = version.id;
      c.status = "Gravado";
    });
    // também registra como criativo (compatibilidade com aba/analise)
    S.actions.addCreative(cid, { type: m.source === "gravado" ? "Vídeo gravado" : "Vídeo enviado", source: m.source === "gravado" ? "Gravação no app" : "Upload da galeria", status: "Original salvo", fileName: version.fileName, creditsUsed: 0 });
    return version;
  }

  // ============================================================
  // 2) Análise de retenção
  // ============================================================
  function retention(reopen) {
    const v = vid();
    if (!v.original && !reopen) { U.toast("Grave ou envie um vídeo primeiro", "warn"); return; }
    shell("Análise de retenção", `
      <div class="vs-analyzing" id="vs-analyzing">
        <div class="vs-spinner"></div>
        <h3 style="color:var(--text-0);margin-top:16px">Estamos procurando a melhor cena para abrir seu vídeo.</h3>
        <p class="muted" style="margin-top:6px">Analisando ritmo, picos de atenção e momentos de virada…</p>
      </div>`, "");
    setTimeout(() => showRetention(), 1300);
  }

  function showRetention(selectedIdx) {
    const c = card();
    const dur = (c.video && c.video.original ? c.video.original.duration : 0) || pending && pending.duration || 25;
    let r = c.video && c.video.retention;
    if (!r) { r = buildRetention(dur, c); S.actions.withVideo(cid, (v) => v.retention = r); }
    const idx = selectedIdx == null ? 0 : selectedIdx;
    const main = r.suggestions[idx];
    const orig = "orig:" + cid;
    shell("Análise de retenção", `
      <div class="info-block"><h4>🎯 Cena de retenção sugerida</h4>
        <div class="scene-card featured">
          <div class="scene-top"><span class="pill pill-accent">⭐ ${esc(main.label)}</span><span class="pill pill-gray">${esc(main.type)}</span></div>
          <div class="scene-time">${mmss(main.start)} — ${mmss(main.end)} <span class="muted">· ${main.end - main.start}s</span></div>
          <div class="scene-reason"><b>Motivo:</b> ${esc(main.reason)}</div>
          <div class="scene-screen"><span class="tp-label" style="color:var(--text-3)">Texto na tela sugerido</span>“${esc(main.screenText)}”</div>
          <div class="scene-struct"><b>Nova estrutura:</b> ${esc(main.structure)}</div>
        </div>
      </div>
      <div id="vs-alts"></div>
      <div class="flex gap-8 wrap" style="margin-top:6px">
        <button class="btn btn-sm" data-vs="alts">🔀 Escolher outro trecho</button>
      </div>`,
      `<button class="btn btn-ghost" data-vs="back-card">Fechar</button>
       <button class="btn btn-primary" data-vs="gen-edited" data-idx="${idx}">🎬 Gerar vídeo editado</button>`);
  }

  function showAlternatives() {
    const r = card().video.retention;
    const box = document.getElementById("vs-alts");
    if (!box) return;
    box.innerHTML = `<div class="info-block"><h4>🔀 Sugestões alternativas</h4>
      ${r.suggestions.map((s, i) => `
        <div class="scene-card">
          <div class="scene-top"><span class="pill pill-blue">Sugestão ${i + 1} — ${esc(s.label)}</span><span class="pill pill-gray">${esc(s.type)}</span></div>
          <div class="scene-time">${mmss(s.start)} — ${mmss(s.end)} <span class="muted">· ${s.end - s.start}s</span></div>
          <div class="scene-reason">${esc(s.reason)}</div>
          <div class="scene-screen"><span class="tp-label" style="color:var(--text-3)">Texto na tela</span>“${esc(s.screenText)}”</div>
          <button class="btn btn-sm btn-primary mt-16" data-vs="use-scene" data-idx="${i}">Usar este trecho</button>
        </div>`).join("")}</div>`;
  }

  // ============================================================
  // 3) Gerar vídeo editado (Abertura Inteligente)
  // ============================================================
  function generateEdited(idx) {
    const r = card().video.retention;
    const scene = r.suggestions[idx] || r.suggestions[0];
    shell("Gerando vídeo editado", `
      <div class="vs-analyzing"><div class="vs-spinner"></div>
        <h3 style="color:var(--text-0);margin-top:16px">Montando a Abertura Inteligente…</h3>
        <p class="muted" style="margin-top:6px">Colocando a cena forte no início, aplicando texto na tela e legenda automática.</p>
      </div>`, "");
    setTimeout(() => {
      const version = {
        id: S.uid("ver"), kind: "Abertura Inteligente", label: "Vídeo com Abertura Inteligente", source: "editado",
        fileName: "abertura-inteligente-" + cid.slice(-4) + ".mp4", duration: (card().video.original ? card().video.original.duration : scene.end) || scene.end,
        sceneUsed: mmss(scene.start) + " — " + mmss(scene.end), screenText: scene.screenText, aiNote: scene.reason,
        structure: scene.structure, sceneType: scene.type, createdAt: today(), status: "Vídeo editado gerado",
      };
      // a versão editada reaproveita o mesmo blob do original para preview (reordenação é simulada)
      if (URLS["orig:" + cid]) URLS[version.id] = URLS["orig:" + cid];
      S.actions.withVideo(cid, (v, c) => {
        v.versions = v.versions.filter((x) => x.kind !== "Abertura Inteligente" || false); // mantém histórico? removemos só a anterior de mesmo nome
        // na verdade queremos histórico: renomeia a anterior como Variação
        const prev = v.versions.find((x) => x.kind === "Abertura Inteligente");
        if (prev) { prev.kind = "Variação"; prev.label = "Variação — " + (prev.sceneUsed || ""); }
        v.versions.splice(v.original ? 1 : 0, 0, version);
        c.status = "Em edição";
      });
      editedReady(version.id);
    }, 1400);
  }

  function editedReady(versionId) {
    const v = vid();
    const edited = v.versions.find((x) => x.id === versionId);
    const origUrl = URLS["orig:" + cid];
    shell("Vídeo editado pronto", `
      <div class="vs-compare">
        <div>
          <div class="vs-tag">Original</div>
          ${playerHTML(origUrl, !origUrl, mmss(v.original ? v.original.duration : 0))}
        </div>
        <div>
          <div class="vs-tag text-accent">✨ Abertura Inteligente</div>
          ${playerHTML(URLS[versionId], !URLS[versionId], mmss(edited.duration), edited.screenText)}
        </div>
      </div>
      <div class="info-block" style="margin-top:16px"><h4>🎬 O que a IA fez</h4>
        <div class="kv">
          <div class="k">Cena usada na abertura</div><div class="v">${esc(edited.sceneUsed)} <span class="pill pill-gray">${esc(edited.sceneType || "")}</span></div>
          <div class="k">Texto aplicado na tela</div><div class="v">“${esc(edited.screenText)}”</div>
          <div class="k">Motivo da IA</div><div class="v">${esc(edited.aiNote)}</div>
        </div>
        <div class="vs-timeline">${timelineChips(edited.structure)}</div>
        <div class="pill pill-accent" style="margin-top:10px">✓ ${esc(edited.status)}</div>
      </div>`,
      `<button class="btn btn-sm" data-vs="use-orig">Usar versão original</button>
       <button class="btn btn-sm" data-vs="gen-other">🔁 Gerar outra versão</button>
       <button class="btn btn-sm" data-vs="send-analysis" data-ver="${versionId}">🔍 Enviar para análise</button>
       <button class="btn btn-primary" data-vs="use-edited" data-ver="${versionId}">✓ Usar versão editada</button>`);
  }

  function timelineChips(structure) {
    const parts = (structure || "Cena forte → contexto → explicação → resultado → CTA").split(/→|›|>/).map((s) => s.trim()).filter(Boolean);
    return parts.map((p, i) => `<span class="vs-scene-chip ${i === 0 ? "strong" : ""}">${i === 0 ? "▶ " : ""}${esc(p)}</span>`).join('<span class="vs-arrow">→</span>');
  }

  // ============================================================
  // Players / helpers
  // ============================================================
  function playerHTML(url, simulated, durLabel, screenText) {
    if (url) {
      return `<div class="rec-stage" style="max-height:46vh">
        <video src="${url}" controls playsinline style="width:100%;height:100%;object-fit:cover"></video>
        <div class="rec-hud"><span class="rec-badge">⏱️ ${esc(durLabel)}</span></div>
        ${screenText ? `<div class="vs-screen-text">“${esc(screenText)}”</div>` : ""}
      </div>`;
    }
    return `<div class="rec-stage" style="max-height:46vh"><div class="rec-sim"><div><div class="rec-sim-ico">🎬</div><b style="color:var(--text-1)">Prévia do vídeo</b><div style="font-size:12px;margin-top:6px;max-width:280px">Duração ${esc(durLabel)}. Prévia simulada (sem vídeo real disponível nesta sessão) — o fluxo continua funcionando.</div></div></div>
      ${screenText ? `<div class="vs-screen-text">“${esc(screenText)}”</div>` : ""}</div>`;
  }

  // Gera sugestões de cena baseadas na duração, roteiro e tipo
  function buildRetention(dur, c) {
    dur = Math.max(6, dur || 25);
    const type = c.type || "";
    const clamp = (a, b) => [Math.min(a, dur - 1), Math.min(b, dur)];
    const byType = {
      "Antes e depois": "Transformação", "Review": "Reação", "Demonstração": "Demonstração",
      "Dor e Solução": "Problema visual", "Comparação": "Comparação", "Unboxing": "Produto aparecendo",
      "Prova social": "Cliente reagindo",
    };
    const [rs, re] = clamp(Math.round(dur * 0.72), Math.round(dur * 0.72) + 5);
    const [vs2, ve] = clamp(Math.round(dur * 0.44), Math.round(dur * 0.44) + 4);
    const [ps, pe] = clamp(Math.round(dur * 0.28), Math.round(dur * 0.28) + 3);
    const suggestions = [
      { label: "Melhor retenção visual", type: byType[type] || "Resultado visual", start: rs, end: re,
        reason: "Essa cena mostra o momento mais forte do vídeo e pode prender mais atenção logo no início.",
        screenText: "Olha o que aconteceu no final…", structure: "Cena forte → contexto → explicação → resultado → CTA" },
      { label: "Resultado final primeiro", type: "Resultado final", start: Math.min(dur - 4, Math.round(dur * 0.85)), end: Math.min(dur, Math.round(dur * 0.85) + 4),
        reason: "Começar pelo resultado gera curiosidade: a pessoa fica para entender como chegou ali.",
        screenText: "Espera até ver como ficou 👀", structure: "Resultado → como começou → passo a passo → CTA" },
      { label: "Frase mais forte", type: "Frase forte", start: ps, end: pe,
        reason: "Abrir com a frase de maior impacto acelera a promessa e melhora os 3 primeiros segundos.",
        screenText: "Ninguém te conta isso…", structure: "Frase forte → prova → demonstração → resultado → CTA" },
      { label: "Reação / momento de virada", type: "Momento de virada", start: vs2, end: ve,
        reason: "A reação/virada é o pico emocional — ótimo gancho para reter e gerar comentário.",
        screenText: "Não acredita? Olha isso.", structure: "Virada → contexto → explicação → benefício → CTA" },
    ];
    return { suggestions, createdAt: today() };
  }

  // ============================================================
  // Ações de versão
  // ============================================================
  function chooseVersion(versionId) {
    S.actions.withVideo(cid, (v) => v.chosenVersionId = versionId);
    const v = vid(); const ver = v.versions.find((x) => x.id === versionId);
    S.actions.setCardStatus(cid, "Pronto para publicar");
    U.toast(`Versão “${ver ? ver.label : ""}” escolhida para publicação ✓`);
  }

  function sendToAnalysis(versionId) {
    S.actions.setCardStatus(cid, "Enviado para análise");
    S.actions.withVideo(cid, (v, c) => { const ver = v.versions.find((x) => x.id === versionId); if (ver) ver.status = "Enviado para análise"; });
    S.update((s) => { const c = s.cards.find((x) => x.id === cid); if (c.content.creatives[0]) c.content.creatives[0].status = "Analisado"; });
    U.toast("Versão enviada para análise da IA ✓");
    closeToCard();
  }

  // ============================================================
  // Shell / overlay
  // ============================================================
  function shell(title, body, foot) {
    remove();
    const o = document.createElement("div");
    o.className = "rec-overlay"; o.id = "vs-overlay";
    o.innerHTML = `<div class="rec-shell">
      <div class="rec-head"><h3>${esc(title)}</h3><div class="x-btn" data-vs="close">✕</div></div>
      <div class="rec-body">${body}</div>
      ${foot ? `<div class="rec-foot">${foot}</div>` : ""}
    </div>`;
    document.body.appendChild(o);
    o.querySelectorAll("[data-vs]").forEach((el) => el.onclick = () => handle(el.dataset.vs, el));
  }
  function remove() { const o = document.getElementById("vs-overlay"); if (o) o.remove(); }
  function closeToCard() {
    remove();
    if (window.CardView && document.getElementById("modal-overlay")) window.App.openCard(cid);
    else window.App.render();
  }

  function handle(action, el) {
    switch (action) {
      case "close": case "cancel": remove(); closeToCard(); break;
      case "back-card": closeToCard(); break;
      case "again-rec": remove(); if (pending && pending.url) { try { URL.revokeObjectURL(pending.url); } catch (e) {} } window.Recorder.open(cid); break;
      case "again-up": remove(); openUpload(cid); break;
      case "save-original": saveOriginal(); U.toast("Original salvo no card ✓"); closeToCard(); break;
      case "approve": saveOriginal(); U.toast("Vídeo aprovado ✓"); retention(); break;
      case "alts": showAlternatives(); break;
      case "use-scene": { const i = +el.dataset.idx; showRetention(i); break; }
      case "gen-edited": generateEdited(+el.dataset.idx); break;
      case "gen-other": retention(true); break;
      case "use-edited": chooseVersion(el.dataset.ver); closeToCard(); break;
      case "use-orig": { const v = vid(); const o = v.versions.find((x) => x.kind === "Original"); if (o) chooseVersion(o.id); closeToCard(); break; }
      case "send-analysis": sendToAnalysis(el.dataset.ver); break;
    }
  }

  function today() { return new Date().toISOString().slice(0, 10); }

  // Abertura direta a partir do card
  function openEdited(cardId) {
    cid = cardId; const v = vid();
    const edited = v.versions.find((x) => x.kind === "Abertura Inteligente");
    if (edited) editedReady(edited.id);
    else if (v.original) retention(true);
    else U.toast("Grave ou envie um vídeo primeiro", "warn");
  }
  function viewOriginal(cardId) {
    cid = cardId; const v = vid();
    if (!v.original) return U.toast("Nenhum vídeo original ainda", "warn");
    shell("Vídeo original", playerHTML(URLS["orig:" + cid], !URLS["orig:" + cid], mmss(v.original.duration)) +
      `<div class="kv" style="margin-top:12px"><div class="k">Origem</div><div class="v">${v.original.source === "gravado" ? "Gravado no app" : "Enviado da galeria"}</div><div class="k">Arquivo</div><div class="v">${esc(v.original.fileName)}</div></div>`,
      `<button class="btn btn-ghost" data-vs="close">Fechar</button><button class="btn btn-primary" data-vs="gen-other">🎬 Gerar abertura inteligente</button>`);
  }
  function getUrl(key) { return URLS[key]; }

  return { review, openUpload, retention, openEdited, viewOriginal, chooseVersion: (cardId, vId) => { cid = cardId; chooseVersion(vId); }, getUrl };
})();
