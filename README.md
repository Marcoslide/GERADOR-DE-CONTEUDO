# VIRALIZA

**Central de execução de marketing e conteúdo.** Transforme uma ideia, produto ou campanha em:
estratégia → roteiro → gravação → criativo → publicação → análise → correção → nova execução.

> **Crie. Teste. Analise. Corrija. Venda.** — *"Hoje faça isso."*

Sistema SaaS para criadores, afiliados, sellers, e-commerces, lojas físicas, infoprodutores, social medias, agências, marcas e live shop. Baseado no **Método R.E.A.L.** (Retenção, Emoção, Autoridade, Loop).

---

## Como abrir (HTML navegável para testar)

Duas formas — as duas são **HTML navegável, sem build e sem servidor**:

1. **Arquivo único (mais fácil para testar):** abra `VIRALIZA.html` — tudo (HTML, CSS e JS) está embutido num só arquivo. Duplo clique e pronto.
2. **Projeto completo:** abra `index.html` (usa a pasta `assets/`).

Tudo roda em JavaScript puro no navegador; os dados ficam salvos no `localStorage` (suas alterações persistem entre sessões).

Para restaurar os dados de exemplo: **Configurações → Conta → Restaurar dados de exemplo**.

> **Câmera na gravação:** o modo real (com sua webcam) funciona quando a página é servida por `http(s)` ou `localhost`. Abrindo direto como arquivo (`file://`), alguns navegadores bloqueiam a câmera — o estúdio entra automaticamente em **modo simulado** e todo o fluxo (gravar, salvar take, analisar) continua testável.

---

## Método R.E.A.L.

| Letra | Pilar | Pergunta central |
|-------|-------|------------------|
| **R** | Retenção | Por que a pessoa pararia para assistir? |
| **E** | Emoção | O que a pessoa precisa sentir para agir? |
| **A** | Autoridade | Por que a pessoa deveria confiar nisso? |
| **L** | Loop | Por que a pessoa voltaria para ver o próximo? |

Complementado pelo conceito **RUA** — encontrar conteúdo na realidade (bastidor, loja, cliente, comentário, problema, transformação), e não apenas criar posts genéricos.

---

## IA funcional (pouca entrada, muita saída)

O VIRALIZA foi ajustado para você **informar o básico e a IA gerar o resto** — sem preencher dezenas de campos. A camada de IA é simulada (mock realista, pronta para trocar por API real em `assets/js/ai.js`) e **gera dados reais no app**, não apenas mensagens.

- **Criar campanha é conversacional:** você descreve em uma frase e escolhe por botões (o que criar, canais, estilo, material, quantidade, público). A IA monta uma **prévia** e, ao confirmar, cria a campanha com **cards já preenchidos** (roteiro, gancho, cena de retenção, legenda, hashtags, CTA, checklist e direção de visual).
- **Card enxuto, 5 abas:** Executar · Roteiro · Conteúdo · Checklist · Análise e Correção.
  - *Executar:* próxima ação + estratégia sugerida pela IA + **Visual do vídeo** (roupa, ambiente, enquadramento, energia…) + ações.
  - *Roteiro:* botões que geram de verdade — roteiro completo, 3 ganchos, stories, variação por público, versão curta/anúncio.
  - *Checklist editável:* adicionar/editar/apagar item e grupo, renomear grupo.
  - *Análise e Correção:* métricas + diagnóstico + **correção no mesmo card** (salva nova versão) ou **novo card de correção vinculado** (histórico de versões).
- **Board tipo Trello:** arrastar entre colunas, menu ⋮ no card (abrir, editar, duplicar, variação, correção, apagar) e colunas editáveis (renomear, cor, apagar, adicionar).
- **Biblioteca reutilizável:** reutilizar em card / nova campanha / variação, além de editar, copiar e apagar.
- **Inteligência de público:** a IA gera subpúblicos (dor, desejo, linguagem, gancho, CTA, plataforma) na criação de campanha e na Persona, para criar variações por público.

### Inteligência de Mercado / Pesquisa IA

Camada opcional que usa referências externas para gerar conteúdo mais forte (serviço separado em `assets/js/research.js`, pronto para busca real; no MVP a análise é simulada de forma realista por produto/nicho/plataforma).

- **Na criação da campanha:** etapa opcional "Inteligência de Mercado" — adicione vários links (Mercado Livre, Shopee, Amazon, Reels, TikTok…), cole avaliações/perguntas ou informe palavra-chave. A IA analisa e mostra **Oportunidades encontradas** (dúvidas frequentes, objeções, elogios/provas, reclamações e ideias de vídeo), e você clica em **Gerar cards com base nessa análise** — cada card nasce preenchido e com nota de **Potencial (Alto/Médio/Baixo + motivo)**.
- **No card/roteiro:** ao gerar/ melhorar roteiro, criar variação ou correção, a IA usa a inteligência salva na campanha automaticamente (mostra "Base usada"). Se não houver, pergunta se deve buscar referências (com opção de colar avaliações/perguntas ou "não perguntar de novo"). Botão **🔎 Melhorar com pesquisa** força uma nova análise.
- **Não copia concorrentes:** extrai apenas inteligência (dúvidas, objeções, provas, ângulos) e transforma em conteúdo original.
- **Biblioteca:** as descobertas (dúvidas, objeções, provas, cenas de retenção) podem ser salvas e reutilizadas; a IA também consulta a biblioteca.
- **Arquitetura:** `MarketResearchService`, `MarketplaceAnalyzer`, `SocialResearchService`, `ReferenceAnalyzer`, `ReviewExtractor`, `QuestionExtractor`, `CreativeAnalyzer`, `AudienceBranchService`, `ScriptResearchService` — cada análise retorna um objeto estruturado.

## Estrutura (8 menus)

1. **Hoje** — tela principal e objetiva: prioridades, ações rápidas, cards do dia, alertas.
2. **Ideias** — captura de pensamentos soltos, classificados pela IA, viram campanha/card/biblioteca.
3. **Campanhas** — unidade principal. Tipos incluindo **Afiliado** (com link, comissão, objeções, provas).
4. **Board** — Trello inteligente com 5 visões: **Produção, Semana, Calendário, Canal, Campanha**. Drag & drop.
5. **Análise** — métricas manuais + diagnóstico da IA (o que funcionou, corrigir, repetir, variação).
6. **Biblioteca** — ganchos, roteiros, criativos e aprendizados vencedores para reuso.
7. **Persona** — identidade da marca/operação (tom de voz, público, limites, temas proibidos).
8. **Configurações** — conta, equipe, créditos de IA, integrações, status personalizados, notificações.

O **Chat IA** é contextual (não é um menu solto): aparece em todo lugar e cada resposta tem botões de ação (salvar como ideia, criar card, aplicar no roteiro, criar correção…).

---

## O Card (a alma do sistema)

Cada card é uma central completa de execução com **9 abas**, sem duplicidade:

**Resumo · Estratégia · Roteiro · Conteúdo · Checklist · Publicação · Análise · Correção · Arquivos**

- **Estratégia** — Método R.E.A.L. + 21 métodos estratégicos neutros que, ao clicar, aplicam mudanças reais no card (atualizam gancho, roteiro, próxima ação).
- **Conteúdo → Vídeo do Card** — dois caminhos que caem no mesmo fluxo (veja abaixo). Também há o caminho alternativo **Gerar com IA** (a partir de foto do produto, com prévia e custo em créditos).

### Vídeo do Card

Aba **Conteúdo → Vídeo do Card**. Dois caminhos, mesmo fluxo — simples, focado em **gravar/enviar → revisar → aprovar → encontrar cena de retenção → gerar abertura inteligente → salvar** (não é um editor complexo):

**Caminho 1 — Gravar agora** (estúdio com câmera + teleprompter):
1. **Checklist rápido** de preparação antes de gravar.
2. **Câmera + teleprompter**: o roteiro do card rola na tela para você ler. O teleprompter é uma sobreposição e **não é gravado no vídeo final** (o vídeo captura só a câmera).
3. **Controles**: velocidade do texto, tamanho da fonte, contagem 3‑2‑1, pausar/continuar, reiniciar, espelhar, vertical/horizontal, timer.

**Caminho 2 — Enviar vídeo da galeria**: upload de MP4, MOV ou WEBM, com prévia, nome, duração e tamanho.

**Fluxo unificado (os dois caminhos):**
1. **Revisar** o vídeo (assistir) → **Aprovar vídeo** (ou salvar original / gravar novamente / enviar outro / cancelar).
2. **Análise de retenção**: o sistema procura a melhor cena para abrir o vídeo e sugere trecho (tempo inicial/final), tipo de retenção, motivo, texto na tela e nova estrutura. Botão **Escolher outro trecho** mostra até 3 alternativas.
3. **Gerar vídeo editado** → cria a versão **Abertura Inteligente** (cena forte no início + texto na tela + legenda automática + CTA), com preview, timeline simplificada e status.
4. **Vídeo editado pronto**: compara **Original × Abertura Inteligente**, mostra a cena usada e o motivo da IA. Botões: usar versão editada, usar original, gerar outra versão, enviar para análise, salvar no card.
5. **Versões do vídeo** ficam salvas no card (Original, Abertura Inteligente e variações). Você escolhe qual será usada para publicação.

> No MVP o processamento de vídeo é **simulado** (mock realista baseado na duração, roteiro e tipo do card) — mas todo o fluxo é funcional e as versões ficam salvas no card.
- **Checklist** — 8 etapas (Preparação, Pessoas, Ambiente, Gravação, Edição, Publicação, Análise, Correção).
- **Análise → Correção → novo card** — todo aprendizado vira nova execução.

---

## Créditos de IA

Toda geração de vídeo IA mostra o custo e pede confirmação:
*"Essa geração consumirá X créditos. Deseja continuar?"* — evitando geração ilimitada.

---

## Integrações (preparadas)

Arquitetura pronta para Meta (Instagram, Facebook, Ads), Google (YouTube, Shorts, Trends) e provedores de vídeo IA. O usuário escolhe o **objetivo** (rápido, premium, anúncio, afiliado) e o sistema decide o provedor por trás. Funções ainda não conectadas exibem: *"Função preparada para integração real. Fluxo salvo no card."*

---

## Arquitetura técnica

Sem dependências externas, sem build. HTML + CSS + JavaScript puro.

```
VIRALIZA.html           Build de arquivo único (tudo embutido) — gerado por build.js
index.html              Versão multiarquivo (usa assets/)
build.js                Gera o VIRALIZA.html a partir dos arquivos abaixo
assets/
  css/styles.css        Design system (dark premium, emerald = ação)
  js/
    seed.js             Dados mockados realistas
    store.js            Estado + persistência (localStorage)
    ai.js               Camada de IA (simulada): campanha, roteiro, visual, correção, público
    research.js         Inteligência de Mercado / Pesquisa IA (services + análise estruturada)
    components.js       Modal, toast, chat contextual, helpers
    views.js            As 8 telas
    campaign.js         Criar campanha com IA (conversacional)
    recorder.js         Captura Gravar agora (câmera + teleprompter)
    video.js            Vídeo do Card: revisar → retenção → abertura inteligente → versões
    card.js             Card detalhado (5 abas)
    app.js              Router, layout, formulários, menus, init
```

Para regenerar o arquivo único após editar o código: `node build.js`.
