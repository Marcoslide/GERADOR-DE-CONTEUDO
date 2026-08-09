/* ============================================================
   R.E.A.L. OS — Dados mockados (seed)
   ============================================================ */
window.SEED = (function () {
  const uid = (p) => p + "_" + Math.random().toString(36).slice(2, 9);

  // ---------- Persona ----------
  const persona = {
    id: "persona_1",
    brandName: "Casa Leve",
    userType: "afiliado",
    niche: "Organização e casa",
    audience: "Mulheres 25–45, mães, donas de casa, classe B/C, que querem uma casa organizada gastando pouco tempo.",
    tone: ["direto", "popular", "próximo"],
    language: "Linguagem simples, do dia a dia, sem termos técnicos. Fala como amiga que resolve problema.",
    products: "Organizadores, potes herméticos, cabides deslizantes, cestos, kits de cozinha.",
    channels: ["Instagram", "TikTok", "YouTube Shorts"],
    promise: "Uma casa organizada em minutos, sem gastar uma fortuna.",
    limits: "Nada de política, religião, promessas de saúde. Não prometer resultado impossível.",
    forbidden: "Política, religião, comparação depreciativa de marcas concorrentes.",
    visualStyle: "Ambientes reais, luz natural, cores neutras, produto sempre visível e limpo.",
    positioning: "A amiga organizada que sempre acha a solução barata.",
    objective: "Gerar vendas por link de afiliado com conteúdo orgânico de alto volume.",
  };

  // ---------- Ideas ----------
  const ideas = [
    { id: uid("idea"), title: "Cliente comentou que perde 30min/dia procurando tampa de pote", description: "Comentário no último Reels virou ouro: 'gente eu perco meia hora procurando tampa'. Isso é dor real, dá vídeo de dor e solução com os potes herméticos.", source: "Comentário", status: "Boa para campanha", tags: ["dor", "cozinha", "afiliado"], aiClass: "venda", aiNotes: "Alta chance de retenção — dor específica e cotidiana. Sugiro gancho no primeiro segundo mostrando a bagunça de tampas.", createdAt: "2026-08-07" },
    { id: uid("idea"), title: "Antes e depois da despensa da minha sogra", description: "Gravar a despensa bagunçada e transformar com os potes e organizadores. Transformação real vende.", source: "Bastidor", status: "Virou card", tags: ["antes-depois", "prova"], aiClass: "antes e depois", aiNotes: "Transformação visual forte. Ideal para retenção via curiosidade.", createdAt: "2026-08-06" },
    { id: uid("idea"), title: "Comparar cabide comum x cabide deslizante", description: "Mostrar quanto espaço economiza no guarda-roupa. Comparação direta.", source: "Ideia de roteiro", status: "Nova", tags: ["comparação", "guarda-roupa"], aiClass: "comparação", aiNotes: "Bom para autoridade e demonstração. Use split-screen.", createdAt: "2026-08-08" },
    { id: uid("idea"), title: "Print de tendência: vídeos de 'restock de despensa' bombando", description: "Tendência de organizar e reabastecer despensa está viralizando. Aproveitar formato.", source: "Tendência", status: "Em análise", tags: ["tendência", "trend"], aiClass: "conteúdo orgânico", aiNotes: "Surfar tendência com produto no meio. Loop forte (série de restock).", createdAt: "2026-08-08" },
    { id: uid("idea"), title: "Dúvida recorrente: 'esses potes vão no microondas?'", description: "Várias pessoas perguntam. Vídeo de demonstração respondendo a objeção.", source: "Pergunta de cliente", status: "Salva para depois", tags: ["objeção", "demonstração"], aiClass: "quebra de objeção", aiNotes: "Responder objeção diretamente aumenta conversão.", createdAt: "2026-08-05" },
    { id: uid("idea"), title: "Kit de organização de pia por menos de R$40", description: "Oferta clara de kit barato. Vídeo de oferta rápida.", source: "Ideia de oferta", status: "Nova", tags: ["oferta", "pia"], aiClass: "oferta", aiNotes: "Preço âncora forte. Colocar valor na tela nos 2 primeiros segundos.", createdAt: "2026-08-09" },
  ];

  // ---------- Campaigns ----------
  const campaigns = [
    {
      id: "camp_1", title: "Afiliado — Potes Herméticos", type: "Afiliado", objective: "Gerar vendas pelo link de afiliado",
      productName: "Kit 10 Potes Herméticos", offer: "Kit com 10 potes por R$ 89,90 (frete grátis)", affiliateLink: "https://s.exemplo/potes-af123",
      commission: "18%", price: "R$ 89,90", platform: "Marketplace X", audience: "Donas de casa que odeiam bagunça na cozinha",
      dor: "Perde tempo procurando tampa, comida estraga, despensa bagunçada", promise: "Cozinha organizada e comida durando mais",
      benefit: "Economia de tempo e de comida", objections: "É caro? Vai no microondas? Vaza?", proofs: "Antes e depois, uso real, comentários",
      bonus: "E-book de organização grátis", emotion: "Alívio / satisfação", cta: "Compra pelo link da bio", channels: ["Instagram", "TikTok", "YouTube Shorts"],
      videosPerDay: 2, status: "Ativa", startDate: "2026-08-01", endDate: "2026-08-31",
      metrics: { views: 148000, sales: 62, revenue: "R$ 5.573", conversion: "1,4%" }, createdAt: "2026-08-01",
    },
    {
      id: "camp_2", title: "Antes e Depois — Guarda-roupa", type: "Antes e depois", objective: "Autoridade + vendas de cabides",
      productName: "Cabides Deslizantes (50un)", offer: "50 cabides por R$ 59,90", affiliateLink: "https://s.exemplo/cabide-af88",
      commission: "15%", price: "R$ 59,90", platform: "Marketplace X", audience: "Quem tem guarda-roupa apertado",
      dor: "Guarda-roupa lotado e desorganizado", promise: "Dobre o espaço do armário", benefit: "Mais espaço, roupas organizadas",
      objections: "Aguenta peso? Desliza mesmo?", proofs: "Antes e depois lado a lado", bonus: "", emotion: "Satisfação visual",
      cta: "Link na bio", channels: ["Instagram", "TikTok"], videosPerDay: 1, status: "Ativa", startDate: "2026-08-03", endDate: "2026-08-25",
      metrics: { views: 82000, sales: 28, revenue: "R$ 1.677", conversion: "1,1%" }, createdAt: "2026-08-03",
    },
    {
      id: "camp_3", title: "Live Shop — Kit Cozinha", type: "Live Shop", objective: "Vender kits ao vivo",
      productName: "Kit Completo Cozinha", offer: "Kit completo com 30% off só na live", affiliateLink: "https://s.exemplo/kit-live",
      commission: "20%", price: "R$ 149,90", platform: "TikTok Shop", audience: "Audiência engajada da live",
      dor: "Cozinha desorganizada", promise: "Transforme sua cozinha numa tarde", benefit: "Kit completo com desconto",
      objections: "Vale a pena o kit todo?", proofs: "Demonstração ao vivo", bonus: "Brinde para primeiras compras",
      emotion: "Urgência", cta: "Compra agora na live", channels: ["Live Shop", "Instagram"], videosPerDay: 3,
      status: "Planejamento", startDate: "2026-08-15", endDate: "2026-08-15", metrics: { views: 0, sales: 0, revenue: "R$ 0", conversion: "—" }, createdAt: "2026-08-08",
    },
  ];

  // ---------- Cards ----------
  const defaultChecklist = () => ([
    { group: "Preparação", items: [
      { t: "Definir produto", done: true }, { t: "Definir promessa", done: true }, { t: "Revisar roteiro", done: true },
      { t: "Separar referência", done: false }, { t: "Preparar oferta", done: false }, { t: "Definir CTA", done: true } ] },
    { group: "Pessoas", items: [
      { t: "Definir quem grava", done: true }, { t: "Definir quem edita", done: false }, { t: "Definir quem aprova", done: false },
      { t: "Definir quem publica", done: false }, { t: "Confirmar participante", done: true }, { t: "Confirmar autorização de imagem", done: false } ] },
    { group: "Ambiente", items: [
      { t: "Escolher cenário", done: true }, { t: "Limpar ambiente", done: false }, { t: "Organizar produtos", done: false },
      { t: "Testar luz", done: false }, { t: "Testar áudio", done: false }, { t: "Preparar celular/câmera", done: false } ] },
    { group: "Gravação", items: [
      { t: "Gravar gancho 1", done: false }, { t: "Gravar gancho 2", done: false }, { t: "Gravar gancho 3", done: false },
      { t: "Gravar fala principal", done: false }, { t: "Gravar B-roll", done: false }, { t: "Gravar close do produto", done: false },
      { t: "Gravar CTA", done: false }, { t: "Gravar stories", done: false } ] },
    { group: "Edição", items: [
      { t: "Cortar início fraco", done: false }, { t: "Inserir texto na tela", done: false }, { t: "Ajustar ritmo", done: false },
      { t: "Colocar legenda", done: false }, { t: "Inserir CTA", done: false }, { t: "Preparar capa", done: false } ] },
    { group: "Publicação", items: [
      { t: "Revisar legenda", done: false }, { t: "Revisar hashtags", done: false }, { t: "Escolher canal", done: false },
      { t: "Agendar", done: false }, { t: "Publicar", done: false }, { t: "Salvar link", done: false } ] },
    { group: "Análise", items: [
      { t: "Inserir métricas", done: false }, { t: "Analisar retenção", done: false }, { t: "Analisar comentários", done: false },
      { t: "Avaliar CTA", done: false }, { t: "Avaliar conversão", done: false } ] },
    { group: "Correção", items: [
      { t: "Criar nova versão", done: false }, { t: "Mudar gancho", done: false }, { t: "Trocar CTA", done: false },
      { t: "Encurtar vídeo", done: false }, { t: "Criar novo card", done: false }, { t: "Testar variação", done: false } ] },
  ]);

  const script1 = {
    hook: "Você perde tempo TODO dia por causa dessa bagunça aqui 👇",
    hookAlt1: "Se você abre o armário e cai tudo, esse vídeo é pra você.",
    hookAlt2: "Parei de perder tampa de pote com esse truque de R$ 8.",
    opening: "Mostrar a gaveta de tampas caindo tudo (0–3s, sem falar, só o caos visual).",
    mainLine: "Eu perdia uns 30 minutos por dia procurando tampa. Aí testei esses potes herméticos que encaixam a tampa embaixo e mudou tudo: comida dura mais, despensa fica limpa e você acha tudo na hora.",
    scenes: ["Gaveta bagunçada (problema)", "Produto entrando em cena", "Demonstração do encaixe", "Despensa organizada (resultado)", "Close do CTA"],
    screenText: ["30 min POR DIA perdidos", "R$ 89,90 o kit", "Link na bio 👆"],
    cutPhrases: ["Ninguém te conta isso", "Mudou minha cozinha", "Testa e me conta"],
    cta: "Corre no link da bio antes que acabe o frete grátis.",
    caption: "Chega de perder tampa 😮‍💨 esses potes salvaram minha cozinha. Link na bio! #organização #cozinha #donadecasa",
    hashtags: "#organização #cozinha #potesherméticos #donadecasa #organizaçãodecasa #dicasdecasa",
    title: "Parei de perder tampa de pote",
    cover: "Gaveta bagunçada com texto '30 min perdidos POR DIA'",
    stories: "Enquete: 'Você também perde tampa?' + link do produto no story seguinte.",
  };

  const cards = [
    {
      id: "card_1", campaignId: "camp_1", title: "Vídeo 1 — Dor e Solução (potes)", type: "Dor e Solução", objective: "Gerar clique no link de afiliado",
      channel: "Instagram", status: "Pronto para gravar", priority: "Alta", responsible: "Você", date: "2026-08-09", time: "10:00", deadline: "2026-08-09", progress: 40,
      nextAction: "Gravar os 3 ganchos", methods: ["Dor e Solução", "Gancho de Retenção"], strategy: {
        objective: "Fazer a pessoa clicar no link e comprar o kit de potes", audience: "Donas de casa 25–45",
        pain: "Perde tempo procurando tampa, comida estraga", desire: "Cozinha organizada e prática",
        promise: "Cozinha organizada e comida durando mais", emotion: "Alívio", offer: "Kit 10 potes R$ 89,90 frete grátis",
        cta: "Compra pelo link da bio", objection: "É caro? Vaza?", proof: "Antes e depois + demonstração de encaixe",
        realMethod: "R — gancho de retenção no caos das tampas; E — alívio; A — demonstração real; L — série 'organizando a cozinha'",
        channel: "Instagram Reels", channelAdapt: "TikTok mais rápido; Shorts com texto maior",
      },
      script: script1, checklist: defaultChecklist(),
      content: { path: null, creatives: [] },
      publication: { channel: "Instagram", date: "", time: "", captionFinal: script1.caption, hashtagsFinal: script1.hashtags, ctaFinal: script1.cta, link: "", status: "Não publicado", responsible: "Você", approved: false },
      analysis: { metrics: {}, done: false },
      corrections: [],
      files: [
        { name: "produto-potes.jpg", type: "Produto", size: "1.2 MB", ico: "🖼️" },
        { name: "referencia-antes-depois.mp4", type: "Referência", size: "8.4 MB", ico: "🎬" },
      ],
      createdAt: "2026-08-08",
    },
    {
      id: "card_2", campaignId: "camp_1", title: "Vídeo 2 — Review honesto dos potes", type: "Review", objective: "Gerar autoridade e clique",
      channel: "TikTok", status: "Roteiro", priority: "Média", responsible: "Ana", date: "2026-08-10", time: "14:00", deadline: "2026-08-10", progress: 20,
      nextAction: "Finalizar roteiro", methods: ["Review", "Prova Social"], strategy: { objective: "Review honesto", audience: "Donas de casa", pain: "Medo de comprar gato por lebre", desire: "Confiança na compra", promise: "Review sincero", emotion: "Confiança", offer: "Kit potes", cta: "Link na bio", objection: "Será que é bom mesmo?", proof: "Uso de 30 dias", realMethod: "A — autoridade por uso real", channel: "TikTok", channelAdapt: "" },
      script: { hook: "Comprei esses potes há 30 dias, olha a verdade 👇", hookAlt1: "Review SEM filtro dos potes que todo mundo tá comprando.", hookAlt2: "", opening: "Mostrar os potes usados, com comida dentro.", mainLine: "Depois de 30 dias usando: o que eu amei e o que me incomodou.", scenes: ["Potes em uso", "Prós", "Contras", "Veredito"], screenText: ["30 dias depois", "Vale a pena?"], cutPhrases: ["A verdade ninguém conta"], cta: "Se quiser, link na bio.", caption: "Review honesto 👀 #review #potes", hashtags: "#review #organização #cozinha", title: "Review honesto dos potes", cover: "Potes usados", stories: "" },
      checklist: defaultChecklist(), content: { path: null, creatives: [] },
      publication: { channel: "TikTok", date: "", time: "", captionFinal: "", hashtagsFinal: "", ctaFinal: "", link: "", status: "Não publicado", responsible: "Ana", approved: false },
      analysis: { metrics: {}, done: false }, corrections: [], files: [], createdAt: "2026-08-08",
    },
    {
      id: "card_3", campaignId: "camp_2", title: "Antes e Depois — Guarda-roupa da sogra", type: "Antes e depois", objective: "Vender cabides",
      channel: "Instagram", status: "Publicado", priority: "Alta", responsible: "Você", date: "2026-08-06", time: "18:00", deadline: "2026-08-06", progress: 100,
      nextAction: "Analisar resultado", methods: ["Antes e Depois", "Transformação"], strategy: { objective: "Mostrar transformação", audience: "Guarda-roupa apertado", pain: "Sem espaço", desire: "Armário organizado", promise: "Dobre o espaço", emotion: "Satisfação", offer: "50 cabides R$ 59,90", cta: "Link na bio", objection: "Aguenta peso?", proof: "Antes e depois real", realMethod: "R — curiosidade da transformação", channel: "Instagram", channelAdapt: "" },
      script: { hook: "O guarda-roupa da minha sogra tava assim... olha o depois 😱", hookAlt1: "", hookAlt2: "", opening: "Guarda-roupa lotado.", mainLine: "Troquei todos os cabides pelos deslizantes e o espaço DOBROU.", scenes: ["Antes lotado", "Troca dos cabides", "Depois organizado"], screenText: ["ANTES", "DEPOIS", "Dobrou o espaço"], cutPhrases: ["Não acredito que era o mesmo armário"], cta: "Cabides no link da bio.", caption: "Antes e depois que ninguém acredita 😱 #antesedepois #guardaroupa", hashtags: "#antesedepois #organização #guardaroupa #cabides", title: "Antes e depois do guarda-roupa", cover: "Split antes/depois", stories: "" },
      checklist: (function(){ const c = defaultChecklist(); c.forEach(g=>g.items.forEach(i=>i.done=true)); return c; })(),
      content: { path: "enviar", creatives: [ { id: uid("cre"), type: "Vídeo enviado", source: "Upload", template: "", status: "Analisado", creditsUsed: 0, prompt: "", fileName: "antes-depois-final.mp4" } ] },
      publication: { channel: "Instagram", date: "2026-08-06", time: "18:00", captionFinal: "Antes e depois que ninguém acredita 😱", hashtagsFinal: "#antesedepois #organização #guardaroupa", ctaFinal: "Cabides no link da bio.", link: "https://instagram.com/reel/exemplo-abc", status: "Publicado", responsible: "Você", approved: true },
      analysis: { done: true, metrics: { views: 82400, reach: 71000, retention: "62%", likes: 5400, comments: 312, shares: 890, saves: 2100, clicks: 1240, leads: 0, sales: 28, cost: "R$ 0", conversion: "2,3%" },
        summary: { worked: "Gancho de curiosidade + transformação visual segurou 62% de retenção. Salvamentos altíssimos (2.1k).", failed: "Muitos salvaram mas poucos clicaram no link — CTA apareceu tarde (só nos últimos 3s).", repeat: "Fórmula antes/depois com sogra/família. Prova social real.", fix: "Mover CTA para o meio do vídeo e repetir no fim.", variation: "Testar mesma fórmula com gaveta de cozinha." } },
      corrections: [ { id: uid("cor"), reason: "CTA fraco / apareceu tarde", note: "Salvamentos altos mas conversão podia ser maior. Mover CTA para o meio.", status: "Gerou novo card", createdAt: "2026-08-07" } ],
      files: [ { name: "antes-depois-final.mp4", type: "Vídeo editado", size: "14 MB", ico: "🎬" }, { name: "print-metricas.png", type: "Análise", size: "420 KB", ico: "📊" } ],
      createdAt: "2026-08-05",
    },
    {
      id: "card_4", campaignId: "camp_1", title: "Vídeo 3 — Demonstração: vai no microondas?", type: "Demonstração", objective: "Quebrar objeção",
      channel: "YouTube Shorts", status: "Em edição", priority: "Média", responsible: "Ana", date: "2026-08-09", time: "16:00", deadline: "2026-08-11", progress: 65,
      nextAction: "Inserir legenda e CTA", methods: ["Demonstração", "Quebra de Objeção"], strategy: { objective: "Responder 'vai no microondas?'", audience: "Interessados que têm dúvida", pain: "Medo de comprar errado", desire: "Segurança na compra", promise: "Pote prático e seguro", emotion: "Confiança", offer: "Kit potes", cta: "Link na bio", objection: "Vai no microondas?", proof: "Demonstração no microondas", realMethod: "A — demonstração ao vivo", channel: "Shorts", channelAdapt: "" },
      script: { hook: "'Esse pote vai no microondas?' — bora testar AGORA", hookAlt1: "", hookAlt2: "", opening: "Pergunta na tela + pote na mão.", mainLine: "Recebo muito essa pergunta, então vou testar na frente de vocês.", scenes: ["Pergunta", "Teste no microondas", "Resultado"], screenText: ["VAI no microondas?", "Testando ao vivo"], cutPhrases: ["Prova real"], cta: "Aprovado! Link na bio.", caption: "Testei pra vocês 🔥", hashtags: "#demonstração #potes #cozinha", title: "Vai no microondas?", cover: "Pote no microondas", stories: "" },
      checklist: defaultChecklist(), content: { path: "gerar", creatives: [ { id: uid("cre"), type: "Vídeo IA", source: "IA (foto do produto)", template: "Demonstração visual", status: "Gerado", creditsUsed: 12, prompt: "Pote hermético em uso na cozinha, luz natural", fileName: "demo-ia-potes.mp4" } ] },
      publication: { channel: "YouTube Shorts", date: "", time: "", captionFinal: "", hashtagsFinal: "", ctaFinal: "", link: "", status: "Não publicado", responsible: "Ana", approved: false },
      analysis: { metrics: {}, done: false }, corrections: [], files: [ { name: "demo-ia-potes.mp4", type: "Vídeo IA", size: "9 MB", ico: "✨" } ], createdAt: "2026-08-08",
    },
    {
      id: "card_5", campaignId: "camp_2", title: "Comparação — Cabide comum x deslizante", type: "Comparação", objective: "Autoridade",
      channel: "TikTok", status: "Ideia", priority: "Baixa", responsible: "Você", date: "2026-08-12", time: "", deadline: "2026-08-13", progress: 5,
      nextAction: "Gerar roteiro", methods: ["Comparação"], strategy: { objective: "Comparar economia de espaço", audience: "Indecisos", pain: "Guarda-roupa cheio", desire: "Espaço", promise: "Veja a diferença", emotion: "Surpresa", offer: "Cabides", cta: "Link na bio", objection: "É melhor mesmo?", proof: "Split-screen", realMethod: "A — comparação visual", channel: "TikTok", channelAdapt: "" },
      script: { hook: "", hookAlt1: "", hookAlt2: "", opening: "", mainLine: "", scenes: [], screenText: [], cutPhrases: [], cta: "", caption: "", hashtags: "", title: "", cover: "", stories: "" },
      checklist: defaultChecklist(), content: { path: null, creatives: [] },
      publication: { channel: "TikTok", date: "", time: "", captionFinal: "", hashtagsFinal: "", ctaFinal: "", link: "", status: "Não publicado", responsible: "Você", approved: false },
      analysis: { metrics: {}, done: false }, corrections: [], files: [], createdAt: "2026-08-09",
    },
    {
      id: "card_6", campaignId: "camp_1", title: "Regravação — Produto aparece nos 2 primeiros segundos", type: "Dor e Solução", objective: "Corrigir retenção",
      channel: "Instagram", status: "Precisa corrigir", priority: "Alta", responsible: "Você", date: "2026-08-09", time: "", deadline: "2026-08-10", progress: 10,
      nextAction: "Regravar abertura", methods: ["Gancho de Retenção", "Dor e Solução"], strategy: { objective: "Mostrar produto cedo", audience: "Donas de casa", pain: "Perde tampa", desire: "Praticidade", promise: "Cozinha organizada", emotion: "Alívio", offer: "Kit potes", cta: "Link na bio", objection: "É caro?", proof: "Demonstração", realMethod: "R — produto nos 2s iniciais", channel: "Instagram", channelAdapt: "" },
      script: { hook: "Esse pote aqui acabou com a bagunça da minha cozinha 👇 (mostrar produto em 0s)", hookAlt1: "", hookAlt2: "", opening: "Produto em close nos primeiros 2 segundos.", mainLine: "Diferente da versão anterior, o produto aparece imediatamente.", scenes: ["Close do produto (0-2s)", "Problema", "Solução", "CTA"], screenText: ["Isso mudou minha cozinha"], cutPhrases: [], cta: "Link na bio.", caption: "", hashtags: "", title: "", cover: "", stories: "" },
      checklist: defaultChecklist(), content: { path: null, creatives: [] },
      publication: { channel: "Instagram", date: "", time: "", captionFinal: "", hashtagsFinal: "", ctaFinal: "", link: "", status: "Não publicado", responsible: "Você", approved: false },
      analysis: { metrics: {}, done: false },
      corrections: [ { id: uid("cor"), reason: "Produto apareceu tarde (8s)", note: "IA recomendou mostrar produto nos 2 primeiros segundos.", status: "Regravação", createdAt: "2026-08-07" } ],
      files: [], createdAt: "2026-08-07",
    },
  ];

  // ---------- Library ----------
  const library = [
    { id: uid("lib"), type: "Gancho vencedor", title: "Você perde tempo TODO dia por causa disso 👇", content: "Gancho de dor cotidiana. Reteve 62% na campanha de potes.", tags: ["dor", "retenção"], source: "card_1", createdAt: "2026-08-06" },
    { id: uid("lib"), type: "Roteiro vencedor", title: "Fórmula Antes e Depois (família)", content: "Antes lotado → troca do produto → depois organizado. Prova social com familiar.", tags: ["antes-depois"], source: "card_3", createdAt: "2026-08-06" },
    { id: uid("lib"), type: "CTA", title: "Corre antes que acabe o frete grátis", content: "CTA de urgência que funcionou bem em oferta.", tags: ["urgência", "cta"], source: "", createdAt: "2026-08-05" },
    { id: uid("lib"), type: "Promessa", title: "Dobre o espaço do seu armário", content: "Promessa numérica clara para cabides.", tags: ["promessa"], source: "", createdAt: "2026-08-04" },
    { id: uid("lib"), type: "Objeção", title: "'Vai no microondas?'", content: "Objeção comum de potes. Responder com demonstração ao vivo.", tags: ["objeção"], source: "", createdAt: "2026-08-05" },
    { id: uid("lib"), type: "Aprendizado", title: "CTA cedo aumenta conversão", content: "Salvamentos altos + conversão baixa = CTA apareceu tarde. Mover para o meio.", tags: ["aprendizado", "cta"], source: "card_3", createdAt: "2026-08-07" },
    { id: uid("lib"), type: "Criativo vencedor", title: "Antes/Depois guarda-roupa", content: "82k views, 2.1k saves. Split-screen com texto grande.", tags: ["criativo"], source: "card_3", createdAt: "2026-08-06" },
    { id: uid("lib"), type: "Template", title: "Zoom lento no produto", content: "Template de destaque para ofertas.", tags: ["template"], source: "", createdAt: "2026-08-03" },
  ];

  // ---------- Today priorities & alerts ----------
  const today = {
    priorities: [
      { id: uid("p"), text: 'Gravar 2 vídeos da campanha "Potes Herméticos"', meta: "Campanha Afiliado · até 12h", done: false },
      { id: uid("p"), text: "Enviar 1 vídeo para análise", meta: "Card: Demonstração microondas", done: false },
      { id: uid("p"), text: "Gerar 3 ganchos novos", meta: "Ideias · cozinha", done: false },
      { id: uid("p"), text: "Aprovar 1 criativo IA", meta: "Card: Demonstração", done: false },
      { id: uid("p"), text: "Publicar 1 Reels", meta: "Instagram · 18h", done: false },
      { id: uid("p"), text: "Revisar card com baixa performance", meta: "Regravação potes", done: true },
    ],
    alerts: [
      { kind: "good", text: "<b>Vídeo 1 — Dor e Solução</b> está pronto para gravar." },
      { kind: "warn", text: "<b>Vídeo 2 — Review</b> precisa de CTA melhor no roteiro." },
      { kind: "info", text: "<b>Demonstração microondas</b> vai consumir 12 créditos antes de gerar." },
      { kind: "warn", text: 'Campanha <b>Live Shop — Kit Cozinha</b> está sem conteúdo publicado há 3 dias.' },
      { kind: "good", text: "<b>Antes e Depois — Guarda-roupa</b> teve boa retenção (62%), mas conversão pode melhorar." },
    ],
  };

  const credits = { available: 240, used: 60, total: 300, history: [
    { desc: "Vídeo IA — Demonstração microondas", amount: -12, date: "2026-08-08" },
    { desc: "Vídeo IA — Produto em destaque", amount: -18, date: "2026-08-06" },
    { desc: "Compra de créditos", amount: +150, date: "2026-08-01" },
    { desc: "Vídeo IA — Antes e depois", amount: -30, date: "2026-08-04" },
  ]};

  const statuses = [
    { name: "Ideia", color: "#8fa39c" }, { name: "Roteiro", color: "#3b82f6" }, { name: "Pronto para gravar", color: "#22d3ee" },
    { name: "Gravado", color: "#a3e635" }, { name: "Enviado para análise", color: "#a78bfa" }, { name: "Precisa corrigir", color: "#ef4444" },
    { name: "Em edição", color: "#f59e0b" }, { name: "Aguardando aprovação", color: "#ec4899" }, { name: "Pronto para publicar", color: "#34d399" },
    { name: "Publicado", color: "#10b981" }, { name: "Analisando resultado", color: "#22d3ee" }, { name: "Virou novo teste", color: "#a78bfa" },
    { name: "Variação criada", color: "#a3e635" }, { name: "Vencedor", color: "#10b981" }, { name: "Concluído", color: "#62756e" },
  ];

  const integrations = {
    meta: { status: "desconectado", ig: "", fb: "" },
    tiktok: { status: "desconectado", note: "" },
    youtube: { status: "em breve" },
  };

  const learning = { approvals: [], performance: [], preferences: { approvedHooks: [], rejectedHooks: [], approvedCTAs: [], rejectedReasons: [], preferredTone: "", winningFormats: [], losingFormats: [] } };
  const ai = { provider: "Modo Simulado", apiKey: "", model: "claude-sonnet-5", temperature: 0.7, maxTokens: 2000, status: "simulado" };

  return { persona, ideas, campaigns, cards, library, today, credits, statuses, integrations, learning, ai,
    user: { id: "user_1", name: "Marcos", email: "marcospereirajpjp@gmail.com", role: "Owner" } };
})();
