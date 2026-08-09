/* ============================================================
   R.E.A.L. OS — Componentes de UI (modal, toast, chat, helpers)
   ============================================================ */
window.UI = (function () {
  // ---------- helpers ----------
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = (n) => { n = Number(n) || 0; return n >= 1000 ? (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1).replace(".", ",") + "k" : String(n); };
  const initials = (name) => (name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  const STATUS_PILL = {
    "Ideia": "pill-gray", "Roteiro": "pill-blue", "Pronto para gravar": "pill-accent", "Gravado": "pill-accent",
    "Enviado para análise": "pill-purple", "Precisa corrigir": "pill-red", "Em edição": "pill-amber",
    "Aguardando aprovação": "pill-pink", "Pronto para publicar": "pill-accent", "Publicado": "pill-accent",
    "Analisando resultado": "pill-blue", "Virou novo teste": "pill-purple", "Concluído": "pill-gray",
    "Ativa": "pill-accent", "Planejamento": "pill-blue", "Não publicado": "pill-gray", "Agendado": "pill-blue",
    "Pausado": "pill-amber", "Nova": "pill-blue", "Em análise": "pill-amber", "Boa para campanha": "pill-accent",
    "Virou card": "pill-purple", "Salva para depois": "pill-gray", "Arquivada": "pill-gray",
    "Rascunho": "pill-gray", "Conteúdo gerado": "pill-blue", "Aprovado": "pill-accent", "Publicando": "pill-purple",
    "Falha na publicação": "pill-red", "Publicado manualmente": "pill-accent", "Em análise": "pill-blue", "Impulsionado": "pill-amber", "Em anúncio": "pill-amber", "Encerrado": "pill-gray", "Variação criada": "pill-purple",
  };
  const statusPill = (s) => `<span class="pill ${STATUS_PILL[s] || "pill-gray"}"><span class="dot"></span>${esc(s)}</span>`;
  const prioClass = (p) => ({ "Alta": "prio-alta", "Média": "prio-media", "Baixa": "prio-baixa" }[p] || "prio-baixa");

  // ---------- Toast ----------
  function toast(msg, kind) {
    let wrap = document.querySelector(".toast-wrap");
    if (!wrap) { wrap = document.createElement("div"); wrap.className = "toast-wrap"; document.body.appendChild(wrap); }
    const el = document.createElement("div");
    el.className = "toast" + (kind === "warn" ? " warn" : "");
    el.innerHTML = `<span class="t-ico">${kind === "warn" ? "⚠️" : "✓"}</span><span>${esc(msg)}</span>`;
    wrap.appendChild(el);
    setTimeout(() => { el.style.transition = "opacity .3s, transform .3s"; el.style.opacity = "0"; el.style.transform = "translateY(10px)"; setTimeout(() => el.remove(), 300); }, 2600);
  }

  // ---------- Modal ----------
  function modal({ title, body, foot, size, onMount }) {
    closeModal();
    const overlay = document.createElement("div");
    overlay.className = "overlay";
    overlay.id = "modal-overlay";
    overlay.innerHTML = `
      <div class="modal ${size || ""}" role="dialog">
        <div class="modal-head">
          <h3>${esc(title)}</h3>
          <div class="x-btn" data-close>✕</div>
        </div>
        <div class="modal-body">${body}</div>
        ${foot ? `<div class="modal-foot">${foot}</div>` : ""}
      </div>`;
    overlay.addEventListener("click", (e) => { if (e.target === overlay || e.target.closest("[data-close]")) closeModal(); });
    document.body.appendChild(overlay);
    if (onMount) onMount(overlay);
    return overlay;
  }
  function closeModal() { const m = document.getElementById("modal-overlay"); if (m) m.remove(); }

  // Confirm dialog
  function confirm(msg, onYes, opts) {
    opts = opts || {};
    modal({
      title: opts.title || "Confirmar", size: "narrow",
      body: `<p style="color:var(--text-1);line-height:1.6">${esc(msg)}</p>`,
      foot: `<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn ${opts.danger ? "btn-danger" : "btn-primary"}" id="cf-yes">${esc(opts.yes || "Confirmar")}</button>`,
      onMount: (o) => { o.querySelector("#cf-yes").onclick = () => { closeModal(); onYes(); }; },
    });
  }

  // "simulated integration" modal
  function simulated(featureName, savedMsg) {
    modal({
      title: "Função preparada para integração", size: "narrow",
      body: `<div style="text-align:center;padding:8px">
        <div style="font-size:40px;margin-bottom:12px">🔌</div>
        <h3 style="color:var(--text-0);font-size:16px;margin-bottom:8px">${esc(featureName)}</h3>
        <p style="color:var(--text-2);line-height:1.6">Função preparada para integração real. ${esc(savedMsg || "Fluxo salvo no card.")}</p>
      </div>`,
      foot: `<button class="btn btn-primary btn-block" data-close>Entendi</button>`,
    });
  }

  // ---------- Chat (contextual) ----------
  // ============ Assistente operacional (usa window.Assistant) ============
  const chatState = { open: false, messages: [] };

  function ctx() { return window.Assistant ? window.Assistant.getContext() : { view: "hoje" }; }

  function openChat() {
    chatState.open = true;
    if (!chatState.messages.length) chatState.messages = [{ role: "ai", text: window.Assistant ? window.Assistant.greeting(ctx()) : "Oi! Sou o Assistente VIRALIZA.", actions: [] }];
    renderChat();
  }
  // reabre com saudação de contexto (usado por "Assistente do card")
  function openChatContext() { chatState.open = true; chatState.messages.push({ role: "ai", text: window.Assistant.greeting(ctx()), actions: [] }); renderChat(); }
  function toggleChat() { chatState.open ? (chatState.open = false, renderChat()) : openChat(); }

  function pushAI(res) { if (res && (res.text || (res.actions && res.actions.length))) { if (res.text) chatState.messages.push({ role: "ai", text: res.text, actions: res.actions || [] }); } renderChat(); scrollChat(); }

  function chatReply(userText) {
    chatState.messages.push({ role: "user", text: userText });
    renderChat(); scrollChat();
    // Claude real quando configurado; senão, cérebro simulado (Assistant).
    if (window.AIProvider && window.AIProvider.isReal()) {
      chatState.messages.push({ role: "ai", text: "…", actions: [], _typing: true }); renderChat(); scrollChat();
      window.AIProvider.assistantReply(userText, ctx()).then((res) => {
        chatState.messages = chatState.messages.filter((m) => !m._typing);
        if (res.source === "claude") {
          const n = window.AIProvider.executeActions(res.actions, ctx());
          const note = (res.learningUsed && res.learningUsed.length) ? `<div class="muted" style="font-size:11px;margin-top:6px">🧠 usei: ${res.learningUsed.map((x) => esc(x)).join(" · ")}</div>` : "";
          chatState.messages.push({ role: "ai", text: (res.reply || "Feito. ✓") + note, actions: [] });
          if (n > 0) window.App.render();
          renderChat(); scrollChat();
        } else { pushAI({ text: window.Assistant.reply(userText, ctx()).text, actions: window.Assistant.reply(userText, ctx()).actions }); }
      }).catch(() => { chatState.messages = chatState.messages.filter((m) => !m._typing); const m = window.Assistant.reply(userText, ctx()); pushAI(m); });
    } else {
      setTimeout(() => { const res = window.Assistant.reply(userText, ctx()); pushAI(res); }, 300);
    }
  }

  function runAction(mi, ai) {
    const a = chatState.messages[mi] && chatState.messages[mi].actions[ai];
    if (!a) return;
    const res = window.Assistant.exec(a.act, ctx(), a.payload);
    pushAI(res);
  }

  function scrollChat() { const b = document.querySelector(".chat-body"); if (b) b.scrollTop = b.scrollHeight; }

  function renderChat() {
    let root = document.getElementById("chat-root");
    if (!root) { root = document.createElement("div"); root.id = "chat-root"; document.body.appendChild(root); }
    if (!chatState.open) { root.innerHTML = `<button class="chat-fab" title="Assistente VIRALIZA">✦</button>`; root.querySelector(".chat-fab").onclick = toggleChat; return; }
    const context = ctx();
    const msgs = chatState.messages.map((m, mi) => {
      if (m.role === "user") return `<div class="msg user"><div class="m-ava">${initials(window.Store.get().user.name)}</div><div class="m-bubble">${esc(m.text)}</div></div>`;
      const acts = (m.actions || []).map((a, ai) => `<button class="chip chat-act" data-mi="${mi}" data-ai="${ai}">${esc(a.label)}</button>`).join("");
      return `<div class="msg ai"><div class="m-ava">✦</div><div><div class="m-bubble">${m.text}</div>${acts ? `<div class="chat-actions">${acts}</div>` : ""}</div></div>`;
    }).join("");
    const quick = window.Assistant ? window.Assistant.quickButtons(context) : [];
    root.innerHTML = `
      <div class="chat-panel">
        <div class="chat-head">
          <div class="ch-ai">✦</div>
          <div style="flex:1"><div class="ch-name">Assistente VIRALIZA</div><div class="ch-ctx">${esc(window.Assistant ? window.Assistant.label(context) : "")}</div></div>
          <div class="x-btn" id="chat-close">✕</div>
        </div>
        ${window.Assistant ? window.Assistant.header(context) : ""}
        <div class="chat-body">${msgs}</div>
        <div class="chat-suggest">${quick.map(([l, a]) => `<span class="chip cs" data-qact="${esc(a)}">${esc(l)}</span>`).join("")}</div>
        <div class="chat-input">
          <input id="chat-inp" placeholder="Fale com o Viraliza: “melhora esse roteiro”, “cria 3 vídeos”…" autocomplete="off"/>
          <button class="chat-send" id="chat-send">➤</button>
        </div>
      </div>`;
    root.querySelector("#chat-close").onclick = toggleChat;
    const inp = root.querySelector("#chat-inp");
    const send = () => { const v = inp.value.trim(); if (!v) return; inp.value = ""; chatReply(v); };
    root.querySelector("#chat-send").onclick = send;
    inp.addEventListener("keydown", (e) => { if (e.key === "Enter") send(); });
    root.querySelectorAll(".cs").forEach((c) => c.onclick = () => { const res = window.Assistant.exec(c.dataset.qact, ctx()); pushAI(res); });
    root.querySelectorAll(".chat-act").forEach((b) => b.onclick = () => runAction(+b.dataset.mi, +b.dataset.ai));
    inp.focus(); scrollChat();
  }

  return { esc, fmt, initials, statusPill, prioClass, toast, modal, closeModal, confirm, simulated, openChat, openChatContext, toggleChat, renderChat, chatState };
})();
