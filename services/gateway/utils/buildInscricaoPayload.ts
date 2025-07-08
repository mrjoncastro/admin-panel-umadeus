import type { UserModel } from '@/types/UserModel'

export interface FormValues {
  genero: string
  campoId: string
  produtoId: string
  tamanho: string
  paymentMethod: string
}

export function buildInscricaoPayload(
  user: UserModel,
  form: FormValues,
  eventoId: string,
  liderId?: string,
) {
  const [firstName, ...rest] = String(user.nome || '').split(' ')
  if (liderId) {
    return {
      nome: user.nome,
      email: user.email,
      telefone: user.telefone,
      cpf: user.cpf,
      data_nascimento: String(user.data_nascimento ?? '').split(' ')[0],
      genero: form.genero || user.genero,
      campo: form.campoId,
      eventoId,
      produtoId: form.produtoId,
      tamanho: form.tamanho,
      paymentMethod: form.paymentMethod,
      liderId,
    }
  }
  return {
    user_first_name: firstName,
    user_last_name: rest.join(' '),
    user_email: user.email,
    user_phone: user.telefone,
    user_cpf: user.cpf,
    user_birth_date: String(user.data_nascimento ?? '').split(' ')[0],
    user_gender: form.genero || user.genero,
    user_cep: user.cep,
    user_address: user.endereco,
    user_neighborhood: user.bairro,
    user_state: user.estado,
    user_city: user.cidade,
    user_number: user.numero,
    campo: form.campoId,
    evento: eventoId,
    produtoId: form.produtoId,
    tamanho: form.tamanho,
    paymentMethod: form.paymentMethod,
  }
}

export type InscricaoPayload = ReturnType<typeof buildInscricaoPayload>
