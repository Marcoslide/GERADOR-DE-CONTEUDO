/* ============================================================
   VIRALIZA — Assistente operacional (agente do sistema)
   Entende contexto (tela/card/campanha), lê o estado, cruza
   dados e EXECUTA ações reais. Mock inteligente no MVP.
   ============================================================ */
window.Assistant = (function () {
  const S = window.Store, U = window.UI, AI = window.AI, PE = window.PublishEngine, esc = U.esc;

  // ---------- Contexto ----------
  function route() { const h = (location.hash || "#/hoje").replace(/^#\//, "").split("/"); return { view: h[0] || "hoje", param: h[1] }; }
  function getContext() {
    const st = S.get();
    const r = route();
    const cardId = (window.CardView && window.CardView.current && window.CardView.current()) || null;
    const card = cardId ? S.sel.card(cardId) : null;
    let campaignId = null;
    if (card) campaignId = card.campaignId;
    else if (r.view === "campanha") campaignId = r.param;
    const campaign = campaignId ? S.sel.campaign(campaignId) : null;
    return { view: r.view, cardId, card, campaignId, campaign, st };
  }

  function label(ctx) {
    if (ctx.card) return "Card: " + ctx.card.title;
    if (ctx.campaign) return "Campanha: " + ctx.campaign.title;
    return { hoje: "Hoje", board: "Board", analise: "Análise", biblioteca: "Biblioteca", persona: "Persona", ideias: "Ideias", campanhas: "Campanhas", config: "Configurações" }[ctx.view] || "VIRALIZA";
  }

  // Cabeçalho "Contexto atual"
  function header(ctx) {
    let rows = [];
    if (ctx.card) {
      const c = ctx.card, v = c.video || {}, camp = ctx.campaign;
      rows = [
        ["Card", c.title], camp ? ["Campanha", camp.title] : null, ["Status", c.status],
        ["Próxima ação", c.nextAction || "—"], ["Vídeos salvos", (v.versions || []).length],
        ["Análises", c.analysis && c.analysis.done ? 1 : 0], ["Correções", (c.corrections || []).length],
      ];
    } else if (ctx.campaign) {
      const cards = S.sel.cardsByCampaign(ctx.campaign.id);
      const pub = cards.filter((c) => /Publicado/.test(PE.pubStatus(c))).length;
      const best = bestCard(cards);
      rows = [
        ["Campanha", ctx.campaign.title], ["Cards", cards.length], ["Publicados", pub],
        ["Pendentes", cards.length - pub], ["Modo", ctx.campaign.publishMode || "Auto c/ aprovação"],
        best ? ["Melhor card", best.title] : null,
      ];
    } else if (ctx.view === "board") {
      const cs = ctx.st.cards;
      rows = [["Board", cs.length + " cards"], ["Pronto p/ gravar", cs.filter((c) => c.status === "Pronto para gravar").length], ["Precisa corrigir", cs.filter((c) => c.status === "Precisa corrigir").length], ["Publicados", cs.filter((c) => c.status === "Publicado").length]];
    } else if (ctx.view === "analise") {
      const done = ctx.st.cards.filter((c) => c.analysis && c.analysis.done);
      rows = [["Análises", done.length], ["Campanhas", ctx.st.campaigns.length]];
    } else {
      rows = [["Campanhas", ctx.st.campaigns.length], ["Cards", ctx.st.cards.length], ["Biblioteca", ctx.st.library.length], ["Créditos IA", ctx.st.credits.available]];
    }
    rows = rows.filter(Boolean);
    return `<div class="asst-ctx"><div class="asst-ctx-title">📍 Contexto atual</div>${rows.map(([k, v]) => `<div class="asst-ctx-row"><span>${esc(k)}</span><b>${esc(String(v))}</b></div>`).join("")}</div>`;
  }

  // Saudação por tela
  function greeting(ctx) {
    if (ctx.card) return `Estou dentro do card <b>${esc(ctx.card.title)}</b>. Posso melhorar o roteiro, gerar a fala principal, criar variação, analisar o vídeo, gerar correção ou mover o status. O que você quer?`;
    if (ctx.campaign) return `Estou lendo a campanha <b>${esc(ctx.campaign.title)}</b> (${S.sel.cardsByCampaign(ctx.campaign.id).length} cards). Posso criar novos vídeos, gerar variações, montar o plano da semana ou analisar a campanha.`;
    if (ctx.view === "board") return "Estou vendo seu board. Posso organizar os cards, encontrar atrasos/gargalos, criar tarefas ou mover publicados para análise.";
    if (ctx.view === "analise") return "Estou lendo suas análises. Posso mostrar o que funcionou, comparar cards e criar os próximos testes.";
    if (ctx.view === "biblioteca") return "Estou lendo sua biblioteca. Posso encontrar padrões vencedores para reaproveitar em novos conteúdos.";
    if (ctx.view === "hoje") return "Quer que eu organize seu dia com base nos cards, campanhas e publicações de hoje?";
    return "Oi! Sou o Assistente VIRALIZA. Me diga o que quer criar, analisar ou corrigir — eu executo dentro do sistema.";
  }

  // Botões rápidos por contexto
  function quickButtons(ctx) {
    if (ctx.card) return [["Melhorar roteiro", "improve_script"], ["Gerar fala principal", "gen_mainline"], ["Criar 5 variações", "variations:5"], ["Analisar vídeo", "analyze_video"], ["Criar correção", "create_correction"], ["Salvar na biblioteca", "save_hook"], ["Mover status", "ask_move"]];
    if (ctx.campaign) return [["Testar 10 variações", "variations:10"], ["Criar 3 vídeos", "create_cards:3"], ["Explodir vencedor", "explode_winner"], ["Plano da semana", "plan_week"], ["Analisar campanha", "summarize_campaign"]];
    if (ctx.view === "board") return [["O que fazer hoje?", "today_plan"], ["Mostrar atrasados", "show_late"], ["Criar card", "create_card"], ["Mover publicados p/ análise", "move_published"]];
    if (ctx.view === "analise") return [["O que funciona melhor?", "compare_best"], ["Ver piores", "compare_worst"], ["Criar correções", "correct_worst"], ["Salvar aprendizados", "save_learnings"]];
    if (ctx.view === "biblioteca") return [["Padrões vencedores", "lib_patterns"], ["Aplicar gancho", "lib_apply"]];
    return [["Criar campanha", "create_campaign"], ["O que fazer hoje?", "today_plan"], ["O que funciona melhor?", "compare_best"]];
  }

  // ---------- Roteamento de intenção ----------
  function reply(text, ctx) {
    const t = (text || "").toLowerCase();
    const num = (t.match(/\b(\d+)\b/) || [])[1];
    // criar N vídeos/variações (na campanha) — checar ANTES de "criar campanha"
    if (/(cria|adiciona|gera|monta).*(\d+).*(v[íi]deo|card|varia)/.test(t) && (ctx.campaign || ctx.card)) return exec("create_cards:" + (num || 3), ctx);
    if (/(varia[çc][õo]es|variar|explod).*(\d+)|(\d+).*(varia[çc][õo]es)/.test(t)) return exec("variations:" + (num || 5), ctx, { text });
    // criar campanha (cria/nova + campanha, sem número de vídeos)
    if ((/\bcria(r)?\b.*(campanha)/.test(t) || /nova campanha/.test(t)) && !num) return exec("create_campaign", ctx, { text });
    // criar card
    if (/\bcria(r)?\b.*(card|v[íi]deo)/.test(t)) return exec("create_card", ctx, { text });
    // melhorar fala principal / roteiro / gancho / cta
    if (/melhor(a|ar|e)/.test(t) && /(roteiro|fala|gancho|cta|legenda)/.test(t)) return exec("improve_script", ctx, { part: t });
    // gerar roteiro
    if (/(gera|gerar|cria|criar).*(roteiro)/.test(t)) return exec("generate_script", ctx);
    if (/fala principal/.test(t)) return exec("gen_mainline", ctx);
    if (/checklist/.test(t)) return exec("gen_checklist", ctx);
    if (/visual/.test(t)) return exec("gen_visual", ctx);
    if (/varia[çc][ãa]o|variar/.test(t)) return exec("create_variation", ctx);
    // analisar vídeo
    if (/analis(a|ar|e).*(v[íi]deo|reten)/.test(t)) return exec("analyze_video", ctx);
    // métricas / o que funciona
    if (/(funcionando melhor|funciona melhor|melhor desempenho|melhores|ranking|desempenho|compara)/.test(t)) return exec("compare_best", ctx);
    if (/piores|pior/.test(t)) return exec("compare_worst", ctx);
    // correção
    if (/(corrig|corre[çc][ãa]o|ficou fraco|refaz|regrav)/.test(t)) return exec("create_correction", ctx, { text });
    // salvar biblioteca
    if (/(salva|salvar|guarda).*(biblioteca|gancho|cta|roteiro|aprendizado|vencedor)/.test(t)) return exec("save_hook", ctx, { text });
    // mover status
    if (/(move|mover|muda|mudar|coloca).*(status|para|pra)\s+/.test(t)) return exec("move_status", ctx, { text });
    // agendar/publicar
    if (/(agenda|agendar|publica|publicar)/.test(t)) return exec(ctx.card ? "schedule" : "today_plan", ctx);
    // plano/dia
    if (/(o que.*fazer|prioridade|meu dia|organiz)/.test(t)) return exec("today_plan", ctx);
    if (/(resum|analis).*(campanha)/.test(t)) return exec("summarize_campaign", ctx);
    // fallback contextual
    return { text: fallback(ctx), actions: quickButtons(ctx).slice(0, 4).map(([l, a]) => ({ label: l, act: a })) };
  }

  function fallback(ctx) {
    if (ctx.card) return `Posso trabalhar neste card. Diga por exemplo: “melhora a fala principal”, “analisa o vídeo”, “cria correção” ou “move para pronto para gravar”.`;
    if (ctx.campaign) return `Posso trabalhar nesta campanha. Diga por exemplo: “cria mais 3 vídeos”, “monta o plano da semana” ou “analisa a campanha”.`;
    return `Me diga o que fazer — por exemplo: “cria uma campanha para vender X”, “o que está funcionando melhor?” ou “o que eu tenho que fazer hoje?”.`;
  }

  // ---------- Execução de ações reais ----------
  function exec(act, ctx, payload) {
    ctx = ctx || getContext(); payload = payload || {};
    const A = S.actions;
    const arg = act.split(":")[1];
    act = act.split(":")[0];

    switch (act) {
      case "create_campaign":
        window.CampaignWizard.open(payload.text ? { text: payload.text } : undefined);
        return { text: "Abri o criador de campanha com IA. Descreva em uma frase e eu monto a campanha + cards prontos.", actions: [] };

      case "create_cards": {
        if (!ctx.campaign) return needCampaign();
        const n = Math.max(1, Math.min(10, parseInt(arg || "3", 10)));
        const plan = AI.generateCampaignPlan({ text: ctx.campaign.productName || ctx.campaign.title, goal: ctx.campaign.type === "Afiliado" ? "Campanha de afiliado" : "Vender produto", channels: ctx.campaign.channels, audience: ctx.campaign.audience, quantity: n + " vídeos" });
        const ids = AI.generateCardsForCampaign(ctx.campaign, plan.cardPlan.slice(0, n));
        PE.buildPlan(ctx.campaign);
        refresh();
        return { text: `Criei <b>${ids.length} cards novos</b> na campanha “${esc(ctx.campaign.title)}”, já com roteiro, gancho, cena de retenção, visual e checklist. Estão no Board e no plano de publicação.`, actions: [{ label: "Ver campanha", act: "open_campaign" }, { label: "Abrir 1º card", act: "open_card", payload: ids[0] }, { label: "Gerar mais variações", act: "gen_variations" }] };
      }

      case "variations": {
        const n = parseInt(arg || "5", 10);
        if (ctx.card && !ctx.campaign) return needCampaign();
        if (ctx.card) { const ids = window.VariationMachine.explodeWinner(ctx.cardId); refresh(); return { text: `Explodi este card em <b>${ids.length} novas variações</b> (gancho, CTA, público, canal e formato diferentes) — cada uma vira card real no plano de teste.`, actions: [{ label: "Ver campanha", act: "open_campaign" }, { label: "Ver publicação", act: "open_campaign_pub" }] }; }
        if (!ctx.campaign) return needCampaign();
        const ids = window.VariationMachine.generate(ctx.campaign, n, { channels: ctx.campaign.channels });
        refresh();
        return { text: `Criei <b>${ids.length} variações distintas</b> do produto — cada uma com cenário, formato, gancho, visual e público diferentes. Já estão no Board (“Variação criada”) e no plano de teste.`, actions: [{ label: "Ver campanha", act: "open_campaign" }, { label: "Ver plano de teste", act: "open_campaign_pub" }, { label: "Abrir 1ª variação", act: "open_card", payload: ids[0] }] };
      }
      case "explode_winner": {
        if (ctx.card) { const ids = window.VariationMachine.explodeWinner(ctx.cardId); refresh(); return { text: `Marquei como <b>Vencedor</b> e gerei ${ids.length} novas variações a partir dele.`, actions: [{ label: "Ver campanha", act: "open_campaign" }] }; }
        if (!ctx.campaign) return needCampaign();
        const win = window.VariationMachine.markWinner(ctx.campaign.id);
        if (!win) return { text: "Ainda não dá para eleger um vencedor: faltam métricas nos vídeos. Publique/insira métricas e eu comparo.", actions: [{ label: "O que fazer hoje?", act: "today_plan" }] };
        const ids = window.VariationMachine.explodeWinner(win.id); refresh();
        return { text: `🏆 Vencedor: <b>${esc(win.title)}</b>. Salvei o aprendizado na biblioteca e gerei <b>${ids.length} novas variações</b> dele.`, actions: [{ label: "Ver campanha", act: "open_campaign" }, { label: "Abrir biblioteca", act: "goto", payload: "biblioteca" }] };
      }
      case "create_card": {
        const title = deriveTitle(payload.text) || "Novo vídeo";
        const camp = ctx.campaign || {};
        const tmp = { type: guessType(payload.text), campaignId: ctx.campaignId, title, strategy: {}, script: {} };
        const id = A.addCard({ title, type: tmp.type, campaignId: ctx.campaignId, status: "Pronto para gravar", nextAction: "Gravar o gancho",
          strategy: AI.generateStrategyForCard(tmp, camp), script: AI.generateScriptForCard(tmp, camp), visual: AI.generateVisualDirection(tmp, camp), checklist: AI.generateChecklistForCard(tmp, camp) });
        refresh();
        return { text: `Criei o card <b>${esc(title)}</b>${ctx.campaign ? " na campanha “" + esc(ctx.campaign.title) + "”" : ""}, já com roteiro, cena de retenção, visual, legenda e CTA.`, actions: [{ label: "Abrir card", act: "open_card", payload: id }, { label: "Gerar variação", act: "create_variation", payload: id }] };
      }

      case "improve_script": case "generate_script": case "gen_mainline": {
        if (!ctx.card) return needCard();
        const camp = ctx.campaign || {};
        const research = camp.research;
        let ns = AI.generateScriptForCard(ctx.card, camp);
        if (research && window.MarketResearch) { /* aplica base de mercado no gancho */ const scg = (research.suggestedCards || [])[0]; if (scg) { ns.hook = scg.hook; ns.screenText = [scg.screenText, "Link na bio 👆"]; } }
        if (act === "gen_mainline") { A.patchCard(ctx.cardId, "script.mainLine", ns.mainLine); }
        else if (act === "improve_script") { A.patchCard(ctx.cardId, "script.hook", "PARA TUDO 🔥 " + ns.hook.replace(/^PARA TUDO 🔥 /, "")); A.patchCard(ctx.cardId, "script.mainLine", ns.mainLine); A.patchCard(ctx.cardId, "script.cta", ns.cta); }
        else { A.updateCard(ctx.cardId, { script: ns }); }
        refresh();
        const base = research ? " Usei a inteligência de mercado salva na campanha." : "";
        return { text: `Atualizei o roteiro do card <b>${esc(ctx.card.title)}</b>.${base} Gancho e fala principal reforçados.`, actions: [{ label: "Abrir roteiro", act: "open_card_tab", payload: "Roteiro" }, { label: "Criar variação", act: "create_variation" }, { label: "Salvar gancho", act: "save_hook" }] };
      }

      case "gen_checklist": { if (!ctx.card) return needCard(); A.setChecklist(ctx.cardId, AI.generateChecklistForCard(ctx.card, ctx.campaign || {})); refresh(); return { text: "Gerei um checklist de execução para este card.", actions: [{ label: "Abrir checklist", act: "open_card_tab", payload: "Checklist" }] }; }
      case "gen_visual": { if (!ctx.card) return needCard(); A.updateCard(ctx.cardId, { visual: AI.generateVisualDirection(ctx.card, ctx.campaign || {}) }); refresh(); return { text: "Gerei a direção de visual (roupa, ambiente, enquadramento, energia da fala).", actions: [{ label: "Abrir card", act: "open_card_tab", payload: "Executar" }] }; }

      case "create_variation": {
        const id = payload || ctx.cardId; if (!id) return needCard();
        const c = S.sel.card(id); const nid = A.duplicateCard(id);
        A.updateCard(nid, { title: c.title + " — Variação", status: "Ideia", nextAction: "Testar variação", script: Object.assign({}, AI.generateScriptForCard(c, ctx.campaign || {})) });
        refresh();
        return { text: `Criei uma <b>variação</b> de “${esc(c.title)}” com novo gancho, para testar. Está no Board em “Ideia”.`, actions: [{ label: "Abrir variação", act: "open_card", payload: nid }] };
      }

      case "analyze_video": {
        if (!ctx.card) return needCard();
        const v = ctx.card.video || {};
        if (!v.versions || !v.versions.length) return { text: "Esse card ainda <b>não tem vídeo salvo</b>. Você pode gravar, enviar da galeria ou gerar com IA.", actions: [{ label: "🎥 Gravar agora", act: "open_recorder" }, { label: "📤 Enviar vídeo", act: "upload_gallery" }, { label: "✨ Gerar com IA", act: "open_card_tab", payload: "Conteúdo" }] };
        const analysis = window.MarketResearch ? null : null; // usa mock de análise
        const a = AI.analyzeUploadedVideoMock({ duration: (v.original && v.original.duration) || 22 }, ctx.card);
        S.update((s) => { const cc = s.cards.find((x) => x.id === ctx.cardId); cc.analysis = { done: true, metrics: cc.analysis.metrics || {}, summary: { worked: a.strengths.join("; "), failed: a.problems.join("; "), repeat: "Manter o gancho.", fix: a.suggestions.join("; "), variation: "Testar variação de gancho." } }; cc.publication.pubStatus = "Em análise"; });
        refresh();
        const edited = (v.versions || []).find((x) => x.kind === "Abertura Inteligente");
        return { text: `Analisei ${edited ? "a versão com <b>abertura inteligente</b>" : "o vídeo"} do card. Nota ~${a.score}. Ponto forte: ${esc(a.strengths[0])}. Melhorar: ${esc(a.problems[0])}.`, actions: [{ label: "Abrir análise", act: "open_card_tab", payload: "Análise e Correção" }, { label: "Criar correção", act: "create_correction" }, { label: "Salvar aprendizado", act: "save_learnings" }] };
      }

      case "create_correction": {
        if (!ctx.card) return needCard();
        const big = /(regrav|refaz|refaz|nova abordagem|outro p[úu]blico|novo criativo|grande)/.test((payload.text || "").toLowerCase());
        const cor = AI.generateCorrectionFromAnalysis(ctx.card, ctx.card.analysis);
        if (big) {
          const nid = A.addCard({ title: "Correção — " + cor.reason, type: ctx.card.type, campaignId: ctx.campaignId, channel: ctx.card.channel, status: "Precisa corrigir", priority: "Alta", originCardId: ctx.cardId, correctionReason: cor.reason, nextAction: "Regravar aplicando a correção", strategy: Object.assign({}, ctx.card.strategy), script: Object.assign({}, ctx.card.script, cor.correctedScript) });
          A.addCorrection(ctx.cardId, { reason: cor.reason, note: "Gerou novo card de correção (regravação).", status: "Gerou novo card" });
          refresh();
          return { text: `Essa correção exige regravação. Criei um <b>novo card de correção</b> vinculado a “${esc(ctx.card.title)}” (motivo: ${esc(cor.reason)}).`, actions: [{ label: "Abrir card de correção", act: "open_card", payload: nid }] };
        }
        A.patchCard(ctx.cardId, "script.hook", cor.correctedScript.hook);
        A.patchCard(ctx.cardId, "script.cta", cor.correctedScript.cta);
        A.addCorrection(ctx.cardId, { reason: cor.reason, note: "Correção aplicada no mesmo card (gancho/CTA).", status: "Aplicada" });
        refresh();
        return { text: `Essa correção parece pequena — apliquei uma <b>nova versão no mesmo card</b>: ${esc(cor.diagnosis)}`, actions: [{ label: "Abrir roteiro", act: "open_card_tab", payload: "Roteiro" }, { label: "Criar novo card de correção", act: "create_correction", payload: { text: "regravar" } }] };
      }

      case "save_hook": case "save_learnings": {
        if (ctx.card) {
          const c = ctx.card;
          if (act === "save_learnings" && c.analysis && c.analysis.summary) A.addLibrary({ type: "Aprendizado", title: "Aprendizado — " + c.title, content: c.analysis.summary.fix, source: c.id, tags: ["aprendizado"] });
          else A.addLibrary({ type: "Gancho vencedor", title: c.script.hook || c.title, content: "Gancho salvo do card " + c.title, source: c.id, tags: ["gancho"] });
          return { text: `Salvei na <b>Biblioteca</b>${act === "save_learnings" ? " o aprendizado" : " o gancho"} do card “${esc(c.title)}”. Vou considerar isso nas próximas gerações.`, actions: [{ label: "Abrir biblioteca", act: "goto", payload: "biblioteca" }] };
        }
        A.addLibrary({ type: "Aprendizado", title: "Aprendizado salvo", content: "Item salvo pelo assistente." });
        return { text: "Salvei na biblioteca.", actions: [{ label: "Abrir biblioteca", act: "goto", payload: "biblioteca" }] };
      }

      case "move_status": {
        if (!ctx.card) return needCard();
        const target = matchStatus(payload.text);
        if (!target) return { text: "Para qual status? Ex: “move para pronto para gravar”, “publicado”, “em edição”.", actions: S.get().statuses.slice(0, 6).map((s) => ({ label: s.name, act: "set_status", payload: s.name })) };
        A.setCardStatus(ctx.cardId, target); refresh();
        return { text: `Movi o card “${esc(ctx.card.title)}” para <b>${esc(target)}</b>.`, actions: [{ label: "Ver board", act: "goto", payload: "board" }] };
      }
      case "ask_move": return { text: "Para qual status?", actions: S.get().statuses.slice(0, 8).map((s) => ({ label: s.name, act: "set_status", payload: s.name })) };
      case "set_status": { if (!ctx.card) return needCard(); A.setCardStatus(ctx.cardId, payload); refresh(); return { text: `Status alterado para <b>${esc(payload)}</b>.`, actions: [{ label: "Ver board", act: "goto", payload: "board" }] }; }

      case "compare_best": case "compare_worst": {
        const done = S.get().cards.filter((c) => c.analysis && c.analysis.done && c.analysis.metrics && c.analysis.metrics.views);
        if (!done.length) return { text: "Ainda <b>não tenho métricas reais</b> de conteúdos publicados. Posso simular a coleta de métricas de um card publicado, ou você insere os dados na aba Análise.", actions: [{ label: "O que fazer hoje?", act: "today_plan" }] };
        const ranked = done.map((c) => ({ c, score: metricScore(c) })).sort((a, b) => act === "compare_best" ? b.score - a.score : a.score - b.score);
        const top = ranked.slice(0, 3);
        const lines = top.map((r, i) => `${i + 1}. <b>${esc(r.c.title)}</b> — ${U.fmt(r.c.analysis.metrics.views)} views · retenção ${esc(r.c.analysis.metrics.retention || "—")}`).join("<br>");
        const pattern = learnPattern(top.map((r) => r.c));
        return { text: `${act === "compare_best" ? "🏆 Melhores" : "⚠️ Piores"} conteúdos por desempenho:<br>${lines}<br><br>${pattern}`, actions: [{ label: "Salvar aprendizado", act: "save_pattern", payload: pattern }, { label: "Criar variação do topo", act: "create_variation", payload: top[0].c.id }] };
      }
      case "save_pattern": { A.addLibrary({ type: "Aprendizado", title: "Padrão vencedor", content: (payload || "Padrão identificado pelo assistente.").replace(/<[^>]+>/g, "") }); return { text: "Aprendizado salvo na biblioteca ✓. Vou usar isso ao gerar novos cards.", actions: [{ label: "Abrir biblioteca", act: "goto", payload: "biblioteca" }] }; }

      case "summarize_campaign": {
        if (!ctx.campaign) return needCampaign();
        const cards = S.sel.cardsByCampaign(ctx.campaign.id);
        const pub = cards.filter((c) => /Publicado/.test(PE.pubStatus(c)));
        const pend = cards.filter((c) => !/Publicado/.test(PE.pubStatus(c)));
        const best = bestCard(cards);
        return { text: `Campanha <b>${esc(ctx.campaign.title)}</b>: ${cards.length} cards, ${pub.length} publicados, ${pend.length} pendentes. ${best ? "Melhor card: <b>" + esc(best.title) + "</b>." : ""} Próxima ação: aprovar/agendar os pendentes.`, actions: [{ label: "Criar 3 vídeos", act: "create_cards:3" }, { label: "Plano da semana", act: "plan_week" }, { label: "Ver publicação", act: "open_campaign_pub" }] };
      }

      case "plan_week": case "gen_variations": case "audience_branches": {
        if (!ctx.campaign) return needCampaign();
        if (act === "audience_branches") { const b = AI.generateAudienceBranches(ctx.campaign.audience); b.slice(0, 5).forEach((x) => A.addLibrary({ type: "Subpúblico", title: x.name, content: `Dor: ${x.pain}. Gancho: ${x.hook}. CTA: ${x.cta}.`, tags: ["público"] })); return { text: `Gerei ${b.length} subpúblicos e salvei 5 na biblioteca (dor, gancho, CTA, plataforma).`, actions: [{ label: "Abrir biblioteca", act: "goto", payload: "biblioteca" }] }; }
        if (act === "gen_variations") { const cards = S.sel.cardsByCampaign(ctx.campaign.id).slice(0, 3); const ids = cards.map((c) => { const nid = A.duplicateCard(c.id); A.updateCard(nid, { title: c.title + " — Variação", status: "Ideia" }); return nid; }); refresh(); return { text: `Criei ${ids.length} variações dos principais cards para teste A/B.`, actions: [{ label: "Ver campanha", act: "open_campaign" }] }; }
        PE.buildPlan(ctx.campaign); refresh();
        return { text: "Montei/atualizei o <b>plano da semana</b> distribuindo os cards por dia, horário e canal.", actions: [{ label: "Ver plano", act: "open_campaign_pub" }] };
      }

      case "today_plan": {
        const cards = S.get().cards;
        const gravar = cards.filter((c) => c.status === "Pronto para gravar");
        const corrigir = cards.filter((c) => c.status === "Precisa corrigir");
        const pubHoje = PE.dueToday();
        const parts = [];
        if (pubHoje.length) parts.push(`📅 <b>${pubHoje.length}</b> publicação(ões) para hoje`);
        if (gravar.length) parts.push(`🎥 <b>${gravar.length}</b> card(s) pronto(s) para gravar`);
        if (corrigir.length) parts.push(`🛠️ <b>${corrigir.length}</b> precisa(m) de correção`);
        if (!parts.length) parts.push("Sem pendências urgentes. Que tal criar uma campanha nova?");
        return { text: "Seu dia:<br>" + parts.join("<br>"), actions: [pubHoje[0] ? { label: "Publicar 1º de hoje", act: "publish_card", payload: pubHoje[0].id } : null, gravar[0] ? { label: "Gravar 1º card", act: "open_recorder", payload: gravar[0].id } : null, { label: "Criar campanha", act: "create_campaign" }].filter(Boolean) };
      }
      case "show_late": { const late = S.get().cards.filter((c) => c.deadline && c.deadline < new Date().toISOString().slice(0, 10) && c.status !== "Publicado"); return { text: late.length ? `Cards atrasados: ${late.map((c) => "<b>" + esc(c.title) + "</b>").join(", ")}.` : "Nenhum card atrasado 👏", actions: late[0] ? [{ label: "Abrir 1º", act: "open_card", payload: late[0].id }] : [] }; }
      case "move_published": { let n = 0; S.get().cards.filter((c) => c.status === "Publicado").forEach((c) => { A.setCardStatus(c.id, "Analisando resultado"); n++; }); refresh(); return { text: `Movi ${n} card(s) publicado(s) para “Analisando resultado”.`, actions: [{ label: "Ver análise", act: "goto", payload: "analise" }] }; }
      case "correct_worst": { const worst = S.get().cards.filter((c) => c.analysis && c.analysis.done).sort((a, b) => metricScore(a) - metricScore(b))[0]; if (!worst) return { text: "Sem análises para corrigir ainda.", actions: [] }; window.App.openCard(worst.id); return { text: `Abri o card de pior desempenho (“${esc(worst.title)}”). Posso criar uma correção.`, actions: [{ label: "Criar correção", act: "create_correction" }] }; }
      case "lib_patterns": { const wins = S.get().library.filter((l) => /vencedor|Aprendizado|retenção/i.test(l.type)); return { text: wins.length ? `Padrões na biblioteca: ${wins.slice(0, 4).map((l) => "<b>" + esc(l.title) + "</b>").join(", ")}.` : "Ainda sem padrões vencedores salvos.", actions: [{ label: "Abrir biblioteca", act: "goto", payload: "biblioteca" }] }; }

      // navegação/continuidade
      case "open_campaign": window.App.render(); location.hash = "#/campanha/" + ctx.campaignId; return silent();
      case "open_campaign_pub": location.hash = "#/campanha/" + ctx.campaignId; return { text: "Abri a campanha — veja a aba <b>Publicação</b>.", actions: [] };
      case "open_card": if (payload) window.App.openCard(payload); return silent();
      case "open_card_tab": if (ctx.cardId) window.App.openCard(ctx.cardId); return silent();
      case "open_recorder": { const id = payload || ctx.cardId; if (id) window.Recorder.open(id); return silent(); }
      case "upload_gallery": if (ctx.cardId) window.VideoStudio.openUpload(ctx.cardId); return silent();
      case "publish_card": if (payload) window.PublishEngine.publishNow(payload); return { text: "Publicando (simulado)…", actions: [] };
      case "goto": location.hash = "#/" + payload; return silent();
      default: return { text: fallback(ctx), actions: [] };
    }
  }

  // ---------- helpers ----------
  function needCard() { return { text: "Abra um card primeiro — assim eu trabalho no roteiro/vídeo certo.", actions: [{ label: "Ver board", act: "goto", payload: "board" }] }; }
  function needCampaign() { return { text: "Abra uma campanha primeiro (ou peça “cria uma campanha…”).", actions: [{ label: "Ver campanhas", act: "goto", payload: "campanhas" }, { label: "Criar campanha", act: "create_campaign" }] }; }
  function silent() { return { text: "", actions: [] }; }
  function refresh() { S.persist && S.persist(); if (window.CardView && window.CardView.current && window.CardView.current()) window.CardView.refresh(); window.App && window.App.render && window.App.render(); }
  function deriveTitle(text) { if (!text) return null; const m = text.match(/(?:card|v[íi]deo)\s+(?:respondendo|sobre|de|que|para)?\s*(.+)/i); let s = m ? m[1] : text; s = s.replace(/[?.!]+$/, "").trim(); return s ? ("Vídeo — " + s.charAt(0).toUpperCase() + s.slice(1)).slice(0, 70) : null; }
  function guessType(text) { const t = (text || "").toLowerCase(); if (/antes.*depois/.test(t)) return "Antes e depois"; if (/review/.test(t)) return "Review"; if (/compar/.test(t)) return "Comparação"; if (/demonstr/.test(t)) return "Demonstração"; if (/prova/.test(t)) return "Prova social"; if (/obje[çc]|vidro|tamanho|d[úu]vida/.test(t)) return "Resposta a objeção"; return "Dor e Solução"; }
  function matchStatus(text) { const t = (text || "").toLowerCase(); return (S.get().statuses.find((s) => t.includes(s.name.toLowerCase())) || {}).name || null; }
  function metricScore(c) { const m = c.analysis.metrics || {}; const ret = parseInt(m.retention) || 0; return (m.views || 0) / 1000 + ret * 2 + (m.sales || 0) * 10 + (m.saves || 0) / 100; }
  function bestCard(cards) { const done = cards.filter((c) => c.analysis && c.analysis.done && c.analysis.metrics && c.analysis.metrics.views); if (!done.length) return null; return done.sort((a, b) => metricScore(b) - metricScore(a))[0]; }
  function learnPattern(cards) { const types = {}; cards.forEach((c) => types[c.type] = (types[c.type] || 0) + 1); const top = Object.keys(types).sort((a, b) => types[b] - types[a])[0]; return `📚 Padrão: vídeos de <b>${esc(top || "Antes e depois")}</b> vêm performando melhor. Recomendo criar mais variações desse tipo.`; }

  // Contexto operacional completo para a IA (roadmap: getAssistantContext)
  function getAssistantContext() {
    const ctx = getContext(), st = ctx.st, c = ctx.card, camp = ctx.campaign;
    const cards = camp ? S.sel.cardsByCampaign(camp.id) : [];
    return {
      view: ctx.view,
      campaign: camp || null,
      card: c || null,
      script: (c && c.script) || null,
      videos: (c && c.video && c.video.versions) || [],
      analysis: (c && c.analysis) || null,
      corrections: (c && c.corrections) || [],
      library: st.library || [],
      learnings: window.Learning ? window.Learning.buildOperationContext() : {},
      publicationPlan: camp ? cards.filter((x) => x.publication && x.publication.date).map((x) => ({ card: x.title, date: x.publication.date, time: x.publication.time, channel: x.publication.channel, status: window.PublishEngine.pubStatus(x) })) : [],
      publicationQueue: camp && window.PublishEngine ? window.PublishEngine.queue(camp.id).map((x) => ({ card: x.title, date: x.publication.date, time: x.publication.time, channel: x.publication.channel })) : [],
    };
  }

  const api = { getContext, getAssistantContext, header, greeting, quickButtons, reply, exec, label };
  window.getAssistantContext = getAssistantContext;
  return api;
})();
