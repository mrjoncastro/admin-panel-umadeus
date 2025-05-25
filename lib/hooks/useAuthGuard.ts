// lib/hooks/useAuthGuard

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";

export function useAuthGuard(
  rolesPermitidos: string[] = ["coordenador", "lider"]
) {
  const { user, isLoggedIn, pb } = useAuth();
  const router = useRouter();

  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!user && !isLoggedIn) return; 

    const temPermissao = user && rolesPermitidos.includes(user.role);

    if (!isLoggedIn || !temPermissao) {
      pb.authStore.clear();
      router.replace("/");
    } else {
      setAuthChecked(true);
    }
  }, [isLoggedIn, user, rolesPermitidos, pb, router]);

  return { user, pb, authChecked };
}
