export interface EventoRecord {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  cidade: string;
  imagem?: string;
  status: "realizado" | "em breve";
  [key: string]: unknown;
}

import type PocketBase from "pocketbase";

export function atualizarStatus(eventos: EventoRecord[], pb: PocketBase): Promise<void[]> {
  const agora = new Date();
  const atualizacoes: Promise<void>[] = [];

  eventos.forEach((e) => {
    const dataEvento = new Date(e.data);
    if (e.status !== "realizado" && !isNaN(dataEvento.getTime()) && dataEvento < agora) {
      e.status = "realizado";
      atualizacoes.push(pb.collection("eventos").update(e.id, { status: "realizado" }).then(() => {}));
    }
  });

  return Promise.all(atualizacoes);
}
