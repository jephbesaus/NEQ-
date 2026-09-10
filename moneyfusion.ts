// IMPORTANT : MoneyFusion étant un fournisseur peu documenté publiquement,
// vérifie les noms exacts des champs et l'URL de base sur leur documentation
// officielle avant la mise en production. La structure ci-dessous suit le
// schéma habituel de ce type d'agrégateur (Mobile Money + carte + crypto) :
// on initie un paiement, on reçoit une URL de paiement à ouvrir, puis
// MoneyFusion confirme via un webhook.

type InitPaymentParams = {
  amountUsd: number;
  method: "mobile_money" | "card" | "crypto";
  reference: string; // notre order_id, pour retrouver la commande au webhook
  returnUrl: string;
};

type InitPaymentResult = { ok: true; paymentUrl: string } | { ok: false; error: string };

export async function initMoneyFusionPayment(params: InitPaymentParams): Promise<InitPaymentResult> {
  const apiKey = process.env.MONEYFUSION_API_KEY;
  const apiUrl = process.env.MONEYFUSION_API_URL; // à remplir avec l'URL réelle de leur API

  if (!apiKey || !apiUrl) {
    return { ok: false, error: "MONEYFUSION_API_KEY ou MONEYFUSION_API_URL manquante dans .env.local" };
  }

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        amount: params.amountUsd,
        currency: "USD",
        payment_method: params.method,
        reference: params.reference,
        return_url: params.returnUrl,
      }),
    });

    if (!res.ok) {
      return { ok: false, error: `MoneyFusion HTTP ${res.status}` };
    }

    const data = await res.json();
    // Adapte le nom du champ ci-dessous à la vraie réponse de MoneyFusion.
    const paymentUrl = data.payment_url ?? data.url;
    if (!paymentUrl) return { ok: false, error: "Réponse MoneyFusion sans URL de paiement" };

    return { ok: true, paymentUrl };
  } catch (e) {
    return { ok: false, error: `MoneyFusion: ${(e as Error).message}` };
  }
}
