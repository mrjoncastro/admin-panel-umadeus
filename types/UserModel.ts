export type UserModel = {
  id: string;
  nome: string;
  email: string;
  role: "coordenador" | "lider" | "usuario";
  cliente?: string;
  tour?: boolean;
  [key: string]: unknown;
};
