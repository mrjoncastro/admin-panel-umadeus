import createPocketBase from "@/lib/pocketbase";

export async function getTenantFromClient(): Promise<string | null> {
  const pb = createPocketBase();
  let tenantId = localStorage.getItem("tenant_id");

  if (!tenantId) {
    const host = window.location.hostname;
    try {
      const cliente = await pb
        .collection("clientes_config")
        .getFirstListItem(`dominio='${host}'`);
      tenantId = cliente.id;
      localStorage.setItem("tenant_id", tenantId);
    } catch {
      tenantId = null;
    }
  }

  return tenantId;
}

export default getTenantFromClient;
