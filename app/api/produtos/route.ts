import { NextResponse } from "next/server";
import createPocketBase from "@/lib/pocketbase";

export async function GET() {
  const pb = createPocketBase();
  try {
    const produtos = await pb.collection("produtos").getFullList({ sort: "-created" });
    return NextResponse.json(produtos);
  } catch (err) {
    console.error("Erro ao listar produtos:", err);
    return NextResponse.json([], { status: 500 });
  }
}
