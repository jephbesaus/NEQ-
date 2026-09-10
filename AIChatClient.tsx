"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";

type Message = { role: "user" | "assistant"; content: string };

type ModuleDef = {
  key: string;
  title: string;
  desc: string;
  img: string;
  kind: "text" | "generation";
};

const modules: ModuleDef[] = [
  { key: "video", title: "Créer une vidéo", desc: "Génère des vidéos avec l'IA", img: "/home/module-video.jpg", kind: "generation" },
  { key: "image", title: "Créer une image", desc: "Crée des images uniques", img: "/home/module-image.jpg", kind: "generation" },
  { key: "script", title: "Écrire un scénario", desc: "Écris des histoires captivantes", img: "/home/module-edit.jpg", kind: "text" },
  { key: "song", title: "Créer une chanson", desc: "Compose des paroles et de la musique", img: "/home/module-music.jpg", kind: "generation" },
  { key: "character", title: "Créer un personnage", desc: "Imagine des personnages uniques", img: "/projects/graffiti.jpg", kind: "generation" },
  { key: "universe", title: "Créer un univers", desc: "Imagine des mondes et univers", img: "/projects/village.jpg", kind: "generation" },
  { key: "idea", title: "Développer une idée", desc: "Transforme ton idée en projet", img: "/projects/red-orb.jpg", kind: "text" },
  { key: "film", title: "Créer un film", desc: "De l'idée au film complet", img: "/home/module-film.jpg", kind: "generation" },
  { key: "project-help", title: "M'aider sur mon projet", desc: "Analyse, améliore et fais avancer ton projet", img: "/home/project-1.jpg", kind: "text" },
  { key: "translate", title: "Traduire / Adapter", desc: "Traduit et adapte tes contenus", img: "/home/project-3.jpg", kind: "text" },
  { key: "search", title: "Rechercher", desc: "Trouve des informations", img: "/home/project-4.jpg", kind: "text" },
  { key: "improve", title: "Améliorer un texte", desc: "Rends tes textes meilleurs", img: "/home/project-2.jpg", kind: "text" },
];

export default function AIChatClient({ firstName }: { firstName: string }) {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [configured, setConfigured] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // Si l'utilisateur arrive depuis une carte module de l'accueil
  // (ex: /ai?module=film), on ouvre directement la bonne conversation.
  useEffect(() => {
    const moduleKey = searchParams.get("module");
    if (moduleKey) {
      const found = modules.find((m) => m.key === moduleKey);
      if (found) startModule(found);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function sendMessage(text: string) {
    if (!text.trim()) return;
    const nextMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await res.json();
      setConfigured(data.configured !== false);
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Une erreur est survenue. Réessayez dans un instant." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function startModule(m: ModuleDef) {
    if (m.kind === "generation") {
      setMessages([
        {
          role: "assistant",
          content: `Le module « ${m.title} » nécessite un moteur de génération (Runway, Veo ou MusicGPT selon le cas), pas encore connecté sur cette installation. Une fois la clé API du fournisseur ajoutée, ce module deviendra pleinement fonctionnel.`,
        },
      ]);
      return;
    }
    setMessages([
      { role: "assistant", content: `Tu as choisi « ${m.title} ». ${m.desc}. Décris ce que tu veux, et je t'aide à avancer.` },
    ]);
  }

  const started = messages.length > 0;

  return (
    <div className="dash ai-page">
      <header className="dash-header">
        <a href="/home" className="pd-back">
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </a>
        <div className="ai-header-title">
          <img src="/home/ai-avatar.jpg" alt="" className="ai-header-avatar" />
          <div>
            <div className="ai-header-name">NEQ IA</div>
            <div className="ai-header-status"><span className="dot-online" />En ligne</div>
          </div>
        </div>
        <div className="dash-header-right">
          <button className="icon-btn" aria-label="Nouvelle conversation" onClick={() => setMessages([])} type="button">
            <svg viewBox="0 0 24 24" width="19" height="19"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>
          </button>
        </div>
      </header>

      {!started ? (
        <div className="ai-welcome">
          <img src="/home/ai-avatar.jpg" alt="NEQ IA" className="ai-welcome-avatar" />
          <h1>Bienvenue chez NEQ IA</h1>
          <p className="ai-welcome-sub">Ton assistant créatif intelligent</p>
          <p className="ai-welcome-desc">
            {firstName ? `Salut ${firstName}. ` : ""}Discute avec moi ou choisis un module pour créer quelque chose aujourd&apos;hui.
          </p>

          <div className="ai-module-grid">
            {modules.map((m) => (
              <button key={m.key} className="ai-module-card" style={{ backgroundImage: `url(${m.img})` }} onClick={() => startModule(m)} type="button">
                <div className="ai-module-scrim" />
                <div className="ai-module-text">
                  <div className="ai-module-title">{m.title}</div>
                  <div className="ai-module-desc">{m.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="ai-chat" ref={scrollRef}>
          {!configured && (
            <div className="ai-config-warning">
              Assistant non configuré : ajoutez OPENAI_API_KEY dans .env.local pour activer les réponses réelles.
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`ai-bubble-row ${m.role}`}>
              {m.role === "assistant" && <img src="/home/ai-avatar.jpg" alt="" className="ai-bubble-avatar" />}
              <div className={`ai-bubble ${m.role}`}>{m.content}</div>
            </div>
          ))}
          {loading && (
            <div className="ai-bubble-row assistant">
              <img src="/home/ai-avatar.jpg" alt="" className="ai-bubble-avatar" />
              <div className="ai-bubble assistant ai-typing">
                <span className="ai-typing-label">NEQ réfléchit</span>
                <span /><span /><span />
              </div>
            </div>
          )}
        </div>
      )}

      <form
        className="ai-input-bar"
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
      >
        <button type="button" className="ai-input-icon" aria-label="Ajouter">
          <svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Écris ton message ici..."
        />
        <button type="button" className="ai-input-icon" aria-label="Message vocal">
          <svg viewBox="0 0 24 24" width="19" height="19"><rect x="9" y="2" width="6" height="12" rx="3" stroke="currentColor" strokeWidth="1.7" fill="none"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round"/></svg>
        </button>
        <button type="submit" className="ai-input-send" aria-label="Envoyer">
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M4 12h16M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </form>
    </div>
  );
}
