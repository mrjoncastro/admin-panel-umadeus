"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import pb from "@/lib/pocketbase";
import { Endereco } from "@/types";
import Link from "next/link";
import { useAuthContext } from "@/lib/context/AuthContext";

export default function EnderecosPage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const [enderecos, setEnderecos] = useState<Endereco[]>([]);

  useEffect(() => {
    if (!pb.authStore.isValid) {
      router.push("/login");
      return;
    }
    if (!user?.id) return;
    const fetchData = async () => {
      const list = await pb.collection("enderecos").getFullList<Endereco>({
        filter: `usuario="${user.id}"`,
      });
      setEnderecos(list);
    };
    fetchData();
  }, [user, router]);

  if (!pb.authStore.isValid) return null;

  return (
    <div className="max-w-2xl mx-auto mt-10 space-y-4 p-4">
      <h1 className="text-2xl font-bold">Meus Endereços</h1>
      <Link
        href="/cliente/enderecos/novo"
        className="inline-block bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg"
      >
        Novo Endereço
      </Link>
      <ul className="space-y-2">
        {enderecos.map((e) => (
          <li key={e.id} className="border p-2 rounded">
            {e.rua}, {e.numero} - {e.bairro} - {e.cidade}/{e.estado} - {e.cep}
          </li>
        ))}
        {enderecos.length === 0 && (
          <li className="text-sm text-zinc-600 dark:text-zinc-300">Nenhum endereço cadastrado.</li>
        )}
      </ul>
    </div>
  );
}
