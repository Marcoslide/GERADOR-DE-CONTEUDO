/* ============================================================
   VIRALIZA — Camada de IA (simulada, mas funcional)
   Gera dados REAIS no estado do app. Pronta para trocar por
   API real (OpenAI/Claude) mantendo as mesmas assinaturas.
   Regra: pouca entrada, muita saída.
   ============================================================ */
window.AI = (function () {
  const S = window.Store;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const cap = (s) => (s || "").charAt(0).toUpperCase() + (s || "").slice(1);

  // ------------------------------------------------------------
  // Planos de card por objetivo
  // ------------------------------------------------------------
  const PLAN_PRODUTO = [
    { type: "Dor e Solução", title: "Vídeo 1 — Dor e Solução" },
    { type: "Antes e depois", title: "Vídeo 2 — Antes e Depois" },
    { type: "Demonstração", title: "Vídeo 3 — Demonstração" },
    { type: "Prova social", title: "Vídeo 4 — Prova Social" },
    { type: "Stories de venda", title: "Stories — Sequência de Venda" },
    { type: "UGC", title: "Criativo IA — Foto do Produto" },
    { type: "Oferta", title: "Vídeo 5 — Oferta com Urgência" },
    { type: "Review", title: "Vídeo 6 — Review honesto" },
  ];
  const PLAN_AFILIADO = [
    { type: "Dor e Solução", title: "Vídeo 1 — Problema do público" },
    { type: "Review", title: "Vídeo 2 — Review do produto" },
    { type: "Comparação", title: "Vídeo 3 — Comparação" },
    { type: "Resposta a objeção", title: "Vídeo 4 — Resposta a objeção" },
    { type: "Stories de venda", title: "Stories — Link de compra" },
    { type: "Oferta", title: "Criativo IA — Oferta rápida" },
    { type: "Prova social", title: "Vídeo 5 — Prova social" },
  ];

  const QTY = { "1 vídeo": 1, "3 vídeos": 3, "5 vídeos": 5, "7 dias de conteúdo": 7, "10 variações": 10 };

  // ------------------------------------------------------------
  // generateCampaignPlan(input)
  // input: { text, goal, channels[], style, material[], quantity, audience }
  // ------------------------------------------------------------
  function generateCampaignPlan(input) {
    input = input || {};
    const text = (input.text || "").trim();
    const goal = input.goal || "Vender produto";
    const isAff = /afiliad/i.test(goal) || (input.material || []).some((m) => /afiliad/i.test(m));
    const type = isAff ? "Afiliado" : /marketplace/i.test(goal) ? "Marketplace" : /live/i.test(goal) ? "Live Shop" : /org[âa]nico/i.test(goal) ? "Conteúdo orgânico" : "Produto físico";
    const product = extractProduct(text) || "seu produto";
    const style = input.style || "Direto e vendedor";
    const channels = (input.channels && input.channels.length) ? input.channels : ["Instagram", "TikTok"];
    const qtd = QTY[input.quantity] || 3;
    const audience = input.audience || guessAudience(text) || "pessoas interessadas no produto";

    const promise = makePromise(product, style);
    const cta = isAff ? "Compra pelo link da bio" : "Garanta pelo link da bio";
    const emotion = pick(["Alívio", "Desejo", "Urgência", "Curiosidade", "Confiança", "Satisfação"]);
    const basePlan = isAff ? PLAN_AFILIADO : PLAN_PRODUTO;
    let cardPlan;
    if (input.quantity === "7 dias de conteúdo") cardPlan = sevenDays(basePlan);
    else if (input.quantity === "10 variações") cardPlan = tenVariations(basePlan);
    else cardPlan = basePlan.slice(0, Math.max(1, qtd));

    return {
      title: (isAff ? "Afiliado — " : "") + cap(product), type, objective: isAff ? "Gerar vendas pelo link de afiliado" : "Gerar vendas do produto",
      productName: cap(product), offer: makeOffer(product), audience, promise, emotion, cta,
      channels, style, videoCount: cardPlan.length, materials: input.material || [], cardPlan,
      summary: `Campanha de ${type.toLowerCase()} para ${product}, estilo "${style}", em ${channels.join(", ")}.`,
    };
  }

  function extractProduct(text) {
    if (!text) return null;
    // pega o que vem depois de "vender/vendo/produto", ignorando artigos, até uma preposição de contexto
    const m = text.match(/(?:vender|vendo|divulgar|promover|produto[:\s])\s+(?:um |uma |o |a |meu |minha |uns |umas )?([a-zà-ú][\wà-ú]*(?:\s+[a-zà-ú][\wà-ú]*){0,4}?)(?=\s+(?:usando|com|para|no|na|nos|nas|em|pelo|pela|via|através|e\s)|[.,!?]|$)/i);
    let p = m ? m[1] : text.split(/\s+/).slice(0, 4).join(" ");
    p = p.replace(/^(um|uma|o|a|meu|minha)\s+/i, "").replace(/\b(usando|com|para|no|na|em|de vídeos?)\b.*$/i, "").trim();
    return p || null;
  }
  function guessAudience(text) {
    if (/m[ãa]e|casa|cozinha|organiza/i.test(text)) return "mães e donas de casa que querem praticidade";
    if (/academia|fitness|treino/i.test(text)) return "pessoas que treinam e cuidam do corpo";
    if (/jovem|jovens|estudante/i.test(text)) return "jovens de 15 a 24 anos";
    return null;
  }
  function makePromise(product, style) {
    if (/organiza|pote|cozinha|casa/i.test(product)) return "Organize em minutos, sem gastar uma fortuna";
    if (/quadro|decor/i.test(product)) return "Transforme seu ambiente em minutos";
    return `Resolva de vez com ${product}`;
  }
  function makeOffer(product) { return `${cap(product)} com condição especial e frete grátis`; }
  function sevenDays(base) { const out = []; for (let i = 0; i < 7; i++) { const b = base[i % base.length]; out.push({ type: b.type, title: `Dia ${i + 1} — ${b.type}` }); } return out; }
  function tenVariations(base) { const out = []; for (let i = 0; i < 10; i++) { const b = base[i % base.length]; out.push({ type: b.type, title: `Variação ${i + 1} — ${b.type}` }); } return out; }

  // ------------------------------------------------------------
  // generateCardsForCampaign(campaign) → cria cards no estado
  // ------------------------------------------------------------
  function generateCardsForCampaign(campaign, plan) {
    const cards = (plan || campaign.cardPlan || []);
    const ids = [];
    cards.forEach((cp, i) => {
      const draft = { title: cp.title, type: cp.type, campaignId: campaign.id, channel: (campaign.channels && campaign.channels[i % campaign.channels.length]) || "Instagram", status: "Pronto para gravar", priority: i === 0 ? "Alta" : "Média", objective: campaign.objective, nextAction: "Gravar o gancho" };
      // gera conteúdo do card
      const tmp = Object.assign({ script: {}, strategy: {}, visual: {} }, draft);
      draft.strategy = generateStrategyForCard(tmp, campaign);
      draft.script = generateScriptForCard(tmp, campaign);
      draft.visual = generateVisualDirection(tmp, campaign);
      draft.checklist = generateChecklistForCard(tmp, campaign);
      draft.methods = [cp.type];
      const id = S.actions.addCard(draft);
      ids.push(id);
    });
    return ids;
  }

  // ------------------------------------------------------------
  // generateStrategyForCard
  // ------------------------------------------------------------
  function generateStrategyForCard(card, campaign) {
    const angle = card.type || "Dor e Solução";
    return {
      objective: campaign.objective || "Gerar vendas pelo link",
      angle, audience: campaign.audience || "público comprador",
      pain: painFor(campaign.productName), desire: "praticidade e resultado",
      promise: campaign.promise || "Resolva de vez", emotion: campaign.emotion || "Alívio",
      offer: campaign.offer || "", cta: campaign.cta || "Link na bio",
      method: angle, channel: card.channel,
      realMethod: `R — gancho de ${angle.toLowerCase()}; E — ${(campaign.emotion || "alívio").toLowerCase()}; A — demonstração real; L — série do produto`,
    };
  }
  function painFor(product) {
    if (/pote|organiza|cozinha/i.test(product || "")) return "perde tempo e vive na bagunça";
    if (/quadro|decor/i.test(product || "")) return "ambiente sem graça e vazio";
    return "não conseguiu resolver com outras soluções";
  }

  // ------------------------------------------------------------
  // generateScriptForCard(card, campaign)
  // ------------------------------------------------------------
  const HOOKS = {
    "Dor e Solução": ["Você perde tempo TODO dia por causa disso 👇", "Se você sofre com {dor}, esse vídeo é pra você.", "Parei de {dor} com esse truque simples."],
    "Antes e depois": ["Olha o ANTES... agora o DEPOIS 😱", "Ninguém acredita que é o mesmo lugar.", "A transformação que você precisa ver."],
    "Demonstração": ["Bora testar AGORA na sua frente 🧪", "Será que funciona mesmo? Olha isso.", "Testando ao vivo pra você decidir."],
    "Prova social": ["Mais de 5 mil pessoas já testaram 👇", "Não sou só eu falando, olha os comentários.", "Todo mundo tá comprando por causa disso."],
    "Review": ["Testei por 30 dias, olha a verdade 👇", "Review SEM filtro do produto que tá bombando.", "Vale a pena? A verdade ninguém conta."],
    "Comparação": ["Comum x melhor: olha a diferença ⚖️", "Antes de comprar, assista essa comparação.", "Um é bom, o outro muda tudo."],
    "Resposta a objeção": ['"{obj}" — vou provar que dá certo 🛡️', "A dúvida que todo mundo tem, respondida.", "Você acha que não funciona? Olha."],
    "Oferta": ["Só hoje: {oferta} 🏷️", "Corre que é por tempo limitado ⏰", "Preço que não vai durar."],
    "Stories de venda": ["Arrasta pra cima e garante o seu 👆", "Últimas unidades com desconto.", "O link tá aqui, corre!"],
    "UGC": ["Comprei e preciso te contar 👇", "Recebido que virou meu favorito.", "Testei sem esperar nada e olha."],
  };

  function generateScriptForCard(card, campaign) {
    const angle = card.type || "Dor e Solução";
    const product = (campaign && campaign.productName) || "o produto";
    const dor = (card.strategy && card.strategy.pain) || painFor(product);
    const cta = (campaign && campaign.cta) || "Compra pelo link da bio";
    const oferta = (campaign && campaign.offer) || "condição especial";
    const obj = "será que funciona mesmo?";
    const hooks = (HOOKS[angle] || HOOKS["Dor e Solução"]).map((h) => h.replace("{dor}", dor).replace("{obj}", obj).replace("{oferta}", oferta));
    const retention = { start: "00:14", end: "00:19", type: pick(["Resultado visual", "Transformação", "Reação", "Momento de virada"]), reason: "Cena de maior impacto — ótima para abrir o vídeo e prender atenção.", screenText: "Olha o que aconteceu no final…" };
    return {
      hook: hooks[0], hookAlt1: hooks[1] || "", hookAlt2: hooks[2] || "",
      opening: `Mostrar ${/pote|organiza|cozinha/i.test(product) ? "a bagunça (0–3s, sem falar)" : "o problema/contexto (0–3s)"}.`,
      mainLine: `${cap(product)} resolve ${dor}. Eu testei e o resultado foi ${pick(["surpreendente", "imediato", "melhor do que esperava"])}: ${(campaign && campaign.promise) || "resolve de vez"}.`,
      scenes: ["Problema/contexto", "Produto entrando em cena", "Demonstração de uso", "Resultado", "Close do CTA"],
      screenText: [dor.toUpperCase(), (campaign && campaign.offer) ? "OFERTA ESPECIAL" : "MUDOU TUDO", "Link na bio 👆"],
      cutPhrases: ["Ninguém te conta isso", "Mudou minha rotina", "Testa e me conta"],
      cta, caption: `${hooks[0].replace(/[👇🔥😱]/g, "").trim()} ${product ? "" : ""}✨ ${cta} #viraliza`,
      hashtags: hashtagsFor(product, campaign), title: `${angle} — ${product}`, cover: `${cap(product)} com texto "${dor}"`,
      stories: `1) Enquete: "Você também sofre com ${dor}?" 2) Mostrar produto 3) Link "${cta}"`,
      retention,
    };
  }
  function hashtagsFor(product, campaign) {
    const base = ["#viraliza", "#dicas"];
    if (/pote|organiza|cozinha|casa/i.test(product || "")) base.push("#organização", "#cozinha", "#donadecasa");
    else if (/quadro|decor/i.test(product || "")) base.push("#decoração", "#casa", "#quadros");
    else base.push("#" + (product || "produto").split(/\s+/)[0].toLowerCase().replace(/[^a-z0-9]/g, ""));
    if (campaign && campaign.type === "Afiliado") base.push("#achadinhos");
    return base.join(" ");
  }

  // ------------------------------------------------------------
  // generateStoriesForCard
  // ------------------------------------------------------------
  function generateStoriesForCard(card, campaign) {
    const cta = (campaign && campaign.cta) || "Link na bio";
    return [
      `Story 1 — Enquete: "Você tem esse problema?" (gera engajamento)`,
      `Story 2 — Mostrar o produto em uso (prova real)`,
      `Story 3 — Depoimento/print de resultado`,
      `Story 4 — CTA com link: "${cta}"`,
    ];
  }

  // ------------------------------------------------------------
  // generateChecklistForCard
  // ------------------------------------------------------------
  function generateChecklistForCard(card, campaign) {
    return [
      { group: "Preparação", items: [{ t: "Separar o produto", done: false }, { t: "Revisar o roteiro/gancho", done: false }, { t: "Preparar cenário e luz", done: false }] },
      { group: "Gravação", items: [{ t: "Gravar 3 ganchos diferentes", done: false }, { t: "Gravar fala principal", done: false }, { t: "Gravar close do produto", done: false }, { t: "Gravar CTA", done: false }] },
      { group: "Edição", items: [{ t: "Cortar início fraco", done: false }, { t: "Inserir texto na tela", done: false }, { t: "Colocar legenda", done: false }] },
      { group: "Publicação", items: [{ t: "Revisar legenda e hashtags", done: false }, { t: "Publicar no canal", done: false }, { t: "Salvar link", done: false }] },
      { group: "Análise", items: [{ t: "Inserir métricas", done: false }, { t: "Avaliar retenção e CTA", done: false }] },
      { group: "Correção", items: [{ t: "Definir o que melhorar", done: false }, { t: "Criar variação/regravação", done: false }] },
    ];
  }

  // ------------------------------------------------------------
  // generateVisualDirection(card, campaign) — "Visual do vídeo"
  // ------------------------------------------------------------
  function generateVisualDirection(card, campaign) {
    const vendedor = /vendedor|urg|oferta/i.test((campaign && campaign.style) || "");
    return {
      roupa: pick(["camiseta clara ou neutra", "look casual e limpo", "camisa lisa sem estampa forte"]),
      cor: pick(["cores neutras (branco, bege, cinza)", "tons claros", "sem estampas chamativas"]),
      ambiente: pick(["sala real com parede vazia", "ambiente organizado e limpo", "cozinha/estante real ao fundo"]),
      enquadramento: "vertical 9:16, meio corpo, produto visível nos 2 primeiros segundos",
      iluminacao: pick(["luz natural de janela", "luz frontal suave, sem sombra no rosto", "ring light frontal"]),
      objetos: pick(["produto em mãos", "produto aplicado no ambiente", "produto + item do dia a dia para escala"]),
      momentoProduto: "produto aparece nos 2 primeiros segundos e reaparece no CTA",
      estilo: (campaign && campaign.style) || "natural e próximo",
      energia: vendedor ? "direto, próximo e vendedor" : pick(["próximo e natural", "empolgado e leve", "confiante e claro"]),
    };
  }

  // ------------------------------------------------------------
  // generateVideoCreativeMock(card, options)
  // ------------------------------------------------------------
  function generateVideoCreativeMock(card, options) {
    options = options || {};
    return {
      type: "Vídeo IA", source: "IA (foto do produto)", template: options.template || "Zoom lento no produto",
      status: "Gerado", creditsUsed: options.cost || 12, prompt: options.prompt || `${card.type} de ${(card.title || "produto")}, luz natural, vertical`,
      fileName: "video-ia-" + (card.id || "").slice(-4) + ".mp4", note: "Vídeo IA gerado em modo simulado. Estrutura pronta para API real.",
    };
  }

  // ------------------------------------------------------------
  // analyzeUploadedVideoMock(video, card)
  // ------------------------------------------------------------
  function analyzeUploadedVideoMock(video, card) {
    const dur = (video && video.duration) || 25;
    return {
      score: (6.8 + Math.random() * 2).toFixed(1),
      retention: { start: Math.round(dur * 0.7), end: Math.round(dur * 0.7) + 5, type: "Resultado visual", reason: "Cena de maior impacto — ideal para abrir." },
      problems: ["Produto aparece tarde", "CTA fraco no final"],
      strengths: ["Gancho bem construído", "Boa clareza"],
      suggestions: ["Mostrar produto nos 2 primeiros segundos", "Repetir CTA no meio"],
    };
  }

  // ------------------------------------------------------------
  // generateCorrectionFromAnalysis(card, analysis)
  // ------------------------------------------------------------
  function generateCorrectionFromAnalysis(card, analysis) {
    const s = card.script || {};
    const reasons = ["Produto apareceu tarde", "CTA fraco", "Gancho fraco", "Baixa retenção"];
    const reason = (analysis && analysis.problems && analysis.problems[0]) || pick(reasons);
    return {
      reason,
      diagnosis: `A IA identificou: ${reason.toLowerCase()}. Isso reduz retenção e conversão.`,
      correctedScript: {
        hook: "PARA TUDO 🔥 " + (s.hook || "olha isso") ,
        opening: "Produto em close nos primeiros 2 segundos.",
        cta: "Toca no link AGORA e garante o seu. 🛒",
        screenText: "Não role antes de ver isso 👀",
      },
      structure: "Cena forte → contexto → explicação → resultado → CTA",
    };
  }

  // ------------------------------------------------------------
  // generateAudienceBranches(audience)
  // ------------------------------------------------------------
  const BRANCH_LIB = {
    jovens: ["jovens gamers", "jovens do futebol", "jovens de academia", "jovens que gostam de moda", "jovens que querem ganhar dinheiro", "jovens estudantes", "jovens de humor/memes", "jovens que seguem influenciadores"],
    "mães": ["mães de primeira viagem", "mães que trabalham fora", "mães organizadas", "mães que economizam", "mães donas de casa"],
    casa: ["quem mora sozinho", "recém-casados", "quem reformou a casa", "quem aluga e não pode furar parede", "quem ama decorar"],
    fitness: ["iniciantes na academia", "quem treina em casa", "quem quer emagrecer", "quem foca em ganho de massa", "corredores"],
    default: ["curiosos que comparam preço", "quem já quase comprou e desistiu", "indicação de amigos", "quem busca praticidade", "quem compra por impulso", "quem pesquisa muito antes"],
  };
  function branchKey(a) {
    a = (a || "").toLowerCase();
    if (/jovem|jovens|adolesc/.test(a)) return "jovens";
    if (/m[ãa]e/.test(a)) return "mães";
    if (/casa|cozinha|decor|organiza/.test(a)) return "casa";
    if (/academia|fitness|treino|corpo/.test(a)) return "fitness";
    return "default";
  }
  function generateAudienceBranches(audience) {
    const names = BRANCH_LIB[branchKey(audience)] || BRANCH_LIB.default;
    const platforms = ["TikTok", "Instagram", "YouTube Shorts", "Facebook"];
    const angles = ["Dor e Solução", "Review", "Antes e depois", "Prova social", "Comparação", "Demonstração"];
    return names.slice(0, 8).map((name, i) => ({
      name,
      pain: `${cap(name)} sofrem com falta de tempo/solução prática`,
      desire: pick(["resultado rápido", "economizar", "praticidade", "se sentir parte do grupo", "resolver de vez"]),
      language: pick(["direta e popular", "descontraída com gírias", "próxima e acolhedora", "empolgada"]),
      visual: pick(["UGC natural", "antes e depois", "demonstração real", "bastidor"]),
      videoType: angles[i % angles.length],
      hook: pick(HOOKS[angles[i % angles.length]] || HOOKS["Dor e Solução"]).replace("{dor}", "isso").replace("{obj}", "funciona?").replace("{oferta}", "oferta"),
      cta: pick(["Link na bio", "Arrasta pra cima", "Comenta EU QUERO", "Chama no direct"]),
      platform: platforms[i % platforms.length],
    }));
  }

  return {
    generateCampaignPlan, generateCardsForCampaign, generateStrategyForCard, generateScriptForCard,
    generateStoriesForCard, generateChecklistForCard, generateVisualDirection, generateVideoCreativeMock,
    analyzeUploadedVideoMock, generateCorrectionFromAnalysis, generateAudienceBranches,
    QTY,
  };
})();
