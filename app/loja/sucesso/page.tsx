"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function SucessoContent() {
  const searchParams = useSearchParams();
  const pedido = searchParams.get("pedido");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-100 via-white to-primary-200 px-6">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 text-center space-y-6 border border-primary-300">
        <h1 className="text-3xl font-extrabold text-[var(--accent)]">
          🎉 Compra Confirmada!
        </h1>

        <p className="text-gray-700 text-base leading-relaxed">
          {pedido ? (
            <>Seu pedido <strong>#{pedido}</strong> foi processado com sucesso.</>
          ) : (
            <>Sua compra foi processada com sucesso.</>
          )}
        </p>

        <div className="text-sm text-gray-500">
          Verifique seu e-mail para os detalhes do pagamento.
        </div>

        <div className="pt-4 flex flex-col gap-2">
          <Link href="/loja" className="btn btn-primary">
            Continuar comprando
          </Link>
          <Link href="/loja/cliente" className="btn btn-secondary">
            Ver meus pedidos
          </Link>
        </div>

        <p className="text-xs text-gray-400 italic mt-6">
          #UMADEUS2025 — Juntos na missão 💜
        </p>
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
