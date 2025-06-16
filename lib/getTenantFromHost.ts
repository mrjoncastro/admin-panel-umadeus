import { headers } from "next/headers";
import createPocketBase from "@/lib/pocketbase";

export async function getTenantFromHost(): Promise<string | null> {
  const headerList = await headers();
  const host = headerList.get("host")?.split(":")[0] ?? "";
  if (!host) return null;

  const pb = createPocketBase();
  try {
    const cfg = await pb
      .collection("clientes_config")
      .getFirstListItem(`dominio='${host}'`);
    return cfg?.cliente ?? null;
  } catch {
    return null;
  }
}
