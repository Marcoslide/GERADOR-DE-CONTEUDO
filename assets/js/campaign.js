/* ============================================================
   VIRALIZA — Criar campanha com IA (conversacional)
   Pouca entrada, muita saída: o usuário escolhe por botões e a
   IA monta a campanha + cards prontos.
   ============================================================ */
window.CampaignWizard = (function () {
  const S = window.Store, U = window.UI, AI = window.AI, esc = U.esc;
  let w = null;

  const GOALS = ["Vender produto", "Campanha de afiliado", "Gerar vídeos com foto do produto", "Gravar vídeos com teleprompter", "Analisar vídeo já gravado", "Criar conteúdo orgânico", "Marketplace", "Live Shop"];
  const CHANNELS = ["Instagram", "TikTok", "YouTube Shorts", "Facebook", "WhatsApp", "Marketplace", "Anúncios"];
  const STYLES = ["Direto e vendedor", "Natural estilo UGC", "Antes e depois", "Review", "Demonstração", "Prova social", "Humor leve", "Premium", "Popular", "Educativo", "Urgência/oferta", "Storytelling"];
  const MATERIAL = ["Tenho foto do produto", "Tenho vídeo gravado", "Tenho link de referência", "Tenho link de afiliado", "Tenho só a ideia", "Quero gravar agora"];
  const QUANTITY = ["1 vídeo", "3 vídeos", "5 vídeos", "7 dias de conteúdo", "10 variações"];

  function open(prefill) {
    w = { text: (prefill && prefill.text) || "", goal: "Vender produto", channels: ["Instagram", "TikTok"], style: "Direto e vendedor", material: [], quantity: "3 vídeos", audience: "" };
    renderForm();
  }

  function chips(list, selected, multi, key) {
    const isSel = (v) => multi ? (w[key] || []).includes(v) : w[key] === v;
    return `<div class="chip-select">${list.map((v) => `<div class="chip ${isSel(v) ? "on" : ""}" data-wchip="${key}" data-val="${esc(v)}" data-multi="${multi ? 1 : 0}">${esc(v)}</div>`).join("")}</div>`;
  }

  function renderForm() {
    U.modal({
      title: "Criar campanha com IA", size: "wide",
      body: `
        <div class="msg ai" style="max-width:100%;margin-bottom:16px"><div class="m-ava">✦</div><div class="m-bubble">Me diga em poucas palavras o que você quer criar. Pode ser um produto, uma ideia, um link de afiliado, um vídeo que você já gravou ou uma campanha para gerar vendas.</div></div>
        <div class="field"><textarea class="textarea" id="w-text" placeholder="Ex: Quero vender um kit de quadros decorativos usando vídeos para Instagram e TikTok.">${esc(w.text)}</textarea></div>
        <div class="field"><label>O que você quer criar?</label>${chips(GOALS, w.goal, false, "goal")}</div>
        <div class="field"><label>Onde quer publicar?</label>${chips(CHANNELS, w.channels, true, "channels")}</div>
        <div class="field"><label>Estilo do vídeo</label>${chips(STYLES, w.style, false, "style")}</div>
        <div class="field"><label>Material disponível</label>${chips(MATERIAL, w.material, true, "material")}</div>
        <div class="form-row">
          <div class="field"><label>Quantidade desejada</label>${chips(QUANTITY, w.quantity, false, "quantity")}</div>
          <div class="field"><label>Público (opcional)</label><input class="input" id="w-aud" value="${esc(w.audience)}" placeholder="Ex: mães que querem organizar a cozinha"/></div>
        </div>`,
      foot: `<button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" id="w-preview">✦ Gerar prévia com IA</button>`,
      onMount: (o) => {
        o.querySelectorAll("[data-wchip]").forEach((el) => el.onclick = () => {
          const key = el.dataset.wchip, val = el.dataset.val, multi = el.dataset.multi === "1";
          if (multi) { w[key] = w[key] || []; const i = w[key].indexOf(val); i >= 0 ? w[key].splice(i, 1) : w[key].push(val); el.classList.toggle("on"); }
          else { w[key] = val; o.querySelectorAll(`[data-wchip="${key}"]`).forEach((x) => x.classList.toggle("on", x.dataset.val === val)); }
        });
        o.querySelector("#w-preview").onclick = () => {
          w.text = o.querySelector("#w-text").value.trim();
          w.audience = o.querySelector("#w-aud").value.trim();
          if (!w.text && !w.audience) return U.toast("Escreva em poucas palavras o que você quer criar", "warn");
          w.plan = AI.generateCampaignPlan(w);
          renderPreview();
        };
      },
    });
  }

  function renderPreview() {
    const p = w.plan;
    const branches = AI.generateAudienceBranches(p.audience);
    const willGen = [
      `${p.cardPlan.length} cards de vídeo prontos`, `${p.cardPlan.length} roteiros com gancho e cena de retenção`,
      `sequência de stories`, `checklist de gravação`, `direção de visual (roupa, ambiente, enquadramento)`,
      `legenda, hashtags e CTA`, `plano de publicação em ${p.channels.join(", ")}`,
    ];
    U.modal({
      title: "Prévia da campanha", size: "wide",
      body: `
        <div class="grid grid-2" style="align-items:start">
          <div class="info-block"><h4>🤖 A IA entendeu</h4>
            <div class="kv">
              <div class="k">Produto/oferta</div><div class="v">${esc(p.productName)} — ${esc(p.offer)}</div>
              <div class="k">Objetivo</div><div class="v">${esc(p.objective)}</div>
              <div class="k">Público inicial</div><div class="v">${esc(p.audience)}</div>
              <div class="k">Canais</div><div class="v">${p.channels.join(", ")}</div>
              <div class="k">Estilo</div><div class="v">${esc(p.style)}</div>
              <div class="k">Quantidade</div><div class="v">${p.cardPlan.length} conteúdos</div>
              <div class="k">Materiais</div><div class="v">${(p.materials || []).join(", ") || "—"}</div>
            </div>
          </div>
          <div class="info-block"><h4>✨ O Viraliza vai gerar</h4>
            ${willGen.map((g) => `<div class="analysis-row" style="padding:7px 0"><span class="ar-ico">✓</span><div>${esc(g)}</div></div>`).join("")}
            <div class="tag-row" style="margin-top:10px">${p.cardPlan.map((c) => `<span class="pill pill-gray">${esc(c.type)}</span>`).join("")}</div>
          </div>
        </div>
        <div class="info-block mb-0"><h4>👥 Subpúblicos sugeridos <span class="muted" style="font-weight:400">(crie variações por público)</span></h4>
          <div class="tag-row">${branches.slice(0, 6).map((b, i) => `<span class="chip" data-branch="${i}">${esc(b.name)}</span>`).join("")}</div>
          <div id="w-branch-detail"></div>
        </div>`,
      foot: `<button class="btn btn-ghost" data-close>Cancelar</button>
        <button class="btn btn-sm" id="w-back">← Ajustar com IA</button>
        <button class="btn btn-primary" id="w-create">✓ Criar campanha</button>`,
      onMount: (o) => {
        o.querySelector("#w-back").onclick = () => renderForm();
        o.querySelector("#w-create").onclick = () => create();
        o.querySelectorAll("[data-branch]").forEach((el) => el.onclick = () => {
          const b = branches[+el.dataset.branch];
          o.querySelectorAll("[data-branch]").forEach((x) => x.classList.remove("on")); el.classList.add("on");
          o.querySelector("#w-branch-detail").innerHTML = `
            <div class="scene-card" style="margin-top:12px">
              <div class="scene-top"><span class="pill pill-accent">${esc(b.name)}</span><span class="pill pill-gray">${esc(b.videoType)}</span><span class="pill pill-blue">${esc(b.platform)}</span></div>
              <div class="kv" style="margin-top:6px"><div class="k">Dor</div><div class="v">${esc(b.pain)}</div><div class="k">Desejo</div><div class="v">${esc(b.desire)}</div><div class="k">Linguagem</div><div class="v">${esc(b.language)}</div><div class="k">Gancho</div><div class="v">${esc(b.hook)}</div><div class="k">CTA</div><div class="v">${esc(b.cta)}</div></div>
              <div class="flex gap-8 wrap" style="margin-top:10px"><button class="btn btn-xs" data-buse="${el.dataset.branch}">Usar este público</button><button class="btn btn-xs" data-blib="${el.dataset.branch}">Salvar na biblioteca</button></div>
            </div>`;
          o.querySelector(`[data-buse="${el.dataset.branch}"]`).onclick = () => { w.plan.audience = b.name; U.toast("Público atualizado para: " + b.name); o.querySelectorAll(".kv .v")[2] && null; renderPreview(); };
          o.querySelector(`[data-blib="${el.dataset.branch}"]`).onclick = () => { S.actions.addLibrary({ type: "Públicos/subpúblicos", title: b.name, content: `Dor: ${b.pain}. Desejo: ${b.desire}. Gancho: ${b.hook}. CTA: ${b.cta}. Plataforma: ${b.platform}.`, tags: ["público"] }); U.toast("Subpúblico salvo na biblioteca ✓"); };
        });
      },
    });
  }

  function create() {
    const p = w.plan;
    const id = S.actions.addCampaign({
      title: p.title, type: p.type, objective: p.objective, productName: p.productName, offer: p.offer,
      audience: p.audience, promise: p.promise, emotion: p.emotion, cta: p.cta, channels: p.channels,
      style: p.style, videosPerDay: 2, status: "Ativa",
      startDate: new Date().toISOString().slice(0, 10), endDate: "",
    });
    const camp = S.sel.campaign(id);
    const cardIds = AI.generateCardsForCampaign(camp, p.cardPlan);
    U.closeModal();
    U.toast(`Campanha criada com ${cardIds.length} cards prontos ✓`);
    location.hash = "#/campanha/" + id;
  }

  return { open };
})();
