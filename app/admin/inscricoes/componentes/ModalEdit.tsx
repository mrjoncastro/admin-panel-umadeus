"use client";

import { FormEvent } from "react";
import { Inscricao } from "@/types";

type Props = {
  inscricao: Inscricao;
  onClose: () => void;
  onSave: (inscricaoAtualizada: Partial<Inscricao>) => void;
};


export default function ModalEditarInscricao({
  inscricao,
  onClose,
  onSave,
}: Props) {
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const atualizada: Partial<Inscricao> = {
      nome: formData.get("nome")?.toString() || "",
      telefone: formData.get("telefone")?.toString() || "",
      status: formData.get("status") as "pendente" | "confirmado" | "cancelado",
      tamanho: formData.get("tamanho")?.toString(),
      genero: formData.get("genero")?.toString(),
      evento: formData.get("evento")?.toString(),
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

          <Input name="evento" label="Evento" defaultValue={inscricao.evento} />

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
