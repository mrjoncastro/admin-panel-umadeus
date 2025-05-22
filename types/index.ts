export type Inscricao = {
  id: string;
  nome: string;
  telefone: string;
  status: "pendente" | "confirmado" | "cancelado";
  tamanho?: string;
  genero?: string;
  evento?: string;
  data_nascimento?: string;
  criado_por?: string;
  campo?: string;
  cpf?: string; 
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
  };
};

export type Pedido = {
  id: string;
  id_pagamento: string;
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
  };
};
