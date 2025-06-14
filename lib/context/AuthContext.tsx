"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import createPocketBase, {
  updateBaseAuth,
  clearBaseAuth,
} from "@/lib/pocketbase";
import type { RecordModel } from "pocketbase";

type UserModel = {
  id: string;
  nome: string;
  role: "coordenador" | "lider" | "usuario";
  tour?: boolean;
  [key: string]: unknown;
};

type AuthContextType = {
  user: UserModel | null;
  /** ID do cliente (tenant) */
  tenantId: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (
    nome: string,
    email: string,
    telefone: string,
    cpf: string,
    endereco: string,
    numero: string,
    estado: string,
    cep: string,
    cidade: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  tenantId: null,
  isLoggedIn: false,
  isLoading: true,
  login: async () => {},
  signUp: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pb = useMemo(() => createPocketBase(), []);
  const [user, setUser] = useState<UserModel | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const token = localStorage.getItem("pb_token");
      const rawUser = localStorage.getItem("pb_user");
      const storedTenant = localStorage.getItem("tenant_id");

      if (token && rawUser) {
        const parsedRecord = JSON.parse(rawUser) as RecordModel;
        pb.authStore.save(token, parsedRecord);
        updateBaseAuth(token, parsedRecord);

        setUser(parsedRecord as unknown as UserModel);
        setTenantId(storedTenant);
        setIsLoggedIn(true);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Erro ao carregar auth:", err.message);
      }
      pb.authStore.clear();
      clearBaseAuth();
      localStorage.removeItem("pb_token");
      localStorage.removeItem("pb_user");
      localStorage.removeItem("tenant_id");
      setUser(null);
      setTenantId(null);
      setIsLoggedIn(false);
    }

    const unsubscribe = pb.authStore.onChange(() => {
      localStorage.setItem("pb_token", pb.authStore.token);
      localStorage.setItem("pb_user", JSON.stringify(pb.authStore.model));
      updateBaseAuth(pb.authStore.token, pb.authStore.model);
    });

    setIsLoading(false);

    return () => {
      unsubscribe();
    };
  }, [pb]);

  const login = async (email: string, password: string) => {
    await pb.collection("usuarios").authWithPassword(email, password);

    const model = pb.authStore.model as unknown as UserModel;

    const dominio = window.location.hostname;
    try {
      const cliente = await pb
        .collection("m24_clientes")
        .getFirstListItem(`dominio='${dominio}'`);
      localStorage.setItem("tenant_id", cliente.id);
      setTenantId(cliente.id);
    } catch {
      setTenantId(null);
    }

    localStorage.setItem("pb_token", pb.authStore.token);
    localStorage.setItem("pb_user", JSON.stringify(model));

    updateBaseAuth(pb.authStore.token, pb.authStore.model);

    setUser(model);
    setIsLoggedIn(true);
  };

  const signUp = async (
    nome: string,
    email: string,
    telefone: string,
    cpf: string,
    endereco: string,
    numero: string,
    estado: string,
    cep: string,
    cidade: string,
    password: string
  ) => {
    const dominio = window.location.hostname;
    let clienteId: string | null = null;
    try {
      const cliente = await pb
        .collection("m24_clientes")
        .getFirstListItem(`dominio='${dominio}'`);
      clienteId = cliente.id;
      localStorage.setItem("tenant_id", clienteId);
      setTenantId(clienteId);
    } catch {
      setTenantId(null);
    }

    await pb.collection("usuarios").create({
      nome,
      email,
      telefone,
      cpf,
      endereco,
      numero,
      estado,
      cep,
      cidade,
      password,
      passwordConfirm: password,
      role: "usuario",
      cliente: clienteId,
      tour: false,
    });
    await login(email, password);
  };

  const logout = () => {
    pb.authStore.clear();
    clearBaseAuth();
    localStorage.removeItem("pb_token");
    localStorage.removeItem("pb_user");
    localStorage.removeItem("tenant_id");
    setUser(null);
    setTenantId(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, tenantId, isLoggedIn, isLoading, login, signUp, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
