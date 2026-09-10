import { createClient } from "@supabase/supabase-js";

// Ce client utilise la clé service_role, qui contourne les règles RLS.
// Il ne doit JAMAIS être importé dans un composant client ni exposé au
// navigateur — uniquement dans des routes serveur de confiance comme le
// webhook de paiement.
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY manquante dans .env.local");
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}
