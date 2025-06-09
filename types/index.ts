export type Inscricao = {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  status?: "pendente" | "aguardando_pagamento" | "confirmado" | "cancelado";
  tamanho?: string;
  produto?: string;
  genero?: string;
  evento?: string;
  data_nascimento?: string;
  criado_por?: string;
  campo?: string;
  cpf?: string;
  confirmado_por_lider?: boolean;
  created?: string;
  expand?: {
    campo?: {
      id: string;
      nome: string;
    };
    criado_por?: {
      id: string;
      nome: string;
    };
    pedido?: {
      id: string;
      status: "pago" | "pendente" | "cancelado";
      valor: number | string;
    };
    id_inscricao?: {
      nome: string;
      telefone?: string;
      cpf?: string;
    };
  };
};

export type Pedido = {
  id: string;
  id_pagamento: string;
  id_inscricao: string;
  produto: string;
  tamanho?: string;
  status: "pendente" | "pago" | "cancelado";
  cor: string;
  genero?: string;
  responsavel?: string;
  email: string;
  created?: string;
  valor: string;
  expand?: {
    campo?: {
      id: string;
      nome: string;
    };
    criado_por?: {
      id: string;
      nome: string;
    };
    pedido?: {
      id: string;
      status: "pago" | "pendente" | "cancelado";
      valor: number | string;
    };
    id_inscricao?: {
      nome: string;
      telefone?: string;
      cpf?: string;
    };
  };
};

export type Produto = {
  id: string;
  nome: string;
  preco: number;
  imagem?: string;
  imagens?: string[];
  tamanhos?: string[];
  generos?: string[];
  descricao?: string;
  detalhes?: string;
  checkout_url?: string;
  ativo?: boolean;
  user_org?: string;
  categoria?: string;
  created?: string;
  expand?: {
    user_org?: {
      id: string;
      nome: string;
    };
  };
};
