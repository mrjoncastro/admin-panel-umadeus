"use client";

import { useEffect, useState, useMemo } from "react";
import { MapPinned } from "lucide-react";
import { useRouter } from "next/navigation";
import createPocketBase from "@/lib/pocketbase";
import { useAuthContext } from "@/lib/context/AuthContext";

export default function TourIcon() {
  const { user, isLoggedIn } = useAuthContext();
  const [visible, setVisible] = useState(false);
  const pb = useMemo(() => createPocketBase(), []);
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn || !user) return setVisible(false);
    const fezTour = Boolean(user.tour);
    setVisible(!fezTour);
  }, [isLoggedIn, user]);

  if (!visible) return null;

  async function iniciarTour() {
    const confirmar = window.confirm("Iniciar tour?");
    if (!confirmar || !user) return;
    try {
      await pb.collection("usuarios").update(user.id, { tour: true });
    } catch (err) {
      console.error("Erro ao registrar tour", err);
    }
    router.push("/iniciar-tour");
  }

  return (
    <div className="fixed bottom-32 right-4 z-50">
      <button
        onClick={iniciarTour}
        aria-label="Iniciar tour"
        className="bg-[var(--color-secondary)] text-[var(--background)] p-2 rounded-full shadow"
      >
        <MapPinned className="w-5 h-5" />
      </button>
    </div>
  );
}
