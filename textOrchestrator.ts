type ChatMessage = { role: "user" | "assistant"; content: string };

type ProviderResult = { ok: true; reply: string } | { ok: false; error: string };

// Chaque fournisseur suit la même forme : on lui donne les messages et un
// prompt système, il répond ou échoue. L'orchestrateur essaie chacun dans
// l'ordre ci-dessous et passe au suivant en cas d'échec — l'utilisateur ne
// voit jamais lequel a répondu, uniquement "NEQ réfléchit..." côté
// interface.

// ---------- 1. Ollama (auto-hébergé, illimité, gratuit) ----------
// Nécessite qu'Ollama tourne sur ta propre machine ou un serveur que tu
// contrôles (ollama.com). Sans ça, cette étape échoue simplement et
// l'orchestrateur passe au fournisseur suivant.
async function callOllama(messages: ChatMessage[], systemPrompt: string): Promise<ProviderResult> {
  const url = process.env.OLLAMA_API_URL; // ex: http://localhost:11434
  if (!url) return { ok: false, error: "OLLAMA_API_URL manquante" };
  try {
    const res = await fetch(`${url}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL ?? "llama3.1",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: false,
      }),
    });
    if (!res.ok) return { ok: false, error: `Ollama HTTP ${res.status}` };
    const data = await res.json();
    const reply = data.message?.content;
    if (!reply) return { ok: false, error: "Ollama: réponse vide" };
    return { ok: true, reply };
  } catch (e) {
    return { ok: false, error: `Ollama: ${(e as Error).message}` };
  }
}

// ---------- 2. DeepSeek (API compatible format OpenAI) ----------
async function callDeepSeek(messages: ChatMessage[], systemPrompt: string): Promise<ProviderResult> {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) return { ok: false, error: "DEEPSEEK_API_KEY manquante" };
  try {
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        temperature: 0.8,
      }),
    });
    if (!res.ok) return { ok: false, error: `DeepSeek HTTP ${res.status}` };
    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content;
    if (!reply) return { ok: false, error: "DeepSeek: réponse vide" };
    return { ok: true, reply };
  } catch (e) {
    return { ok: false, error: `DeepSeek: ${(e as Error).message}` };
  }
}

// ---------- 3. OpenAI ----------
async function callOpenAI(messages: ChatMessage[], systemPrompt: string): Promise<ProviderResult> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return { ok: false, error: "OPENAI_API_KEY manquante" };
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        temperature: 0.8,
      }),
    });
    if (!res.ok) return { ok: false, error: `OpenAI HTTP ${res.status}` };
    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content;
    if (!reply) return { ok: false, error: "OpenAI: réponse vide" };
    return { ok: true, reply };
  } catch (e) {
    return { ok: false, error: `OpenAI: ${(e as Error).message}` };
  }
}

// ---------- 4. Google Gemini (Flash) ----------
async function callGemini(messages: ChatMessage[], systemPrompt: string): Promise<ProviderResult> {
  const key = process.env.GOOGLE_GEMINI_API_KEY;
  if (!key) return { ok: false, error: "GOOGLE_GEMINI_API_KEY manquante" };
  try {
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents,
        }),
      }
    );
    if (!res.ok) return { ok: false, error: `Gemini HTTP ${res.status}` };
    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) return { ok: false, error: "Gemini: réponse vide" };
    return { ok: true, reply };
  } catch (e) {
    return { ok: false, error: `Gemini: ${(e as Error).message}` };
  }
}

// ---------- 5. NVIDIA NIM (API compatible format OpenAI) ----------
async function callNvidiaNim(messages: ChatMessage[], systemPrompt: string): Promise<ProviderResult> {
  const key = process.env.NVIDIA_NIM_API_KEY;
  if (!key) return { ok: false, error: "NVIDIA_NIM_API_KEY manquante" };
  try {
    const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.NVIDIA_NIM_MODEL ?? "meta/llama-3.1-8b-instruct",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        temperature: 0.8,
      }),
    });
    if (!res.ok) return { ok: false, error: `NVIDIA NIM HTTP ${res.status}` };
    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content;
    if (!reply) return { ok: false, error: "NVIDIA NIM: réponse vide" };
    return { ok: true, reply };
  } catch (e) {
    return { ok: false, error: `NVIDIA NIM: ${(e as Error).message}` };
  }
}

// ---------- 6. OpenRouter (passerelle vers de nombreux modèles) ----------
// Utile en dernier recours : un seul compte, accès à des dizaines de
// modèles (GPT-4o, Claude, Llama...) selon ce que tu configures chez eux.
async function callOpenRouter(messages: ChatMessage[], systemPrompt: string): Promise<ProviderResult> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return { ok: false, error: "OPENROUTER_API_KEY manquante" };
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        "X-Title": "NEQ",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
      }),
    });
    if (!res.ok) return { ok: false, error: `OpenRouter HTTP ${res.status}` };
    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content;
    if (!reply) return { ok: false, error: "OpenRouter: réponse vide" };
    return { ok: true, reply };
  } catch (e) {
    return { ok: false, error: `OpenRouter: ${(e as Error).message}` };
  }
}

// Ordre de priorité : Ollama, DeepSeek, OpenAI, Gemini, NVIDIA NIM, puis
// OpenRouter en dernier recours (couvre presque tous les modèles existants).
const providers = [callOllama, callDeepSeek, callOpenAI, callGemini, callNvidiaNim, callOpenRouter];

const DEFAULT_SYSTEM_PROMPT =
  "Tu es NEQ IA, l'assistant créatif de l'application NEQ, un studio de création audiovisuelle assisté par IA. Réponds de façon claire, utile et concise, en français.";

const DISCLAIMER =
  "\n\n—\nNEQ fait de son mieux pour être précis, mais une vérification reste recommandée.";

export async function getAIReply(
  messages: ChatMessage[],
  systemPrompt: string = DEFAULT_SYSTEM_PROMPT
): Promise<{ reply: string; anyConfigured: boolean }> {
  const errors: string[] = [];
  let anyConfigured = false;

  for (const provider of providers) {
    const result = await provider(messages, systemPrompt);
    if (result.ok) {
      return { reply: result.reply + DISCLAIMER, anyConfigured: true };
    }
    if (!result.error.includes("manquante")) anyConfigured = true;
    errors.push(result.error);
  }

  console.error("Tous les fournisseurs IA ont échoué:", errors.join(" | "));

  if (!anyConfigured) {
    return {
      reply:
        "Aucun fournisseur IA n'est encore configuré dans .env.local (OLLAMA_API_URL, DEEPSEEK_API_KEY, OPENAI_API_KEY, GOOGLE_GEMINI_API_KEY ou NVIDIA_NIM_API_KEY).",
      anyConfigured: false,
    };
  }

  return {
    reply: "NEQ rencontre une difficulté temporaire pour répondre. Réessaie dans un instant.",
    anyConfigured: true,
  };
}
