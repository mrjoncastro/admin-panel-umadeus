export type UserModel = {
  id: string;
  nome: string;
  email: string;
  role: "coordenador" | "lider" | "usuario";
  [key: string]: unknown;
};
