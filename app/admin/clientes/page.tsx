"use client";

import { useEffect, useState, useMemo } from "react";
import createPocketBase from "@/lib/pocketbase";
import ListaClientes from "./components/ListaClientes";
import ModalEditarInscricao from "../inscricoes/componentes/ModalEdit";
import type { Inscricao } from "@/types";
import { useToast } from "@/lib/context/ToastContext";

export default function ClientesPage() {
  const pb = useMemo(() => createPocketBase(), []);
  const { showError, showSuccess } = useToast();
  const [clientes, setClientes] = useState<Inscricao[]>([]);
  const [loading, setLoading] = useState(true);
  const [clienteEmEdicao, setClienteEmEdicao] = useState<Inscricao | null>(null);

  useEffect(() => {
    async function fetchClientes() {
      try {
        const lista = await pb.collection("inscricoes").getFullList<Inscricao>({
          expand: "pedido",
          sort: "-created",
        });
        setClientes(lista);
      } catch (err) {
        console.error("Erro ao carregar clientes", err);
        showError("Erro ao carregar clientes");
      } finally {
        setLoading(false);
      }
    }

    fetchClientes();
  }, [pb, showError, setClientes, setLoading]);

  const salvarEdicao = async (atualizada: Partial<Inscricao>) => {
    if (!clienteEmEdicao) return;
    try {
      await pb.collection("inscricoes").update(clienteEmEdicao.id, atualizada);
      setClientes((prev) =>
        prev.map((c) => (c.id === clienteEmEdicao.id ? { ...c, ...atualizada } : c))
      );
      showSuccess("Cliente atualizado");
    } catch (err) {
      console.error("Erro ao salvar cliente", err);
      showError("Erro ao salvar cliente");
    } finally {
      setClienteEmEdicao(null);
    }
  };

  if (loading) return <p className="p-6 text-center text-sm">Carregando clientes...</p>;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="heading">Clientes</h1>
      <ListaClientes clientes={clientes} onEdit={setClienteEmEdicao} />
      {clienteEmEdicao && (
        <ModalEditarInscricao
          inscricao={clienteEmEdicao}
          onClose={() => setClienteEmEdicao(null)}
          onSave={salvarEdicao}
        />
      )}
    </main>
  );
}
