"use client"

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Ajuste o path aqui conforme a localização real do arquivo:
const RedefinirSenhaClient = dynamic(
  () => import("./RedefinirSenhaClient"),
  {
    ssr: false,
    loading: () => <p>Carregando...</p>,
  }
);

export default function RedefinirSenhaPage() {
  return (
    <Suspense fallback={<p>Carregando...</p>}>
      <RedefinirSenhaClient />
    </Suspense>
  );
}
