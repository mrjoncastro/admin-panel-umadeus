"use client";

import { useEffect, useState } from "react";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import ModalEditarPerfil from "@/app/admin/perfil/components/ModalEditarPerfil";

interface UsuarioAuthModel {
  id: string;
  email: string;
  nome: string;
  telefone?: string;
  cpf?: string;
  data_nascimento?: string;
  endereco?: string;
  numero?: string;
  estado?: string;
  cep?: string;
  cidade?: string;
  role: "coordenador" | "lider" | "usuario" | string;
  campo?: string;
  expand?: {
    campo?: {
      nome: string;
    };
  };
}

export default function PerfilPage() {
  const { pb, authChecked } = useAuthGuard(["usuario"]);
  const [usuario, setUsuario] = useState<UsuarioAuthModel | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    if (!authChecked) return;

    const handleAuthChange = () => {
      const model = pb.authStore.model as unknown as UsuarioAuthModel;
      setUsuario(model);
    };

    handleAuthChange();
    const unsubscribe = pb.authStore.onChange(handleAuthChange);
    return () => unsubscribe();
  }, [authChecked, pb]);

  if (!authChecked || !usuario) return null;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white dark:bg-zinc-900 rounded-xl shadow space-y-6">
      <h2 className="text-2xl font-bold text-zinc-800 dark:text-white">
        Seu Perfil
      </h2>

      <div className="space-y-2 text-zinc-700 dark:text-zinc-200">
        <p>
          <span className="font-semibold">Nome:</span> {usuario.nome}
        </p>
        <p>
          <span className="font-semibold">E-mail:</span> {usuario.email}
        </p>
        <p>
          <span className="font-semibold">Campo de Atuação:</span>{" "}
          {usuario.expand?.campo?.nome || "Não vinculado"}
        </p>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => setMostrarModal(true)}
          className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg hover:opacity-90"
        >
          Editar Perfil
        </button>
      </div>

      {mostrarModal && (
        <ModalEditarPerfil
          onClose={() => {
            setMostrarModal(false);
            const model = pb.authStore.model as unknown as UsuarioAuthModel;
            setUsuario(model);
          }}
        />
      )}
    </div>
  );
}
