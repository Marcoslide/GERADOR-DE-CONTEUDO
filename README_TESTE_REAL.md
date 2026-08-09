# VIRALIZA — Como testar (modo simulado x Claude real)

Há **dois modos**. Escolha conforme o que você quer testar.

---

## 🟢 Modo simulado (rápido, sem instalar nada)

Serve para testar **interface e fluxo** (mock). **Não** usa Claude real.

1. Dê **duplo clique** em **`VIRALIZA.html`**.
2. Pronto — abre no navegador, funciona offline.

> Abra o **`VIRALIZA.html`** (tem CSS e JS embutidos). **Não** abra o `index.html` sozinho — esse depende da pasta `assets/` ao lado.

**No celular:** não dá para abrir arquivo HTML solto. Use o link publicado (o app real):
`https://claude.ai/code/artifact/70f36c5d-420c-4c1f-bcff-bdeb7008f702`

---

## 🤖 Modo real com Claude (backend + chave)

Para testar **IA real**: campanha, cards, roteiros, variações, memória e plano gerados pelo Claude.

### 1. Rodar o backend

```bash
cd server
cp .env.example .env
npm install
npm start
```

### 2. Configurar a chave (só no backend, nunca no navegador)

Edite **`server/.env`**:

```
ANTHROPIC_API_KEY=sua_chave_aqui
CLAUDE_MODEL=claude-sonnet-5
PORT=3000
```

> Se `claude-sonnet-5` não estiver disponível na sua conta, troque o `CLAUDE_MODEL` (ex.: `claude-opus-5`, `claude-haiku-4-5-20251001`). Também é ajustável no painel.

### 3. Abrir o app pelo backend

```
http://localhost:3000
```

O próprio backend serve o frontend (mesma origem — sem CORS).

### 4. Conectar

```
Configurações → IA e APIs → Claude Real → Testar conexão
```

- **URL do backend:** pode deixar **em branco** (mesma origem), ou usar `http://localhost:3000`. Se colar a URL completa (`http://localhost:3000/api/ai/claude`) por engano, também funciona — é normalizada.
- Se algo não conectar, clique em **🔍 Diagnosticar conexão Claude** — ele diz exatamente onde está o problema e o próximo passo.

---

## Diferença resumida

| | HTML direto (`file://`) | Backend (`http://localhost:3000`) |
|---|---|---|
| Interface e fluxo | ✅ | ✅ |
| Claude real | ❌ (só mock) | ✅ (com chave no `.env`) |
| Precisa instalar | Não | `npm install` |
| Precisa chave | Não | Sim (`server/.env`) |

## Segurança

A `ANTHROPIC_API_KEY` fica **somente** em `server/.env` (já no `.gitignore`). O frontend nunca vê a chave — ele só chama `/api/ai/claude` no backend. Por isso a tela **IA e APIs não tem campo de token**.

## Endpoints do backend

- `GET /api/ai/status` — backend online? chave detectada? modelo?
- `POST /api/ai/test` — testa a conexão real com a Claude API.
- `POST /api/ai/claude` — cérebro operacional; recebe `{task, context, input, schema}` e devolve JSON estruturado `{success, task, reply, actions, data, learningUsed, error}`.

## Sem chave configurada

Tudo continua funcional em **modo simulado** automaticamente (com aviso). O caminho real fica pronto; só falta a chave para o trecho "Claude real" deixar de ser mock.
