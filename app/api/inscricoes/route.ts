import { NextRequest, NextResponse } from "next/server";
import PocketBase from "pocketbase";

const pb = new PocketBase("https://umadeus-production.up.railway.app");
pb.autoCancellation(false);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      nome,
      email,
      telefone,
      cpf,
      data_nascimento,
      tamanho,
      genero,
      liderId,
    } = body;

    // Limpa CPF e telefone
    const cpfNumerico = cpf.replace(/\D/g, "");
    const telefoneNumerico = telefone.replace(/\D/g, "");

    // Validação de campos obrigatórios
    const camposObrigatorios = [
      nome,
      email,
      telefoneNumerico,
      cpfNumerico,
      data_nascimento,
      tamanho,
      genero,
      liderId,
    ];

    if (camposObrigatorios.some((campo) => !campo || campo.trim() === "")) {
      return NextResponse.json(
        { erro: "Todos os campos são obrigatórios." },
        { status: 400 }
      );
    }

    if (!["masculino", "feminino"].includes(genero.toLowerCase())) {
      return NextResponse.json(
        { erro: "Gênero inválido. Use 'masculino' ou 'feminino'." },
        { status: 400 }
      );
    }

    const lider = await pb.collection("usuarios").getOne(liderId, {
      expand: "campo",
    });

    const campoId = lider.expand?.campo?.id;

    if (!campoId) {
      return NextResponse.json(
        { erro: "Campo do líder não encontrado." },
        { status: 404 }
      );
    }

    // Verifica duplicidade por telefone ou CPF
    try {
      await pb
        .collection("inscricoes")
        .getFirstListItem(
          `telefone="${telefoneNumerico}" || cpf="${cpfNumerico}"`
        );
      return NextResponse.json(
        { erro: "Telefone ou CPF já cadastrado." },
        { status: 409 }
      );
    } catch {
      // OK - não encontrado
    }

    // Cria inscrição SEM pedido
    const inscricao = await pb.collection("inscricoes").create({
      nome,
      email,
      telefone: telefoneNumerico,
      cpf: cpfNumerico,
      data_nascimento,
      genero,
      tamanho,
      evento: "Congresso UMADEUS 2K25",
      campo: campoId,
      criado_por: liderId,
      status: "pendente", // status inicial
    });

    return NextResponse.json({
      sucesso: true,
      inscricaoId: inscricao.id,
      nome,
      email,
      tamanho,
      genero,
      responsavel: liderId,
    });
  } catch (err: unknown) {
    console.error("❌ Erro ao criar inscrição:", err);
    return NextResponse.json(
      { erro: "Erro ao processar a inscrição." },
      { status: 500 }
    );
  }
}
