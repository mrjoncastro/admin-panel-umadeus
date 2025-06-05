import type { NextRequest } from "next/server";
import createPocketBase from "@/lib/pocketbase";
import type { RecordModel } from "pocketbase";

type AuthOk = {
  user: RecordModel;
  pbSafe: ReturnType<typeof createPocketBase>;
};

type AuthError = {
  error: string;
};

export function getUserFromHeaders(req: NextRequest): AuthOk | AuthError {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  const rawUser = req.headers.get("X-PB-User");

  if (!token || !rawUser) {
    return { error: "Token ou usuário ausente." };
  }

  try {
    const parsedUser = JSON.parse(rawUser) as RecordModel;

    const pb = createPocketBase();
    pb.authStore.save(token, parsedUser);
    pb.autoCancellation(false);

    return { user: parsedUser, pbSafe: pb };
  } catch {
    return { error: "Usuário inválido." };
  }
}
