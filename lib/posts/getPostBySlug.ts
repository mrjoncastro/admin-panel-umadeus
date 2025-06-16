import createPocketBase from "@/lib/pocketbase";
import { getTenantFromHost } from "@/lib/getTenantFromHost";
import type { PostRecord } from "./getPostsFromPB";

export async function getPostBySlug(slug: string): Promise<PostRecord | null> {
  const pb = createPocketBase();
  const tenantId = await getTenantFromHost();
  try {
    const post = await pb
      .collection("posts")
      .getFirstListItem<PostRecord>(`slug='${slug}' && cliente='${tenantId}'`);
    return {
      ...post,
      thumbnail: post.thumbnail ? pb.files.getUrl(post, post.thumbnail) : null,
    };
  } catch {
    return null;
  }
}
