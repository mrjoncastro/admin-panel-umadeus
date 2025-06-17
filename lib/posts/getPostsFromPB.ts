import createPocketBase from "@/lib/pocketbase";
import { getTenantFromHost } from "@/lib/getTenantFromHost";

export interface PostRecord {
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

export async function getPostsFromPB() {
  const pb = createPocketBase();
  const tenantId = await getTenantFromHost();
  const list = await pb.collection("posts").getFullList<PostRecord>({
    sort: "-date",
    filter: tenantId ? `cliente='${tenantId}'` : "",
  });

  return list.map((p) => ({
    ...p,
    thumbnail: p.thumbnail ? pb.files.getUrl(p, p.thumbnail) : null,
  }));
}
