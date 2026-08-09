/* ============================================================
   VIRALIZA backend — ponte para a Claude API (Anthropic)
   Recebe {task, context, input, schema}, monta o prompt com a
   memória operacional e devolve SEMPRE JSON estruturado.
   ============================================================ */
"use strict";

const TASKS = [
  "generate_campaign", "generate_script", "generate_variations", "assistant_action",
  "analyze_content", "generate_correction", "save_learning", "create_publication_plan",
];

// Prompt base — o Claude é o cérebro operacional do Viraliza e responde SÓ JSON.
function systemPrompt() {
  return [
    "Você é o cérebro operacional do VIRALIZA, uma central de execução de marketing e conteúdo",
    "(criar, testar, analisar, corrigir e vender).",
    "",
    "Você recebe: a tarefa (task), o contexto atual do sistema (context), a entrada do usuário (input),",
    "a memória operacional (context.operationLearningContext) e o schema esperado (schema).",
    "",
    "REGRAS:",
    "- Responda SOMENTE com JSON válido. Sem markdown, sem cercas de código, sem texto fora do JSON.",
    "- Siga os padrões APROVADOS da memória e EVITE os padrões rejeitados. Use o tom preferido.",
    "- Cada variação/roteiro deve ser realmente diferente (gancho, cenário, formato, CTA, público, visual).",
    "- Nunca copie concorrentes: extraia inteligência (dores, dúvidas, objeções, ângulos) e crie algo original.",
    "- Quando precisar executar algo no sistema, retorne actions[]. Cada action tem { type, payload }.",
    "- A fala principal (mainSpeech) deve ser um texto natural, corrido, pronto para teleprompter — não uma lista.",
    "",
    "Formato de saída OBRIGATÓRIO:",
    '{ "reply": string, "actions": [{ "type": string, "payload": object }], "data": object, "learningUsed": string[] }',
    "learningUsed deve listar, em linguagem simples, quais aprendizados da operação você usou.",
  ].join("\n");
}

function userMessage(task, context, input, schema) {
  return JSON.stringify({ task, context: context || {}, input: input || {}, schema: schema || null });
}

// Extrai o primeiro objeto JSON de um texto (caso o modelo escape do formato).
function extractJSON(text) {
  if (!text) return null;
  const trimmed = String(text).trim();
  try { return JSON.parse(trimmed); } catch (e) { /* continua */ }
  // remove cercas ```json ... ```
  const fenced = trimmed.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  try { return JSON.parse(fenced); } catch (e) { /* continua */ }
  // procura do primeiro { até o último }
  const first = trimmed.indexOf("{"), last = trimmed.lastIndexOf("}");
  if (first >= 0 && last > first) {
    const slice = trimmed.slice(first, last + 1);
    try { return JSON.parse(slice); } catch (e) { /* falhou */ }
  }
  return null;
}

// Chama a Claude API. Retorna { ok, data } ou { ok:false, error }.
async function callClaude(Anthropic, apiKey, { task, context, input, schema, model, temperature, maxTokens }) {
  if (!apiKey) return { ok: false, error: { type: "api_key_missing", message: "ANTHROPIC_API_KEY não configurada no backend." } };
  const client = new Anthropic({ apiKey });
  let resp;
  try {
    resp = await client.messages.create({
      model: model || "claude-sonnet-5",
      max_tokens: maxTokens || 2000,
      temperature: typeof temperature === "number" ? temperature : 0.7,
      system: systemPrompt(),
      messages: [{ role: "user", content: userMessage(task, context, input, schema) }],
    });
  } catch (e) {
    const status = e && e.status;
    const type = status === 401 ? "api_key_missing" : status === 408 ? "timeout" : "claude_error";
    return { ok: false, error: { type, message: (e && e.message) || "Erro ao chamar a Claude API." } };
  }
  const text = (resp && resp.content && resp.content.map((b) => b.text || "").join("")) || "";
  const json = extractJSON(text);
  if (!json) return { ok: false, error: { type: "invalid_json", message: "Claude não retornou JSON válido.", raw: text.slice(0, 500) } };
  return { ok: true, data: json };
}

module.exports = { TASKS, systemPrompt, extractJSON, callClaude };
