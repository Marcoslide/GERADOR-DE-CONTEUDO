# VIRALIZA — Backend (Claude API)

Ponte segura entre o frontend do VIRALIZA e a **Claude API (Anthropic)**. A `ANTHROPIC_API_KEY` fica **no backend** (variável de ambiente), nunca no navegador.

```
Frontend Viraliza → /api/ai/claude → Claude API → JSON estruturado → Frontend executa ação real
```

## Como rodar

```bash
cd server
npm install
cp .env.example .env
# edite .env e cole sua ANTHROPIC_API_KEY
npm start
```

Abra **http://localhost:3000** — o backend também serve o frontend (mesma origem, sem CORS/CSP no fetch).

Sem `ANTHROPIC_API_KEY`, o backend responde com erro claro (`api_key_missing`) e o frontend cai automaticamente para o **modo simulado**.

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/ai/status` | Estado da IA (configured, provider, model). |
| POST | `/api/ai/test` | Faz uma chamada mínima ao Claude para validar a chave. |
| POST | `/api/ai/claude` | Endpoint principal. Corpo: `{ task, context, input, schema }`. |

### Contrato de resposta

```json
{ "success": true, "task": "", "reply": "", "actions": [], "data": {}, "learningUsed": [], "error": null }
```

Erro:

```json
{ "success": false, "error": { "type": "api_key_missing | claude_error | invalid_json | timeout | backend_error", "message": "" } }
```

### Tasks suportadas
`generate_campaign`, `generate_script`, `generate_variations`, `assistant_action`, `analyze_content`, `generate_correction`, `save_learning`, `create_publication_plan`.

## Conectar no frontend
No app: **Configurações → IA e APIs → modo "Claude Real"**, URL do backend `http://localhost:3000` (ou deixe vazio para mesma origem), **Testar conexão** → **Salvar**. O `AIProviderService` passa a usar o backend; se ele falhar, cai para o mock e avisa.
