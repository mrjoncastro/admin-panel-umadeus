import PocketBase from "pocketbase";

const pb = new PocketBase(
  process.env.PB_URL || "https://umadeus-production.up.railway.app"
);
pb.autoCancellation(false);

export default pb;
