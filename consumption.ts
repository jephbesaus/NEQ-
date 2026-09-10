import { getSupabaseAdmin } from "@/lib/supabase/admin";

type Module = "image" | "video" | "music" | "voice";

const FREE_GENERATIONS_ALLOWED = 3; // les 3 premières générations sont offertes
const MINIMUM_CREDITS_PER_GENERATION = 50;

type CheckResult =
  | { allowed: true; willCharge: boolean; creditsToCharge: number }
  | { allowed: false; reason: "insufficient_credits"; balance: number };

// À appeler AVANT de lancer une génération réelle (image, vidéo, musique,
// voix) auprès d'un fournisseur. Ne s'applique jamais au texte (NEQ IA en
// conversation), qui reste gratuit et illimité — cette fonction n'est
// simplement pas appelée pour ce cas-là.
export async function checkCreditsBeforeGeneration(
  userId: string,
  module: Module,
  providerCostInCredits?: number
): Promise<CheckResult> {
  const admin = getSupabaseAdmin();

  // La vidéo est toujours payante, jamais de générations gratuites.
  if (module !== "video") {
    const { data: usage } = await admin
      .from("free_generation_usage")
      .select("free_used")
      .eq("user_id", userId)
      .eq("module", module)
      .single();

    const freeUsed = usage?.free_used ?? 0;
    if (freeUsed < FREE_GENERATIONS_ALLOWED) {
      return { allowed: true, willCharge: false, creditsToCharge: 0 };
    }
  }

  const creditsToCharge = Math.max(providerCostInCredits ?? 0, MINIMUM_CREDITS_PER_GENERATION);

  const { data: credits } = await admin.from("credits").select("balance").eq("user_id", userId).single();
  const balance = credits?.balance ?? 0;

  if (balance < creditsToCharge) {
    return { allowed: false, reason: "insufficient_credits", balance };
  }

  return { allowed: true, willCharge: true, creditsToCharge };
}

// À appeler APRÈS une génération réussie : déduit les crédits si
// nécessaire, et incrémente le compteur de générations gratuites sinon.
export async function recordGenerationResult(
  userId: string,
  module: Module,
  willCharge: boolean,
  creditsCharged: number,
  provider: string,
  description: string
) {
  const admin = getSupabaseAdmin();

  if (willCharge) {
    const { data: credits } = await admin.from("credits").select("balance").eq("user_id", userId).single();
    const newBalance = (credits?.balance ?? 0) - creditsCharged;

    await admin.from("credits").upsert({ user_id: userId, balance: newBalance, updated_at: new Date().toISOString() });

    await admin.from("credit_usage").insert({
      user_id: userId,
      module,
      provider,
      credits_spent: creditsCharged,
      description,
    });
  } else if (module !== "video") {
    const { data: usage } = await admin
      .from("free_generation_usage")
      .select("free_used")
      .eq("user_id", userId)
      .eq("module", module)
      .single();

    await admin.from("free_generation_usage").upsert({
      user_id: userId,
      module,
      free_used: (usage?.free_used ?? 0) + 1,
    });
  }
}
