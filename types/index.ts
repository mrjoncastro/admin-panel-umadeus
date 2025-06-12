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
  cliente?: string;
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
  cliente?: string;
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
  cores?: string[];
  slug: string;
  descricao?: string;
  detalhes?: string;
  checkout_url?: string;
  checkoutUrl?: string; // alias usado no formulário do admin
  ativo?: boolean;
  user_org?: string;
  cliente?: string;
  categoria?: string;
  created?: string;
  expand?: {
    user_org?: {
      id: string;
      nome: string;
    };
  };
};

export type Categoria = {
  id: string;
  nome: string;
  slug: string;
};

export type Evento = {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  cidade: string;
  imagem?: string;
  status: "realizado" | "em breve";
  created?: string;
};

export type Cliente = {
  id: string;
  documento: string;
  nome?: string;
  dominio?: string;
  logo_url?: string;
  cor_primaria?: string;
  responsavel_nome?: string;
  responsavel_email?: string;
  ativo?: boolean;
  asaas_api_key?: string;
  asaas_account_id?: string;
  created?: string;
};

export type Compra = {
  id: string;
  cliente: string;
  usuario: string;
  itens: Record<string, unknown>[];
  valor_total: number;
  status: "pendente" | "pago" | "cancelado";
  metodo_pagamento: "pix" | "cartao" | "boleto";
  checkout_url?: string;
  asaas_payment_id?: string;
  externalReference: string;
  endereco_entrega?: Record<string, unknown>;
  created?: string;
  updated?: string;
};
