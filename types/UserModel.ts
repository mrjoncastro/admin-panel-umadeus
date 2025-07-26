export type UserModel = {
  id: string
  nome: string
  email: string
  telefone?: string
  cpf?: string
  data_nascimento?: string
  endereco?: string
  numero?: string
  bairro?: string
  estado?: string
  cep?: string
  cidade?: string
  genero?: string
  campo?: string
  role: 'coordenador' | 'lider' | 'usuario' | 'fornecedor'
  cliente?: string
  tour?: boolean
  [key: string]: unknown
}
