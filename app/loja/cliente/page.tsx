"use client";

import { useEffect, useState } from "react";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import type { Inscricao } from "@/types";

export default function AreaCliente() {
  const { user, pb, authChecked } = useAuthGuard(["usuario"]);
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);

  useEffect(() => {
    if (!authChecked || !user) return;
    const token = pb.authStore.token;
    fetch("/loja/api/minhas-inscricoes", {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-PB-User": JSON.stringify(user),
      },
    })
      .then((res) => res.json())
      .then((data) => setInscricoes(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Erro ao carregar inscricoes", err);
        setInscricoes([]);
      });
  }, [authChecked, user, pb]);

  if (!authChecked) return null;

  const pedidos = [
    {
      id: "1",
      data: "10/06/2025",
      status: "pago",
      pagamento: "Cartão",
    },
    {
      id: "2",
      data: "02/06/2025",
      status: "pendente",
      pagamento: "Boleto",
    },
  ];

  const pagamentos = [
    {
      id: "1",
      valor: "R$ 199,90",
      status: "pago",
    },
    {
      id: "2",
      valor: "R$ 59,90",
      status: "pendente",
    },
  ];

  return (
    <main className="p-8 text-platinum font-sans space-y-10">
      <section className="card">
        <h2 className="text-xl font-bold">Resumo do Cliente</h2>
        <p>
          <strong>Nome:</strong> {user?.nome || "-"}
        </p>
        <p>
          <strong>E-mail:</strong> {user?.email || "-"}
        </p>
        <p>
          <strong>Telefone:</strong> {String(user?.telefone ?? "-")}
        </p>

        <div className="flex flex-wrap gap-2 pt-4">
          <a href="/loja/perfil" className="btn btn-secondary">
            Alterar dados pessoais
          </a>
          <a href="/admin/redefinir-senha" className="btn btn-secondary">
            Alterar senha
          </a>
          <button type="button" className="btn btn-secondary" disabled>
            Gerenciar endereços
          </button>
        </div>
      </section>

      <section className="card">
        <h2 className="text-xl font-bold mb-4">Meus Pedidos</h2>
        <table className="table-base">
          <thead>
            <tr>
              <th>Número</th>
              <th>Data</th>
              <th>Status</th>
              <th>Pagamento</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((p) => (
              <tr key={p.id}>
                <td>#{p.id}</td>
                <td>{p.data}</td>
                <td>{p.status}</td>
                <td>{p.pagamento}</td>
                <td className="flex gap-2">
                  <a
                    href={`/loja/compras/${p.id}`}
                    className="btn btn-secondary"
                  >
                    Ver detalhes
                  </a>
                  <button className="btn btn-primary">Recomprar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h2 className="text-xl font-bold mb-4">Minhas Inscrições</h2>
        <table className="table-base">
          <thead>
            <tr>
              <th>Status</th>
              <th>Evento</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {inscricoes.map((i) => (
              <tr key={i.id}>
                <td className="capitalize">{i.status}</td>
                <td>{i.expand?.evento?.titulo || "-"}</td>
                <td>
                  {i.created
                    ? new Date(i.created).toLocaleDateString("pt-BR")
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h2 className="text-xl font-bold mb-4">Pagamentos</h2>
        <table className="table-base">
          <thead>
            <tr>
              <th>ID</th>
              <th>Valor</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pagamentos.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.valor}</td>
                <td>{p.status}</td>
                <td className="flex gap-2">
                  <button className="btn btn-secondary">Reenviar boleto</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
