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

    // Sanitiza o CPF
    const cpfNumerico = cpf.replace(/\D/g, "");

    // Valida campos obrigatórios
    const camposObrigatorios = [
      nome,
      email,
      telefone,
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

    // Busca campo vinculado ao líder
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
        .getFirstListItem(`telefone="${telefone}" || cpf="${cpfNumerico}"`);
      return NextResponse.json(
        { erro: "Telefone ou CPF já cadastrado." },
        { status: 409 }
      );
    } catch {
      // OK se não encontrar (erro esperado)
    }

    // Cria o pedido (status: pendente)
    const pedido = await pb.collection("pedidos").create({
      status: "pendente",
      produto: "Kit Camisa + Pulseira",
      cor: genero.toLowerCase() === "masculino" ? "Preto" : "Roxo",
      tamanho,
      genero,
      email,
      campo: campoId,
      responsavel: liderId,
    });

    // Cria a inscrição vinculada ao pedido e ao campo
    const inscricao = await pb.collection("inscricoes").create({
      nome,
      email,
      telefone,
      cpf: cpfNumerico,
      data_nascimento,
      genero,
      tamanho,
      evento: "Congresso UMADEUS 2K25",
      campo: campoId,
      criado_por: liderId,
      status: "pendente",
      pedido: pedido.id,
    });

    // Retorna dados necessários para o checkout
    return NextResponse.json({
      sucesso: true,
      inscricaoId: inscricao.id,
      pedidoId: pedido.id,
      nome,
      email,
      tamanho,
      genero,
      responsavel: liderId,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("❌ Erro ao criar inscrição:", err.message);
    } else {
      console.error("❌ Erro desconhecido ao criar inscrição.");
    }

    return NextResponse.json(
      { erro: "Erro ao processar a inscrição." },
      { status: 500 }
    );
  }
}
