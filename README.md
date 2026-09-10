# NEQ — Connexion Google

Structure Next.js (App Router) + Supabase, avec la connexion Google déjà câblée.

## Ce qui est déjà fait

- `app/page.tsx` → écran de connexion (ton design vert/noir), le bouton
  **Se connecter avec Google** déclenche le vrai flux OAuth.
- `app/auth/callback/route.ts` → reçoit Google après que l'utilisateur a
  choisi son compte, crée la session.
- `middleware.ts` → garde la session à jour sur toutes les pages.
- `app/home/page.tsx` → page d'arrivée après connexion (à remplacer plus
  tard par le vrai écran d'accueil "What do you want to create today?").

## Ce qu'il te reste à faire (15-20 min)

### 1. Créer un projet Supabase
1. Va sur https://supabase.com → New Project (gratuit)
2. Une fois créé : **Project Settings → API**
3. Copie `Project URL` et `anon public key`

### 2. Créer les identifiants Google
1. Va sur https://console.cloud.google.com
2. Crée un projet (ou utilise un existant)
3. **APIs & Services → OAuth consent screen** → configure le nom "NEQ", logo, etc.
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   - Type d'application : **Web application**
   - Authorized redirect URIs → ajoute :
     ```
     https://TON-PROJET.supabase.co/auth/v1/callback
     ```
     (tu trouves cette URL exacte dans Supabase → Authentication → Providers → Google)
5. Copie le **Client ID** et le **Client Secret**

### 3. Connecter Google dans Supabase
1. Dans Supabase → **Authentication → Providers → Google**
2. Active le provider, colle le Client ID + Client Secret
3. Sauvegarde

### 4. Configurer le projet
```bash
cp .env.local.example .env.local
```
Remplis `.env.local` avec l'URL et la clé anon copiées à l'étape 1.

### 5. Lancer le projet
```bash
npm install
npm run dev
```
Ouvre http://localhost:3000 → clique sur "Se connecter avec Google" →
le sélecteur de compte Google natif s'affiche → choix du compte →
retour automatique sur `/home`, connecté.

## Comportement du bouton

Le clic appelle `supabase.auth.signInWithOAuth({ provider: "google" })`
avec `prompt: "select_account"`, ce qui force Google à toujours afficher
la liste des comptes Gmail disponibles sur l'appareil (au lieu de
reconnecter automatiquement le dernier compte utilisé).

## Prochaines étapes suggérées

- Remplacer `app/home/page.tsx` par le vrai écran d'accueil NEQ.
- Ajouter la table `profiles` dans Supabase (Postgres) pour stocker le
  solde de crédits, la langue préférée, etc., créée automatiquement à la
  première connexion via un trigger SQL.
- Déployer sur Vercel (connecte le repo GitHub, ajoute les mêmes variables
  d'environnement dans les Project Settings de Vercel).

## Storage — photos de profil

Dans Supabase : **Storage** → **New bucket** → nom exact `avatars` → coche
**Public bucket** → Create. Sans ce bucket, "Modifier la photo de profil"
dans Paramètres échouera.

## Paiement MoneyFusion

Ajoute dans `.env.local` :
```
MONEYFUSION_API_KEY=
MONEYFUSION_API_URL=
```
Vérifie l'URL exacte et le format de réponse dans la documentation
officielle MoneyFusion — `lib/payments/moneyfusion.ts` est structuré pour
s'adapter facilement une fois ces détails confirmés.

## Nouveau schéma de crédits

Réexécute `supabase/credits_schema.sql` dans le SQL Editor de Supabase —
il remplace l'ancien système (soldes par module) par un solde unique,
comme demandé.
