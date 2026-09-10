"use client";

import { useState } from "react";

type Tool = "effects" | "text" | "audio" | "transitions" | "control" | "aiedit";

const tools: { key: Tool; label: string }[] = [
  { key: "effects", label: "Effets NEQ" },
  { key: "text", label: "Texte" },
  { key: "audio", label: "Audio" },
  { key: "transitions", label: "Transitions" },
  { key: "control", label: "Contrôle vidéo" },
  { key: "aiedit", label: "AI Edit" },
];

const visualEffects = ["Glitch NEQ", "Lumière", "Énergie", "Particules", "Cinématique", "Distorsion", "Flash", "Fumée", "Éclat", "Motion blur"];
const aiEffects = ["Transformer en nuit", "Ajouter une pluie réaliste", "Changer l'arrière-plan", "Style cinématographique"];

// Effets cinématiques NEQ : le sujet reste au premier plan (visage
// préservé), l'IA modifie l'action, le décor ou l'impact autour de lui.
// Nécessite un moteur vidéo capable de comprendre le sujet et de le
// recomposer dans une nouvelle scène (segmentation + génération) — à
// connecter avec le fournisseur vidéo choisi.
const cinematicEffects = ["Franchir un obstacle", "Impact d'une arme", "Explosion à proximité", "Chute ralentie", "Poursuite dynamique"];

// Décors prêts à l'emploi pour "Changer de décor" : le sujet est détouré
// et replacé dans un nouvel environnement, sans toucher au visage.
const backgroundPresets = ["Forêt", "Plage", "Village", "Ville", "Île"];
const transitionsList = ["Fade", "Zoom", "Slide", "Blur", "Flash", "Rotation", "Glitch", "Transition NEQ"];

export default function EditorClient() {
  const [imported, setImported] = useState(false);
  const [activeTool, setActiveTool] = useState<Tool>("effects");
  const [format, setFormat] = useState("9:16");
  const [publishOpen, setPublishOpen] = useState(false);
  const [visibility, setVisibility] = useState<"public" | "community" | "private">("community");
  const [allowRemix, setAllowRemix] = useState(true);

  if (!imported) {
    return (
      <div className="editor-page">
        <header className="editor-topbar">
          <a href="/tools" className="editor-back">
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
            NEQ Editor
          </a>
        </header>

        <div className="import-screen">
          <button className="import-new-btn" type="button" onClick={() => setImported(true)}>
            <svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round"/></svg>
            Nouveau projet
          </button>

          <div className="import-grid">
            <button className="import-tile" type="button" onClick={() => setImported(true)}>
              <svg viewBox="0 0 24 24" width="26" height="26"><path d="M4 6h6l2 2h8v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" fill="none"/></svg>
              Vidéos
            </button>
            <button className="import-tile" type="button" onClick={() => setImported(true)}>
              <svg viewBox="0 0 24 24" width="26" height="26"><rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" fill="none"/><circle cx="9" cy="10" r="2" stroke="currentColor" strokeWidth="1.6" fill="none"/><path d="M4 17l5-5 4 4 3-3 4 4" stroke="currentColor" strokeWidth="1.6" fill="none"/></svg>
              Images
            </button>
            <button className="import-tile" type="button" onClick={() => setImported(true)}>
              <svg viewBox="0 0 24 24" width="26" height="26"><path d="M9 18V5l11-2v13" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinejoin="round"/><circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.6" fill="none"/><circle cx="17" cy="16" r="3" stroke="currentColor" strokeWidth="1.6" fill="none"/></svg>
              Audios
            </button>
            <button className="import-tile" type="button" onClick={() => setImported(true)}>
              <svg viewBox="0 0 24 24" width="26" height="26"><rect x="9" y="2" width="6" height="12" rx="3" stroke="currentColor" strokeWidth="1.6" fill="none"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round"/></svg>
              Enregistrements
            </button>
            <button className="import-tile" type="button" onClick={() => setImported(true)}>
              <svg viewBox="0 0 24 24" width="26" height="26"><path d="M4 4h16v16H4Z" stroke="currentColor" strokeWidth="1.6" fill="none"/><path d="M4 15l4-4 4 4 4-6 4 6" stroke="currentColor" strokeWidth="1.6" fill="none"/></svg>
              Fichiers
            </button>
            <button className="import-tile" type="button" onClick={() => setImported(true)}>
              <svg viewBox="0 0 24 24" width="26" height="26"><path d="M17 2l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Remixer une création NEQ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-page">
      <header className="editor-topbar">
        <a href="/tools" className="editor-back">
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </a>
        <div className="editor-title">Nouveau projet</div>
        <div className="editor-topbar-actions">
          <button className="icon-editor-btn" type="button" aria-label="Annuler">
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M9 7L4 12l5 5M4 12h11a5 5 0 0 1 0 10h-1" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button className="icon-editor-btn" type="button" aria-label="Rétablir">
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M15 7l5 5-5 5M20 12H9a5 5 0 0 0 0 10h1" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </header>

      <div className="editor-preview">
        <div className="editor-preview-frame" data-format={format}>
          <span className="editor-preview-placeholder">Aperçu de la vidéo</span>
        </div>
      </div>

      <div className="tool-tabs">
        {tools.map((t) => (
          <button key={t.key} className={`tool-tab ${activeTool === t.key ? "active" : ""}`} onClick={() => setActiveTool(t.key)} type="button">
            {t.label}
          </button>
        ))}
      </div>

      <div className="tool-panel">
        {activeTool === "effects" && (
          <>
            <div className="tool-panel-group">
              <div className="tool-panel-label">Effets visuels</div>
              <div className="chip-row">
                {visualEffects.map((e) => <button key={e} className="chip-btn" type="button">{e}</button>)}
              </div>
            </div>
            <div className="tool-panel-group">
              <div className="tool-panel-label">Effets IA</div>
              <div className="chip-row">
                {aiEffects.map((e) => <button key={e} className="chip-btn ai" type="button">{e}</button>)}
              </div>
            </div>
            <div className="tool-panel-group">
              <div className="tool-panel-label">Effets cinématiques NEQ</div>
              <div className="chip-row">
                {cinematicEffects.map((e) => <button key={e} className="chip-btn ai" type="button">{e}</button>)}
              </div>
            </div>
            <div className="tool-panel-group">
              <div className="tool-panel-label">Changer de décor (visage préservé)</div>
              <div className="chip-row">
                {backgroundPresets.map((e) => <button key={e} className="chip-btn ai" type="button">{e}</button>)}
              </div>
            </div>
          </>
        )}

        {activeTool === "text" && (
          <div className="tool-panel-group">
            <div className="tool-panel-label">Ajouter du texte</div>
            <div className="chip-row">
              {["Titre", "Sous-titre", "Citation", "Paroles", "Sous-titres automatiques"].map((e) => (
                <button key={e} className="chip-btn" type="button">{e}</button>
              ))}
            </div>
          </div>
        )}

        {activeTool === "audio" && (
          <>
            <div className="tool-panel-group">
              <div className="tool-panel-label">Musique</div>
              <div className="chip-row">
                {["Importer une musique", "Utiliser une création NEQ Music", "Fondu entrée/sortie"].map((e) => (
                  <button key={e} className="chip-btn" type="button">{e}</button>
                ))}
              </div>
            </div>
            <div className="tool-panel-group">
              <div className="tool-panel-label">Voix</div>
              <div className="chip-row">
                {["Enregistrer", "Importer une voix", "Narration", "Voix IA"].map((e) => (
                  <button key={e} className="chip-btn" type="button">{e}</button>
                ))}
              </div>
            </div>
            <div className="tool-panel-group">
              <div className="tool-panel-label">Effets sonores</div>
              <div className="chip-row">
                {["Pluie", "Explosion", "Vent", "Foule", "Porte", "Ambiance de rue"].map((e) => (
                  <button key={e} className="chip-btn" type="button">{e}</button>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTool === "transitions" && (
          <div className="tool-panel-group">
            <div className="tool-panel-label">Entre deux clips</div>
            <div className="chip-row">
              {transitionsList.map((e) => <button key={e} className="chip-btn" type="button">{e}</button>)}
            </div>
          </div>
        )}

        {activeTool === "control" && (
          <div className="tool-panel-group">
            <div className="chip-row">
              {["Vitesse", "Rotation", "Zoom", "Position", "Recadrage", "Opacité", "Volume", "Luminosité", "Contraste", "Saturation", "Température"].map((e) => (
                <button key={e} className="chip-btn" type="button">{e}</button>
              ))}
            </div>
          </div>
        )}

        {activeTool === "aiedit" && (
          <div className="ai-edit-panel">
            <textarea placeholder="Décris le montage que tu veux. Exemple : fais-moi un montage dynamique de cette vidéo pour un Reel de 30 secondes." />
            <button className="btn btn-primary" type="button">Générer le montage</button>
            <p className="ai-edit-note">
              Cette fonction s&apos;appuiera sur un modèle IA pour proposer découpage, transitions, musique,
              sous-titres et effets automatiquement. Le résultat reste modifiable ensuite.
            </p>
          </div>
        )}
      </div>

      <div className="timeline">
        <div className="timeline-track">
          <div className="timeline-label">VIDÉO</div>
          <div className="timeline-lane">
            <div className="clip">Clip 1</div>
            <div className="clip">Clip 2</div>
            <div className="clip">Clip 3</div>
          </div>
        </div>
        <div className="timeline-track">
          <div className="timeline-label">TEXTE</div>
          <div className="timeline-lane">
            <div className="clip text-clip">Titre</div>
          </div>
        </div>
        <div className="timeline-track">
          <div className="timeline-label">AUDIO</div>
          <div className="timeline-lane">
            <div className="clip audio-clip">Musique</div>
          </div>
        </div>
        <div className="timeline-track">
          <div className="timeline-label">VOIX</div>
          <div className="timeline-lane">
            <div className="clip voice-clip">Voix</div>
          </div>
        </div>

        <div className="timeline-tools">
          {["Couper", "Diviser", "Déplacer", "Fusionner", "Réordonner", "Durée", "Dupliquer", "Supprimer"].map((t) => (
            <button key={t} className="timeline-tool-btn" type="button">{t}</button>
          ))}
        </div>
      </div>

      <div className="export-bar">
        <div className="format-select">
          {["9:16", "16:9", "1:1", "4:5"].map((f) => (
            <button key={f} className={`format-chip ${format === f ? "active" : ""}`} onClick={() => setFormat(f)} type="button">{f}</button>
          ))}
        </div>
        <button className="btn btn-primary export-btn" type="button">Exporter</button>
      </div>

      <button className="publish-open-btn" type="button" onClick={() => setPublishOpen(true)}>
        Publier sur NEQ
      </button>

      {publishOpen && (
        <div className="legal-overlay" onClick={() => setPublishOpen(false)}>
          <div className="legal-modal" onClick={(e) => e.stopPropagation()}>
            <div className="legal-modal-head">
              <span>Publier le projet</span>
              <button type="button" onClick={() => setPublishOpen(false)}>✕</button>
            </div>
            <div className="publish-body">
              <div className="tool-panel-label">Visibilité</div>
              <div className="chip-row">
                <button className={`chip-btn ${visibility === "public" ? "ai" : ""}`} type="button" onClick={() => setVisibility("public")}>Public</button>
                <button className={`chip-btn ${visibility === "community" ? "ai" : ""}`} type="button" onClick={() => setVisibility("community")}>Communauté</button>
                <button className={`chip-btn ${visibility === "private" ? "ai" : ""}`} type="button" onClick={() => setVisibility("private")}>Privé</button>
              </div>

              <div className="tool-panel-label" style={{ marginTop: 16 }}>Remix</div>
              <button className={`chip-btn ${allowRemix ? "ai" : ""}`} type="button" onClick={() => setAllowRemix((v) => !v)}>
                {allowRemix ? "Remix autorisé" : "Remix interdit"}
              </button>

              <button className="btn btn-primary" style={{ marginTop: 20, width: "100%" }} type="button" onClick={() => setPublishOpen(false)}>
                Publier
              </button>
              <p className="ai-edit-note" style={{ marginTop: 10 }}>
                La publication réelle (stockage vidéo + apparition dans le fil Outils) nécessite
                le système de publications, à connecter une fois l&apos;export vidéo réel branché.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
