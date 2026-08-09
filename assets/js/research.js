/* ============================================================
   VIRALIZA — Inteligência de Mercado / Pesquisa IA
   Arquitetura de serviços separada, pronta para busca real.
   No MVP retorna análise simulada realista por produto/nicho/
   plataforma. Extrai inteligência (nunca copia concorrente).
   ============================================================ */
window.MarketResearch = (function () {
  const S = window.Store, AI = window.AI;
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const cap = (s) => (s || "").charAt(0).toUpperCase() + (s || "").slice(1);

  // ---------- Plataforma ----------
  function detectPlatform(url) {
    const u = (url || "").toLowerCase();
    if (/mercadolivre|mercadolibre|\/ml[ab]|produto\.ml/.test(u)) return "Mercado Livre";
    if (/shopee/.test(u)) return "Shopee";
    if (/amazon|amzn/.test(u)) return "Amazon";
    if (/instagram|tiktok|youtube|youtu\.be|facebook|fb\.watch|kwai/.test(u)) return "Social";
    if (!u) return "Manual";
    return "Referência";
  }

  // ---------- Domínio do produto (pools de conteúdo) ----------
  const POOLS = {
    decor: {
      questions: ["Vem com vidro?", "Qual o tamanho real?", "Já vem pronto para pendurar?", "A moldura é de madeira mesmo?", "As cores são fiéis à foto?"],
      objections: ["Medo de chegar quebrado", "Medo de parecer menor que a foto", "Dúvida sobre o material", "Dúvida sobre instalação", "Medo da cor vir diferente"],
      praises: ["Clientes elogiam o acabamento", "Clientes dizem que chegou bem embalado", "Clientes dizem que ficou lindo na sala", "Clientes dizem que chegou rápido"],
      complaints: ["Alguns esperavam um tamanho maior", "Alguns tiveram dúvida sobre a cor real", "Alguns não entenderam a diferença entre variações"],
      creative: ["Antes e depois da parede sem vida", "Prova de tamanho ao lado do sofá", "Abertura da embalagem reforçada", "Close na moldura/detalhe", "Como pendurar em 1 minuto"],
    },
    organizacao: {
      questions: ["Vai no microondas?", "Veda bem?", "Qual a capacidade?", "É livre de BPA?", "Pode ir no freezer?"],
      objections: ["Medo de vazar", "Achar caro", "Dúvida se é resistente", "Dúvida se as tampas encaixam"],
      praises: ["Clientes dizem que organizou a cozinha", "Clientes elogiam a vedação", "Clientes dizem que é bonito e prático", "Chegou rápido"],
      complaints: ["Alguns esperavam mais peças", "Alguns acharam a tampa diferente da foto"],
      creative: ["Gaveta bagunçada virando organizada", "Teste de vedação de cabeça para baixo", "Restock de despensa", "Antes e depois da despensa"],
    },
    fitness: {
      questions: ["Qual o sabor mais gostoso?", "Quantas doses rende?", "Tem lactose?", "Serve para iniciante?"],
      objections: ["Medo de não sentir efeito", "Achar caro", "Dúvida sobre o sabor", "Dúvida se é original"],
      praises: ["Clientes elogiam o sabor", "Clientes dizem que rende bastante", "Clientes sentiram resultado", "Chegou lacrado"],
      complaints: ["Alguns acharam doce demais", "Alguns esperavam render mais"],
      creative: ["Antes e depois de treino", "Preparo do shake em 15s", "Comparação com concorrente", "Rotina real de uso"],
    },
    generic: {
      questions: ["Qual o tamanho/medida?", "É resistente?", "Vem completo?", "Qual o prazo de entrega?", "É original?"],
      objections: ["Medo de não valer o preço", "Medo de chegar com defeito", "Dúvida sobre a qualidade", "Dúvida se é como na foto"],
      praises: ["Clientes elogiam a qualidade", "Clientes dizem que chegou rápido", "Clientes dizem que é igual ao anúncio", "Bem embalado"],
      complaints: ["Alguns esperavam algo diferente", "Alguns tiveram dúvida na hora de escolher a variação"],
      creative: ["Produto em uso no dia a dia", "Antes e depois", "Unboxing da embalagem", "Comparação de qualidade", "Prova real de resultado"],
    },
  };
  function domain(product, niche) {
    const t = ((product || "") + " " + (niche || "")).toLowerCase();
    if (/quadro|decor|parede|moldura|poster|painel/.test(t)) return "decor";
    if (/pote|organiz|cozinha|casa|cesto|cabide|despensa/.test(t)) return "organizacao";
    if (/academia|treino|suplemento|whey|fit|creatina|emagrec/.test(t)) return "fitness";
    return "generic";
  }

  // ---------- Serviços (arquitetura separada) ----------
  const ReviewExtractor = { extract: (pool, pasted) => uniq([...(pasted.reviews ? splitLines(pasted.reviews) : []), ...pool.praises]) };
  const QuestionExtractor = { extract: (pool, pasted) => uniq([...(pasted.questions ? splitLines(pasted.questions) : []), ...pool.questions]) };
  const CreativeAnalyzer = { analyze: (pool) => pool.creative.slice() };
  const AudienceBranchService = { branches: (audience) => (window.AI ? AI.generateAudienceBranches(audience) : []) };

  const MarketplaceAnalyzer = {
    analyze: (input, product, niche) => {
      const pool = POOLS[domain(product, niche)];
      const plat = input.detectedPlatform;
      // prioridade varia por plataforma (ML = perguntas; Shopee = avaliações)
      const questions = QuestionExtractor.extract(pool, input.pasted || {});
      const praises = ReviewExtractor.extract(pool, input.pasted || {});
      return {
        questions, reviewsPositive: praises, reviewsNegative: pool.complaints.slice(),
        objections: pool.objections.slice(), praises, complaints: pool.complaints.slice(),
        creativeInsights: CreativeAnalyzer.analyze(pool),
      };
    },
  };
  const SocialResearchService = {
    analyze: (input, product, niche) => {
      const pool = POOLS[domain(product, niche)];
      return {
        questions: [], reviewsPositive: [], reviewsNegative: [], objections: pool.objections.slice(1, 3),
        praises: [], complaints: [],
        creativeInsights: ["Gancho forte nos 2 primeiros segundos", "Cena de retenção: " + pick(pool.creative), "Ritmo rápido com cortes secos", "CTA claro no fim", "Formato vertical UGC"],
      };
    },
  };
  const ReferenceAnalyzer = {
    analyze: (input, product, niche) => {
      const plat = input.detectedPlatform;
      if (plat === "Social") return SocialResearchService.analyze(input, product, niche);
      return MarketplaceAnalyzer.analyze(input, product, niche);
    },
  };

  // analisa UMA fonte → objeto estruturado
  function analyzeSource(ref, product, niche) {
    const plat = detectPlatform(ref.url);
    const input = { detectedPlatform: plat, pasted: ref.pasted || {} };
    const r = ReferenceAnalyzer.analyze(input, product, niche);
    return {
      sourceType: plat, url: ref.url || "", productTitle: product || "", detectedPlatform: plat,
      questions: r.questions, reviewsPositive: r.reviewsPositive, reviewsNegative: r.reviewsNegative,
      objections: r.objections, praises: r.praises, complaints: r.complaints,
      creativeInsights: r.creativeInsights, contentOpportunities: [], suggestedCards: [], audienceBranches: [],
      confidence: ref.url ? "Média" : "Baixa",
    };
  }

  // ---------- Serviço principal ----------
  // MarketResearchService.analyze({ product, niche, references:[{url,type}], pasted:{}, audience })
  const MarketResearchService = {
    analyze: (opts) => {
      opts = opts || {};
      const product = opts.product || "produto";
      const niche = opts.niche || "";
      const refs = (opts.references || []).filter((r) => r.url);
      const pasted = opts.pasted || {};
      const pool = POOLS[domain(product, niche)];

      // agrega perguntas/objeções/elogios/reclamações de todas as fontes + textos colados
      let questions = [], praises = [], complaints = [], objections = [], creative = [];
      refs.forEach((r) => { const a = analyzeSource(Object.assign({}, r, { pasted }), product, niche); questions.push(...a.questions); praises.push(...a.praises); complaints.push(...a.complaints); objections.push(...a.objections); creative.push(...a.creativeInsights); });
      if (!refs.length) { questions = QuestionExtractor.extract(pool, pasted); praises = ReviewExtractor.extract(pool, pasted); objections = pool.objections.slice(); complaints = pool.complaints.slice(); creative = pool.creative.slice(); }
      if (pasted.questions) questions.unshift(...splitLines(pasted.questions));
      if (pasted.reviews) praises.unshift(...splitLines(pasted.reviews));
      if (pasted.comments) questions.push(...splitLines(pasted.comments));

      questions = rank(uniq(questions)); objections = rank(uniq(objections)); praises = rank(uniq(praises)); complaints = rank(uniq(complaints)); creative = uniq(creative);

      const contentOpportunities = buildOpportunities(pool, questions, objections, praises, complaints, creative);
      const suggestedCards = buildSuggestedCards(product, questions, objections, praises, complaints, creative);
      const audienceBranches = AudienceBranchService.branches(opts.audience || niche || product);
      const confidence = refs.length >= 2 ? "Alta" : (refs.length === 1 || hasPasted(pasted)) ? "Média" : "Baixa";

      return {
        sourceType: refs.length ? refs.map((r) => detectPlatform(r.url)).join(", ") : (hasPasted(pasted) ? "Manual" : "Keyword"),
        product, niche, detectedPlatform: refs[0] ? detectPlatform(refs[0].url) : "Manual",
        questions, objections, praises, complaints, creativeInsights: creative,
        contentOpportunities, suggestedCards, audienceBranches, confidence, createdAt: today(),
      };
    },
  };

  // ScriptResearchService: inteligência para roteiro (usa research salvo ou simula)
  const ScriptResearchService = {
    forCard: (card, campaign) => {
      const research = campaign && campaign.research;
      if (research) return research;
      const product = (campaign && campaign.productName) || card.title || "produto";
      return MarketResearchService.analyze({ product, niche: (campaign && campaign.style) || "", audience: (campaign && campaign.audience) || "" });
    },
  };

  // ---------- Oportunidades e cards ----------
  function buildOpportunities(pool, questions, objections, praises, complaints, creative) {
    return {
      duvidas: questions.slice(0, 5),
      objecoes: objections.slice(0, 4),
      elogios: praises.slice(0, 4),
      reclamacoes: complaints.slice(0, 4),
      ideias: creative.slice(0, 6),
    };
  }

  function buildSuggestedCards(product, questions, objections, praises, complaints, creative) {
    const cards = [];
    if (questions[0]) cards.push(mkCard("Dúvida", questions[0], product, "Quebra de Objeção", "Alto", "Dúvida muito frequente — vídeo de conversão direta."));
    if (complaints[0]) cards.push(mkCard("Reclamação", complaints[0], product, "Demonstração", "Alto", "Corrige expectativa errada e evita frustração."));
    if (praises[0]) cards.push(mkCard("Elogio", praises[0], product, "Prova social", "Médio", "Prova social gera confiança."));
    if (objections[0]) cards.push(mkCard("Objeção", objections[0], product, "Resposta a objeção", "Alto", "Objeção forte — remove barreira de compra."));
    if (creative[0]) cards.push(mkCard("Cena forte", creative[0], product, "Antes e depois", "Médio", "Alto potencial visual e de retenção."));
    if (questions[1]) cards.push(mkCard("Dúvida", questions[1], product, "Demonstração", "Médio", "Segunda dúvida mais comum."));
    return cards;
  }

  function mkCard(origin, basis, product, type, potential, potentialReason) {
    const b = basis.replace(/^Clientes (dizem que |elogiam )/i, "").replace(/^Alguns /i, "");
    const map = {
      "Dúvida": { title: `Vídeo — ${basis}`, hook: `Antes de comprar ${product.toLowerCase()}, olha esse detalhe 👇`, screenText: basis, cta: "Tire a dúvida no link 👆" },
      "Reclamação": { title: `Vídeo — Veja isso antes de comprar`, hook: `Não compre ${product.toLowerCase()} antes de ver isso.`, screenText: cap(b), cta: "Confira os detalhes antes de escolher." },
      "Elogio": { title: `Vídeo — ${cap(b)}`, hook: `Olha o que os clientes mais falam 👇`, screenText: cap(b), cta: "Compra com confiança pelo link." },
      "Objeção": { title: `Vídeo — ${cap(b)}?`, hook: `"${b}"? Deixa eu te mostrar a verdade 🛡️`, screenText: cap(b), cta: "Garanta o seu sem medo — link na bio." },
      "Cena forte": { title: `Vídeo — ${cap(basis)}`, hook: `Espera até o final 👀`, screenText: cap(basis), cta: "Faça igual — link na bio." },
    };
    const m = map[origin] || map["Dúvida"];
    return { title: m.title, type, origin, basis, hook: m.hook, screenText: m.screenText, cta: m.cta, retentionText: "Close no detalhe / momento de virada", potential, potentialReason };
  }

  // gera cards REAIS no board a partir da análise
  function generateCardsFromResearch(campaign, analysis) {
    const ids = [];
    (analysis.suggestedCards || []).forEach((sc, i) => {
      const tmp = { type: sc.type, campaignId: campaign.id, title: sc.title, strategy: {}, script: {} };
      const strategy = AI.generateStrategyForCard(tmp, campaign);
      strategy.audience = campaign.audience || strategy.audience;
      const script = Object.assign({}, AI.generateScriptForCard(tmp, campaign), {
        hook: sc.hook, cta: sc.cta, screenText: [sc.screenText, "Link na bio 👆"],
        retention: { start: "00:12", end: "00:17", type: "Momento de virada", reason: sc.potentialReason, screenText: sc.screenText },
      });
      const id = S.actions.addCard({
        title: sc.title, type: sc.type, campaignId: campaign.id, channel: (campaign.channels && campaign.channels[i % campaign.channels.length]) || "Instagram",
        status: "Pronto para gravar", priority: sc.potential === "Alto" ? "Alta" : "Média", objective: campaign.objective, nextAction: "Gravar o gancho",
        origin: "Inteligência de mercado", basis: sc.origin + ": " + sc.basis, potential: sc.potential, potentialReason: sc.potentialReason,
        methods: [sc.type], strategy, script, visual: AI.generateVisualDirection(tmp, campaign), checklist: AI.generateChecklistForCard(tmp, campaign),
      });
      ids.push(id);
    });
    return ids;
  }

  // salva descobertas na biblioteca
  function saveToLibrary(analysis) {
    let n = 0;
    const add = (type, arr) => (arr || []).forEach((t) => { S.actions.addLibrary({ type, title: t, content: `Descoberta de mercado (${analysis.detectedPlatform}) — ${analysis.product}`, tags: ["mercado"], source: "" }); n++; });
    add("Dúvida frequente", analysis.contentOpportunities.duvidas);
    add("Objeção", analysis.contentOpportunities.objecoes);
    add("Prova social", analysis.contentOpportunities.elogios);
    add("Reclamação", analysis.contentOpportunities.reclamacoes);
    add("Cena de retenção", analysis.contentOpportunities.ideias);
    return n;
  }

  // ---------- utils ----------
  function splitLines(t) { return (t || "").split(/[\n;]+/).map((x) => x.trim()).filter((x) => x.length > 2); }
  function uniq(a) { const seen = new Set(); return a.filter((x) => { const k = x.toLowerCase().trim(); if (seen.has(k)) return false; seen.add(k); return true; }); }
  function rank(a) { return a; } // no MVP mantém ordem (fontes já priorizadas)
  function hasPasted(p) { return !!(p && (p.reviews || p.questions || p.comments || p.description || p.keyword)); }
  function today() { return new Date().toISOString().slice(0, 10); }

  return {
    detectPlatform, analyzeSource,
    MarketResearchService, MarketplaceAnalyzer, SocialResearchService, ReferenceAnalyzer,
    ReviewExtractor, QuestionExtractor, CreativeAnalyzer, AudienceBranchService, ScriptResearchService,
    analyze: (opts) => MarketResearchService.analyze(opts),
    generateCardsFromResearch, saveToLibrary,
  };
})();
