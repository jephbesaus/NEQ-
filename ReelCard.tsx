"use client";

import { useState } from "react";

export default function ReelCard({ title, author, img }: { title: string; author: string; img: string }) {
  const [liked, setLiked] = useState(false);

  async function handleShare() {
    const shareData = {
      title: `${title} — NEQ`,
      text: `Découvre "${title}" créé sur NEQ.`,
      url: typeof window !== "undefined" ? window.location.href : "",
    };
    // navigator.share ouvre le sélecteur natif du téléphone (TikTok,
    // Instagram, WhatsApp, Facebook, etc.) quand disponible.
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // L'utilisateur a annulé, rien à faire.
      }
    } else {
      // Sur ordinateur (pas de sélecteur natif), on ouvre Facebook comme
      // exemple simple ; à remplacer par un vrai menu de partage plus tard.
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`,
        "_blank"
      );
    }
  }

  return (
    <div className="reel-card" style={{ backgroundImage: `url(${img})` }}>
      <div className="reel-scrim" />
      <div className="reel-info">
        <div className="reel-author">{author}</div>
        <div className="reel-title">{title}</div>
      </div>
      <div className="reel-actions">
        <button className="reel-action" type="button" aria-label="Aimer" onClick={() => setLiked((v) => !v)}>
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path
              d="M12 21s-7.5-4.6-10-9.2C.5 8 2.4 4.5 6 4c2-.3 3.7.7 6 3 2.3-2.3 4-3.3 6-3 3.6.5 5.5 4 4 7.8C19.5 16.4 12 21 12 21Z"
              stroke="currentColor"
              strokeWidth="1.7"
              fill={liked ? "currentColor" : "none"}
              strokeLinejoin="round"
            />
          </svg>
          <span>J&apos;aime</span>
        </button>
        <button className="reel-action" type="button" aria-label="Commenter" onClick={() => alert("Les commentaires arrivent avec le système de publications.")}>
          <svg viewBox="0 0 24 24" width="24" height="24"><path d="M21 12a8 8 0 1 1-3.2-6.4L21 4l-1.2 4.4A7.96 7.96 0 0 1 21 12Z" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinejoin="round"/></svg>
          <span>Commenter</span>
        </button>
        <a className="reel-action" href="/editor" aria-label="Remixer">
          <svg viewBox="0 0 24 24" width="24" height="24"><path d="M17 2l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span>Remixer</span>
        </a>
        <button className="reel-action" type="button" aria-label="Télécharger" onClick={() => alert("Le téléchargement sera disponible une fois l'export vidéo réel branché.")}>
          <svg viewBox="0 0 24 24" width="24" height="24"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span>Télécharger</span>
        </button>
        <button className="reel-action" type="button" aria-label="Partager" onClick={handleShare}>
          <svg viewBox="0 0 24 24" width="24" height="24"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v14" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span>Partager</span>
        </button>
      </div>
    </div>
  );
}
