// Barème : 1$ = 10 crédits, appliqué de façon linéaire sur tous les
// forfaits. Modifiable ici sans toucher au reste du code.
export const creditPacks = {
  usd_1: { amountUsd: 1, credits: 10, label: "1$ — 10 crédits" },
  usd_2: { amountUsd: 2, credits: 20, label: "2$ — 20 crédits" },
  usd_5: { amountUsd: 5, credits: 50, label: "5$ — 50 crédits" },
  usd_10: { amountUsd: 10, credits: 100, label: "10$ — 100 crédits" },
  usd_25: { amountUsd: 25, credits: 250, label: "25$ — 250 crédits" },
  usd_50: { amountUsd: 50, credits: 500, label: "50$ — 500 crédits" },
  usd_100: { amountUsd: 100, credits: 1000, label: "100$ — 1000 crédits" },
  usd_1000: { amountUsd: 1000, credits: 10000, label: "1000$ — 10 000 crédits" },
};

export type CreditPackKey = keyof typeof creditPacks;

// Méthodes de paiement proposées à l'utilisateur avant de choisir un
// montant. Chacune peut être branchée sur un fournisseur différent.
export const paymentMethods = [
  { key: "mobile_money", label: "Mobile Money", provider: "moneyfusion" },
  { key: "card", label: "Carte bancaire", provider: "moneyfusion" },
  { key: "crypto", label: "Cryptomonnaie", provider: "moneyfusion" },
] as const;

export type PaymentMethodKey = (typeof paymentMethods)[number]["key"];
