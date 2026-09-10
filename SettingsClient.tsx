"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { creditPacks, paymentMethods, type CreditPackKey, type PaymentMethodKey } from "@/lib/payments/config";

type Section = {
  key: string;
  title: string;
  items: string[];
};

const sections: Section[] = [
  {
    key: "account",
    title: "Mon compte",
    items: ["Photo de profil", "Nom / pseudo", "Bio", "Email", "Numéro de téléphone", "Modifier le profil", "Changer le mot de passe", "Vérification du compte"],
  },
  {
    key: "credits",
    title: "Crédits et paiements",
    items: ["Mes soldes", "Recharger par carte bancaire", "Recharger par Mobile Money", "Recharger en cryptomonnaie", "Historique des recharges", "Historique des paiements", "Crédits consommés", "Remboursements"],
  },
  {
    key: "usage",
    title: "Consommation",
    items: ["Votre activité de crédits", "Détail par génération (vidéo, musique, voix, image)"],
  },
  {
    key: "notifications",
    title: "Notifications",
    items: ["Activité sur mes créations", "Likes", "Commentaires", "Remix", "Messages", "Alertes de solde faible"],
  },
  {
    key: "privacy",
    title: "Confidentialité et sécurité",
    items: ["Compte privé ou public", "Qui peut commenter", "Qui peut remixer", "Qui peut télécharger mes créations", "Sessions connectées", "Déconnexion de tous les appareils"],
  },
  {
    key: "prefs",
    title: "Préférences",
    items: ["Langue", "Pays / région", "Format de date", "Notifications", "Lecture automatique des vidéos", "Qualité de lecture"],
  },
  {
    key: "appearance",
    title: "Apparence",
    items: ["Taille du texte"],
  },
  {
    key: "storage",
    title: "Stockage et projets",
    items: ["Mes projets", "Brouillons", "Créations exportées", "Stockage utilisé", "Supprimer des fichiers"],
  },
  {
    key: "creations",
    title: "Mes créations",
    items: ["Mes publications", "Mes vidéos", "Mes images", "Mes musiques", "Mes remixes", "Publications privées"],
  },
  {
    key: "rights",
    title: "Droits et contenu",
    items: ["Gestion des droits de mes créations", "Autoriser ou interdire le Remix", "Autoriser ou interdire le téléchargement", "Signaler une création", "Signaler une utilisation abusive"],
  },
  {
    key: "help",
    title: "Aide et support",
    items: ["Centre d'aide", "FAQ", "Contacter NEQ — neq127337@gmail.com", "Signaler un problème", "Problème de paiement", "Problème de génération"],
  },
  {
    key: "about",
    title: "À propos de NEQ",
    items: ["Qui sommes-nous", "Version de l'application", "Conditions d'utilisation", "Politique de confidentialité", "Règles de la communauté", "Licences"],
  },
];

const legalContent: Record<string, { title: string; body: string }> = {
  "Qui sommes-nous": {
    title: "À propos de NEQ",
    body:
      "NEQ est une plateforme numérique développée et éditée par Together We Can, dans le cadre de sa vision visant à concevoir des solutions technologiques innovantes, accessibles et adaptées aux besoins des utilisateurs.\n\n" +
      "La plateforme a été conçue sous la direction de Joseph Baliwa Jeph, Fondateur et Président-Directeur Général (PDG) de Together We Can.\n\n" +
      "NEQ a pour ambition de créer un environnement numérique permettant aux utilisateurs de découvrir, créer, partager et valoriser leurs contenus et leurs projets à travers différents outils et services.\n\n" +
      "Développé par : Together We Can\nFondateur & PDG : Joseph Baliwa Jeph\nProduit : NEQ\nAnnée de lancement : 2026\n\n© 2026 Together We Can",
  },
  "Version de l'application": {
    title: "Version de l'application",
    body: "NEQ version 1.0.0 — 2026.",
  },
  "Conditions d'utilisation": {
    title: "Conditions d'utilisation",
    body:
      "En utilisant NEQ, vous acceptez de respecter les droits des autres créateurs, de ne pas publier de contenu illégal, haineux ou portant atteinte à des tiers, et d'utiliser les crédits achetés conformément à leur usage prévu (génération de contenu via l'application). " +
      "NEQ se réserve le droit de suspendre un compte en cas d'abus. Ce texte est une base de départ à faire relire par un juriste avant publication officielle.",
  },
  "Politique de confidentialité": {
    title: "Politique de confidentialité",
    body:
      "NEQ collecte les informations nécessaires au fonctionnement du service (email, contenus créés, historique de crédits). Ces données ne sont jamais vendues à des tiers. " +
      "Les contenus envoyés aux fournisseurs IA (texte, image, vidéo, audio) sont transmis uniquement pour générer le résultat demandé. Ce texte est une base de départ à faire relire par un juriste avant publication officielle.",
  },
  "Règles de la communauté": {
    title: "Règles de la communauté",
    body:
      "Respectez les autres créateurs. Ne publiez pas de contenu violent, haineux, ou violant les droits d'auteur d'un tiers. " +
      "Le Remix est encouragé, mais respectez les autorisations laissées par le créateur original (autoriser ou non le remix, le téléchargement).",
  },
};

export default function SettingsClient({
  email,
  name,
  avatarUrl,
  balance,
}: {
  email: string;
  name: string;
  avatarUrl: string | null;
  balance: number;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [legalOpen, setLegalOpen] = useState<string | null>(null);
  const [rechargeStep, setRechargeStep] = useState<"closed" | "method" | "amount">("closed");
  const [method, setMethod] = useState<PaymentMethodKey | null>(null);
  const [paying, setPaying] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [preview, setPreview] = useState<string | null>(avatarUrl);

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    const supabase = createClient();
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) return;

      const path = `${userId}/avatar.jpg`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, {
        upsert: true,
        contentType: file.type,
      });
      if (uploadError) throw uploadError;

      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      await supabase.auth.updateUser({ data: { avatar_url: pub.publicUrl } });
      setPreview(pub.publicUrl);
    } catch (err) {
      console.error("Erreur upload avatar:", err);
      alert("Impossible d'envoyer la photo. Vérifie que le bucket 'avatars' existe dans Supabase Storage.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handlePay(packKey: CreditPackKey) {
    if (!method) return;
    setPaying(true);
    try {
      const res = await fetch("/api/payments/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packKey, method }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? "Le paiement n'a pas pu être initié.");
      }
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="dash settings-page">
      <header className="dash-header">
        <div className="dash-logo">NEQ</div>
      </header>

      <div className="settings-profile">
        <label className="settings-avatar-wrap">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="settings-avatar-img" />
          ) : (
            <div className="settings-avatar">{name?.[0]?.toUpperCase() ?? "?"}</div>
          )}
          <input type="file" accept="image/*" hidden onChange={handleAvatarUpload} />
          <span className="settings-avatar-edit">{uploadingAvatar ? "..." : "Modifier"}</span>
        </label>
        <div>
          <div className="settings-name">{name}</div>
          <div className="settings-email">{email}</div>
        </div>
      </div>

      <div className="wallet-card">
        <div>
          <div className="wallet-label">Solde de crédits</div>
          <div className="wallet-balance">{balance}</div>
        </div>
        <button className="btn btn-primary" type="button" onClick={() => setRechargeStep("method")}>
          Recharger
        </button>
      </div>

      {rechargeStep === "method" && (
        <div className="recharge-panel">
          <div className="recharge-panel-title">Choisis un moyen de paiement</div>
          <div className="chip-row">
            {paymentMethods.map((m) => (
              <button
                key={m.key}
                className="chip-btn"
                type="button"
                onClick={() => {
                  setMethod(m.key);
                  setRechargeStep("amount");
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
          <button className="recharge-cancel" type="button" onClick={() => setRechargeStep("closed")}>
            Annuler
          </button>
        </div>
      )}

      {rechargeStep === "amount" && (
        <div className="recharge-panel">
          <div className="recharge-panel-title">Choisis un montant</div>
          <div className="chip-row">
            {Object.entries(creditPacks).map(([key, pack]) => (
              <button
                key={key}
                className="chip-btn"
                type="button"
                disabled={paying}
                onClick={() => handlePay(key as CreditPackKey)}
              >
                {pack.label}
              </button>
            ))}
          </div>
          <button className="recharge-cancel" type="button" onClick={() => setRechargeStep("closed")}>
            Annuler
          </button>
        </div>
      )}

      <div className="settings-list">
        {sections.map((s) => (
          <div className="settings-section" key={s.key}>
            <button className="settings-section-head" onClick={() => setOpen(open === s.key ? null : s.key)} type="button">
              {s.title}
              <svg viewBox="0 0 24 24" width="16" height="16" className={open === s.key ? "chev open" : "chev"}>
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {open === s.key && (
              <div className="settings-section-body">
                {s.items.map((item) => (
                  <button
                    className="settings-item"
                    key={item}
                    type="button"
                    onClick={() => legalContent[item] && setLegalOpen(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="settings-account-actions">
        <button className="settings-signout" onClick={handleSignOut} disabled={signingOut} type="button">
          {signingOut ? "Déconnexion..." : "Déconnexion"}
        </button>
        <button className="settings-delete" type="button">Supprimer mon compte</button>
      </div>

      {legalOpen && legalContent[legalOpen] && (
        <div className="legal-overlay" onClick={() => setLegalOpen(null)}>
          <div className="legal-modal" onClick={(e) => e.stopPropagation()}>
            <div className="legal-modal-head">
              <span>{legalContent[legalOpen].title}</span>
              <button type="button" onClick={() => setLegalOpen(null)}>✕</button>
            </div>
            <div className="legal-modal-body">{legalContent[legalOpen].body}</div>
          </div>
        </div>
      )}

      <nav className="bottom-nav">
        <a href="/home" className="nav-item">
          <svg viewBox="0 0 24 24" width="20" height="20"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z" fill="currentColor"/></svg>
          Accueil
        </a>
        <a href="/projects" className="nav-item">
          <svg viewBox="0 0 24 24" width="20" height="20"><path d="M4 6h6l2 2h8v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" fill="none"/></svg>
          Projets
        </a>
        <a href="/ai" className="nav-item nav-plus" aria-label="NEQ IA">
          <span className="nav-plus-circle">
            <img src="/home/ai-avatar.jpg" alt="" />
          </span>
          <span>NEQ IA</span>
        </a>
        <a href="/tools" className="nav-item">
          <svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" fill="none"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/></svg>
          Outils
        </a>
        <a href="/settings" className="nav-item active">
          <svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" fill="none"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round"/></svg>
          Profil
        </a>
      </nav>
    </div>
  );
}
