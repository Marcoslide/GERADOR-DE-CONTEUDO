/* ============================================================
   VIRALIZA — Gravar agora (câmera + teleprompter)
   O roteiro aparece na tela como sobreposição (teleprompter) e
   NÃO é gravado no vídeo — o MediaRecorder captura apenas o
   stream da câmera, não o DOM. Fallback simulado no file://.
   ============================================================ */
window.Recorder = (function () {
  const S = window.Store, U = window.UI, esc = U.esc;

  let cardId = null;
  let stream = null;         // MediaStream da câmera
  let mediaRecorder = null;
  let chunks = [];
  let recordedBlob = null;
  let recordedUrl = null;
  let simulated = false;     // sem câmera real
  let landscape = false;
  let mirror = true;

  // teleprompter
  let tpRAF = null, tpPos = 0, tpLast = 0, tpPlaying = false;
  let tpSpeed = 60;          // px/s
  let tpFont = 26;           // px
  let countdownOn = true;

  // timer
  let recStart = 0, recTimerId = null, recSeconds = 0, recording = false, paused = false;
  let segment = "full";      // full | hook | cta

  function open(id) {
    cardId = id;
    resetMedia();
    // O teleprompter precisa da Fala Principal — se não existir, a IA gera o roteiro antes de gravar.
    const c = S.sel.card(id);
    if (window.AI && (!c.script || !c.script.mainLine)) {
      const camp = S.sel.campaign(c.campaignId) || {};
      const ns = window.AI.generateScriptForCard(c, camp);
      S.actions.updateCard(id, { script: Object.assign({}, c.script, ns) });
      U.toast("Roteiro gerado pela IA para o teleprompter ✓");
    }
    renderPrep();
  }

  function card() { return S.sel.card(cardId); }

  // ---------- Roteiro → linhas do teleprompter ----------
  function scriptLines() {
    const s = card().script || {};
    const lines = [];
    if (segment === "hook") {
      if (s.hook) lines.push({ label: "Gancho", text: s.hook, hook: true });
      if (s.hookAlt1) lines.push({ label: "Gancho alt.", text: s.hookAlt1 });
    } else if (segment === "cta") {
      if (s.cta) lines.push({ label: "CTA", text: s.cta });
    } else {
      if (s.hook) lines.push({ label: "Gancho", text: s.hook, hook: true });
      if (s.opening) lines.push({ label: "Abertura (3s)", text: s.opening });
      if (s.mainLine) lines.push({ label: "Fala principal", text: s.mainLine });
      (s.cutPhrases || []).forEach((p) => lines.push({ label: "Frase de corte", text: p }));
      if (s.cta) lines.push({ label: "CTA", text: s.cta });
    }
    if (!lines.length) lines.push({ label: "Roteiro", text: "Sem roteiro definido — grave livremente ou volte ao card e crie o roteiro." });
    return lines;
  }

  // ============================================================
  // 1) Preparação (checklist rápido)
  // ============================================================
  function renderPrep() {
    const items = ["Cenário escolhido e organizado", "Luz testada (rosto iluminado)", "Áudio testado (sem eco/ruído)", "Produto em cena e limpo", "Roteiro revisado"];
    shell(`Gravar agora — ${esc(card().title)}`, `
      <div class="rec-prep">
        <p class="muted" style="text-align:center;margin-bottom:16px">Checklist rápido antes de gravar. Marque o que já está pronto:</p>
        ${items.map((t, i) => `<div class="prep-item" data-prep="${i}"><div class="chk-box" data-box="${i}"></div><div>${esc(t)}</div></div>`).join("")}
        <div class="alert info" style="margin-top:14px"><span class="al-ico">🎬</span><div class="al-body" style="font-size:12px">O roteiro vai aparecer na tela como <b>teleprompter</b> para você ler — mas <b>não aparece no vídeo final</b>.</div></div>
      </div>`,
      `<button class="btn btn-ghost" data-rec-close>Cancelar</button>
       <button class="btn btn-primary" id="rec-start-prep">Iniciar gravação →</button>`);
    const o = document.getElementById("rec-overlay");
    o.querySelectorAll("[data-prep]").forEach((el) => el.onclick = () => { const b = el.querySelector(".chk-box"); b.classList.toggle("done"); b.textContent = b.classList.contains("done") ? "✓" : ""; });
    o.querySelector("#rec-start-prep").onclick = () => renderStage();
  }

  // ============================================================
  // 2) Palco: câmera + teleprompter + controles
  // ============================================================
  async function renderStage() {
    segment = segment || "full";
    shell(`Gravar${segment === "hook" ? " gancho" : segment === "cta" ? " CTA" : ""} — ${esc(card().title)}`, `
      <div class="rec-stage ${landscape ? "landscape" : ""}" id="rec-stage">
        <video id="rec-video" autoplay muted playsinline class="${mirror ? "mirror" : ""}"></video>
        <div class="rec-sim" id="rec-sim" style="display:none">
          <div><div class="rec-sim-ico">📷</div><b style="color:var(--text-1)">Câmera não disponível</b>
          <div style="font-size:12px;max-width:260px;margin-top:6px">Abrindo via arquivo local a câmera pode ser bloqueada. Modo simulado ativo — você ainda pode testar todo o fluxo (gravar, salvar take, analisar).</div></div>
        </div>
        <div class="rec-hud">
          <span class="rec-timer" id="rec-timer"><span class="rec-dot" style="display:none" id="rec-recdot"></span>00:00</span>
          <span class="rec-badge">⏱️ ideal 15–25s</span>
          <span class="rec-badge" id="rec-mode"></span>
        </div>
        <div class="teleprompter" id="rec-tp"><div class="teleprompter-inner" id="rec-tp-inner"></div></div>
        <div class="rec-count" id="rec-count" style="display:none"><span id="rec-count-n">3</span></div>
      </div>

      <div class="rec-controls">
        <button class="rec-btn" id="rec-restart" title="Reiniciar teleprompter">↺</button>
        <button class="rec-btn rmain" id="rec-main" title="Gravar / Parar">⏺</button>
        <button class="rec-btn" id="rec-pause" title="Pausar/continuar teleprompter">⏯</button>
      </div>

      <div class="rec-sliders">
        <div class="rec-slider"><label>Velocidade do texto <span id="rec-speed-v">${tpSpeed} px/s</span></label><input type="range" id="rec-speed" min="20" max="140" value="${tpSpeed}"></div>
        <div class="rec-slider"><label>Tamanho da fonte <span id="rec-font-v">${tpFont} px</span></label><input type="range" id="rec-font" min="16" max="46" value="${tpFont}"></div>
      </div>
      <div class="rec-toggles">
        <span class="chip ${countdownOn ? "on" : ""}" id="rec-cd">⏲ Contagem 3‑2‑1</span>
        <span class="chip ${mirror ? "on" : ""}" id="rec-mirror">🪞 Espelhar</span>
        <span class="chip ${landscape ? "on" : ""}" id="rec-orient">↔️ Horizontal</span>
      </div>
      <div class="rec-note">O teleprompter é sobreposto e <b>não</b> é gravado no vídeo.</div>`,
      `<button class="btn btn-ghost" data-rec-close>Fechar</button>
       <button class="btn btn-sm" id="rec-back-prep">← Checklist</button>`);

    const o = document.getElementById("rec-overlay");
    buildTeleprompter();
    o.querySelector("#rec-back-prep").onclick = () => { stopTeleprompter(); renderPrep(); };
    o.querySelector("#rec-restart").onclick = () => { tpPos = teleStart(); applyTP(); };
    o.querySelector("#rec-pause").onclick = () => { tpPlaying ? stopTeleprompter() : startTeleprompter(); };
    o.querySelector("#rec-main").onclick = () => recording ? stopRecording() : beginCountdownThenRecord();
    const sp = o.querySelector("#rec-speed"); sp.oninput = () => { tpSpeed = +sp.value; o.querySelector("#rec-speed-v").textContent = tpSpeed + " px/s"; };
    const ft = o.querySelector("#rec-font"); ft.oninput = () => { tpFont = +ft.value; o.querySelector("#rec-font-v").textContent = tpFont + " px"; buildTeleprompter(true); };
    o.querySelector("#rec-cd").onclick = (e) => { countdownOn = !countdownOn; e.target.classList.toggle("on", countdownOn); };
    o.querySelector("#rec-mirror").onclick = (e) => { mirror = !mirror; e.target.classList.toggle("on", mirror); const v = document.getElementById("rec-video"); if (v) v.classList.toggle("mirror", mirror); };
    o.querySelector("#rec-orient").onclick = (e) => { landscape = !landscape; e.target.classList.toggle("on", landscape); document.getElementById("rec-stage").classList.toggle("landscape", landscape); };

    await startCamera();
  }

  function buildTeleprompter(keepPos) {
    const inner = document.getElementById("rec-tp-inner");
    if (!inner) return;
    inner.style.fontSize = tpFont + "px";
    inner.innerHTML = scriptLines().map((l) => `<div class="tp-line ${l.hook ? "tp-hook" : ""}"><span class="tp-label">${esc(l.label)}</span>${esc(l.text)}</div>`).join("");
    if (!keepPos) { tpPos = teleStart(); }
    applyTP();
  }
  function teleStart() { const tp = document.getElementById("rec-tp"); return tp ? tp.clientHeight * 0.9 : 200; }
  function applyTP() { const inner = document.getElementById("rec-tp-inner"); if (inner) inner.style.transform = `translateY(${tpPos}px)`; }

  function startTeleprompter() {
    if (tpPlaying) return;
    tpPlaying = true; tpLast = 0;
    const step = (ts) => {
      if (!tpPlaying) return;
      if (!tpLast) tpLast = ts;
      const dt = (ts - tpLast) / 1000; tpLast = ts;
      tpPos -= tpSpeed * dt;
      const inner = document.getElementById("rec-tp-inner");
      if (inner && tpPos < -(inner.scrollHeight)) tpPos = teleStart(); // loop
      applyTP();
      tpRAF = requestAnimationFrame(step);
    };
    tpRAF = requestAnimationFrame(step);
  }
  function stopTeleprompter() { tpPlaying = false; if (tpRAF) cancelAnimationFrame(tpRAF); tpRAF = null; }

  // ---------- Câmera ----------
  async function startCamera() {
    const video = document.getElementById("rec-video");
    const sim = document.getElementById("rec-sim");
    const modeBadge = document.getElementById("rec-mode");
    simulated = false;
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error("no mediaDevices");
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1080 }, height: { ideal: 1920 } }, audio: true });
      video.srcObject = stream;
      if (modeBadge) modeBadge.textContent = "🟢 Câmera ativa";
    } catch (e) {
      simulated = true;
      if (video) video.style.display = "none";
      if (sim) sim.style.display = "grid";
      if (modeBadge) modeBadge.textContent = "⚪ Modo simulado";
    }
  }

  function resetMedia() {
    recordedBlob = null; if (recordedUrl) { URL.revokeObjectURL(recordedUrl); recordedUrl = null; }
    chunks = []; recording = false; paused = false; recSeconds = 0; segment = "full";
  }
  function stopCamera() { if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; } }

  // ---------- Contagem + gravação ----------
  function beginCountdownThenRecord() {
    if (!countdownOn) return startRecording();
    const el = document.getElementById("rec-count"), n = document.getElementById("rec-count-n");
    let c = 3; el.style.display = "grid"; n.textContent = c;
    const iv = setInterval(() => {
      c--;
      if (c <= 0) { clearInterval(iv); el.style.display = "none"; startRecording(); }
      else n.textContent = c;
    }, 800);
  }

  function startRecording() {
    recording = true; paused = false; recSeconds = 0;
    document.getElementById("rec-main").classList.add("recording");
    document.getElementById("rec-recdot").style.display = "inline-block";
    startTeleprompter();
    // timer
    updateTimer();
    recTimerId = setInterval(() => { if (!paused) { recSeconds++; updateTimer(); } }, 1000);
    // MediaRecorder (real)
    if (!simulated && stream) {
      chunks = [];
      let opts = {};
      const types = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"];
      for (const t of types) { if (window.MediaRecorder && MediaRecorder.isTypeSupported(t)) { opts = { mimeType: t }; break; } }
      try {
        mediaRecorder = new MediaRecorder(stream, opts);
        mediaRecorder.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
        mediaRecorder.onstop = () => { recordedBlob = new Blob(chunks, { type: (mediaRecorder.mimeType || "video/webm") }); recordedUrl = URL.createObjectURL(recordedBlob); renderReview(); };
        mediaRecorder.start();
      } catch (e) { simulated = true; }
    }
    U.toast("Gravando…");
  }

  function stopRecording() {
    recording = false;
    document.getElementById("rec-main") && document.getElementById("rec-main").classList.remove("recording");
    const dot = document.getElementById("rec-recdot"); if (dot) dot.style.display = "none";
    stopTeleprompter();
    if (recTimerId) { clearInterval(recTimerId); recTimerId = null; }
    if (!simulated && mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop(); // triggers onstop → renderReview
    } else {
      renderReview(); // simulated
    }
  }

  function updateTimer() { const el = document.getElementById("rec-timer"); if (el) el.innerHTML = `<span class="rec-dot" id="rec-recdot" style="display:${recording ? "inline-block" : "none"}"></span>${mmss(recSeconds)}`; }
  function mmss(s) { const m = Math.floor(s / 60), r = s % 60; return String(m).padStart(2, "0") + ":" + String(r).padStart(2, "0"); }

  // ============================================================
  // 3) Revisão + ações pós-gravação
  // ============================================================
  let aiDone = false;
  // Após finalizar a gravação, entrega ao fluxo unificado do Vídeo do Card
  function renderReview() {
    stopCamera();
    const meta = {
      source: "gravado",
      fileName: `take-${cardId.slice(-4)}.webm`,
      duration: recSeconds,
      size: recordedBlob ? (recordedBlob.size / 1048576).toFixed(1) + " MB" : "—",
      url: recordedUrl,
      simulated: simulated,
    };
    close(true); // remove o overlay do gravador (silencioso)
    window.VideoStudio.review(cardId, meta);
  }

  function renderReviewLegacy() {
    stopCamera(); aiDone = false;
    const dur = mmss(recSeconds);
    const preview = recordedUrl
      ? `<video src="${recordedUrl}" controls playsinline class="${mirror ? "" : ""}" style="width:100%;height:100%;object-fit:cover"></video>`
      : `<div class="rec-sim"><div><div class="rec-sim-ico">🎬</div><b style="color:var(--text-1)">Take gravado (simulado)</b><div style="font-size:12px;margin-top:6px">Duração ${dur}. Sem câmera real, o vídeo não é baixável — mas o fluxo de salvar e analisar funciona.</div></div></div>`;
    shell(`Take gravado — ${esc(card().title)}`, `
      <div class="rec-stage ${landscape ? "landscape" : ""}" style="max-height:52vh">${preview}
        <div class="rec-hud"><span class="rec-badge">⏱️ ${dur}</span><span class="rec-badge">${simulated ? "⚪ simulado" : "🟢 vídeo real"}</span></div>
      </div>
      <div class="rec-controls" style="margin-top:14px">
        <button class="btn" id="rev-repeat">↺ Repetir take</button>
        <button class="btn btn-primary" id="rev-save">💾 Salvar take no card</button>
        <button class="btn" id="rev-download" ${recordedUrl ? "" : "disabled"}>⬇️ Baixar vídeo</button>
        <button class="btn" id="rev-analyze">🔍 Enviar para análise</button>
      </div>
      <div id="rev-ai"></div>
      <div class="divider"></div>
      <p class="muted" style="font-size:12px;text-align:center;margin-bottom:8px">Depois de gravar — corrija e multiplique:</p>
      <div class="rec-after">
        <button class="btn btn-sm" id="rev-caption">✍️ Gerar legenda</button>
        <button class="btn btn-sm" id="rev-rehook">🪝 Regravar gancho</button>
        <button class="btn btn-sm" id="rev-recta">📣 Regravar CTA</button>
        <button class="btn btn-sm" id="rev-variation">🧬 Criar variação</button>
      </div>`,
      `<button class="btn btn-ghost" data-rec-close>Concluir</button>`);

    const o = document.getElementById("rec-overlay");
    o.querySelector("#rev-repeat").onclick = () => { resetTakeKeepSegment(); renderStage(); };
    o.querySelector("#rev-save").onclick = () => saveTake();
    o.querySelector("#rev-download").onclick = () => downloadTake();
    o.querySelector("#rev-analyze").onclick = () => analyzeTake();
    o.querySelector("#rev-caption").onclick = () => genCaption();
    o.querySelector("#rev-rehook").onclick = () => { segment = "hook"; resetTakeKeepSegment(); renderStage(); };
    o.querySelector("#rev-recta").onclick = () => { segment = "cta"; resetTakeKeepSegment(); renderStage(); };
    o.querySelector("#rev-variation").onclick = () => createVariation();
  }

  function resetTakeKeepSegment() { chunks = []; recSeconds = 0; recording = false; if (recordedUrl) { URL.revokeObjectURL(recordedUrl); recordedUrl = null; } recordedBlob = null; }

  let savedThisTake = false;
  function saveTake() {
    const fn = `take-${cardId.slice(-4)}-${mmss(recSeconds).replace(":", "m")}s.webm`;
    S.actions.addCreative(cardId, { type: segment === "hook" ? "Regravação do gancho" : segment === "cta" ? "Regravação do CTA" : "Vídeo gravado", source: "Gravação no app (teleprompter)", status: "Gravado", fileName: fn, creditsUsed: 0 });
    S.actions.addFile(cardId, { name: fn, type: "Vídeo bruto", size: simulated ? "—" : approxSize(), ico: "🎬" });
    S.actions.setCardStatus(cardId, "Gravado");
    savedThisTake = true;
    U.toast("Take salvo no card ✓");
  }
  function approxSize() { return recordedBlob ? (recordedBlob.size / (1024 * 1024)).toFixed(1) + " MB" : "—"; }

  function downloadTake() {
    if (!recordedUrl) return U.toast("Sem vídeo real para baixar (modo simulado)", "warn");
    const a = document.createElement("a");
    a.href = recordedUrl; a.download = `take-${card().title.replace(/[^\w]+/g, "-").toLowerCase()}.webm`;
    document.body.appendChild(a); a.click(); a.remove();
    U.toast("Download iniciado ✓");
  }

  function analyzeTake() {
    if (!savedThisTake) saveTake();
    S.actions.setCardStatus(cardId, "Enviado para análise");
    // marca criativo como analisado
    S.update((s) => { const c = s.cards.find((x) => x.id === cardId); if (c.content.creatives[0]) c.content.creatives[0].status = "Analisado"; });
    aiDone = true;
    const box = document.getElementById("rev-ai");
    if (box) box.innerHTML = `
      <div class="info-block" style="margin-top:14px"><h4>🤖 Análise da IA</h4>
        <div class="score-ring" style="margin-bottom:12px">
          <div class="ring" style="background:conic-gradient(var(--accent) 0% 76%, var(--bg-3) 76% 100%)"><div style="width:72px;height:72px;border-radius:50%;background:var(--panel);display:grid;place-items:center"><div class="ring-val">7.6</div></div></div>
          <div><b style="color:var(--text-0)">Boa base — ${recSeconds < 8 ? "muito curto" : recSeconds > 45 ? "um pouco longo" : "duração ideal"}</b><p class="muted" style="font-size:13px;margin-top:4px">Gancho no tempo certo. Ajuste o CTA e mostre o produto cedo para subir a conversão.</p></div>
        </div>
        <div class="analysis-row"><span class="ar-ico">✅</span><div><b style="color:var(--text-0)">Ponto forte:</b> leitura fluida com o teleprompter, ritmo bom.</div></div>
        <div class="analysis-row"><span class="ar-ico">⚠️</span><div><b style="color:var(--text-0)">Melhorar:</b> reforçar o CTA no fim e mostrar o produto nos primeiros segundos.</div></div>
        <div class="analysis-row"><span class="ar-ico">✨</span><div><b style="color:var(--text-0)">Sugestão:</b> regravar só o gancho e testar uma variação.</div></div>
      </div>`;
    U.toast("Vídeo analisado pela IA ✓");
  }

  function genCaption() {
    const s = card().script || {};
    const cap = s.caption || `${s.hook || "Olha isso 👇"} \n\n${s.cta || "Link na bio!"} ${s.hashtags || "#viraliza"}`;
    S.actions.patchCard(cardId, "publication.captionFinal", cap);
    U.toast("Legenda gerada e salva na Publicação ✓");
  }

  function createVariation() {
    const c = card();
    S.actions.addCard({ title: c.title + " — Variação", type: c.type, campaignId: c.campaignId, channel: c.channel, status: "Ideia", priority: c.priority, methods: c.methods, strategy: Object.assign({}, c.strategy), nextAction: "Testar variação" });
    U.toast("Variação criada no Board ✓");
  }

  // ============================================================
  // Shell (overlay)
  // ============================================================
  function shell(title, body, foot) {
    close(true);
    const o = document.createElement("div");
    o.className = "rec-overlay"; o.id = "rec-overlay";
    o.innerHTML = `<div class="rec-shell">
      <div class="rec-head"><h3>${title}</h3><div class="x-btn" data-rec-close>✕</div></div>
      <div class="rec-body">${body}</div>
      ${foot ? `<div class="rec-foot">${foot}</div>` : ""}
    </div>`;
    document.body.appendChild(o);
    o.querySelectorAll("[data-rec-close]").forEach((el) => el.onclick = () => close());
    return o;
  }

  function close(silent) {
    stopTeleprompter();
    if (recTimerId) { clearInterval(recTimerId); recTimerId = null; }
    if (!silent) stopCamera();
    const o = document.getElementById("rec-overlay");
    if (o) o.remove();
    if (!silent) {
      recording = false; savedThisTake = false;
      // refresh underlying card drawer if open
      if (window.CardView && document.getElementById("modal-overlay")) window.App.openCard(cardId);
      else window.App.render();
    }
  }

  return { open, close };
})();
