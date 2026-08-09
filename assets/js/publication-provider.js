/* ============================================================
   VIRALIZA — PublicationProviderService
   Abstração de publicação. Hoje: provider "mock" (simulado,
   funcional). Preparado para Meta / TikTok / YouTube reais
   (tokens sempre no backend, nunca no frontend).
   ============================================================ */
window.PublicationProviderService = (function () {
  const S = window.Store;

  function providerFor(channel) {
    const it = S.get().integrations || {};
    if (/Instagram|Facebook|Reels/i.test(channel) && it.meta && it.meta.status === "conectado") return "meta";
    if (/TikTok/i.test(channel) && it.tiktok && it.tiktok.status === "conectado") return "tiktok";
    if (/YouTube|Shorts/i.test(channel)) return "youtube";
    return "mock";
  }

  // No MVP tudo cai no provider mock (real exige backend com OAuth/tokens).
  function publishNow(item) {
    const provider = providerFor(item && item.channel);
    // Estrutura pronta: quando o provider real existir, aqui chamaria o backend.
    return { provider, mode: provider === "mock" ? "simulado" : "real-preparado", status: "Publicando" };
  }
  function schedulePost(item) { return { provider: providerFor(item && item.channel), status: "Agendado" }; }
  function getStatus(item) { return { status: "desconhecido", provider: providerFor(item && item.channel) }; }
  function syncMetrics(item) { return { synced: false, note: "Sincronização real via backend (preparado)." }; }

  const MODES = ["mock", "manual", "agendado com lembrete", "automático com aprovação", "automático liberado"];
  const PROVIDERS = ["Meta", "TikTok", "YouTube Shorts", "Manual/Mock"];

  return { providerFor, publishNow, schedulePost, getStatus, syncMetrics, MODES, PROVIDERS };
})();
