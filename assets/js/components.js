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
  const chatState = { open: false, context: "Assistente global", messages: [], actions: [] };

  const DEFAULT_ACTIONS = ["Salvar como ideia", "Criar campanha", "Criar card", "Criar roteiro", "Gerar legenda", "Gerar CTA", "Criar variação", "Salvar na biblioteca"];

  function openChat(context, seedMsg, actions) {
    chatState.open = true;
    chatState.context = context || "Assistente global";
    chatState.actions = actions || DEFAULT_ACTIONS;
    if (chatState.messages.length === 0 || context) {
      chatState.messages = [{ role: "ai", text: seedMsg || "Oi! Sou o assistente do VIRALIZA. Me conta uma ideia, produto ou vídeo que eu transformo em ação.", actions: chatState.actions }];
    }
    renderChat();
  }
  function toggleChat() { chatState.open ? (chatState.open = false, renderChat()) : openChat(); }

  function chatReply(userText) {
    chatState.messages.push({ role: "user", text: userText });
    // canned intelligent-ish reply based on keywords
    const t = userText.toLowerCase();
    let reply, actions = chatState.actions;
    if (/gancho|retenção|abertura/.test(t)) {
      reply = "Aqui vão 3 ganchos com foco em <b>retenção (R)</b>:<br>1. \"Você perde tempo todo dia por causa disso 👇\"<br>2. \"Ninguém te conta esse truque de organização.\"<br>3. \"Testei por 30 dias — olha o resultado.\"<br>Quer que eu aplique um no roteiro?";
      actions = ["Aplicar no roteiro", "Criar variação", "Salvar na biblioteca", "Criar card"];
    } else if (/melhorar.*(v[íi]deo|conte[úu]do)|analis/.test(t)) {
      reply = "Analisei o padrão: o <b>produto costuma aparecer tarde</b>. Recomendo mostrar o produto nos 2 primeiros segundos e repetir o CTA no meio. Isso tende a subir retenção e conversão.";
      actions = ["Aplicar novo gancho", "Criar card de regravação", "Salvar aprendizado", "Gerar nova legenda", "Criar versão anúncio"];
    } else if (/legenda|caption/.test(t)) {
      reply = "Legenda sugerida:<br>\"Chega de perder tampa 😮‍💨 esses potes salvaram minha cozinha. Corre no link da bio! #organização #cozinha\"";
      actions = ["Aplicar no conteúdo", "Gerar variação", "Salvar na biblioteca"];
    } else if (/cta/.test(t)) {
      reply = "CTAs de conversão:<br>• \"Corre no link da bio antes que acabe o frete grátis.\"<br>• \"Toca no link e garante o seu.\"<br>Qual quer usar?";
      actions = ["Aplicar no conteúdo", "Salvar na biblioteca"];
    } else if (/campanha|afiliad|produto/.test(t)) {
      reply = "Boa! Posso montar uma <b>campanha de afiliado</b> com cards prontos: dor e solução, review, comparação, demonstração e prova social. Quer que eu crie?";
      actions = ["Criar campanha", "Criar card", "Salvar como ideia"];
    } else {
      reply = "Entendi. Posso transformar isso em ação agora. O que prefere fazer?";
      actions = chatState.actions;
    }
    setTimeout(() => { chatState.messages.push({ role: "ai", text: reply, actions }); renderChat(); scrollChat(); }, 400);
    renderChat(); scrollChat();
  }

  function handleChatAction(action) {
    // Route action buttons to real store operations where possible
    const A = window.Store.actions;
    if (action === "Salvar como ideia" || action === "Criar tarefa") {
      const last = [...chatState.messages].reverse().find((m) => m.role === "user");
      A.addIdea({ title: last ? last.text.slice(0, 60) : "Ideia do chat IA", description: last ? last.text : "", source: "Chat IA", status: "Nova" });
      toast("Ideia salva ✓"); chatState.messages.push({ role: "ai", text: "Salvei como <b>ideia</b> na sua lista. ✓", actions: chatState.actions });
    } else if (action === "Criar campanha") {
      toast("Abrindo nova campanha…"); toggleChat(); window.App.openCampaignForm();
      return;
    } else if (action === "Criar card") {
      toast("Abrindo novo card…"); toggleChat(); window.App.openCardForm();
      return;
    } else if (action === "Salvar na biblioteca" || action === "Salvar aprendizado") {
      const last = [...chatState.messages].reverse().find((m) => m.role === "ai");
      A.addLibrary({ type: action === "Salvar aprendizado" ? "Aprendizado" : "Gancho vencedor", title: (last ? last.text.replace(/<[^>]+>/g, "").slice(0, 50) : "Item do chat"), content: last ? last.text.replace(/<[^>]+>/g, "") : "" });
      toast("Salvo na biblioteca ✓"); chatState.messages.push({ role: "ai", text: "Guardado na <b>Biblioteca</b> para reuso. ✓", actions: chatState.actions });
    } else if (action === "Criar card de regravação") {
      const id = A.addCard({ title: "Regravação (via chat IA)", type: "Dor e Solução", status: "Precisa corrigir", priority: "Alta", nextAction: "Regravar abertura" });
      toast("Card de regravação criado ✓"); chatState.messages.push({ role: "ai", text: "Criei um <b>card de regravação</b> no Board. ✓", actions: chatState.actions });
    } else {
      // generic acknowledge + apply
      chatState.messages.push({ role: "ai", text: `Feito: <b>${esc(action)}</b>. ✓ (fluxo aplicado e salvo)`, actions: chatState.actions });
      toast(action + " ✓");
    }
    renderChat(); scrollChat();
  }

  function scrollChat() { const b = document.querySelector(".chat-body"); if (b) b.scrollTop = b.scrollHeight; }

  function renderChat() {
    let root = document.getElementById("chat-root");
    if (!root) { root = document.createElement("div"); root.id = "chat-root"; document.body.appendChild(root); }
    if (!chatState.open) {
      root.innerHTML = `<button class="chat-fab" title="Assistente IA">✦</button>`;
      root.querySelector(".chat-fab").onclick = toggleChat;
      return;
    }
    const msgs = chatState.messages.map((m) => {
      if (m.role === "user") return `<div class="msg user"><div class="m-ava">${initials(window.Store.get().user.name)}</div><div class="m-bubble">${esc(m.text)}</div></div>`;
      const acts = (m.actions || []).map((a) => `<button class="chip chat-act" data-act="${esc(a)}">${esc(a)}</button>`).join("");
      return `<div class="msg ai"><div class="m-ava">✦</div><div><div class="m-bubble">${m.text}</div>${acts ? `<div class="chat-actions">${acts}</div>` : ""}</div></div>`;
    }).join("");
    root.innerHTML = `
      <div class="chat-panel">
        <div class="chat-head">
          <div class="ch-ai">✦</div>
          <div style="flex:1"><div class="ch-name">Assistente VIRALIZA</div><div class="ch-ctx">Contexto: ${esc(chatState.context)}</div></div>
          <div class="x-btn" id="chat-close">✕</div>
        </div>
        <div class="chat-body">${msgs}</div>
        <div class="chat-suggest">
          <span class="chip cs" data-s="Me dá 3 ganchos de retenção">3 ganchos</span>
          <span class="chip cs" data-s="Como melhorar esse vídeo?">Melhorar vídeo</span>
          <span class="chip cs" data-s="Gera uma legenda vendedora">Legenda</span>
          <span class="chip cs" data-s="Cria uma campanha de afiliado">Campanha afiliado</span>
        </div>
        <div class="chat-input">
          <input id="chat-inp" placeholder="Escreva uma ideia, produto ou pergunta…" autocomplete="off"/>
          <button class="chat-send" id="chat-send">➤</button>
        </div>
      </div>`;
    root.querySelector("#chat-close").onclick = toggleChat;
    const inp = root.querySelector("#chat-inp");
    const send = () => { const v = inp.value.trim(); if (!v) return; inp.value = ""; chatReply(v); };
    root.querySelector("#chat-send").onclick = send;
    inp.addEventListener("keydown", (e) => { if (e.key === "Enter") send(); });
    root.querySelectorAll(".cs").forEach((c) => c.onclick = () => { inp.value = c.dataset.s; send(); });
    root.querySelectorAll(".chat-act").forEach((b) => b.onclick = () => handleChatAction(b.dataset.act));
    inp.focus(); scrollChat();
  }

  return { esc, fmt, initials, statusPill, prioClass, toast, modal, closeModal, confirm, simulated, openChat, toggleChat, renderChat, chatState };
})();
