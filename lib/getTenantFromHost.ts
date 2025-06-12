import { headers } from "next/headers";
import createPocketBase from "@/lib/pocketbase";

export async function getTenantFromHost(): Promise<string | null> {
  const host = (await headers()).get("host")?.split(":")[0] ?? "";
  if (!host) return null;

  const pb = createPocketBase();
  try {
    const cliente = await pb
      .collection("m24_clientes")
      .getFirstListItem(`dominio='${host}'`);
    return cliente?.id ?? null;
  } catch {
    return null;
  }
}
