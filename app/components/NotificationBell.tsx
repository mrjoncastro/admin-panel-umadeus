"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import TooltipIcon from "./TooltipIcon";
import pb from "@/lib/pocketbase";

export default function NotificationBell() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const [inscricoes, pedidos] = await Promise.all([
          pb
            .collection("inscricoes")
            .getList(1, 1, { filter: 'status="pendente"' }),
          pb
            .collection("pedidos")
            .getList(1, 1, { filter: 'status="pendente"' }),
        ]);
        setCount(inscricoes.totalItems + pedidos.totalItems);
      } catch (err) {
        console.error("Erro ao buscar notificações", err);
      }
    };

    fetchCount();
    const id = setInterval(fetchCount, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <TooltipIcon label="Inscrições/Pedidos pendentes">
      <Link href="/inscricoes" className="relative block">
        <Bell className="w-5 h-5" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full text-xs h-4 min-w-4 flex items-center justify-center px-1">
            {count}
          </span>
        )}
      </Link>
    </TooltipIcon>
  );
}
