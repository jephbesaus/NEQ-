import { createBrowserClient } from "@supabase/ssr";

// Client Supabase utilisé dans les Client Components (ex: le bouton "Se connecter avec Google").
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
