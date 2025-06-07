export interface UserExtraFields {
  telefone?: string;
  cpf?: string;
  data_nascimento?: string;
  campo?: string;
}

export type UserModel = {
  id: string;
  nome: string;
  email: string;
  role: "coordenador" | "lider";
} & UserExtraFields;
