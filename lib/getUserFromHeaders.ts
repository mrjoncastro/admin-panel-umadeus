import type { NextRequest } from "next/server";
import pb from "@/lib/pocketbase";
import type { RecordModel } from "pocketbase";

type AuthOk = {
  user: RecordModel;
  pbSafe: typeof pb;
};

type AuthError = {
  error: string;
};

export function getUserFromHeaders(req: NextRequest): AuthOk | AuthError {
  const token = req.cookies.get("pb_token")?.value;
  const rawUser = req.cookies.get("pb_user")?.value;

  if (!token || !rawUser) {
    return { error: "Token ou usuário ausente." };
  }

  try {
    const parsedUser = JSON.parse(decodeURIComponent(rawUser)) as RecordModel;

    pb.authStore.save(token, parsedUser);
    pb.autoCancellation(false); 

    return { user: parsedUser, pbSafe: pb };
  } catch {
    return { error: "Usuário inválido." };
  }
}
