import createPocketBase from "@/lib/pocketbase";

export async function getTenantFromClient(): Promise<string | null> {
  const storedTenant = localStorage.getItem("tenant_id");
  let tenantId = storedTenant;
  if (!tenantId) {
    const host = window.location.hostname;
    const pb = createPocketBase();
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
