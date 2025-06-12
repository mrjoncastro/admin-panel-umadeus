"use client";

import { useCart } from "@/lib/context/CartContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { useAuthContext } from "@/lib/context/AuthContext";
import { CheckCircle } from "lucide-react";
import { hexToPtName } from "@/utils/colorNamePt";

function formatCurrency(n: number) {
  return `R$ ${n.toFixed(2).replace(".", ",")}`;
}

function CheckoutContent() {
  const { itens, clearCart } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn, user } = useAuthContext();

  const [nome, setNome] = useState(user?.nome || "");
  const [telefone, setTelefone] = useState(String(user?.telefone ?? ""));
  const [email, setEmail] = useState(user?.email || "");
  const [endereco, setEndereco] = useState(String(user?.endereco ?? ""));
  const [cpf, setCpf] = useState("");
  const [estado, setEstado] = useState("");
  const [cep, setCep] = useState("");
  const [cidade, setCidade] = useState("");
  const [numero, setNumero] = useState(String(user?.numero ?? ""));
  const [dataNascimento, setDataNascimento] = useState(
    String((user as any)?.data_nascimento ?? "")
  );
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  useEffect(() => {
    if (user) {
      setNome(user.nome || "");
      setTelefone(String(user.telefone ?? ""));
      setEmail(user.email || "");
      setEndereco(String(user.endereco ?? ""));
      setNumero(String(user.numero ?? ""));
      setEstado(String(user.estado ?? ""));
      setCep(String(user.cep ?? ""));
      setCidade(String(user.cidade ?? ""));
      setCpf(String(user.cpf ?? ""));
      setCpf(String(user.cpf ?? ""));
      setNumero(String(user.numero ?? ""));
      setEstado(String(user.estado ?? ""));
      setCep(String(user.cep ?? ""));
      setCidade(String(user.cidade ?? ""));
      setDataNascimento(String((user as any).data_nascimento ?? ""));
    }
  }, [user]);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login?redirect=/loja/checkout");
    }
  }, [isLoggedIn, router]);

  const pedidoId = searchParams.get("pedido") || Date.now().toString();
  const total = itens.reduce((sum, i) => sum + i.preco * i.quantidade, 0);

  function maskTelefone(valor: string) {
    // Remove tudo que não for número
    let v = valor.replace(/\D/g, "");
    // (99) 99999-9999 ou (99) 9999-9999
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 10) {
      // Celular com 9 dígitos
      return v.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    } else if (v.length > 6) {
      // Fixo ou celular antigo
      return v.replace(/^(\d{2})(\d{4,5})(\d{0,4})$/, "($1) $2-$3");
    } else if (v.length > 2) {
      return v.replace(/^(\d{2})(\d{0,5})$/, "($1) $2");
    } else {
      return v;
    }
  }

  const handleConfirm = async () => {
    setStatus("loading");
    try {
      const itensPayload = await Promise.all(
        itens.map(async (i) => {
          let fotoBase64: string | undefined;
          if (i.imagem) {
            try {
              const resp = await fetch(i.imagem);
              const blob = await resp.blob();
              fotoBase64 = await new Promise((res) => {
                const reader = new FileReader();
                reader.onloadend = () => res(reader.result as string);
                reader.readAsDataURL(blob);
              });
            } catch {
              /* ignore */
            }
          }
          return {
            name: i.nome,
            description: i.descricao,
            quantity: i.quantidade,
            value: i.preco,
            fotoBase64,
          };
        })
      );

      const payload = {
        valor: total,
        itens: itensPayload,
        successUrl: `${window.location.origin}/loja/sucesso?pedido=${pedidoId}`,
        errorUrl: `${window.location.origin}/loja/sucesso?pedido=${pedidoId}`,
        cliente: {
          nome,
          email,
          telefone,
          cpf,
          endereco,
          numero,
          estado,
          cep,
          cidade,
        },
        installments: 1,
        paymentMethods: ["PIX", "CREDIT_CARD"],
      };

      const res = await fetch("/admin/api/asaas/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      const link = data?.checkoutUrl || data?.link;
      if (!res.ok || !link) throw new Error("Falha ao gerar link de pagamento");
      clearCart();
      setTimeout(() => {
        setStatus("success");
        setTimeout(() => {
          window.location.href = link;
        }, 1000);
      }, 1000);
    } catch {
      alert("Erro ao processar pagamento. Tente novamente.");
      setStatus("idle");
    }
  };

  if (itens.length === 0) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-semibold mb-4 tracking-tight">
          Seu carrinho está vazio
        </h1>
        <button
          onClick={() => router.push("/loja")}
          className="text-sm underline mt-2"
        >
          Voltar à loja
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-[80vh] flex justify-center items-center py-8">
      <div className="w-full max-w-5xl bg-neutral-50 rounded-2xl shadow-sm grid grid-cols-1 md:grid-cols-2 gap-10 p-6 md:p-12">
        {/* Bloco ESQUERDO: Info de entrega */}
        <section>
          <h2 className="text-lg font-semibold mb-6 tracking-tight">
            Informações de entrega
          </h2>
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nome</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-base focus:border-black focus:outline-none"
                  placeholder="Seu nome"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={telefone}
                  onChange={(e) => setTelefone(maskTelefone(e.target.value))}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-base focus:border-black focus:outline-none"
                  placeholder="(00) 90000-0000"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">E-mail</label>
              <input
                type="email"
                value={typeof email === "string" ? email : ""}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-base focus:border-black focus:outline-none"
                placeholder="Seu melhor e-mail"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Endereço</label>
              <input
                type="text"
                value={typeof endereco === "string" ? endereco : ""}
                onChange={(e) => setEndereco(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-base focus:border-black focus:outline-none"
                placeholder="Rua"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-base focus:border-black focus:outline-none"
                placeholder="Número"
                required
              />
              <input
                type="text"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-base focus:border-black focus:outline-none"
                placeholder="Estado"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-base focus:border-black focus:outline-none"
                placeholder="CEP"
                required
              />
              <input
                type="text"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-base focus:border-black focus:outline-none"
                placeholder="Cidade"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">CPF</label>
              <input
                type="text"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-base focus:border-black focus:outline-none"
                placeholder="CPF"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Data de nascimento
              </label>
              <input
                type="date"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-base focus:border-black focus:outline-none"
                required
              />
            </div>
          </form>
        </section>
        {/* Bloco DIREITO: Resumo do pedido */}
        <section>
          <h2 className="text-lg font-semibold mb-6 tracking-tight">
            Resumo do pedido
          </h2>
          <ul className="divide-y divide-gray-100 mb-5">
            {itens.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between py-4"
              >
                <div>
                  <div className="font-medium">{item.nome}</div>
                  <div className="text-xs text-gray-400">
                    Modelo: {item.generos?.[0] || "-"} | Tamanho:{" "}
                    {item.tamanhos?.[0] || "-"} | Cor:{" "}
                    {item.cores?.[0] ? hexToPtName(item.cores[0]) : "-"}
                  </div>
                  <div className="text-xs text-gray-400">Qtd: {item.quantidade}</div>
                </div>
                <div className="font-semibold">
                  {formatCurrency(item.preco * item.quantidade)}
                </div>
              </li>
            ))}
          </ul>
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Frete</span>
              <span className="text-gray-400">--</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-1">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
          <button
            onClick={handleConfirm}
            disabled={status !== "idle"}
            className="mt-8 w-full py-3 rounded-xl bg-primary-600 text-white font-medium text-base tracking-wide transition hover:bg-primary-900 active:scale-95 disabled:opacity-50"
          >
            {status === "loading" ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Processando...
              </span>
            ) : status === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              "Confirmar Pedido"
            )}
          </button>
        </section>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutContent />
    </Suspense>
  );
}
