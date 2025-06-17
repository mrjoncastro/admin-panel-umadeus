"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function SucessoContent() {
  const searchParams = useSearchParams();
  const pedido = searchParams.get("pedido");

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm border rounded-lg shadow-sm p-6 text-center">
        <h1 className="text-xl font-semibold mb-2">Compra confirmada</h1>
        <p className="text-gray-700 mb-2">
          {pedido ? (
            <>Seu pedido <b>#{pedido}</b> foi processado com sucesso.</>
          ) : (
            <>Sua compra foi processada com sucesso.</>
          )}
        </p>
        <div className="text-xs text-gray-500 mb-4">
          Verifique seu e-mail para detalhes do pagamento.
        </div>
        <div className="flex flex-col gap-2 mb-2">
          <Link
            href="/loja"
            className="block w-full rounded bg-black text-white py-2 text-sm hover:bg-gray-800 transition"
          >
            Continuar comprando
          </Link>
          <Link
            href="/loja/cliente"
            className="block w-full rounded border py-2 text-sm text-black hover:bg-gray-100 transition"
          >
            Meus pedidos
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SucessoPage() {
  return (
    <Suspense>
      <SucessoContent />
    </Suspense>
  );
}
