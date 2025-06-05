import PocketBase, { type AuthRecord } from "pocketbase";

type CloneablePocketBase = PocketBase & {
  clone?: () => PocketBase;
};

const PB_URL = process.env.NEXT_PUBLIC_PB_URL!;

const basePb: CloneablePocketBase = new PocketBase(PB_URL);

export function createPocketBase() {
  if (typeof basePb.clone === "function") {
    return basePb.clone();
  }
  const pb = new PocketBase(PB_URL);
  pb.authStore.save(basePb.authStore.token, basePb.authStore.model);
  return pb;
}

export function updateBaseAuth(token: string, model: AuthRecord | null) {
  basePb.authStore.save(token, model);
}

export function clearBaseAuth() {
  basePb.authStore.clear();
}

export default createPocketBase;
