// lib/getRecentPostsClient.ts
export async function getRecentPostsClient() {
  const res = await fetch("/posts.json", { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.slice(0, 3);
}
