import PocketBase from "pocketbase";

const PB_URL = process.env.NEXT_PUBLIC_PB_URL!;
const basePb = new PocketBase(PB_URL);

export function createPocketBase() {
  const pb = new PocketBase(PB_URL);
  pb.authStore.save(basePb.authStore.token, basePb.authStore.model);
  return pb;
}

export function updateBaseAuth(
  token: string,
  model: Parameters<typeof basePb.authStore.save>[1]
) {
  basePb.authStore.save(token, model);
}

export function clearBaseAuth() {
  basePb.authStore.clear();
}

export default createPocketBase;
