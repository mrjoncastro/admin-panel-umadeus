import createPocketBase from "@/lib/pocketbase";

export interface PostClientRecord {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  date: string;
  thumbnail?: string | null;
  category?: string | null;
  keywords?: string[];
  content?: string;
  credit?: string | null;
}

export async function getPostsClientPB(): Promise<PostClientRecord[]> {
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

  const list = await pb.collection("posts").getFullList<PostClientRecord>({
    sort: "-date",
    filter: tenantId ? `cliente='${tenantId}'` : "",
  });

  return list.map((p) => ({
    ...p,
    thumbnail: p.thumbnail ? pb.files.getUrl(p, p.thumbnail) : null,
  }));
}
