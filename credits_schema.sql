-- ============================================================
-- NEQ — Système de crédits prépayés (SQL Editor de Supabase)
-- Remplace entièrement l'ancien schéma si tu l'avais déjà exécuté :
-- Dashboard > SQL Editor > New query > colle > Run
-- ============================================================

drop table if exists public.credits;
drop table if exists public.credit_usage;
drop table if exists public.free_generation_usage;
drop table if exists public.orders;

-- Solde unique de crédits par utilisateur (achat générique en dollars,
-- converti en points — pas de solde séparé par module).
create table public.credits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.credits enable row level security;

create policy "Un utilisateur voit son propre solde"
  on public.credits for select
  using (auth.uid() = user_id);

-- Les mises à jour de solde passent uniquement par le webhook de paiement
-- (clé service_role, qui contourne RLS), jamais directement depuis le client.

-- Historique des commandes de recharge.
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  provider text not null,               -- 'moneyfusion', 'stripe', ...
  provider_ref text,
  amount_cents integer not null,
  currency text not null default 'usd',
  module text not null default 'wallet', -- 'wallet' = recharge générale
  credits integer not null,
  status text not null default 'pending' check (status in ('pending','paid','failed','refunded')),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

alter table public.orders enable row level security;

create policy "Un utilisateur voit ses propres commandes"
  on public.orders for select
  using (auth.uid() = user_id);

-- Compte, pour chaque utilisateur et chaque module, combien de
-- générations gratuites ont déjà été utilisées (texte : illimité et
-- toujours gratuit, donc pas suivi ici).
create table public.free_generation_usage (
  user_id uuid references auth.users(id) on delete cascade,
  module text not null check (module in ('image','video','music','voice')),
  free_used integer not null default 0,
  primary key (user_id, module)
);

alter table public.free_generation_usage enable row level security;

create policy "Un utilisateur voit sa propre consommation gratuite"
  on public.free_generation_usage for select
  using (auth.uid() = user_id);

-- Historique de consommation payante (déduction réelle de crédits),
-- utile pour la page "Consommation" des Paramètres. Le fournisseur réel
-- (Runway, ElevenLabs...) est enregistré ici mais jamais montré à
-- l'utilisateur dans l'interface.
create table public.credit_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  module text not null check (module in ('image','video','music','voice')),
  provider text,
  credits_spent integer not null,
  description text,
  created_at timestamptz not null default now()
);

alter table public.credit_usage enable row level security;

create policy "Un utilisateur voit sa propre consommation"
  on public.credit_usage for select
  using (auth.uid() = user_id);

-- ============================================================
-- Règles de consommation (appliquées côté serveur, pas ici en SQL) :
--   - Texte (NEQ IA conversation)  : toujours gratuit, illimité
--   - Image / Musique / Voix      : 2 à 3 générations gratuites par
--                                   utilisateur, puis 50 crédits minimum
--                                   par génération (le coût exact dépend
--                                   du fournisseur réellement utilisé)
--   - Vidéo                       : toujours payant, 50 crédits minimum
-- Voir lib/credits/consumption.ts pour l'implémentation.
-- ============================================================
