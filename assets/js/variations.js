/* ============================================================
   VIRALIZA — Máquina de Variações (Teste de Criativos)
   Um produto → vários ângulos → vários cards reais → testar →
   achar vencedor → explodir o vencedor em novas variações.
   ============================================================ */
window.VariationMachine = (function () {
  const S = window.Store, U = window.UI, AI = window.AI, PE = window.PublishEngine, esc = U.esc;

  // Ângulos distintos (cenário + formato + gancho + visual + público diferentes)
  const ANGLES = [
    { tag: "Fundo Branco / Oferta Direta", type: "Oferta", scene: "fundo branco / estúdio", hook: "Só hoje: {oferta} 🏷️", visual: "produto em close no fundo branco", audience: "quem busca custo-benefício", cta: "Garante o seu no link 👆" },
    { tag: "Sala Decorada / Antes e Depois", type: "Antes e depois", scene: "sala decorada real", hook: "Olha o ANTES... agora o DEPOIS 😱", visual: "parede vazia x decorada (split)", audience: "mulher decorando a sala", cta: "Transforme a sua — link na bio" },
    { tag: "Segurando o Produto / Review", type: "Review", scene: "casa real", hook: "Testei por 30 dias, olha a verdade 👇", visual: "pessoa segurando e mostrando o produto", audience: "cliente que pesquisa antes de comprar", cta: "Se quiser, link na bio" },
    { tag: "Embalagem / Prova de Segurança", type: "Demonstração", scene: "bancada de embalagem", hook: "Olha como embalamos pra chegar intacto 📦", visual: "abertura da embalagem reforçada", audience: "cliente com medo de comprar online", cta: "Compra segura pelo link" },
    { tag: "Tamanho Real / Quebra de Objeção", type: "Resposta a objeção", scene: "parede com sofá", hook: "Não compre antes de ver o tamanho real 👀", visual: "produto ao lado do sofá / fita métrica", audience: "quem tem medo de errar o tamanho", cta: "Confira as medidas no anúncio" },
    { tag: "Bastidor / Produção", type: "Bastidor de Autoridade", scene: "bastidor da produção", hook: "É assim que a gente faz aqui 👇", visual: "processo de produção", audience: "quem valoriza qualidade", cta: "Feito com cuidado — link na bio" },
    { tag: "Cliente / Prova Social", type: "Prova social", scene: "depoimentos", hook: "Mais de 5 mil pessoas já compraram 👇", visual: "prints e fotos de clientes reais", audience: "cliente indeciso", cta: "Junte-se a eles — link na bio" },
    { tag: "Comparação / Parede Vazia x Decorada", type: "Comparação", scene: "split screen", hook: "Comum x transformado: olha a diferença ⚖️", visual: "comparação lado a lado", audience: "quem compara opções antes de comprar", cta: "Escolha o seu no link" },
    { tag: "Tutorial / Como Escolher Tamanho", type: "Demonstração", scene: "mesa de trabalho", hook: "O erro que todo mundo comete antes de comprar 👇", visual: "tutorial de medidas na parede", audience: "quem está na primeira compra", cta: "Aprenda e escolha certo — link" },
    { tag: "Urgência / Oferta Final", type: "Oferta", scene: "produto em destaque", hook: "Corre que é por tempo limitado ⏰", visual: "produto + preço grande na tela", audience: "comprador por impulso", cta: "Últimas unidades — corre no link" },
    { tag: "Rua / Dor Real", type: "Dor e Solução", scene: "rua / dia a dia", hook: "Se sua casa está sem vida, olha isso 👇", visual: "UGC natural, sem produção", audience: "quem acabou de se mudar", cta: "Resolve isso — link na bio" },
    { tag: "UGC / Uso no Dia a Dia", type: "UGC", scene: "casa real", hook: "Recebido que virou meu favorito 👇", visual: "produto em uso no dia a dia", audience: "público jovem", cta: "Corre pegar o seu — link" },
    { tag: "História Curta / Transformação", type: "Transformação", scene: "casa real", hook: "Há 1 semana essa parede era assim... 👇", visual: "storytelling de transformação", audience: "quem gosta de história", cta: "Faça a sua transformação — link" },
    { tag: "Lista Rápida / 3 Motivos", type: "Review", scene: "mesa", hook: "3 motivos pra você comprar isso hoje 👇", visual: "lista com produto em destaque", audience: "quem decide rápido", cta: "Motivo 4: o link tá na bio" },
    { tag: "Erro Comum / Alerta", type: "Resposta a objeção", scene: "casa real", hook: "Pare de cometer esse erro na hora de comprar 👇", visual: "demonstração do erro x certo", audience: "cliente cauteloso", cta: "Faça certo — link na bio" },
  ];

  const CHANNELS_ROT = ["Instagram", "TikTok", "YouTube Shorts", "Stories", "Facebook", "Anúncios"];

  // Gera N variações distintas para uma campanha
  function generate(campaign, n, opts) {
    opts = opts || {};
    n = Math.max(1, Math.min(30, n || 5));
    let angles = ANGLES.slice();
    if (opts.styles && opts.styles.length) {
      const wanted = opts.styles.map((s) => s.toLowerCase());
      const match = angles.filter((a) => wanted.some((w) => a.type.toLowerCase().includes(w) || a.tag.toLowerCase().includes(w)));
      if (match.length) angles = match.concat(angles.filter((a) => !match.includes(a)));
    }
    const channels = (opts.channels && opts.channels.length) ? opts.channels : (campaign.channels || ["Instagram"]);
    const ids = [];
    for (let i = 0; i < n; i++) {
      const a = angles[i % angles.length];
      const channel = channels[i % channels.length];
      const tmp = { type: a.type, campaignId: campaign.id, title: a.tag, strategy: {}, script: {} };
      const strategy = AI.generateStrategyForCard(tmp, campaign);
      strategy.audience = a.audience; strategy.angle = a.type;
      const base = AI.generateScriptForCard(tmp, campaign);
      const script = Object.assign({}, base, {
        hook: a.hook.replace("{oferta}", campaign.offer || "oferta especial"),
        cta: a.cta,
        screenText: [a.tag.split(" / ")[1] || a.tag, "Link na bio 👆"],
        retention: { start: "00:12", end: "00:17", type: "Momento de virada", reason: "Cena forte do ângulo " + a.tag, screenText: a.hook.replace("{oferta}", "") },
      });
      const visual = Object.assign(AI.generateVisualDirection(tmp, campaign), { ambiente: a.scene, objetos: a.visual, estilo: a.tag });
      const id = S.actions.addCard({
        title: `Variação ${i + 1} — ${a.tag}`, type: a.type, campaignId: campaign.id, channel,
        status: "Variação criada", priority: i < 2 ? "Alta" : "Média", objective: campaign.objective, nextAction: "Gravar o gancho",
        scenario: a.scene, variationTag: a.tag, origin: "Máquina de variações", isVariation: true,
        potential: i < 3 ? "Alto" : "Médio", potentialReason: `Ângulo "${a.tag}" para ${a.audience}.`,
        methods: [a.type], strategy, script, visual, checklist: AI.generateChecklistForCard(tmp, campaign),
      });
      ids.push(id);
    }
    // monta plano de teste
    PE.buildPlan(campaign);
    return ids;
  }

  // Explode o vencedor: novas variações baseadas no melhor conteúdo
  const EXPLODE = [
    { s: "outro gancho", mod: (sc) => ({ hook: "Espera até o final 👀 " + (sc.hook || "") }) },
    { s: "CTA diferente", mod: () => ({ cta: "Comenta EU QUERO que eu te mando o link 👇" }) },
    { s: "outro público", mod: () => ({}), aud: "presente para a família" },
    { s: "versão curta", mod: (sc) => ({ mainLine: (sc.mainLine || "").split(".")[0] + "." }) },
    { s: "estilo premium", mod: () => ({}), style: "premium" },
    { s: "estilo oferta", mod: (sc) => ({ hook: "Só hoje com condição especial 🏷️" }) },
    { s: "para Stories", mod: () => ({}), channel: "Stories" },
    { s: "para TikTok", mod: () => ({}), channel: "TikTok" },
    { s: "com prova social", mod: () => ({ hook: "Mais de 5 mil já compraram, olha 👇" }) },
    { s: "com comentário real", mod: () => ({ hook: "Um cliente comentou isso e eu precisei mostrar 👇" }) },
  ];
  function explodeWinner(cardId) {
    const c = S.sel.card(cardId);
    const camp = S.sel.campaign(c.campaignId) || {};
    const ids = [];
    EXPLODE.forEach((e) => {
      const script = Object.assign({}, c.script, e.mod(c.script || {}));
      const strategy = Object.assign({}, c.strategy, e.aud ? { audience: e.aud } : {});
      const nid = S.actions.addCard({
        title: `${(c.variationTag || c.type)} — ${e.s}`, type: c.type, campaignId: c.campaignId, channel: e.channel || c.channel,
        status: "Variação criada", priority: "Média", objective: c.objective, nextAction: "Gravar o gancho",
        scenario: c.scenario, variationTag: c.variationTag, origin: "Explosão do vencedor", isVariation: true, originCardId: cardId,
        potential: "Alto", potentialReason: "Derivada do vídeo vencedor.",
        methods: c.methods, strategy, script, visual: Object.assign({}, c.visual, e.style ? { estilo: e.style } : {}), checklist: AI.generateChecklistForCard(c, camp),
      });
      ids.push(nid);
    });
    S.actions.setCardStatus(cardId, "Vencedor");
    if (camp.id) PE.buildPlan(camp);
    return ids;
  }

  // marca vencedor / perdedores de uma campanha com base em métricas
  function markWinner(campaignId) {
    const cards = S.sel.cardsByCampaign(campaignId).filter((c) => c.analysis && c.analysis.done && c.analysis.metrics && c.analysis.metrics.views);
    if (!cards.length) return null;
    const score = (c) => { const m = c.analysis.metrics; return (m.views || 0) / 1000 + (parseInt(m.retention) || 0) * 2 + (m.sales || 0) * 10; };
    const ranked = cards.sort((a, b) => score(b) - score(a));
    const win = ranked[0];
    S.actions.setCardStatus(win.id, "Vencedor");
    // aprendizado
    S.actions.addLibrary({ type: "Aprendizado", title: `${win.variationTag || win.type} performou melhor`, content: `Vencedor do teste: ${win.title}. Maior retenção/cliques. Recomendo explodir esse vencedor em novas variações.`, source: win.id, tags: ["vencedor", "aprendizado"] });
    return win;
  }

  return { ANGLES, CHANNELS_ROT, generate, explodeWinner, markWinner };
})();
