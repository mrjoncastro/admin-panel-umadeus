"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import pb from "@/lib/pocketbase";
import ModalEditarPerfil from "../perfil/components/ModalEditarPerfil";
import MudarSenha from "./components/MudarSenha";
import Link from "next/link";

interface UsuarioAuthModel {
  id: string;
  email: string;
  nome: string;
  telefone?: string;
  cpf?: string;
  data_nascimento?: string;
  role: string;
}

export default function ClientePage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<UsuarioAuthModel | null>(null);
  const [mostrarModalPerfil, setMostrarModalPerfil] = useState(false);
  const [mostrarModalSenha, setMostrarModalSenha] = useState(false);

  const atualizarUsuario = () => {
    const model = pb.authStore.model as unknown as UsuarioAuthModel;
    setUsuario(model);
  };

  useEffect(() => {
    if (!pb.authStore.isValid) {
      router.push("/login");
      return;
    }
    const model = pb.authStore.model as unknown as UsuarioAuthModel;
    setUsuario(model);
  }, [router]);

  if (!usuario) return null;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white dark:bg-zinc-900 rounded-xl shadow space-y-6">
      <h1 className="text-2xl font-bold text-zinc-800 dark:text-white">Área do Cliente</h1>

      <div className="space-y-2 text-zinc-700 dark:text-zinc-200">
        <p>
          <span className="font-semibold">Nome:</span> {usuario.nome}
        </p>
        <p>
          <span className="font-semibold">E-mail:</span> {usuario.email}
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setMostrarModalPerfil(true)}
          className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg hover:opacity-90"
        >
          Editar Perfil
        </button>
        <button
          onClick={() => setMostrarModalSenha(true)}
          className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg hover:opacity-90"
        >
          Alterar Senha
        </button>
        <Link
          href="/cliente/enderecos"
          className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg hover:opacity-90"
        >
          Meus Endereços
        </Link>
      </div>

      {mostrarModalPerfil && (
        <ModalEditarPerfil
          onClose={() => {
            setMostrarModalPerfil(false);
            atualizarUsuario();
          }}
        />
      )}

      {mostrarModalSenha && (
        <MudarSenha
          onClose={() => {
            setMostrarModalSenha(false);
          }}
        />
      )}
    </div>
  );
}
