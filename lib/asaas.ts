export function buildCheckoutUrl(baseUrl: string): string {
  return baseUrl.replace(/\/$/, "") + "/checkouts";
}

export type CheckoutItem = {
  name: string;
  description?: string;
  quantity: number;
  value: number;
  fotoBase64?: string | null;
};

export type CreateCheckoutParams = {
  valor: number;
  itens: CheckoutItem[];
  successUrl: string;
  errorUrl: string;
  cliente: {
    nome: string;
    email: string;
    telefone: string;
    cpf: string;
    endereco: string;
    numero: string;
    estado: string;
    cep: string;
    cidade: string;
  };
  installments?: number;
  paymentMethods?: ("PIX" | "CREDIT_CARD")[];
};

export async function createCheckout(
  params: CreateCheckoutParams
): Promise<string> {
  const baseUrl = process.env.ASAAS_API_URL;
  const rawKey = process.env.ASAAS_API_KEY;

  console.log("🔑 ASAAAS_API_URL:", baseUrl);
  console.log("🔑 ASAAS_API_KEY:", rawKey);

  if (!baseUrl || !rawKey) {
    throw new Error("Asaas não configurado");
  }

  const apiKey = rawKey.startsWith("$") ? rawKey : `$${rawKey}`;
  const url = buildCheckoutUrl(baseUrl);

  const payload = {
    billingTypes: params.paymentMethods ?? ["CREDIT_CARD", "PIX"],
    chargeTypes: ["DETACHED", "INSTALLMENT"],
    callback: {
      successUrl: params.successUrl,
      cancelUrl: params.errorUrl,
      expiredUrl: params.errorUrl,
    },
    minutesToExpire: 10,
    items: params.itens.map((i) => ({
      description: i.description ?? i.name,
      name: i.name,
      quantity: i.quantity,
      value: i.value,
    })),
    customerData: {
      name: params.cliente.nome,
      email: params.cliente.email,
      phone: params.cliente.telefone,
      address: params.cliente.endereco,
      addressNumber: Number(params.cliente.numero),
      province: params.cliente.estado,
      postalCode: params.cliente.cep,
      city: params.cliente.cidade,
      cpfCnpj: params.cliente.cpf,
    },
    installment: { maxInstallmentCount: params.installments ?? 1 },
    customFields:
      (params.itens
        .map((item, idx) =>
          item.fotoBase64 ? { name: `item${idx + 1}Foto`, value: item.fotoBase64 } : null
        )
        .filter(Boolean) as { name: string; value: string }[]) || undefined,
  };

  console.log("📦 Payload enviado ao Asaas:", payload);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "access-token": apiKey,
      "User-Agent": "qg3",
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  console.log("📨 Resposta do Asaas:", text);

  if (!res.ok) {
    throw new Error(text);
  }

  const data = JSON.parse(text);
  const checkoutUrl: string | undefined =
    data?.invoiceUrl || data?.checkoutUrl || data?.link;

  console.log("🔗 URL do checkout gerada:", checkoutUrl);

  if (!checkoutUrl) {
    throw new Error("checkoutUrl ausente");
  }

  return checkoutUrl;
}
