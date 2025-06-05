"use client";

import { useEffect, useState, useMemo } from "react";
import { Bell, X } from "lucide-react";
import createPocketBase from "@/lib/pocketbase";
import type { Inscricao } from "@/types";

export default function NotificationBell() {
  const pb = useMemo(() => createPocketBase(), []);
  const [count, setCount] = useState(0);
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [insList, pedidos] = await Promise.all([
          pb.collection("inscricoes").getList<Inscricao>(1, 5, {
            filter: 'status="pendente"',
            expand: "campo",
            sort: "-created",
            $autoCancel: false,
          }),
          pb.collection("pedidos").getList(1, 1, {
            filter: 'status="pendente"',
            $autoCancel: false,
          }),
        ]);

        setCount(insList.totalItems + pedidos.totalItems);
        setInscricoes(insList.items);
      } catch (err) {
        console.error("Erro ao buscar notificações", err);
      }
    };

    fetchData();
    const id = setInterval(fetchData, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <button
        aria-label="Notificações"
        onClick={() => setOpen((o) => !o)}
        className="relative bg-[#2A1A1C] text-[#DCDCDC] p-2 rounded-full shadow"
      >
        <Bell className="w-5 h-5" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full text-xs h-4 min-w-4 flex items-center justify-center px-1">
            {count}
          </span>
        )}
      </button>
      {open && (
        <div className="mt-2 w-72 max-h-60 overflow-auto bg-white dark:bg-zinc-900 text-[#2A1A1C] dark:text-white rounded shadow-lg">
          <div className="flex items-center justify-between px-4 py-2 border-b dark:border-zinc-700">
            <span className="font-semibold">Novas inscrições</span>
            <button aria-label="Fechar" onClick={() => setOpen(false)}>
              <X size={16} />
            </button>
          </div>
          <ul className="p-2 text-sm space-y-1">
            {inscricoes.length === 0 && (
              <li className="text-center py-4">Sem inscrições pendentes</li>
            )}
            {inscricoes.map((i) => (
              <li
                key={i.id}
                className="border-b last:border-b-0 pb-1 mb-1 dark:border-zinc-700"
              >
                <span className="font-medium">{i.nome}</span> -{" "}
                {i.expand?.campo?.nome || "—"}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
