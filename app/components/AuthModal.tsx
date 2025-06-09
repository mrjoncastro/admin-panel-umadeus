"use client";

import Link from "next/link";

export default function AuthModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-900 text-black dark:text-white p-6 rounded-xl shadow-xl w-full max-w-sm space-y-5">
        <h2 className="text-xl font-semibold text-center">Faça login para continuar</h2>
        <p className="text-sm text-center">É necessário acessar sua conta para finalizar a compra.</p>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="text-sm text-gray-600 dark:text-gray-300">Fechar</button>
          <Link href="/login" className="btn btn-primary text-sm">Fazer login</Link>
        </div>
      </div>
    </div>
  );
}
