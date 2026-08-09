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
    components.js       Modal, toast, chat contextual, helpers
    views.js            As 8 telas
    recorder.js         Captura Gravar agora (câmera + teleprompter)
    video.js            Vídeo do Card: revisar → retenção → abertura inteligente → versões
    card.js             Card detalhado (9 abas)
    app.js              Router, layout, formulários, init
```

Para regenerar o arquivo único após editar o código: `node build.js`.
