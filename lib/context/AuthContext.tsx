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
    try {
      const token = localStorage.getItem("pb_token");
      const rawUser = localStorage.getItem("pb_user");

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
      localStorage.removeItem("pb_token");
      localStorage.removeItem("pb_user");
      setUser(null);
      setIsLoggedIn(false);
    }

    const unsubscribe = pb.authStore.onChange(() => {
      localStorage.setItem("pb_token", pb.authStore.token);
      localStorage.setItem("pb_user", JSON.stringify(pb.authStore.model));
    });

    setIsLoading(false);

    return () => {
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    await pb.collection("usuarios").authWithPassword(email, password);

    const model = pb.authStore.model as unknown as UserModel;

    localStorage.setItem("pb_token", pb.authStore.token);
    localStorage.setItem("pb_user", JSON.stringify(model));

    setUser(model);
    setIsLoggedIn(true);
  };

  const logout = () => {
    pb.authStore.clear();
    localStorage.removeItem("pb_token");
    localStorage.removeItem("pb_user");
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
