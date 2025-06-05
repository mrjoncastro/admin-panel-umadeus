import { useMemo } from "react";
import createPocketBase from "@/lib/pocketbase";

export default function usePocketBase() {
  return useMemo(() => createPocketBase(), []);
}
