"use client";

import { createContext, useContext, useEffect, useState } from "react";
import pb from "@/lib/pocketbase";
import type { RecordModel } from "pocketbase";

type UserModel = {
  id: string;
  nome: string;
  role: "coordenador" | "lider";
  [key: string]: unknown;
};

type AuthContextType = {
  user: UserModel | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserModel | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getCookie = (name: string) =>
      document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${name}=`))
        ?.split("=")[1];
    try {
      const token = getCookie("pb_token");
      const rawUser = getCookie("pb_user");

      if (token && rawUser) {
        const parsedRecord = JSON.parse(rawUser) as RecordModel;
        pb.authStore.save(token, parsedRecord);

        setUser(parsedRecord as unknown as UserModel);
        setIsLoggedIn(true);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Erro ao carregar auth:", err.message);
      }
      pb.authStore.clear();
      document.cookie =
        "pb_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie =
        "pb_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      setUser(null);
      setIsLoggedIn(false);
    }

    const unsubscribe = pb.authStore.onChange(() => {
      document.cookie = `pb_token=${pb.authStore.token}; path=/`;
      document.cookie = `pb_user=${encodeURIComponent(
        JSON.stringify(pb.authStore.model)
      )}; path=/`;
    });

    setIsLoading(false);

    return () => {
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    await pb.collection("usuarios").authWithPassword(email, password);

    const model = pb.authStore.model as unknown as UserModel;

    document.cookie = `pb_token=${pb.authStore.token}; path=/`;
    document.cookie = `pb_user=${encodeURIComponent(
      JSON.stringify(model)
    )}; path=/`;

    setUser(model);
    setIsLoggedIn(true);
  };

  const logout = () => {
    pb.authStore.clear();
    document.cookie = "pb_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "pb_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
