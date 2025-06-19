export type UserModel = {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  cpf?: string;
  data_nascimento?: string;
  endereco?: string;
  numero?: string;
  estado?: string;
  cep?: string;
  cidade?: string;
  role: "coordenador" | "lider" | "usuario";
  cliente?: string;
  tour?: boolean;
  [key: string]: unknown;
};
