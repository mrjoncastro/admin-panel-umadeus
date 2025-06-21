import { describe, it, expect } from 'vitest'
import { criarPedido } from '../lib/flows/orderFlow'
import { criarInscricao } from '../components/templates/inscricao'

const dadosValidos = {
  nome: 'Teste',
  email: 'teste@example.com',
  telefone: '11999999999',
  cpf: '12345678900',
  data_nascimento: '2000-01-01',
  genero: 'masculino',
  evento: 'evt1',
  campo: 'c1',
  criado_por: 'lider1',
  produto: 'Somente Pulseira',
  tamanho: 'M',
}

const pulseira = { nome: 'Somente Pulseira', preco: 10 }
const kit = { nome: 'Kit Camisa + Pulseira', preco: 50 }

describe('Fluxo de inscrição e pedido', () => {
  it('cria inscrição válida com status pendente', () => {
    const inscricao = criarInscricao(dadosValidos)
    expect(inscricao.status).toBe('pendente')
    expect(inscricao.id).toMatch(/^insc_/)
  })

  it('falha quando campos obrigatórios estão vazios', () => {
    expect(() => criarInscricao({ ...dadosValidos, nome: '' })).toThrow()
    expect(() => criarInscricao({ ...dadosValidos, evento: '' })).toThrow()
  })

  it('cria pedido com valor correto', () => {
    const inscricao = criarInscricao(dadosValidos)
    const pedido = criarPedido(inscricao, pulseira)
    expect(pedido.id_inscricao).toBe(inscricao.id)
    expect(pedido.valor).toBe('10.00')
    expect(pedido.status).toBe('pendente')
    expect(pedido.canal).toBe('inscricao')
  })

  it('gera pedido para kit completo com valor 50', () => {
    const inscricao = criarInscricao({
      ...dadosValidos,
      produto: 'Kit Camisa + Pulseira',
    })
    const pedido = criarPedido(inscricao, kit)
    expect(pedido.valor).toBe('50.00')
    expect(pedido.email).toBe('sememail@teste.com')
    expect(pedido.status).toBe('pendente')
    expect(pedido.canal).toBe('inscricao')
  })
})
