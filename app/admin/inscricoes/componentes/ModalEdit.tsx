"use client";

import { FormEvent, useEffect, useState } from "react";
import { Inscricao, Evento } from "@/types";
import { useAuth } from "@/lib/hooks/useAuth";

type Props = {
  inscricao: Inscricao & { eventoId: string };
  onClose: () => void;
  onSave: (inscricaoAtualizada: Partial<Inscricao & { eventoId: string }>) => void;
};


export default function ModalEditarInscricao({
  inscricao,
  onClose,
  onSave,
}: Props) {
  const { user, pb } = useAuth();
  const [eventos, setEventos] = useState<Evento[]>([]);

  useEffect(() => {
    if (!user) return;
    pb
      .collection("eventos")
      .getFullList<Evento>({
        sort: "-data",
        filter: `cliente='${user.cliente}' && status!='realizado'`,
      })
      .then((evs) => setEventos(evs))
      .catch(() => setEventos([]));
  }, [pb, user]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const eventoId = formData.get("evento")?.toString();
    const eventoSelecionado = eventos.find((ev) => ev.id === eventoId);

    const atualizada: Partial<Inscricao & { eventoId: string }> = {
      nome: formData.get("nome")?.toString() || "",
      telefone: formData.get("telefone")?.toString() || "",
      status: formData.get("status") as "pendente" | "confirmado" | "cancelado",
      tamanho: formData.get("tamanho")?.toString(),
      genero: formData.get("genero")?.toString(),
      eventoId: eventoId || inscricao.eventoId,
      evento: eventoSelecionado?.titulo || inscricao.evento,
    };

    onSave(atualizada);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">Editar Inscrição</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input name="nome" label="Nome" defaultValue={inscricao.nome} />
          <Input
            name="telefone"
            label="Telefone"
            defaultValue={inscricao.telefone}
          />

          <Select name="status" label="Status" defaultValue={inscricao.status}>
            <option value="pendente">Pendente</option>
            <option value="confirmado">Confirmado</option>
            <option value="cancelado">Cancelado</option>
          </Select>

          <Select
            name="tamanho"
            label="Tamanho"
            defaultValue={inscricao.tamanho || ""}
          >
            {["PP", "P", "M", "G", "GG", "XG"].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>

          <Select
            name="genero"
            label="Gênero"
            defaultValue={inscricao.genero || ""}
          >
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
          </Select>

          <Select
            name="evento"
            label="Evento"
            defaultValue={
              inscricao.eventoId ||
              eventos.find((ev) => ev.titulo === inscricao.evento)?.id ||
              ""
            }
          >
            {eventos.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.titulo}
              </option>
            ))}
          </Select>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded border cursor-pointer "
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded cursor-pointer"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Componentes auxiliares
type InputProps = {
  name: string;
  label: string;
  defaultValue?: string;
  type?: string;
};

function Input({ name, label, defaultValue = "", type = "text" }: InputProps) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium block mb-1">
        {label}
      </label>
      <input
        id={name}
        type={type}
        name={name}
        defaultValue={defaultValue}
        className="w-full p-2 border rounded"
      />
    </div>
  );
}

type SelectProps = {
  name: string;
  label: string;
  defaultValue?: string;
  children: React.ReactNode;
};

function Select({ name, label, defaultValue = "", children }: SelectProps) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium block mb-1">
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        className="w-full p-2 border rounded"
      >
        {children}
      </select>
    </div>
  );
}
