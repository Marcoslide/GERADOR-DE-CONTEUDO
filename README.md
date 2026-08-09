# R.E.A.L. OS

**Central de execução de marketing e conteúdo.** Transforme uma ideia, produto ou campanha em:
estratégia → roteiro → gravação → criativo → publicação → análise → correção → nova execução.

> **Crie. Teste. Analise. Corrija. Venda.** — *"Hoje faça isso."*

Sistema SaaS reconstruído do zero para criadores, afiliados, sellers, e-commerces, lojas físicas, infoprodutores, social medias, agências, marcas e live shop.

---

## Como abrir

É um app **HTML navegável, sem build e sem servidor**. Basta abrir o arquivo:

```
index.html
```

Duplo clique no `index.html` (ou arraste para o navegador). Tudo roda em JavaScript puro no navegador, e os dados ficam salvos no `localStorage` (suas alterações persistem entre sessões).

Para restaurar os dados de exemplo: **Configurações → Conta → Restaurar dados de exemplo**.

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
- **Conteúdo** — 3 caminhos: **Gerar com IA** (a partir de foto do produto, com prévia e custo em créditos), **Enviar vídeo** (com análise da IA), **Gravar agora** (câmera com roteiro/gancho na tela).
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
index.html
assets/
  css/styles.css        Design system (dark premium, emerald = ação)
  js/
    seed.js             Dados mockados realistas
    store.js            Estado + persistência (localStorage)
    components.js       Modal, toast, chat contextual, helpers
    views.js            As 8 telas
    card.js             Card detalhado (9 abas)
    app.js              Router, layout, formulários, init
```
