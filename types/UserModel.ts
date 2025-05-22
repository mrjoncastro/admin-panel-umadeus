export type UserModel = {
  id: string;
  nome: string;
  email: string;
  role: "coordenador" | "lider";
  [key: string]: any;
};
