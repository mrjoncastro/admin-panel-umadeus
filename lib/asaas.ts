export function buildCheckoutUrl(baseUrl: string): string {
  return baseUrl.replace(/\/$/, "") + "/checkouts";
}

export type CheckoutItem = {
  name: string;
  quantity: number;
  value: number;
};

export type CreateCheckoutParams = {
  valor: number;
  itens: CheckoutItem[];
  successUrl: string;
  errorUrl: string;
};

export async function createCheckout(params: CreateCheckoutParams): Promise<string> {
  const baseUrl = process.env.ASAAS_API_URL;
  const rawKey = process.env.ASAAS_API_KEY;
  if (!baseUrl || !rawKey) {
    throw new Error("Asaas nao configurado");
  }
  const apiKey = rawKey.startsWith("$") ? rawKey : `$${rawKey}`;
  const url = buildCheckoutUrl(baseUrl);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      access_token: apiKey,
      "User-Agent": "qg3",
    },
    body: JSON.stringify({
      value: params.valor,
      items: params.itens,
      callback: {
        successUrl: params.successUrl,
        errorUrl: params.errorUrl,
      },
    }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text);
  }
  const data = JSON.parse(text);
  const checkoutUrl: string | undefined = data.checkoutUrl;
  if (!checkoutUrl) {
    throw new Error("checkoutUrl ausente");
  }
  return checkoutUrl;
}
